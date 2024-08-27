import { ToastManager } from "./ToastManager.js";
let manager = new ToastManager();
document.addEventListener("keydown", () => {
    manager.notify({
        message: "You have a new notification!",
    });
});
