import { ToastManager } from "./ToastManager.js";

let manager = new ToastManager();

manager.warn({
    message: "You did something stupid, dumbass."
})