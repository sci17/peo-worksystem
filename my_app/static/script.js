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
    const navSubitems = document.querySelectorAll(".portal-nav .nav-subitem");
    const adminDivisionButton = document.querySelector(".js-admin-division-button");
    const maintenanceToggle = document.querySelector(".js-maintenance-toggle");
    const maintenanceMenu = document.querySelector(".js-maintenance-menu");

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
                if (item.classList.contains("js-maintenance-toggle")) {
                    return;
                }
                if (window.matchMedia("(max-width: 1024px)").matches) {
                    closeSidebar();
                }
            });
        });
    }

    if (navSubitems.length) {
        navSubitems.forEach((item) => {
            item.addEventListener("click", () => {
                if (window.matchMedia("(max-width: 1024px)").matches) {
                    closeSidebar();
                }
            });
        });
    }

    if (adminDivisionButton) {
        adminDivisionButton.addEventListener("click", (event) => {
            event.preventDefault();
            const targetUrl = adminDivisionButton.dataset.adminDivisionUrl;
            if (targetUrl) {
                window.location.href = targetUrl;
            }
        });
    }

    if (maintenanceToggle && maintenanceMenu) {
        const maintenanceContainer = maintenanceToggle.closest(".nav-maintenance");

        const setMaintenanceOpen = (open) => {
            maintenanceToggle.setAttribute("aria-expanded", String(open));
            maintenanceMenu.hidden = !open;
            if (maintenanceContainer) {
                maintenanceContainer.classList.toggle("is-open", open);
            }
        };

        setMaintenanceOpen(maintenanceToggle.dataset.maintenanceOpen === "true");

        maintenanceToggle.addEventListener("click", (event) => {
            event.preventDefault();
            const isOpen = maintenanceToggle.getAttribute("aria-expanded") === "true";
            setMaintenanceOpen(!isOpen);
        });
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    });
});

