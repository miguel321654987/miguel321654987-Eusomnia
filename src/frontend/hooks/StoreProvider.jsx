import { useReducer, useEffect } from "react";
import storeReducer, { initialStore } from "../store.js";
import { getActions } from "./actions.js";
import { StoreContext } from "./useGlobalReducer.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/* StoreProvider es el corazón del estado global: se encarga de crear el estado, 
modificarlo, sincronizarlo con tu base de datos y distribuirlo a toda la aplicación */

/* useReducer: alternativa a useState para estados complejos
  storeReducer: función que define cómo cambia el estado ("cerebro" que procesa las acciones)
  initialStore(): Inicializa el estado global */

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  useEffect(() => {
    const token = store.token;

    if (!token) return;

    const verificarSesionYCargarDatos = async () => {
      const actions = getActions(store, dispatch);

      try {
        const userResponse = await fetch(`${BACKEND_URL}/api/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.status === 401) {
          actions.handleLogout();
          return;
        }

        const userData = await userResponse.json();
        const profile = userData.results || userData;

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { token, user: profile },
        });

        if (profile && profile.id) {
          dispatch({ type: "CLEAR_FAVORITES" }); // Limpia favoritos antes de cargar los nuevos
          await actions.cargarFavoritosBackend(profile.id);
        }
      } catch (error) {
        console.error("Error al sincronizar sesión con el servidor:", error);
      }
    };

    verificarSesionYCargarDatos();
  }, [store.token, dispatch]);

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

/* Al usar .Provider se activa el StoreContext y permite que los componentes hijos
 accedan al estado global y al dispatch.
 value={{ state: store, dispatch }}> los vuelve disponibles para useGlobalReducer */
