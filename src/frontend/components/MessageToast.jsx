import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// Helper para obtener la clase de color según el status HTTP o el tipo de mensaje.
const getStatusClasses = (status) => {
  if (!status) return { type: "", classes: "" };
  switch (Math.floor(status)) {
    case 200: // Éxito (Login, Logout exitoso)
      return { type: "success", classes: "bg-success border-success" };
    case 401: // No Autorizado
    case 403: // Prohibido
      return { type: "warning", classes: "bg-warning border-warning" };
    case 409: // Conflicto (Ya existe)
      return { type: "info", classes: "bg-info border-info" };
    default: // Error genérico de API o desconectado
      return { type: "danger", classes: "bg-danger border-danger" };
  }
};

/**
 * Componente que muestra mensajes globales (Toast/Snackbar) basados en el estado del Store.
 * Se recomienda colocarlo dentro del Layout.jsx para envolver todo el contenido principal.
 */
const MessageToast = () => {
  // Usamos un contexto o separamos la lógica de lectura de store para mayor modularidad.
  // Aquí asumimos que tenemos acceso al estado global (message) mediante useContext.
  const { store, dispatch } = useGlobalReducer();

  const message = store.message;

  useEffect(() => {
    if (!message) return;

    // Configurar temporizador para limpiar el mensaje tras 5 segundos (UX mejorado)
    const timer = setTimeout(() => {
      dispatch({ type: "SET_MESSAGE", payload: null }); // Limpiar el estado después de mostrarlo
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, dispatch]);

  if (!message) return null;

  const statusData = getStatusClasses(message.status);

  return (
    <div
      className={`fixed top-4 right-4 z-[1050] p-3 rounded-lg shadow-xl max-w-xs transition-all duration-300 border ${statusData.classes}`}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <p className="font-bold text-sm">{message.msg}</p>
        {/* Icono corregido con propiedades camelCase para React */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V7c0-.55-.45-1-1-1h-9a2 2 0 00-2 2v6a2 2 0 002 2h5l1.405-1.405z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default MessageToast;
