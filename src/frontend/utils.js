// 🔧 HELPER DE CIERRE DEFENSIVO DE MODALES
export const closeModalSafely = (id) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    // .Modal: módulo específico de Bootstrap que controla la lógica de las ventanas emergentes (abrir, cerrar, animar).
    try {
      // Recupera la instancia activa de Bootstrap asociada a ese modal.
      // Si no existe una, la crea automáticamente. Es más seguro que getInstance().
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(
        modalEl,
        {},
      );

      modalInstance.hide(); // Método de Bootstrap para animar y cerrar el modal
      return;
    } catch (error) {
      console.warn(
        `Bootstrap Modal.hide() falló para #${id}, usando fallback CSS`,
        error,
      );
    }
  }

  // Fallback:Cierre manual por CSS
  modalEl.classList.remove("show");
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.style.display = "none";

  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) backdrop.remove();

  document.body.classList.remove("modal-open");
  document.body.style.overflow = ""; // 🔥 Restablece el scroll si Bootstrap se quedó colgado
};

//* 🔧 HELPER DE APERTURA DEFENSIVA DE MODALES
export const openModalSafely = (id) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  if (window.bootstrap?.Modal) {
    try {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(
        modalEl,
        {},
      );
      modalInstance.show();
      return;
    } catch (error) {
      console.warn(
        `Bootstrap Modal.show() falló para #${id}, usando fallback CSS`,
        error,
      );
    }
  }

  // Fallback: Apertura manual por CSS
  modalEl.classList.add("show");
  modalEl.setAttribute("aria-hidden", "false");
  modalEl.style.display = "block";

  if (!document.querySelector(".modal-backdrop")) {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    document.body.appendChild(backdrop);
  }

  document.body.classList.add("modal-open");
};

//* 🔧 HELPER PARA CAMBIAR ENTRE MODALES
export const switchModals = (closeId, openId) => {
  closeModalSafely(closeId);

  // 🔥 Escucha el evento nativo de Bootstrap para abrir el siguiente solo cuando el primero se oculte del todo
  const closeEl = document.getElementById(closeId);
  if (closeEl && window.bootstrap?.Modal) {
    closeEl.addEventListener(
      "hidden.bs.modal",
      () => {
        openModalSafely(openId);
      },
      { once: true },
    ); // { once: true } evita que el evento se quede escuchando siempre
  } else {
    // Fallback si Bootstrap no está listo
    setTimeout(() => {
      openModalSafely(openId);
    }, 150);
  }
};
