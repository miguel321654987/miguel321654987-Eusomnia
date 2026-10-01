import React from "react";
import ReactDOM from "react-dom/client";
import "./Index.css"; // Global styles for your application

// 🌟 ¡AÑADE ESTAS DOS LÍNEAS AQUÍ PARA CARGAR BOOTSTRAP!
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { RouterProvider } from "react-router-dom"; // Import RouterProvider to use the router
import { router } from "./routes.jsx"; // Import the router configuration
import { StoreProvider } from "./hooks/StoreProvider.jsx"; // Import the StoreProvider for global state management
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer } from "react-toastify";

import { BackendURL } from "./components/BackendURL.jsx";

export const Main = () => {
  if (
    !import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_BACKEND_URL == ""
  )
    return (
      <React.StrictMode>
        <BackendURL />
      </React.StrictMode>
    );

  return (
    <React.StrictMode>
      {/* Provide global state to all components */}
      <ToastContainer position="top-right" autoClose={3000} />
      <StoreProvider>
        {/* Set up routing for the application */}
        <RouterProvider router={router} />
      </StoreProvider>
    </React.StrictMode>
  );
};

// Render the Main component into the root DOM element.
ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
