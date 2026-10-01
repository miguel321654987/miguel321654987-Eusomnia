import { useContext, useMemo, createContext } from "react";
import { getActions } from "./actions.js";

/* Se inicializa y exporta el contexto para que StoreProvider pueda usarlo
 para envolver a la aplicación */

export const StoreContext = createContext(null);

/* useGlobalReducer es el mecanismo para extraer los datos */

/* Se define la función del Hook. Al llamarlo dentro de un componente, 
intenta leer el valor actual de StoreContext */

export default function useGlobalReducer() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useGlobalReducer must be used within StoreProvider");
  }

  const { store, dispatch } = context;

  // Memorizamos las acciones pasando el store y el dispatch actuales
  const actions = useMemo(() => {
    return getActions(store, dispatch);
  }, [store, dispatch]);

  return { store, dispatch, actions };
}