/* ROAD_MAINTENANCE_SCRIPT_START */
document.addEventListener("DOMContentLoaded", () => {
    const equipmentModal = document.querySelector(".js-equipment-modal");
    const openEquipmentModalButtons = document.querySelectorAll(".js-open-equipment-modal");
    const closeEquipmentModalButtons = document.querySelectorAll(".js-close-equipment-modal");
    const equipmentForm = document.querySelector(".js-equipment-form");
    const equipmentTableBody = document.querySelector(".js-equipment-table-body");
    const equipmentRecordMeta = document.querySelector(".js-equipment-record-meta");
    const equipmentStatAvailable = document.querySelector(".js-equipment-stat-available");
    const equipmentStatInUse = document.querySelector(".js-equipment-stat-in-use");
    const equipmentStatMaintenance = document.querySelector(".js-equipment-stat-maintenance");
    const equipmentStatOutService = document.querySelector(".js-equipment-stat-out-service");
    const topEquipmentCount = document.querySelector(".js-top-equipment-count");
    const scheduleModal = document.querySelector(".js-schedule-modal");
    const openScheduleModalButtons = document.querySelectorAll(".js-open-schedule-modal");
    const closeScheduleModalButtons = document.querySelectorAll(".js-close-schedule-modal");
    const scheduleForm = document.querySelector(".js-schedule-form");
    const scheduleTableBody = document.querySelector(".js-schedule-table-body");
    const scheduleCountText = document.querySelector(".js-schedule-count-text");
    const scheduleStatScheduled = document.querySelector(".js-schedule-stat-scheduled");
    const scheduleStatProgress = document.querySelector(".js-schedule-stat-progress");
    const scheduleStatCompleted = document.querySelector(".js-schedule-stat-completed");
    const scheduleStatUrgent = document.querySelector(".js-schedule-stat-urgent");
    const topScheduledCount = document.querySelector(".js-top-scheduled-count");

    const setBodyScrollLock = () => {
        const isAnyModalOpen = [equipmentModal, scheduleModal].some((modal) => modal && !modal.hidden);
        document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
    };

    const escapeHtml = (value) =>
        value
            .toString()
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    const getEquipmentRows = () => {
        if (!equipmentTableBody) {
            return [];
        }
        const rows = equipmentTableBody.querySelectorAll("tr");
        return Array.from(rows).filter((row) => !row.classList.contains("equipment-empty-row"));
    };

    const updateEquipmentSummary = () => {
        const rows = getEquipmentRows();
        const count = rows.length;

        if (equipmentRecordMeta) {
            equipmentRecordMeta.textContent = `${count} equipment found`;
        }
        if (topEquipmentCount) {
            topEquipmentCount.textContent = String(count);
        }

        let availableCount = 0;
        let inUseCount = 0;
        let maintenanceCount = 0;
        let outOfServiceCount = 0;

        rows.forEach((row) => {
            const statusValue = (row.cells[5]?.textContent || "").trim().toLowerCase();
            if (statusValue === "available") {
                availableCount += 1;
            }
            if (statusValue === "in use") {
                inUseCount += 1;
            }
            if (statusValue === "under maintenance") {
                maintenanceCount += 1;
            }
            if (statusValue === "out of service") {
                outOfServiceCount += 1;
            }
        });

        if (equipmentStatAvailable) {
            equipmentStatAvailable.textContent = String(availableCount);
        }
        if (equipmentStatInUse) {
            equipmentStatInUse.textContent = String(inUseCount);
        }
        if (equipmentStatMaintenance) {
            equipmentStatMaintenance.textContent = String(maintenanceCount);
        }
        if (equipmentStatOutService) {
            equipmentStatOutService.textContent = String(outOfServiceCount);
        }
    };

    const closeEquipmentModal = () => {
        if (!equipmentModal) {
            return;
        }
        equipmentModal.hidden = true;
        setBodyScrollLock();
    };

    const openEquipmentModal = () => {
        if (!equipmentModal) {
            return;
        }
        equipmentModal.hidden = false;
        setBodyScrollLock();
        const firstInput = equipmentModal.querySelector("input[name='name']");
        if (firstInput) {
            firstInput.focus();
        }
    };

    openEquipmentModalButtons.forEach((button) => {
        button.addEventListener("click", openEquipmentModal);
    });

    closeEquipmentModalButtons.forEach((button) => {
        button.addEventListener("click", closeEquipmentModal);
    });

    const closeScheduleModal = () => {
        if (!scheduleModal) {
            return;
        }
        scheduleModal.hidden = true;
        setBodyScrollLock();
    };

    const openScheduleModal = () => {
        if (!scheduleModal) {
            return;
        }
        scheduleModal.hidden = false;
        setBodyScrollLock();
        const firstInput = scheduleModal.querySelector("input[name='title']");
        if (firstInput) {
            firstInput.focus();
        }
    };

    openScheduleModalButtons.forEach((button) => {
        button.addEventListener("click", openScheduleModal);
    });

    closeScheduleModalButtons.forEach((button) => {
        button.addEventListener("click", closeScheduleModal);
    });

    if (equipmentForm && equipmentTableBody) {
        equipmentForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(equipmentForm);
            const code = (formData.get("code") || "").toString().trim();
            const name = (formData.get("name") || "").toString().trim();
            const type = (formData.get("type") || "").toString().trim();
            const model = (formData.get("model") || "").toString().trim();
            const plateNumber = (formData.get("plate_number") || "").toString().trim();
            const status = (formData.get("status") || "").toString().trim();
            const location = (formData.get("location") || "").toString().trim();
            const operator = (formData.get("operator") || "").toString().trim();

            if (!name) {
                return;
            }

            const emptyRow = equipmentTableBody.querySelector(".equipment-empty-row");
            if (emptyRow) {
                emptyRow.remove();
            }

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${escapeHtml(code || "-")}</td>
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(type || "-")}</td>
                <td>${escapeHtml(model || "-")}</td>
                <td>${escapeHtml(plateNumber || "-")}</td>
                <td>${escapeHtml(status || "-")}</td>
                <td>${escapeHtml(location || "-")}</td>
                <td>${escapeHtml(operator || "-")}</td>
            `;

            equipmentTableBody.prepend(newRow);
            equipmentForm.reset();
            updateEquipmentSummary();
            closeEquipmentModal();
        });
    }

    const getScheduleRows = () => {
        if (!scheduleTableBody) {
            return [];
        }
        const rows = scheduleTableBody.querySelectorAll("tr");
        return Array.from(rows).filter((row) => !row.classList.contains("schedule-empty-row"));
    };

    const updateScheduleSummary = () => {
        const rows = getScheduleRows();
        const rowCount = rows.length;

        if (scheduleCountText) {
            scheduleCountText.textContent = `${rowCount} schedule${rowCount === 1 ? "" : "s"} found`;
        }
        if (topScheduledCount) {
            topScheduledCount.textContent = String(rowCount);
        }

        let scheduledCount = 0;
        let inProgressCount = 0;
        let completedCount = 0;
        let urgentCount = 0;

        rows.forEach((row) => {
            const priorityValue = (row.cells[3]?.textContent || "").trim().toLowerCase();
            const statusValue = (row.cells[4]?.textContent || "").trim().toLowerCase();

            if (statusValue === "scheduled") {
                scheduledCount += 1;
            }
            if (statusValue === "in progress") {
                inProgressCount += 1;
            }
            if (statusValue === "completed") {
                completedCount += 1;
            }
            if (priorityValue === "urgent") {
                urgentCount += 1;
            }
        });

        if (scheduleStatScheduled) {
            scheduleStatScheduled.textContent = String(scheduledCount);
        }
        if (scheduleStatProgress) {
            scheduleStatProgress.textContent = String(inProgressCount);
        }
        if (scheduleStatCompleted) {
            scheduleStatCompleted.textContent = String(completedCount);
        }
        if (scheduleStatUrgent) {
            scheduleStatUrgent.textContent = String(urgentCount);
        }
    };

    const formatDateValue = (value) => {
        if (!value) {
            return "-";
        }
        const parts = value.split("-");
        if (parts.length !== 3) {
            return value;
        }
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    if (scheduleForm && scheduleTableBody) {
        scheduleForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = new FormData(scheduleForm);
            const title = (formData.get("title") || "").toString().trim();
            const road = (formData.get("road") || "").toString().trim();
            const type = (formData.get("type") || "").toString().trim();
            const priority = (formData.get("priority") || "").toString().trim();
            const team = (formData.get("team") || "").toString().trim();
            const startDate = (formData.get("start_date") || "").toString().trim();

            if (!title) {
                return;
            }

            const emptyRow = scheduleTableBody.querySelector(".schedule-empty-row");
            if (emptyRow) {
                emptyRow.remove();
            }

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td>${escapeHtml(title)}</td>
                <td>${escapeHtml(road || "-")}</td>
                <td>${escapeHtml(type || "-")}</td>
                <td>${escapeHtml(priority || "-")}</td>
                <td>Scheduled</td>
                <td>${escapeHtml(formatDateValue(startDate))}</td>
                <td>${escapeHtml(team || "-")}</td>
            `;

            scheduleTableBody.prepend(newRow);
            scheduleForm.reset();
            updateScheduleSummary();
            closeScheduleModal();
        });
    }

    updateEquipmentSummary();
    updateScheduleSummary();

    const tabs = document.querySelectorAll(".road-tab[data-road-tab]");
    const panels = document.querySelectorAll(".road-tab-panel[data-road-panel]");

    if (tabs.length) {
        const setActiveTab = (tabKey) => {
            tabs.forEach((tab) => {
                const isActive = tab.dataset.roadTab === tabKey;
                tab.classList.toggle("is-active", isActive);
                tab.setAttribute("aria-selected", String(isActive));
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.roadPanel === tabKey;
                panel.classList.toggle("is-active", isActive);
                panel.hidden = !isActive;
            });
        };

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActiveTab(tab.dataset.roadTab);
            });
        });

        const activeTab = document.querySelector(".road-tab.is-active[data-road-tab]");
        setActiveTab(activeTab ? activeTab.dataset.roadTab : tabs[0].dataset.roadTab);
    }

    const dropdowns = document.querySelectorAll(".js-road-dropdown");
    const closeDropdowns = (current = null) => {
        dropdowns.forEach((dropdown) => {
            if (dropdown !== current) {
                dropdown.classList.remove("is-open");
                const trigger = dropdown.querySelector(".dropdown-trigger");
                if (trigger) {
                    trigger.setAttribute("aria-expanded", "false");
                }
            }
        });
    };

    if (dropdowns.length) {
        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector(".dropdown-trigger");
            const label = dropdown.querySelector(".dropdown-label");
            const options = dropdown.querySelectorAll(".dropdown-option");

            if (trigger) {
                trigger.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const opening = !dropdown.classList.contains("is-open");
                    closeDropdowns(dropdown);
                    dropdown.classList.toggle("is-open", opening);
                    trigger.setAttribute("aria-expanded", String(opening));
                });
            }

            options.forEach((option) => {
                option.addEventListener("click", () => {
                    options.forEach((item) => item.classList.remove("is-selected"));
                    option.classList.add("is-selected");

                    if (label) {
                        label.textContent = option.textContent;
                    }

                    dropdown.classList.remove("is-open");
                    if (trigger) {
                        trigger.setAttribute("aria-expanded", "false");
                    }
                });
            });
        });

        document.addEventListener("click", () => {
            closeDropdowns();
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDropdowns();
            closeEquipmentModal();
            closeScheduleModal();
        }
    });
});

/* ROAD_MAINTENANCE_SCRIPT_END */

