// #region Types
var ToastType;
(function (ToastType) {
    ToastType[ToastType["Neutral"] = 0] = "Neutral";
    ToastType[ToastType["Success"] = 1] = "Success";
    ToastType[ToastType["Warn"] = 2] = "Warn";
    ToastType[ToastType["Error"] = 3] = "Error";
})(ToastType || (ToastType = {}));
// #endregion Types
// #region Classes
/**
 * Class to manage Toasts
 */
export class ToastManager {
    DEFAULT_DURATION = 3000;
    INITIAL_Y = 16;
    GAP = 8;
    activeToasts = [];
    template;
    constructor() {
        // Check for the necessary template elements
        const template = document.getElementById("toast");
        if (!template) {
            throw new Error("The necessary <template> element was not found on this page");
        }
        else {
            this.template = template;
        }
    }
    buildProps(props, type) {
        return {
            ...props,
            duration: props.duration !== undefined ? props.duration : this.DEFAULT_DURATION,
            type: type,
            template: this.template,
            listener: this
        };
    }
    pushToast(newToast, resolver) {
        this.activeToasts.push(newToast);
        this.updatePositions();
        resolver?.then((toast) => {
            this.onToastRemoved(toast);
        });
    }
    /**
     * Build and push a neutral toast to the user.
     * @param props Properties for the toast.
     */
    notify(props) {
        const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Neutral));
        this.pushToast(newToast, resolver);
    }
    /**
     * Build and push a success toast to the user.
     * @param props Properties for the toast.
     */
    success(props) {
        const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Success));
        this.pushToast(newToast, resolver);
    }
    /**
     * Build and push a warning toast to the user.
     * @param props Properties for the toast.
     */
    warn(props) {
        const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Warn));
        this.pushToast(newToast, resolver);
    }
    /**
     * Build and push an error toast to the user.
     * @param props Properties for the toast.
     */
    error(props) {
        const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Error));
        this.pushToast(newToast, resolver);
    }
    updatePositions() {
        let snapshot = [...this.activeToasts];
        let y = this.INITIAL_Y;
        for (let toast of snapshot) {
            toast.setTop(y);
            y += Math.ceil(toast.getHeight() + this.GAP);
        }
    }
    onToastRemoved(toast) {
        this.activeToasts.splice(this.activeToasts.indexOf(toast), 1);
        this.updatePositions();
    }
}
export class Toast {
    TRANSITION_DURATION = 500;
    element;
    height;
    removed = false;
    constructor(props) {
        let template = props.template.content.cloneNode(true);
        let toast = template.querySelector(".toast");
        switch (props.type) {
            case ToastType.Neutral:
                toast.classList.add("neutral");
                break;
            case ToastType.Success:
                toast.classList.add("success");
                break;
            case ToastType.Warn:
                toast.classList.add("warn");
                break;
            case ToastType.Error:
                toast.classList.add("error");
                break;
        }
        if (props.type === ToastType.Warn || props.type === ToastType.Error) {
            toast.ariaLive = "assertive";
        }
        let messageText = template.querySelector(".toast-message");
        messageText.textContent = props.message;
        let titleText = template.querySelector(".toast-title");
        let dismissButton = template.querySelector(".dismiss");
        if (!props.title) {
            titleText.remove();
        }
        else {
            titleText.textContent = props.title;
        }
        if (props.onclick) {
            toast.onclick = props.onclick;
            toast.classList.add("has-listener");
        }
        dismissButton.onclick = () => {
            this.remove().then(() => {
                props.listener.onToastRemoved(this);
            });
        };
        document.body.prepend(template);
        this.height = toast.getBoundingClientRect().height;
        this.element = toast;
    }
    remove() {
        if (this.removed)
            return;
        this.removed = true;
        return new Promise(resolve => {
            this.element?.classList.add("remove");
            setTimeout(() => {
                this.element?.remove();
            }, this.TRANSITION_DURATION);
            resolve(true);
        });
    }
    setTop(newTop) {
        this.element.style.setProperty("--_top", `${newTop}px`);
    }
    getHeight() {
        return this.height;
    }
}
export class ToastBuilder {
    static build(props) {
        let newToast = new Toast(props);
        let resolver = null;
        if (props.duration > 0) {
            resolver = new Promise(resolve => {
                setTimeout(() => {
                    newToast.remove()?.then(() => {
                        resolve(newToast);
                    });
                }, props.duration);
            });
        }
        return { newToast, resolver };
    }
}
// #endregion Classes
