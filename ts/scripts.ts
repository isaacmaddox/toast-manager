import { ToastManager } from "./ToastManager.js";

let manager = new ToastManager();

document.addEventListener("keydown", () => {
    manager.warn({
        message: "You did something stupid, dumbass."
    })
})