import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { closeModalSafely, switchModals } from "../utils.js";
import { toast } from "react-toastify";

export const Login = ({ loginModal, signupModal }) => {
  const { dispatch } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const abrirSignupModal = () => {
    // 🌟 CAMBIO DEFENSIVO DE MODAL (Necesario para local VS Code)
    switchModals(loginModal, signupModal);
    // En lugar de abrir/cerrar con Bootstrap directamente,usamos switchModals
    // En local, Bootstrap a veces no está completamente inicializado en el click
    // El helper intenta primero con Bootstrap y hace fallback a CSS si es necesario.
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: "SET_MESSAGE", payload: null }); // Limpiamos mensajes previos

    if (!email.trim() || !password.trim()) {
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "⚠️ Los campos están vacíos", status: 400 },
      });
      return;
    }
    if (password.length < 6) {
      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "⚠️ La contraseña debe tener al menos 6 caracteres",
          status: 400,
        },
      });
      return;
    }

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!resp.ok) {
        const datosError = await resp.json();
        const mensajeDelBack = datosError.message || "Error al iniciar sesión";
        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: `⚠️ ${mensajeDelBack}`, status: resp.status },
        });
        toast.error(mensajeDelBack);
        return;
      }

      const data = await resp.json();
      localStorage.setItem("jwt-token", data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { token: data.token, user: null },
      });
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "¡Sesión iniciada!", status: 200 },
      });
      toast.success("¡Sesión iniciada!");

      // 🌟 CIERRE DEFENSIVO DEL MODAL
      // En entorno local, Bootstrap a veces tarda en inicializarse completamente.
      // El helper closeModalSafely intenta cerrar con Bootstrap primero, y si falla,
      // lo hace con CSS para que el modal se cierre sin dejar backdrop abierto.
      setTimeout(() => {
        closeModalSafely(loginModal);
        dispatch({ type: "SET_MESSAGE", payload: null });
        setEmail("");
        setPassword("");
      }, 300);
    } catch {
      dispatch({
        type: "SET_MESSAGE",
        payload: { msg: "Error de conexión", status: 500 },
      });
      toast.error("Error de conexión");
    }
  };

  return (
    <div
      className="modal fade"
      id={loginModal}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleLogin}>
          <div className="modal-header">
            <h2 className="modal-title fs-5">Login</h2>
            {/* 🔥 Eliminamos data-bs-dismiss="modal" y dejamos que nuestro helper */}
            {/* gestione el cierre de forma segura cuando el usuario pulsa la "X" */}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                closeModalSafely(loginModal);
                dispatch({ type: "SET_MESSAGE", payload: null });
                setEmail("");
                setPassword("");
              }}
            ></button>
          </div>
          <div className="modal-body">
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="modal-footer d-flex flex-column gap-2">
            <button type="submit" className="btn btn-success w-100">
              Entrar
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={abrirSignupModal}
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
