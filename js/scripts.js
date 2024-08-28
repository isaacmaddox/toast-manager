import { ToastManager } from "./ToastManager.js";
let toastManager = new ToastManager();
let messages = [
    "Here's to you!",
    "Glad you could make it!",
    "Thanks for showing up!",
    "Boo!",
    "¡Bienvenidos!"
];
let active = toastManager.getCount();
let input = document.querySelector("input");
document.getElementById("toast-trigger").addEventListener("click", () => {
    active = toastManager.getCount();
    let msg = input.value.trim() !== "" ? input.value.trim() : messages[Math.floor(Math.random() * messages.length)];
    if (active <= 3) {
        toastManager.notify({
            message: msg,
        });
    }
    else if (active < 5) {
        toastManager.warn({
            title: "Woah there!",
            message: "Looks like you're getting carried away. Wouldn't want to have to stop you...",
            duration: 6000,
        });
    }
    else if (active < 6) {
        toastManager.error({
            message: "We'll have to stop you there",
            duration: 0
        });
    }
});
