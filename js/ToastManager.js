export default class ToastManager {
    DEFAULT_DURATION = 3000;
    INITIAL_TOP = 16;
    GAP = 8;
    activeToasts = [];
    template;
    constructor() {
        let template = document.getElementById("tm-template");
        if (!template) {
            throw new Error("ToastManager couldn't find the necessary <template> element on this page");
        }
        this.template = template;
    }
    getProps(oldProps, type) {
        return {
            ...oldProps,
            type: type,
            duration: oldProps.duration ?? this.DEFAULT_DURATION,
            dismissable: oldProps.dismissable ?? true,
            template: this.template,
            onRemove: (t) => {
                this.onToastRemove(t);
            },
        };
    }
    updateToastProps() {
        let top = this.INITIAL_TOP;
        for (const toast of this.activeToasts) {
            toast.top = top;
            top += toast.height + this.GAP;
        }
    }
    updateToastDelay(start) {
        for (let i = start; i < this.activeToasts.length; ++i) {
            this.activeToasts[i].delay = (i - start) * 30;
        }
    }
    onToastRemove(toast) {
        let ind = this.activeToasts.indexOf(toast);
        this.activeToasts.splice(ind, 1);
        this.updateToastProps();
        this.updateToastDelay(ind);
    }
    makeToast(props, type) {
        let strictProps = this.getProps(props, type);
        let newToast = new Toast(strictProps);
        this.activeToasts.push(newToast);
        this.updateToastProps();
    }
    notify(props) {
        this.makeToast(props, ToastType.Neutral);
    }
    success(props) {
        this.makeToast(props, ToastType.Success);
    }
    warn(props) {
        this.makeToast(props, ToastType.Warn);
    }
    error(props) {
        this.makeToast(props, ToastType.Error);
    }
    get toastCount() {
        return this.activeToasts.length;
    }
}
export class Toast {
    height;
    ANIMATION_DURATION = 300;
    element;
    props;
    timeout;
    static cssProps = {
        textColor: "--_text",
        titleColor: "--_title",
        backgroundColor: "--_bg",
        borderColor: "--_border",
        borderHoverColor: "--_border-hover",
        dismissButtonColor: "--_dismiss",
        dismissButtonHoverColor: "--_dismiss-hover",
    };
    constructor(props) {
        this.props = props;
        const toast = props.template.content.cloneNode(true).querySelector(".toast");
        const titleElement = toast.querySelector(".toast-title");
        const messageElement = toast.querySelector(".toast-message");
        const dismissButton = toast.querySelector("button.dismiss");
        // Error checking
        if (props.duration < 0)
            props.duration = 0;
        if (!props.dismissable && props.duration === 0) {
            throw new Error("Toasts must be dismissable or have a non-infinite duration");
        }
        // Remove unecessary elements, else set their values
        if (!props.title) {
            titleElement.remove();
        }
        else {
            titleElement.textContent = props.title;
        }
        if (!props.dismissable) {
            dismissButton.remove();
        }
        else {
            dismissButton.onclick = () => {
                this.remove();
            };
        }
        messageElement.textContent = props.message;
        switch (props.type) {
            case ToastType.Success:
                toast.classList.add("success");
                break;
            case ToastType.Warn:
                toast.classList.add("warn");
                break;
            case ToastType.Error:
                toast.classList.add("error");
                break;
            default:
                toast.classList.add("neutral");
                break;
        }
        if (props.style)
            for (const [key, value] of Object.entries(props.style)) {
                toast.style.setProperty(Toast.cssProps[key], value);
            }
        if (props.type === ToastType.Warn || props.type === ToastType.Error) {
            toast.ariaLive = "assertive";
        }
        document.body.prepend(toast);
        this.height = toast.getBoundingClientRect().height;
        this.element = toast;
        if (props.duration !== 0) {
            this.timeout = setTimeout(() => {
                this.remove();
            }, props.duration + this.ANIMATION_DURATION);
        }
    }
    remove() {
        this.element.classList.add("remove");
        clearTimeout(this.timeout);
        this.props.onRemove(this);
        setTimeout(() => {
            this.element.remove();
        }, this.ANIMATION_DURATION);
    }
    set top(newTop) {
        this.element.style.setProperty("--_top", `${newTop}px`);
    }
    set delay(newDelay) {
        this.element.style.setProperty("--_delay", `${newDelay}ms`);
    }
}
var ToastType;
(function (ToastType) {
    ToastType[ToastType["Neutral"] = 0] = "Neutral";
    ToastType[ToastType["Success"] = 1] = "Success";
    ToastType[ToastType["Warn"] = 2] = "Warn";
    ToastType[ToastType["Error"] = 3] = "Error";
})(ToastType || (ToastType = {}));
