class ToastNotification {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    //Creating a container
    if (!document.getElementById("toast-container")) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById("toast-container");
    }
  }

  show(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");

    const icon = this.getIcon(type);

    toast.innerHTML = `
    <div class="toast-content">
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${this.escapeHtml(message)}</span>
        <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
      </div>
    `;
    this.container.appendChild(toast);

    //animation trigger
    setTimeout(() => toast.classList.add("toast-show"), 10);

    //close button
    const closeButton = toast.querySelector(".toast-close");
    closeButton.addEventListener("click", () => this.hide(toast));

    if (duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }

    return toast;
  }

  hide(toast) {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getIcon(type) {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  success(message, duration) {
    return this.show(message, "success", duration);
  }

  error(message, duration) {
    return this.show(message, "error", duration);
  }

  warning(message, duration) {
    return this.show(message, "warning", duration);
  }

  info(message, duration) {
    return this.show(message, "info", duration);
  }

  confirm(message, onConfirm, onCancel) {
    const overlay = document.createElement("div");
    overlay.className = "toast-confirm-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "confirm-message");

    overlay.innerHTML = `
      <div class="toast-confirm-dialog">
        <div class="toast-confirm-content">
          <span class="toast-icon toast-icon-warning">⚠</span>
          <p id="confirm-message" class="toast-confirm-message">${this.escapeHtml(
            message
          )}</p>
        </div>
        <div class="toast-confirm-actions">
          <button type="button" class="btn btn-secondary toast-confirm-cancel">Cancel</button>
          <button type="button" class="btn btn-danger toast-confirm-ok">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add("show"), 10);

    const confirmBtn = overlay.querySelector(".toast-confirm-ok");
    const cancelBtn = overlay.querySelector(".toast-confirm-cancel");

    confirmBtn.focus();
    const close = (result) => {
      overlay.classList.remove("show");
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
      if (result && onConfirm) onConfirm();
      if (!result && onCancel) onCancel();
    };

    confirmBtn.addEventListener("click", () => close(true));
    cancelBtn.addEventListener("click", () => close(false));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });

    // ESC key to cancel
    const escHandler = (e) => {
      if (e.key === "Escape") {
        close(false);
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }
}

const toast = new ToastNotification();
