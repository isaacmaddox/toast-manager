export class ToastManager {
    activeToasts;
    neutralTemplate;
    constructor() {
        this.neutralTemplate = document.getElementById("neutral-tast");
        if (!this.neutralTemplate) {
            throw new ToastManagerError("The current page is missing the \"neutral-toast\" HTML <template> element");
        }
    }
    warn(props) {
        const newToast = this.makeNewToast(props);
        return newToast;
    }
    makeNewToast(props) {
        const newToast = new Toast(props);
        this.activeToasts.push(newToast);
        return newToast;
    }
}
export class Toast {
    element;
    constructor({ type, title, message }) {
    }
}
class ToastManagerError extends Error {
    constructor(message) {
        super(message, {
            cause: "Improper setup"
        });
    }
}
