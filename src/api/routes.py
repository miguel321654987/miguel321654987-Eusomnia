from api.blueprints.user_bp import user_bp
from flask import Blueprint


api = Blueprint('api', __name__)

# REGISTRO DE BLUEPRINTS
api.register_blueprint(user_bp, url_prefix='/auth')
