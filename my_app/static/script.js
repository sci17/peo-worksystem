document.addEventListener("DOMContentLoaded", () => {
    const loginCard = document.querySelector(".login-card");
    if (loginCard) {
        requestAnimationFrame(() => {
            loginCard.classList.add("loaded");
        });
    }

    const body = document.body;
    const sidebarToggle = document.querySelector(".sidebar-toggle");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    const navItems = document.querySelectorAll(".portal-nav .nav-item");
    const adminLoginButton = document.querySelector(".js-admin-login-button");

    const closeSidebar = () => {
        body.classList.remove("sidebar-open");
    };

    if (sidebarToggle && sidebarOverlay) {
        sidebarToggle.addEventListener("click", () => {
            body.classList.toggle("sidebar-open");
        });

        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    if (navItems.length) {
        navItems.forEach((item) => {
            item.addEventListener("click", () => {
                if (window.matchMedia("(max-width: 1024px)").matches) {
                    closeSidebar();
                }
            });
        });
    }

    if (adminLoginButton) {
        adminLoginButton.addEventListener("click", (event) => {
            event.preventDefault();
            const targetUrl = adminLoginButton.dataset.adminLoginUrl;
            if (targetUrl) {
                window.location.href = targetUrl;
            }
        });
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    });
});
