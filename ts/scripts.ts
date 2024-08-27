import { ToastManager } from "./ToastManager.js";

let manager = new ToastManager();

manager.warn({
    title: "Boo!",
    message: "You have been warned",
    // duration: 0
});

document.addEventListener("keydown", (e) => {
    let n = Math.floor(Math.random() * 4);

    if (e.key === "Enter") {
        switch (n) {
            case 0:
                manager.notify({
                    message: "Here's a notification for you",
                });
                break;
            case 1:
                manager.success({
                    message: "Great success! You can continue",
                });
                break;
            case 2:
                manager.warn({
                    message: "Uh oh! You did something stupid"
                });
                break;
            case 3:
                manager.error({
                    message: "Uh oh! We did something idiotic. Standby"
                });
                break;
        }
    }
})