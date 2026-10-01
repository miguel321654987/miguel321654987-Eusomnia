export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("jwt-token") || null,
    user: null,
    api: {
      listLoading: false,
      list: [], // Catálogo base de Home
    },
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "LOGIN_SUCCESS": {
      const payload = action.payload || {};
      const nextToken = payload.token ?? payload;
      const nextUser = payload.user ?? null;

      return {
        ...store,
        token: nextToken,
        user: nextUser,
      };
    }

    case "LOGOUT":
      return {
        ...store,
        token: null,
        user: null,
        message: { msg: "👋 ¡Sesión cerrada con éxito!", status: 200 },
        favorites: {
          list: [],
          loading: false,
          error: null,
        },
      };

    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };

    // Indica que ha comenzado la carga del listado inicial de Home.
    case "API_LIST_LOADING":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: true,
          error: null,
        },
      };
    case "API_LIST_SUCCESS":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: false,
          list: action.payload,
          error: null,
        },
      };

    case "API_ERROR":
      return {
        ...store,
        api: {
          ...store.api,
          listLoading: false,
          detailsLoading: false,
          filteredLoading: false,
          searchLoading: false,
          error: action.payload,
        },
      };

    default:
      throw Error("Unknown action.");
  }
}
