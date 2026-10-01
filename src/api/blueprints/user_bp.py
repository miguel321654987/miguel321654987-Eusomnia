from flask import Blueprint, request, jsonify
from api.models import db, User
from sqlalchemy import select
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from api.utils import APIException
from api.extensions import bcrypt

# 1. Definimos el Blueprint (El componente modular)
user_bp = Blueprint('User', __name__)


@user_bp.route("/signup", methods=["POST"])
def handle_signup():
    body = request.get_json()
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    email = body.get("email")
    password = body.get("password")
    name = body.get("name")          # NUEVO
    last_name = body.get("last_name")  # NUEVO

    # Validaciones estrictas de campos requeridos para un nuevo usuario
    if not email or not isinstance(email, str) or email.strip() == "":
        raise APIException("El campo 'email' es obligatorio", status_code=400)
    if not password or not isinstance(password, str) or password.strip() == "":
        raise APIException(
            "El campo 'password' es obligatorio", status_code=400)
    # NUEVAS VALIDACIONES
    if not name or not isinstance(name, str) or name.strip() == "":
        raise APIException("El campo 'name' es obligatorio", status_code=400)
    if not last_name or not isinstance(last_name, str) or last_name.strip() == "":
        raise APIException(
            "El campo 'last_name' es obligatorio", status_code=400)

    # 1. Verificar si el usuario ya existe (SQLAlchemy 2.0 style)
    stmt = select(User).where(User.email == email.strip())
    user_exists = db.session.execute(stmt).scalar_one_or_none()

    if user_exists is not None:
        raise APIException(
            "El correo electrónico ya está registrado", status_code=409)

    try:
        # 2. Crear y guardar el nuevo usuario usando Bcrypt
        hashed_password = bcrypt.generate_password_hash(
            password.strip()).decode('utf-8')

        # Se agregan name y last_name limpiando espacios innecesarios
        new_user = User(
            email=email.strip(),
            password=hashed_password,
            name=name.strip(),
            last_name=last_name.strip(),
            is_active=True
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "Usuario creado con éxito",
            "results": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno del servidor al crear el usuario: {str(e)}", status_code=500)


@user_bp.route("/login", methods=["POST"])
def create_token():
    body = request.get_json()
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        raise APIException(
            "Los campos 'email' y 'password' son requeridos", status_code=400)

    # 1. Buscamos al usuario únicamente por su email
    stmt = select(User).where(User.email == email.strip())
    user = db.session.execute(stmt).scalar_one_or_none()

    # 2. Verificamos si existe y si la contraseña coincide usando bcrypt.check_password_hash
    if user is None or not bcrypt.check_password_hash(user.password, password.strip()):
        raise APIException(
            "Credenciales inválidas. Email o contraseña incorrectos", status_code=401)

    # 3. Denegar login si la cuenta está desactivada
    if not user.is_active:
        raise APIException(
            "Acceso denegado: Tu cuenta ha sido desactivada.", status_code=403)

    # Crea un nuevo token con el id de usuario dentro
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Autenticación exitosa",
        "token": access_token,
        "user_id": user.id
    }), 200


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def protected():
    # Accede a la identidad del usuario actual
    current_user_id = get_jwt_identity()
    user = db.session.get(User, int(current_user_id))

    if user is None:
        raise APIException("Usuario no encontrado", status_code=404)

    # VALIDACIÓN DE ESTADO: Si el usuario está inactivo, denegar acceso (Status 403)
    if not user.is_active:
        raise APIException(
            "Acceso denegado: Tu cuenta ha sido desactivada.", status_code=403)

    return jsonify({
        "message": "Acceso concedido a ruta protegida",
        "results": {"id": user.id, "email": user.email}
    }), 200


@user_bp.route('/user', methods=['GET'])
def get_all_users():
    # Usando select() y scalars() estilo SQLAlchemy 2.0
    stmt = select(User)
    users_query = db.session.scalars(stmt).all()

    # Validamos si la lista está vacía
    if not users_query:
        return jsonify({
            "message": "No se encontraron usuarios en la base de datos",
            "results": []
        }), 200

    # Convertimos la lista de objetos a diccionarios mediante comprensión de listas
    all_users = [user.serialize() for user in users_query]

    return jsonify({
        "message": "Usuarios obtenidos con éxito",
        "results": all_users,
        "total_users": len(all_users)
    }), 200


