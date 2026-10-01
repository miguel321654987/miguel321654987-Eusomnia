import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { closeModalSafely } from "../utils.js";
import { toast } from "react-toastify";

export const Signup = ({ signupModal }) => {
  const { dispatch } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [last_name, setLast_name] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const tieneLetra = /[a-zA-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);

    if (
      !email.trim() ||
      !password.trim() ||
      !name.trim() ||
      !last_name.trim()
    ) {
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "⚠️ Rellena todos los campos.", status: 400 },
      });
      toast.info("Rellena todos los campos.");
      return;
    }
    if (password.length < 8) {
      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "⚠️ La contraseña debe tener al menos 8 caracteres",
          status: 400,
        },
      });
      toast.info("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!tieneLetra || !tieneNumero) {
      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "⚠️ La contraseña debe contener al menos una letra y un número.",
          status: 400,
        },
      });
      toast.info("La contraseña debe contener al menos una letra y un número.");
      return;
    }

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, last_name }),
        },
      );

      if (resp.status === 409) {
        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: "📧 El usuario ya existe.", status: 409 },
        });
        toast.error("El usuario ya existe");
        return;
      }

      if (!resp.ok) {
        const datosError = await resp.json();
        const mensajeDelBack = datosError.message || "Error en el registro";
        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: `⚠️ ${mensajeDelBack}`, status: resp.status },
        });
        toast.error(mensajeDelBack);
        return;
      }

      if (resp.ok) {
        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: "✅ ¡Usuario creado con éxito!", status: 201 },
        });
        toast.success("¡Usuario creado con éxito!");
        setName("");
        setLast_name("");
        setEmail("");
        setPassword("");

        // 🌟 CIERRE DEFENSIVO DEL MODAL
        // En entorno local, Bootstrap a veces tarda en inicializarse completamente.
        // El helper intenta cerrar con Bootstrap. Si falla, lo hace manualmente con CSS
        setTimeout(() => {
          closeModalSafely(signupModal);
          dispatch({ type: "SET_MESSAGE", payload: null });
        }, 300);
      }
    } catch {
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "🚀 Error de conexión.", status: 500 },
      });
      toast.error("Error de conexión");
    }
  };

  return (
    <div
      className="modal fade"
      id={signupModal}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleSignup}>
          <div className="modal-header">
            <h2 className="modal-title fs-5">Registro</h2>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                closeModalSafely(signupModal); // 🔥 Corrección defensiva
                dispatch({ type: "SET_MESSAGE", payload: null });
                setName("");
                setLast_name("");
                setEmail("");
                setPassword("");
              }}
            ></button>
          </div>
          <div className="modal-body text-start">
            <input
              className="form-control mb-2"
              type="text"
              placeholder="Nombre"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="form-control mb-2"
              type="text"
              placeholder="Apellido"
              autoComplete="family-name"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
            />
            <input
              className="form-control mb-2"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="form-control mb-2"
              type="password"
              placeholder="Contraseña"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary w-100">
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
