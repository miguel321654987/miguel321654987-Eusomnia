import { closeModalSafely } from "../utils.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Mapa de traducción: Claves del Store local → Parámetros aceptados por TCGdex /cards
const TCG_FILTER_MAP = {
  types: "types",
  retreat: "retreat",
  rarity: "rarity",
  illustrator: "illustrator",
  hp: "hp",
  category: "category",
  energyType: "energyType",
  regulationmarks: "regulationmarks",
  stage: "stage",
  suffix: "suffix",
  variants: "variants",
  trainertypes: "trainertypes",
};

export const getActions = (store, dispatch) => {
  // 🔥 Helper interno para incluir el Token JWT de forma automática y segura
  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt-token");
    // Si no hay token, devolvemos solo el Content-Type básico
    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }
    // Si el token existe, devolvemos el objeto completo con la autorización
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // 🔥 Helper para IDs con caracteres especiales.
  const obtenerIdCodificado = (id) => {
    const idTexto = String(id).trim();

    // Algunos IDs necesitan codificación adicional, pero conservamos todo el contenido original del ID.
    if (
      idTexto.toLowerCase().startsWith("exu-") &&
      (idTexto.includes("?") ||
        idTexto.includes("%") ||
        idTexto.toLowerCase().includes("3f"))
    ) {
      return encodeURIComponent(encodeURIComponent(idTexto));
    }

    // Para IDs normales basta con una codificación.
    return encodeURIComponent(idTexto);
  };

  return {
    handleLogout: (modalId = null) => {
      // 1. Si hay un ID, cerramos ese modal específico de forma segura.
      if (modalId) {
        closeModalSafely(modalId);
      } else {
        // Si no hay un modal concreto, limpiamos los residuos del body de forma segura
        const backdrops = document.querySelectorAll(".modal-backdrop");
        backdrops.forEach((backdrop) => backdrop.remove());
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");
      }

      // 2. Limpieza segura de los datos de sesión
      localStorage.removeItem("jwt-token");
      dispatch({ type: "LOGOUT" });

      dispatch({
        type: "SET_MESSAGE",
        payload: {
          msg: "Sesión expirada. Por favor, identifícate de nuevo.",
          status: 401,
        },
      });

      setTimeout(() => {
        dispatch({ type: "SET_MESSAGE", payload: null });
      }, 3000);
    },

    //  👾 Catálogo de filtros para el Sidebar
    // Realiza un único fetch a tu propio backend (${BACKEND_URL}/api/pok/filter-options)
    cargarOpcionesFiltros: async () => {
      // Previene que se repita el fetch si ya hay filtros cargados en la store.
      if (store.api.filters?.types?.length > 0) return;

      try {
        const response = await fetch(`${BACKEND_URL}/api/pok/filter-options`);
        if (!response.ok) {
          throw new Error(
            `Error fetching backend filter options: HTTP ${response.status}`,
          );
        }

        const data = await response.json();
        const filterPayload = data.results || data;

        dispatch({
          type: "API_FILTERS_SUCCESS",
          payload: filterPayload,
        });
      } catch (error) {
        console.error("Error in cargarOpcionesFiltros:", error);
      }
    },

    //  👾 CARGA INICIAL DE HOME ===
    obtenerPokemons: async () => {
      // Si ya hay datos cargados en Home, no repetimos la petición.
      if (store.api.list && store.api.list.length > 0) return;

      let listaCartas;

      // Primer bloque: obtiene el listado resumido de cartas SOLO para Home.
      try {
        dispatch({ type: "API_LIST_LOADING" }); // Indica que comienza la carga del listado base.
        const response = await fetch(
          "https://api.tcgdex.net/v2/en/cards?pagination:page=1&pagination:itemsPerPage=24",
        );

        if (!response.ok) {
          throw new Error(
            `Error al obtener el listado de cartas: HTTP ${response.status}`,
          );
        }

        const data = await response.json();

        // TCGdex a veces devuelve array directo o un objeto con propiedad "cards".
        listaCartas = Array.isArray(data) ? data : data.cards;

        if (!Array.isArray(listaCartas)) {
          throw new Error(
            "La respuesta del listado no tiene el formato esperado.",
          );
        }
      } catch (err) {
        console.error("Error al cargar el listado de cartas:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
        return;
      }

      // Publicamos solo una versión ligera para Home.
      // buscarCartasPorFiltro → 9 campos (versión completa para overlay)
      const cartasNormalizadas = listaCartas;

      // Home guarda este array ligero en api.list.
      dispatch({
        type: "API_LIST_SUCCESS",
        payload: cartasNormalizadas,
      });
    },

    //  👾 BÚSQUEDA POR FILTROS EN SIDEBAR ===
    filtrarCartas: async (filtrosAplicados = {}) => {
      dispatch({ type: "API_FILTERED_LOADING" });

      try {
        const {
          page = 1,
          itemsPerPage = 24,
          variants,
          ...demasFiltros
        } = filtrosAplicados;

        const query = new URLSearchParams();

        Object.entries(demasFiltros).forEach(([key, value]) => {
          if (value && typeof value === "string" && value.trim() !== "") {
            // 💡 Buscamos la traducción en tu tabla intermedia. Si no existe, usa la llave original.
            const apiParam = TCG_FILTER_MAP[key] || key;

            // Enviamos el valor puro y limpio hacia Flask
            query.append(apiParam, value.trim());
          }
        });

        if (
          variants &&
          typeof variants === "string" &&
          variants.trim() !== ""
        ) {
          query.append(`variants.${variants.trim()}`, "true");
        }

        query.append("pagination:page", String(page));
        query.append("pagination:itemsPerPage", String(itemsPerPage));

        // Llamada al Backend para obtener cartas filtradas según los parámetros construidos.
        const response = await fetch(
          `${BACKEND_URL}/api/pok/filters?${query.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Error al filtrar cartas: HTTP ${response.status}`);
        }

        const data = await response.json();
        const cartasRaw = Array.isArray(data) ? data : data.cards || [];

        const cartasNormalizadas = cartasRaw.map((carta) => ({
          ...carta,
          id: String(carta.id),
          pokemon_name: carta.name,
          image: carta.image ? `${carta.image}/low.png` : defaultImage,
        }));

        dispatch({
          type: "API_FILTERED_SUCCESS",
          payload: cartasNormalizadas,
        });

        return cartasNormalizadas;
      } catch (error) {
        console.error("Error en filtrarCartas():", error);

        dispatch({
          type: "API_ERROR",
          payload: error.message,
        });

        return [];
      }
    },

    //  👾 BÚSQUEDA/FILTRO EN NAVBAR INDEPENDIENTE DE HOME ===
    buscarCartasPorFiltro: async (filtros = {}) => {
      const filtro = String(filtros.inputText || "").trim();
      // Si el input está vacío, limpiamos el resultado superpuesto.
      if (!filtro) {
        dispatch({ type: "API_SEARCH_CLEAR" });
        return [];
      }
      dispatch({ type: "API_SEARCH_LOADING" });
      try {
        // Usamos la búsqueda nativa de TCGdex con coincidencia parcial (like:)
        // La API devuelve hasta 128 resultados paginados, ordenados por relevancia
        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards?name=like:${encodeURIComponent(filtro)}&pagination:page=1&pagination:itemsPerPage=24`,
        );
        if (!response.ok) {
          throw new Error(`Error al buscar cartas: HTTP ${response.status}`);
        }
        const data = await response.json();
        const cartasCompletas = Array.isArray(data) ? data : data.cards || [];
        // Normalizamos directamente - la API ya filtra
        const cartasNormalizadas = cartasCompletas;

        // Orden local: 1) Prefijo (startsWith), 2) Alfabético dentro de cada grupo
        const term = filtro.toLowerCase();
        cartasNormalizadas.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aStarts = aName.startsWith(term) ? 0 : 1;
          const bStarts = bName.startsWith(term) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          return aName.localeCompare(bName);
        });

        dispatch({
          type: "API_SEARCH_SUCCESS",
          payload: cartasNormalizadas,
        });
        return cartasNormalizadas;
      } catch (err) {
        console.error("Error al buscar cartas por filtro:", err);

        dispatch({
          type: "API_ERROR",
          payload: err.message,
        });
        return [];
      }
    },

    //  👾 PETICIONES DETALLE POKÉMON ===
    obtenerDetallePokemon: async (id) => {
      try {
        // Home ya no guarda datos completos de cada carta.
        // Por eso el detalle debe cargar siempre con un fetch puntual.
        dispatch({ type: "API_DETAILS_LOADING" });

        // Detector de caracteres especiales PARA EL SEGUNDO POKEMON
        let idTexto = obtenerIdCodificado(id);

        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards/${idTexto}`,
        );

        if (!response.ok) {
          throw new Error("No se pudo encontrar la información de esta carta.");
        }

        const data = await response.json();

        /* 🔥 FORMATEO DEFENSIVO: Validamos la imagen usando 'defaultImage'
        TCGdex estructura la imagen de la carta como string o dentro de un objeto */
        const imagenFinal = data.image // Operadores Ternarios Anidados,
          ? data.image.includes("http") // se leen como secuencia de condiciones
            ? `${data.image}/high.png`
            : data.image
          : defaultImage;

        const detalleFormateado = {
          ...data,
          image: imagenFinal, // Nos aseguramos de que siempre contenga algo válido
        };

        dispatch({ type: "API_DETAIL_SUCCESS", payload: detalleFormateado });
      } catch (err) {
        console.error("Error al cargar detalle:", err);
        dispatch({ type: "API_ERROR", payload: err.message });
      }
    },

    // 🔥 Helper para limpiar el detalle al desmontar el componente
    limpiarDetallePokemon: () => {
      dispatch({ type: "API_DETAIL_SUCCESS", payload: null });
    },

    //  ❤️ GESTIÓN DE FAVORITOS
    cargarFavoritosBackend: async (userId) => {
      // antes de pedir la lista del nuevo usuario, limpiamos el estado local
      dispatch({ type: "CLEAR_FAVORITES" });

      // 1. Activa el loading exclusivo de favoritos
      dispatch({ type: "FAVORITES_LOADING" });

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites`,
          { headers: getAuthHeaders() },
        );
        if (!response.ok)
          throw new Error("Error al obtener los favoritos del servidor");

        const data = await response.json();

        // 2. Guarda la lista y apaga el loading de favoritos
        dispatch({
          type: "SET_FAVORITES",
          payload: data.results || data,
        });
      } catch (error) {
        console.error("Error cargando favoritos del backend:", error);
        // 3. Registra el error exclusivo de favoritos
        dispatch({
          type: "FAVORITES_ERROR",
          payload: error.message,
        });
      }
    },

    añadirFavoritoBackend: async (userId, pokemon) => {
      try {
        const idSeguro = encodeURIComponent(String(pokemon.id).trim());

        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${idSeguro}`,
          {
            method: "POST",
            headers: { ...getAuthHeaders() }, // ✨ Escalabilidad: podrían agregarse otros headers
            body: JSON.stringify(pokemon), // 🌟 ¡Aquí pasamos la info del store al back!
          },
        );

        if (response.status === 409) {
          dispatch({
            type: "SET_MESSAGE",
            payload: { msg: "⚠️ Ya está en favoritos", status: 409 },
          });
          return;
        }

        if (!response.ok) throw new Error("No se pudo añadir el favorito");

        // Todo bien: Actualizamos el Navbar e interfaz en tiempo real
        dispatch({ type: "ADD_FAVORITE_STORE", payload: pokemon });
      } catch (error) {
        console.error(error);
      }
    },

    eliminarFavoritoBackend: async (userId, pokemonId) => {
      try {
        // Codificamos el ID para que coincida perfectamente con el POST
        const idSeguro = encodeURIComponent(String(pokemonId).trim());

        const response = await fetch(
          `${BACKEND_URL}/api/favorites/user/${userId}/favorites/${idSeguro}`,
          {
            method: "DELETE",
            headers: { ...getAuthHeaders() },
          },
        );
        if (!response.ok)
          throw new Error("No se pudo eliminar el favorito del servidor");

        // Todo bien: removemos del estado local filtrando por ID
        dispatch({ type: "REMOVE_FAVORITE_STORE", payload: pokemonId });

        dispatch({
          type: "SET_MESSAGE",
          payload: { msg: "🗑️ Carta eliminada de tus favoritos", status: 200 },
        });
      } catch (error) {
        console.error("Error al eliminar favorito:", error);
        dispatch({ type: "FAVORITES_ERROR", payload: error.message });
      }
    },
  };
};