@user_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    # db.session.get() para buscar por clave primaria
    user = db.session.get(User, user_id)

    if user is None:
        raise APIException(
            f"El usuario con ID {user_id} no fue encontrado", status_code=404)

    return jsonify({
        "message": "Usuario obtenido con éxito",
        "results": user.serialize()
    }), 200


@user_bp.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()  # 1. Valida que exista un token JWT
def delete_user(user_id):
    # 2. Validación IDOR: ¿El token coincide con el ID de la URL?
    current_user_id = get_jwt_identity()
    if int(user_id) != int(current_user_id):
        raise APIException(
            "No tienes permisos para eliminar esta cuenta.", status_code=403)

    # 3. Forzar el envío del JSON con la contraseña actual
    # silent=True evita que falle si no mandan JSON
    body = request.get_json(silent=True)
    if body is None or 'current_password' not in body:
        raise APIException(
            "Es obligatorio incluir tu 'current_password' en el cuerpo JSON para eliminar la cuenta.", status_code=400)

    current_password = body.get('current_password')

    if not isinstance(current_password, str) or current_password.strip() == "":
        raise APIException(
            "La contraseña proporcionada no es válida.", status_code=400)

    # 4. Buscar el usuario en la base de datos
    user = db.session.get(User, user_id)
    if user is None:
        raise APIException(
            f"El usuario con ID {user_id} no existe", status_code=404)

    # 5. Verificar que la contraseña coincide con el hash guardado
    if not bcrypt.check_password_hash(user.password, current_password.strip()):
        raise APIException(
            "La contraseña actual proporcionada es incorrecta. Acción cancelada.", status_code=401)

    # --- A partir de aquí el usuario ha confirmado su identidad al 100% ---
    try:
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "message": f"Tu cuenta (ID {user_id}) ha sido eliminada de forma permanente con éxito.",
            "id_deleted": user_id
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al eliminar el usuario: {str(e)}", status_code=500)


@user_bp.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # 1. Validación de sesión: ¿El token pertenece al ID de la URL?
    current_user_id = get_jwt_identity()
    if int(user_id) != int(current_user_id):
        raise APIException(
            "No tienes permisos para modificar esta cuenta.", status_code=403)

    body = request.get_json()
    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    # 2. Buscar al usuario en la base de datos
    user = db.session.get(User, user_id)
    if user is None:
        raise APIException(
            f"El usuario con ID {user_id} no fue encontrado", status_code=404)

    email = body.get('email')
    password = body.get('password')
    # <--- Contraseña actual para validar identidad
    current_password = body.get('current_password')

    # 3. Validar que se envíe la contraseña actual para autorizar cambios de perfil
    if current_password is None or current_password.strip() == "":
        raise APIException(
            "Es obligatorio introducir tu contraseña actual para confirmar tu identidad.", status_code=400)

    # 4. Verificar si la contraseña ingresada es correcta contra la base de datos
    if not bcrypt.check_password_hash(user.password, current_password.strip()):
        raise APIException(
            "La contraseña actual proporcionada es incorrecta.", status_code=401)

    # --- A partir de aquí el usuario ha demostrado ser el dueño real ---

    # Validaciones de formato
    if email is not None and (not isinstance(email, str) or email.strip() == ""):
        raise APIException(
            "El campo 'email' es inválido o está vacío", status_code=400)
    if password is not None and (not isinstance(password, str) or password.strip() == ""):
        raise APIException(
            "El campo 'password' no puede estar vacío si se incluye", status_code=400)

    try:
        if email is not None:
            user.email = email.strip()
        if password is not None:
            user.password = bcrypt.generate_password_hash(
                password.strip()).decode('utf-8')

        db.session.commit()
        return jsonify({
            "message": "Perfil actualizado con éxito",
            "results": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al actualizar el usuario: {str(e)}", status_code=500)
