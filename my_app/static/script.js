document.addEventListener("DOMContentLoaded", () => {
    const loginCard = document.querySelector(".login-card");
    if (loginCard) {
        requestAnimationFrame(() => {
            loginCard.classList.add("loaded");
        });
    }
});
