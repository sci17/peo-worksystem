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
    const projectDashboardButton = document.querySelector(".js-project-dashboard-button");
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

    if (projectDashboardButton) {
        projectDashboardButton.addEventListener("click", (event) => {
            event.preventDefault();
            const targetUrl = projectDashboardButton.dataset.projectDashboardUrl;
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
            const willOpen = !isOpen;
            setMaintenanceOpen(willOpen);
            if (willOpen) {
                showPeoGeneralToast("Maintenance Division tools are available below in the sidebar.", {
                    title: "Maintenance Division",
                    variant: "info",
                });
            }
        });
    }

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    });

    const newDocumentButton = document.querySelector(".pa-new-doc");
    const documentsTableBody = document.getElementById("pa-documents-tbody")
        || document.querySelector('[data-admin-panel="documents"] .pa-table tbody');
    const billingTableBody = document.getElementById("pa-billing-tbody")
        || document.querySelector('[data-admin-panel="billing"] .pa-table tbody');
    const documentsFoundLabel = document.getElementById("pa-documents-found");
    const billingCountLabel = document.getElementById("pa-billing-count");
    const docMetricTotal = document.querySelector('[data-doc-metric="total"]');
    const docMetricForReview = document.querySelector('[data-doc-metric="for_review"]');
    const docMetricProcessing = document.querySelector('[data-doc-metric="processing"]');
    const docMetricOpenIssues = document.querySelector('[data-doc-metric="open_issues"]');
    const docMetricThisWeek = document.getElementById("pa-documents-this-week");
    const docMetricCompleted = document.getElementById("pa-documents-completed");
    const docMetricApproved = document.getElementById("pa-documents-approved");
    const docMetricEfficiency = document.getElementById("pa-documents-efficiency");
    const docMetricEfficiencyBar = document.getElementById("pa-documents-efficiency-bar");
    const docStatusCardDraft = document.querySelector('[data-doc-status-card="draft"]');
    const docStatusCardForReview = document.querySelector('[data-doc-status-card="for_review"]');
    const docStatusCardProcessing = document.querySelector('[data-doc-status-card="processing"]');
    const docStatusCardApproved = document.querySelector('[data-doc-status-card="approved"]');
    const billingMetricTotal = document.querySelector('[data-billing-metric="total"]');
    const billingMetricReceived = document.querySelector('[data-billing-metric="received"]');
    const billingMetricOnProcess = document.querySelector('[data-billing-metric="on_process"]');
    const billingMetricPending = document.querySelector('[data-billing-metric="pending"]');
    const billingStatusCardDraft = document.querySelector('[data-billing-status-card="draft"]');
    const billingStatusCardForReview = document.querySelector('[data-billing-status-card="for_review"]');
    const billingStatusCardRouted = document.querySelector('[data-billing-status-card="routed"]');
    const billingStatusCardProcessing = document.querySelector('[data-billing-status-card="processing"]');
    const billingStatusCardApproved = document.querySelector('[data-billing-status-card="approved"]');
    const billingStatusCardOpen = document.querySelector('[data-billing-status-card="open"]');
    const billingStatusCardClosed = document.querySelector('[data-billing-status-card="closed"]');
    const adminFloatCards = document.querySelectorAll(".admin-division-float-card");
    const documentsPanel = document.querySelector('[data-admin-panel="documents"]');
    const billingPanel = document.querySelector('[data-admin-panel="billing"]');
    const documentSearchInput = documentsPanel?.querySelector("[data-admin-doc-search]")
        || documentsPanel?.querySelector(".pa-doc-search");
    const documentDivisionFilter = documentsPanel?.querySelector("[data-admin-doc-division-filter]")
        || documentsPanel?.querySelectorAll(".pa-select")?.[0];
    const documentStatusFilter = documentsPanel?.querySelector("[data-admin-doc-status-filter]")
        || documentsPanel?.querySelectorAll(".pa-select")?.[1];
    const billingSearchInput = billingPanel?.querySelector("[data-admin-billing-search]")
        || billingPanel?.querySelector(".pa-doc-search");
    const billingStatusFilter = billingPanel?.querySelector("[data-admin-billing-status-filter]")
        || billingPanel?.querySelector(".pa-select");
    const documentSelectAllCheckbox = documentsPanel?.querySelector('[data-admin-select-all="documents"]');
    const billingSelectAllCheckbox = billingPanel?.querySelector('[data-admin-select-all="billing"]');
    const documentBulkDeleteButton = documentsPanel?.querySelector('[data-admin-bulk-delete="documents"]');
    const billingBulkDeleteButton = billingPanel?.querySelector('[data-admin-bulk-delete="billing"]');
    const ADMIN_DIVISION_STORAGE_KEY = "peo_admin_division_records_v1";
    const ADMIN_DIVISION_RECORD_ID_PREFIX = "admin_record_";
    let editingRecordId = null;
    let editingTableType = null;
    let adminStatusToastElement = null;
    let adminStatusToastTimer = null;
    let adminConfirmToastElement = null;

    const closeAdminStatusToast = () => {
        if (!adminStatusToastElement) return;
        adminStatusToastElement.classList.remove("is-visible");
        const toastToRemove = adminStatusToastElement;
        adminStatusToastElement = null;
        window.setTimeout(() => {
            toastToRemove.remove();
        }, 180);
        if (adminStatusToastTimer) {
            window.clearTimeout(adminStatusToastTimer);
            adminStatusToastTimer = null;
        }
    };

    const showAdminStatusToast = (message, variant = "success") => {
        closeAdminStatusToast();
        const toast = document.createElement("div");
        toast.className = `admin-status-toast admin-status-toast--${variant === "success" ? "success" : "info"}`;
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.innerHTML = `
            <div class="admin-status-toast__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path d="M9.2 16.8 4.9 12.5l1.6-1.6 2.7 2.7 8-8L18.8 7l-9.6 9.8z"></path>
                </svg>
            </div>
            <div class="admin-status-toast__body">${String(message || "").trim() || "Action completed successfully."}</div>
        `;
        document.body.appendChild(toast);
        adminStatusToastElement = toast;
        window.requestAnimationFrame(() => {
            toast.classList.add("is-visible");
        });
        adminStatusToastTimer = window.setTimeout(() => {
            closeAdminStatusToast();
        }, 3200);
    };

    const closeAdminConfirmToast = () => {
        if (!adminConfirmToastElement) return;
        adminConfirmToastElement.remove();
        adminConfirmToastElement = null;
    };

    const showAdminConfirmToast = (options = {}) => {
        closeAdminConfirmToast();
        const titleText = String(options.title || "Confirm Delete").trim() || "Confirm Delete";
        const messageText = String(options.message || "Are you sure to delete this data?").trim() || "Are you sure to delete this data?";
        const confirmLabel = String(options.confirmLabel || "Yes, Delete").trim() || "Yes, Delete";
        const cancelLabel = String(options.cancelLabel || "Cancel").trim() || "Cancel";

        const prompt = document.createElement("div");
        prompt.className = "admin-confirm-toast";
        prompt.setAttribute("role", "alertdialog");
        prompt.setAttribute("aria-live", "assertive");
        prompt.innerHTML = `
            <div class="admin-confirm-toast__header">${titleText}</div>
            <p class="admin-confirm-toast__message">${messageText}</p>
            <div class="admin-confirm-toast__actions">
                <button type="button" class="admin-confirm-toast__btn admin-confirm-toast__btn--danger" data-action="yes">${confirmLabel}</button>
                <button type="button" class="admin-confirm-toast__btn admin-confirm-toast__btn--cancel" data-action="cancel">${cancelLabel}</button>
            </div>
        `;

        document.body.appendChild(prompt);
        adminConfirmToastElement = prompt;
        window.requestAnimationFrame(() => {
            prompt.classList.add("is-visible");
        });

        return new Promise((resolve) => {
            let settled = false;
            const settle = (approved) => {
                if (settled) return;
                settled = true;
                closeAdminConfirmToast();
                resolve(Boolean(approved));
            };

            prompt.querySelectorAll("[data-action]").forEach((button) => {
                button.addEventListener("click", () => {
                    const action = String(button.getAttribute("data-action") || "");
                    settle(action === "yes");
                });
            });
        });
    };

    const closeAdminSelectDropdowns = () => {
        document.querySelectorAll(".pa-select-custom.is-open").forEach((dropdown) => {
            dropdown.classList.remove("is-open");
        });
    };

    const enhanceAdminSelect = (select) => {
        if (!(select instanceof HTMLSelectElement)) return;
        if (select.dataset.enhanced === "true") return;
        select.dataset.enhanced = "true";
        select.classList.add("pa-select-native-hidden");

        const wrapper = document.createElement("div");
        wrapper.className = "pa-select-custom";

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "pa-select-custom__trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");

        const label = document.createElement("span");
        label.className = "pa-select-custom__label";
        const caret = document.createElement("span");
        caret.className = "pa-select-custom__caret";
        caret.textContent = "▾";
        trigger.appendChild(label);
        trigger.appendChild(caret);

        const menu = document.createElement("ul");
        menu.className = "pa-select-custom__menu";
        menu.setAttribute("role", "listbox");

        const renderOptions = () => {
            menu.innerHTML = "";
            Array.from(select.options).forEach((option) => {
                const item = document.createElement("li");
                const optionButton = document.createElement("button");
                optionButton.type = "button";
                optionButton.className = "pa-select-custom__option";
                optionButton.dataset.value = option.value;
                optionButton.textContent = option.textContent || option.value;
                optionButton.setAttribute("role", "option");
                if (option.disabled) {
                    optionButton.disabled = true;
                }
                if (option.selected) {
                    optionButton.classList.add("is-selected");
                    optionButton.setAttribute("aria-selected", "true");
                } else {
                    optionButton.setAttribute("aria-selected", "false");
                }
                item.appendChild(optionButton);
                menu.appendChild(item);
            });
        };

        const syncFromSelect = () => {
            const selectedOption = select.options[select.selectedIndex];
            label.textContent = selectedOption?.textContent || "Select";
            menu.querySelectorAll(".pa-select-custom__option").forEach((button) => {
                const isSelected = button.dataset.value === select.value;
                button.classList.toggle("is-selected", isSelected);
                button.setAttribute("aria-selected", isSelected ? "true" : "false");
            });
        };
        select._adminSelectSync = syncFromSelect;
        select._adminSelectRender = renderOptions;

        renderOptions();
        syncFromSelect();

        trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            const willOpen = !wrapper.classList.contains("is-open");
            closeAdminSelectDropdowns();
            wrapper.classList.toggle("is-open", willOpen);
            trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });

        menu.addEventListener("click", (event) => {
            const optionButton = event.target.closest(".pa-select-custom__option");
            if (!optionButton || optionButton.disabled) return;
            const nextValue = String(optionButton.dataset.value || "");
            if (select.value !== nextValue) {
                select.value = nextValue;
                select.dispatchEvent(new Event("change", { bubbles: true }));
            } else {
                syncFromSelect();
            }
            wrapper.classList.remove("is-open");
            trigger.setAttribute("aria-expanded", "false");
        });

        if (select.dataset.adminSelectListenerBound !== "true") {
            select.addEventListener("change", () => {
                if (typeof select._adminSelectSync === "function") {
                    select._adminSelectSync();
                }
            });
            select.dataset.adminSelectListenerBound = "true";
        }

        if (!select._adminSelectObserver && typeof MutationObserver !== "undefined") {
            const observer = new MutationObserver(() => {
                if (typeof select._adminSelectRender === "function") {
                    select._adminSelectRender();
                }
                if (typeof select._adminSelectSync === "function") {
                    select._adminSelectSync();
                }
            });
            observer.observe(select, {
                childList: true,
                subtree: true,
                attributes: true,
            });
            select._adminSelectObserver = observer;
        }

        wrapper.appendChild(trigger);
        wrapper.appendChild(menu);
        select.insertAdjacentElement("afterend", wrapper);
    };

    const refreshAdminEnhancedSelect = (select) => {
        if (!(select instanceof HTMLSelectElement)) return;
        const wrapper = select.nextElementSibling;
        if (wrapper instanceof HTMLElement && wrapper.classList.contains("pa-select-custom")) {
            wrapper.remove();
        }
        if (select._adminSelectObserver && typeof select._adminSelectObserver.disconnect === "function") {
            select._adminSelectObserver.disconnect();
        }
        delete select._adminSelectObserver;
        delete select._adminSelectRender;
        delete select._adminSelectSync;
        delete select.dataset.enhanced;
        select.classList.remove("pa-select-native-hidden");
        enhanceAdminSelect(select);
    };

    const enhanceAdminFormSelects = (form) => {
        if (!(form instanceof HTMLFormElement)) return;
        form.querySelectorAll("select").forEach((select) => {
            refreshAdminEnhancedSelect(select);
        });
    };

    [documentDivisionFilter, documentStatusFilter, billingStatusFilter].forEach((select) => {
        enhanceAdminSelect(select);
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".pa-select-custom")) {
            closeAdminSelectDropdowns();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAdminSelectDropdowns();
        }
    });

    const normalizeStatus = (value) => {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
    };

    const statusLabel = (value) => {
        const normalized = normalizeStatus(value);
        if (normalized === "on_process") return "On Process";
        if (normalized === "received") return "Received";
        if (normalized === "for_review") return "For Review";
        if (normalized === "routed") return "Routed";
        if (normalized === "processing") return "Processing";
        if (normalized === "approved") return "Approved";
        if (normalized === "open") return "Open";
        if (normalized === "closed") return "Closed";
        if (normalized === "draft") return "Draft";
        return value || "Draft";
    };

    const createStatusBadge = (value) => {
        const badge = document.createElement("span");
        const normalized = normalizeStatus(value) || "draft";
        badge.className = `admin-division-status-badge is-${normalized}`;
        badge.textContent = statusLabel(value);
        return badge;
    };

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const readFileAsDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsDataURL(file);
        });
    };

    const getBillingTypeDisplay = (values) => {
        const billingType = String(values.billing_type || "").trim();
        const billingTypeOther = String(values.billing_type_other || "").trim();
        if (normalizeStatus(billingType) === "others") {
            return billingTypeOther ? `Others - ${billingTypeOther}` : "Others";
        }
        return billingType || "-";
    };

    const normalizeBillingHistoryStatus = (value) => {
        const normalized = normalizeStatus(value || "draft");
        if (normalized === "received") return "approved";
        if (normalized === "on_process") return "processing";
        return normalized || "draft";
    };

    const buildBillingHistoryEntry = (record, changedAt) => {
        const snapshot = {
            billing_type: String(record.billing_type || "").trim(),
            billing_type_other: String(record.billing_type_other || "").trim(),
            percentage: String(record.percentage || "").trim(),
            date_received: String(record.date_received || "").trim(),
            received_by: String(record.received_by || "").trim(),
            status: normalizeBillingHistoryStatus(record.billing_status || record.status || "draft"),
            changed_at: changedAt || new Date().toISOString(),
        };
        return snapshot;
    };

    const hasBillingHistoryChange = (previousEntry, nextEntry) => {
        const fields = [
            "billing_type",
            "billing_type_other",
            "percentage",
            "date_received",
            "received_by",
            "status",
        ];
        return fields.some((field) => String(previousEntry?.[field] || "") !== String(nextEntry?.[field] || ""));
    };

    const ensureBillingHistory = (record) => {
        const existingHistory = Array.isArray(record.billing_history) ? [...record.billing_history] : [];
        if (existingHistory.length) return existingHistory;
        return [buildBillingHistoryEntry(record)];
    };

    const buildBillingHistoryCell = (record) => {
        const historyWrap = document.createElement("div");
        historyWrap.className = "pa-billing-history";
        const historyEntries = ensureBillingHistory(record);
        const previewCount = 2;

        const historyItems = historyEntries
            .slice()
            .reverse()
            .map((entry, indexFromLatest) => {
                const item = document.createElement("div");
                item.className = `pa-billing-history-item${indexFromLatest === 0 ? " is-latest" : ""}`;
                item.dataset.historyIndex = String(indexFromLatest);

                const versionTag = document.createElement("span");
                versionTag.className = "pa-billing-history-version";
                const versionNumber = historyEntries.length - indexFromLatest;
                versionTag.textContent = `v${versionNumber}${indexFromLatest === 0 ? " (Latest)" : ""}`;

                const details = document.createElement("small");
                const typeDisplay = getBillingTypeDisplay(entry);
                const detailParts = [];

                if (typeDisplay && typeDisplay !== "-") {
                    detailParts.push(typeDisplay);
                }
                if (entry.percentage) {
                    detailParts.push(entry.percentage);
                }
                if (entry.date_received) {
                    detailParts.push(formatDate(entry.date_received));
                }
                if (entry.received_by) {
                    detailParts.push(entry.received_by);
                }

                details.textContent = detailParts.length
                    ? detailParts.join(" | ")
                    : "No billing details recorded";

                item.appendChild(versionTag);
                item.appendChild(details);
                return item;
            });

        historyItems.forEach((item, index) => {
            if (index >= previewCount) {
                item.classList.add("pa-history-hidden");
            }
            historyWrap.appendChild(item);
        });

        if (historyItems.length > previewCount) {
            const toggleButton = document.createElement("button");
            toggleButton.type = "button";
            toggleButton.className = "pa-billing-history-toggle";
            toggleButton.dataset.expanded = "false";
            toggleButton.textContent = `Show ${historyItems.length - previewCount} more`;

            toggleButton.addEventListener("click", () => {
                const expanded = toggleButton.dataset.expanded === "true";
                const nextExpanded = !expanded;
                toggleButton.dataset.expanded = nextExpanded ? "true" : "false";

                historyItems.forEach((item, index) => {
                    if (index < previewCount) return;
                    item.classList.toggle("pa-history-hidden", !nextExpanded);
                });

                toggleButton.textContent = nextExpanded
                    ? "Show less"
                    : `Show ${historyItems.length - previewCount} more`;
            });

            historyWrap.appendChild(toggleButton);
        }

        return historyWrap;
    };

    const generateRecordId = () => {
        return `${ADMIN_DIVISION_RECORD_ID_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    };

    const normalizeRecord = (rawRecord) => {
        const normalized = { ...(rawRecord || {}) };
        normalized.__record_id = normalized.__record_id || generateRecordId();
        const fallbackStatus = normalized.status || "Draft";
        normalized.doc_status = normalized.doc_status || fallbackStatus;
        normalized.billing_status = normalized.billing_status || normalized.doc_status || "Draft";
        normalized.status = normalized.doc_status;
        normalized.division = normalized.division || "Admin";
        normalized.doc_type = normalized.doc_type || "Other";
        normalized.scanned_file_name = normalized.scanned_file_name || "";
        normalized.scanned_file_type = normalized.scanned_file_type || "";
        normalized.scanned_file_data = normalized.scanned_file_data || "";
        normalized.billing_history = ensureBillingHistory(normalized);
        return normalized;
    };

    const refreshScannedFileLabel = (form) => {
        if (!form) return;
        const fileInput = form.querySelector('[name="scanned_file"]');
        const label = form.querySelector("[data-admin-file-current]");
        if (!fileInput || !label) return;

        const selectedFileName = fileInput.files?.[0]?.name || "";
        const existingFileName = form.dataset.existingScannedFileName || "";
        if (selectedFileName) {
            label.textContent = `Selected file: ${selectedFileName}`;
            return;
        }
        if (existingFileName) {
            label.textContent = `Current file: ${existingFileName}`;
            return;
        }
        label.textContent = "No scanned file uploaded.";
    };

    const setExistingScannedFileName = (form, fileName) => {
        if (!form) return;
        form.dataset.existingScannedFileName = fileName || "";
        refreshScannedFileLabel(form);
    };

    const createRowSelectionCell = (recordId) => {
        const selectionCell = document.createElement("td");
        selectionCell.className = "pa-select-col";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "js-admin-row-select";
        checkbox.dataset.recordId = recordId;
        checkbox.setAttribute("aria-label", "Select row");
        selectionCell.appendChild(checkbox);
        return selectionCell;
    };

    const setRowActionsCell = (cell, recordId) => {
        cell.className = "pa-row-actions";
        cell.innerHTML = `
            <button type="button" class="pa-action-icon pa-action-edit" data-admin-action="edit" data-record-id="${recordId}" aria-label="Edit row" title="Edit">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m3 17.25 9.06-9.06 3.75 3.75L6.75 21H3v-3.75zm13.71-10.04a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.09 1.09 3.75 3.75 1.25-1.93z"></path>
                </svg>
            </button>
            <button type="button" class="pa-action-icon pa-action-delete" data-admin-action="delete" data-record-id="${recordId}" aria-label="Delete row" title="Delete">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM7 10h2v8H7v-8z"></path>
                </svg>
            </button>
        `;
    };

    const getTableDataRows = (tableBody, emptyClass) => {
        if (!tableBody) return [];
        return Array.from(tableBody.querySelectorAll("tr")).filter((row) => !row.classList.contains(emptyClass));
    };

    const ensureEmptyRowState = (tableBody, emptyClass, colSpan, message, shouldShow) => {
        if (!tableBody) return;
        let emptyRow = tableBody.querySelector(`.${emptyClass}`);

        if (shouldShow) {
            if (!emptyRow) {
                emptyRow = document.createElement("tr");
                emptyRow.className = emptyClass;
                const cell = document.createElement("td");
                cell.colSpan = colSpan;
                cell.textContent = message;
                emptyRow.appendChild(cell);
                tableBody.appendChild(emptyRow);
            }
            emptyRow.hidden = false;
            return;
        }

        if (emptyRow) {
            emptyRow.hidden = true;
        }
    };

    const isLocalStorageAvailable = () => {
        try {
            const probeKey = "__peo_admin_storage_probe__";
            window.localStorage.setItem(probeKey, "1");
            window.localStorage.removeItem(probeKey);
            return true;
        } catch (error) {
            return false;
        }
    };

    const readAdminDivisionRecords = () => {
        if (!isLocalStorageAvailable()) return [];
        try {
            const raw = window.localStorage.getItem(ADMIN_DIVISION_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed.map((record) => normalizeRecord(record));
        } catch (error) {
            return [];
        }
    };

    const writeAdminDivisionRecords = (records) => {
        if (!isLocalStorageAvailable()) return;
        try {
            window.localStorage.setItem(ADMIN_DIVISION_STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            // Ignore storage write failures (quota/private mode).
        }
    };

    const refreshDocumentCounters = () => {
        if (!documentsTableBody) return;

        const rows = getTableDataRows(documentsTableBody, "pa-empty-documents");
        const statuses = rows.map((row) => normalizeStatus(row.children[7]?.textContent));
        const total = rows.length;
        const forReview = statuses.filter((status) => status === "for_review").length;
        const processing = statuses.filter((status) => status === "processing").length;
        const openIssues = statuses.filter((status) => status === "draft").length;
        const approved = statuses.filter((status) => status === "approved").length;
        const efficiencyRate = total > 0 ? Math.round((approved / total) * 100) : 0;
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(now.getDate() - now.getDay());
        const thisWeek = rows.filter((row) => {
            const dateValue = String(row.children[8]?.textContent || "").trim();
            const parsed = new Date(dateValue);
            return !Number.isNaN(parsed.getTime()) && parsed >= weekStart;
        }).length;

        if (documentsFoundLabel) documentsFoundLabel.textContent = `${total} documents found`;
        if (docMetricTotal) docMetricTotal.textContent = String(total);
        if (docMetricForReview) docMetricForReview.textContent = String(forReview);
        if (docMetricProcessing) docMetricProcessing.textContent = String(processing);
        if (docMetricOpenIssues) docMetricOpenIssues.textContent = String(openIssues);
        if (docMetricThisWeek) docMetricThisWeek.textContent = String(thisWeek);
        if (docMetricCompleted) docMetricCompleted.textContent = String(approved);
        if (docMetricApproved) docMetricApproved.textContent = String(approved);
        if (docMetricEfficiency) docMetricEfficiency.textContent = `${efficiencyRate}%`;
        if (docMetricEfficiencyBar) docMetricEfficiencyBar.style.width = `${efficiencyRate}%`;
        if (docStatusCardDraft) docStatusCardDraft.textContent = String(openIssues);
        if (docStatusCardForReview) docStatusCardForReview.textContent = String(forReview);
        if (docStatusCardProcessing) docStatusCardProcessing.textContent = String(processing);
        if (docStatusCardApproved) docStatusCardApproved.textContent = String(approved);
    };

    const enableAdminDivisionCardFloat = () => {
        if (!adminFloatCards.length) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        adminFloatCards.forEach((card) => {
            if (!(card instanceof HTMLElement)) return;

            card.addEventListener("pointermove", (event) => {
                const bounds = card.getBoundingClientRect();
                const relativeX = (event.clientX - bounds.left) / bounds.width;
                const relativeY = (event.clientY - bounds.top) / bounds.height;
                const rotateY = (relativeX - 0.5) * 9;
                const rotateX = (0.5 - relativeY) * 9;
                const shiftX = (relativeX - 0.5) * 8;
                const shiftY = (relativeY - 0.5) * 8;

                card.style.setProperty("--admin-card-rotate-x", `${rotateX.toFixed(2)}deg`);
                card.style.setProperty("--admin-card-rotate-y", `${rotateY.toFixed(2)}deg`);
                card.style.setProperty("--admin-card-shift-x", `${shiftX.toFixed(2)}px`);
                card.style.setProperty("--admin-card-shift-y", `${shiftY.toFixed(2)}px`);
            });

            const resetAdminCardFloat = () => {
                card.style.setProperty("--admin-card-rotate-x", "0deg");
                card.style.setProperty("--admin-card-rotate-y", "0deg");
                card.style.setProperty("--admin-card-shift-x", "0px");
                card.style.setProperty("--admin-card-shift-y", "0px");
            };

            card.addEventListener("pointerleave", resetAdminCardFloat);
            card.addEventListener("pointercancel", resetAdminCardFloat);
        });
    };

    const refreshBillingCounters = () => {
        if (!billingTableBody) return;

        const rows = getTableDataRows(billingTableBody, "pa-empty-billing");
        const statuses = rows.map((row) => normalizeStatus(row.children[7]?.textContent));
        const total = rows.length;
        const draft = statuses.filter((status) => status === "draft").length;
        const forReview = statuses.filter((status) => status === "for_review").length;
        const routed = statuses.filter((status) => status === "routed").length;
        const processing = statuses.filter((status) => status === "processing" || status === "on_process").length;
        const approved = statuses.filter((status) => status === "approved" || status === "received").length;
        const open = statuses.filter((status) => status === "open").length;
        const closed = statuses.filter((status) => status === "closed").length;

        if (billingCountLabel) billingCountLabel.textContent = `${total} record${total === 1 ? "" : "s"}`;
        if (billingMetricTotal) billingMetricTotal.textContent = String(total);
        if (billingMetricReceived) billingMetricReceived.textContent = String(approved);
        if (billingMetricOnProcess) billingMetricOnProcess.textContent = String(processing);
        if (billingMetricPending) billingMetricPending.textContent = String(open);
        if (billingStatusCardDraft) billingStatusCardDraft.textContent = String(draft);
        if (billingStatusCardForReview) billingStatusCardForReview.textContent = String(forReview);
        if (billingStatusCardRouted) billingStatusCardRouted.textContent = String(routed);
        if (billingStatusCardProcessing) billingStatusCardProcessing.textContent = String(processing);
        if (billingStatusCardApproved) billingStatusCardApproved.textContent = String(approved);
        if (billingStatusCardOpen) billingStatusCardOpen.textContent = String(open);
        if (billingStatusCardClosed) billingStatusCardClosed.textContent = String(closed);
    };

    const getSelectedRecordIds = (tableBody, emptyClass) => {
        return getTableDataRows(tableBody, emptyClass)
            .map((row) => row.querySelector(".js-admin-row-select"))
            .filter((checkbox) => checkbox && checkbox.checked)
            .map((checkbox) => checkbox.dataset.recordId);
    };

    const updateBulkDeleteButtonState = (tableType) => {
        const isDocuments = tableType === "documents";
        const tableBody = isDocuments ? documentsTableBody : billingTableBody;
        const emptyClass = isDocuments ? "pa-empty-documents" : "pa-empty-billing";
        const button = isDocuments ? documentBulkDeleteButton : billingBulkDeleteButton;
        const selectedCount = getSelectedRecordIds(tableBody, emptyClass).length;
        if (!button) return;
        button.disabled = selectedCount === 0;
        button.textContent = selectedCount > 0 ? `Delete Selected (${selectedCount})` : "Delete Selected";
    };

    const syncSelectAllCheckbox = (tableType) => {
        const isDocuments = tableType === "documents";
        const tableBody = isDocuments ? documentsTableBody : billingTableBody;
        const emptyClass = isDocuments ? "pa-empty-documents" : "pa-empty-billing";
        const selectAllCheckbox = isDocuments ? documentSelectAllCheckbox : billingSelectAllCheckbox;
        if (!selectAllCheckbox) return;

        const rows = getTableDataRows(tableBody, emptyClass).filter((row) => !row.hidden);
        if (!rows.length) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
            return;
        }

        const checkedCount = rows.filter((row) => row.querySelector(".js-admin-row-select")?.checked).length;
        selectAllCheckbox.checked = checkedCount === rows.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < rows.length;
    };

    const syncSelectionControls = () => {
        syncSelectAllCheckbox("documents");
        syncSelectAllCheckbox("billing");
        updateBulkDeleteButtonState("documents");
        updateBulkDeleteButtonState("billing");
    };

    const deleteRecordsByIds = (recordIds) => {
        if (!recordIds.length) return;
        const deleteSet = new Set(recordIds);
        const remainingRecords = readAdminDivisionRecords().filter((record) => !deleteSet.has(record.__record_id));
        writeAdminDivisionRecords(remainingRecords);
        renderAdminDivisionRecords(remainingRecords);
    };

    const setFormStatusOptionsByMode = (form, tableType) => {
        const statusSelect = form?.querySelector('[data-admin-status-select]');
        if (!statusSelect) return;

        if (tableType === "billing") {
            statusSelect.innerHTML = `
                <option value="Draft">Draft</option>
                <option value="For Review">For Review</option>
                <option value="Routed">Routed</option>
                <option value="Processing">Processing</option>
                <option value="Approved">Approved</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
            `;
            return;
        }

        statusSelect.innerHTML = `
            <option value="Draft">Draft</option>
            <option value="For Review">For Review</option>
            <option value="Routed">Routed</option>
            <option value="Processing">Processing</option>
            <option value="Approved">Approved</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
        `;
    };

    const toggleBillingTypeOtherField = (form) => {
        const billingTypeSelect = form?.querySelector('[data-admin-billing-type-select]');
        const otherWrap = form?.querySelector('[data-admin-billing-type-other-wrap]');
        if (!billingTypeSelect || !otherWrap) return;
        const isOthers = normalizeStatus(billingTypeSelect.value) === "others";
        otherWrap.classList.toggle("pa-form-hidden-field", !isOthers);
    };

    const toggleBillingReceivedFields = (form) => {
        const statusSelect = form?.querySelector('[data-admin-status-select]');
        const dateWrap = form?.querySelector('[data-admin-received-date-wrap]');
        const receivedByWrap = form?.querySelector('[data-admin-received-by-wrap]');
        if (!statusSelect || !dateWrap || !receivedByWrap) return;

        const isReceived = normalizeStatus(statusSelect.value) === "received";
        dateWrap.classList.toggle("pa-form-hidden-field", !isReceived);
        receivedByWrap.classList.toggle("pa-form-hidden-field", !isReceived);
    };

    const openEditModalForRecord = (recordId, tableType = "documents") => {
        const record = readAdminDivisionRecords().find((item) => item.__record_id === recordId);
        if (!record) return;

        const modal = buildNewDocumentModal();
        const form = modal.querySelector("#admin-new-document-form");
        const kicker = modal.querySelector(".pa-doc-modal-kicker");
        const title = modal.querySelector("#admin-new-document-title");
        const subtitle = modal.querySelector("#admin-new-document-subtitle");
        const submitButton = modal.querySelector("#admin-new-document-submit");
        if (!form) return;

        editingRecordId = recordId;
        editingTableType = tableType;
        form.reset();
        setFormStatusOptionsByMode(form, tableType);
        enhanceAdminFormSelects(form);
        const recordForForm = {
            ...record,
            status: tableType === "billing"
                ? (
                    normalizeStatus(record.billing_status || record.status) === "received"
                        ? "Approved"
                        : normalizeStatus(record.billing_status || record.status) === "on_process"
                            ? "Processing"
                            : (record.billing_status || record.status)
                )
                : (record.doc_status || record.status),
        };
        Object.keys(recordForForm).forEach((key) => {
            const input = form.elements.namedItem(key);
            if (input && input.type !== "file") {
                input.value = recordForForm[key] || "";
            }
        });
        enhanceAdminFormSelects(form);

        if (tableType === "billing") {
            if (kicker) kicker.textContent = "Billing Records";
            if (title) title.textContent = "Edit Billing Record";
            if (subtitle) subtitle.textContent = "Update billing status and payment details";
            if (submitButton) submitButton.textContent = "Save Billing Changes";
        } else {
            if (kicker) kicker.textContent = "Document Register";
            if (title) title.textContent = "Edit Document";
            if (subtitle) subtitle.textContent = "Update document details";
            if (submitButton) submitButton.textContent = "Save Changes";
        }
        toggleBillingTypeOtherField(form);
        toggleBillingReceivedFields(form);
        setExistingScannedFileName(form, record.scanned_file_name || "");

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    const applyDocumentFilters = () => {
        if (!documentsTableBody) return;

        const rows = getTableDataRows(documentsTableBody, "pa-empty-documents");
        const searchTerm = String(documentSearchInput?.value || "").trim().toLowerCase();
        const selectedDivision = String(documentDivisionFilter?.value || "all").trim().toLowerCase();
        const selectedStatus = normalizeStatus(documentStatusFilter?.value || "all");
        let visibleCount = 0;

        rows.forEach((row) => {
            const divisionValue = String(row.children[6]?.textContent || "").trim().toLowerCase();
            const statusValue = normalizeStatus(row.children[7]?.textContent || "");
            const rowText = Array.from(row.querySelectorAll("td"))
                .map((cell) => cell.textContent || "")
                .join(" ")
                .toLowerCase();

            const matchesSearch = !searchTerm || rowText.includes(searchTerm);
            const matchesDivision = selectedDivision === "all" || divisionValue === selectedDivision;
            const matchesStatus = selectedStatus === "all" || statusValue === selectedStatus;
            const matches = matchesSearch && matchesDivision && matchesStatus;

            row.hidden = !matches;
            if (!matches) {
                const rowCheckbox = row.querySelector(".js-admin-row-select");
                if (rowCheckbox) rowCheckbox.checked = false;
            }
            if (matches) visibleCount += 1;
        });

        ensureEmptyRowState(
            documentsTableBody,
            "pa-empty-documents",
            11,
            "No documents found.",
            visibleCount === 0
        );
        if (documentsFoundLabel) {
            documentsFoundLabel.textContent = `${visibleCount} document${visibleCount === 1 ? "" : "s"} found`;
        }
        syncSelectionControls();
    };

    const applyBillingFilters = () => {
        if (!billingTableBody) return;

        const rows = getTableDataRows(billingTableBody, "pa-empty-billing");
        const searchTerm = String(billingSearchInput?.value || "").trim().toLowerCase();
        const selectedStatus = normalizeStatus(billingStatusFilter?.value || "all");
        let visibleCount = 0;

        rows.forEach((row) => {
            const statusValue = normalizeStatus(row.children[7]?.textContent || "");
            const rowText = Array.from(row.querySelectorAll("td"))
                .map((cell) => cell.textContent || "")
                .join(" ")
                .toLowerCase();

            const matchesSearch = !searchTerm || rowText.includes(searchTerm);
            const matchesStatus = selectedStatus === "all" || statusValue === selectedStatus;
            const matches = matchesSearch && matchesStatus;

            row.hidden = !matches;
            if (!matches) {
                const rowCheckbox = row.querySelector(".js-admin-row-select");
                if (rowCheckbox) rowCheckbox.checked = false;
            }
            if (matches) visibleCount += 1;
        });

        ensureEmptyRowState(
            billingTableBody,
            "pa-empty-billing",
            12,
            "No billing records found.",
            visibleCount === 0
        );
        if (billingCountLabel) {
            billingCountLabel.textContent = `${visibleCount} record${visibleCount === 1 ? "" : "s"}`;
        }
        syncSelectionControls();
    };

    const addDocumentRow = (values, options = {}) => {
        if (!documentsTableBody) return;
        const prepend = options.prepend !== false;
        const shouldRefresh = options.refresh !== false;
        const recordId = values.__record_id || generateRecordId();

        const emptyRow = documentsTableBody.querySelector(".pa-empty-documents");
        if (emptyRow) emptyRow.remove();

        const row = document.createElement("tr");
        row.dataset.recordId = recordId;
        const createdDate = values.date_received || values.date_started || new Date().toISOString().slice(0, 10);
        row.appendChild(createRowSelectionCell(recordId));
        const fields = [
            values.slip_no || "-",
            values.document_name || "-",
            values.location || "-",
            values.doc_type || "-",
            values.contractor || "-",
            values.division || "-",
            statusLabel(values.doc_status || values.status),
            formatDate(createdDate),
        ];

        fields.forEach((value, index) => {
            const cell = document.createElement("td");
            if (index === 6) {
                cell.appendChild(createStatusBadge(value));
            } else {
                cell.textContent = value;
            }
            row.appendChild(cell);
        });

        const scannedFileCell = document.createElement("td");
        if (values.scanned_file_data) {
            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "pa-view-uploaded-file";
            viewButton.textContent = "View File";
            viewButton.dataset.adminAction = "view-file";
            viewButton.dataset.recordId = recordId;
            scannedFileCell.appendChild(viewButton);
        } else {
            scannedFileCell.textContent = "-";
        }
        row.appendChild(scannedFileCell);

        const actionsCell = document.createElement("td");
        setRowActionsCell(actionsCell, recordId);
        row.appendChild(actionsCell);

        if (prepend) {
            documentsTableBody.prepend(row);
        } else {
            documentsTableBody.append(row);
        }
        if (shouldRefresh) {
            refreshDocumentCounters();
            applyDocumentFilters();
        }
    };

    const addBillingRow = (values, options = {}) => {
        if (!billingTableBody) return;
        const prepend = options.prepend !== false;
        const shouldRefresh = options.refresh !== false;
        const recordId = values.__record_id || generateRecordId();

        const emptyRow = billingTableBody.querySelector(".pa-empty-billing");
        if (emptyRow) emptyRow.remove();

        const row = document.createElement("tr");
        row.dataset.recordId = recordId;
        const amount = values.revised_contract_amount || values.contract_amount || "-";
        row.appendChild(createRowSelectionCell(recordId));
        const fields = [
            values.slip_no || "-",
            values.document_name || "-",
            values.contractor || "-",
            getBillingTypeDisplay(values),
            values.percentage || "-",
            amount,
            statusLabel(values.billing_status || values.status),
            formatDate(values.date_received),
            values.received_by || "-",
        ];

        fields.forEach((value, index) => {
            const cell = document.createElement("td");
            if (index === 6) {
                cell.appendChild(createStatusBadge(value));
            } else {
                cell.textContent = value;
            }
            row.appendChild(cell);
        });

        const historyCell = document.createElement("td");
        historyCell.appendChild(buildBillingHistoryCell(values));
        row.appendChild(historyCell);

        const actionsCell = document.createElement("td");
        setRowActionsCell(actionsCell, recordId);
        row.appendChild(actionsCell);

        if (prepend) {
            billingTableBody.prepend(row);
        } else {
            billingTableBody.append(row);
        }
        if (shouldRefresh) {
            refreshBillingCounters();
            applyBillingFilters();
        }
    };

    const addAdminDivisionRecord = (values, options = {}) => {
        const shouldPersist = options.persist !== false;
        const prepend = options.prepend !== false;
        const normalizedInputStatus = normalizeStatus(values.status || "");
        const resolvedBillingStatus = values.billing_status
            || values.status
            || (normalizedInputStatus === "received" ? "Approved" : "Draft");
        const normalized = normalizeRecord({
            ...values,
            doc_status: values.doc_status || values.status,
            billing_status: resolvedBillingStatus,
        });

        addDocumentRow(normalized, { prepend });
        addBillingRow(normalized, { prepend });

        if (shouldPersist) {
            const existingRecords = readAdminDivisionRecords();
            existingRecords.unshift(normalized);
            writeAdminDivisionRecords(existingRecords);
        }
    };

    const renderAdminDivisionRecords = (records) => {
        if (documentsTableBody) {
            getTableDataRows(documentsTableBody, "pa-empty-documents").forEach((row) => row.remove());
        }
        if (billingTableBody) {
            getTableDataRows(billingTableBody, "pa-empty-billing").forEach((row) => row.remove());
        }

        records.forEach((record) => {
            addDocumentRow(record, { prepend: false, refresh: false });
            addBillingRow(record, { prepend: false, refresh: false });
        });

        refreshDocumentCounters();
        refreshBillingCounters();
        applyDocumentFilters();
        applyBillingFilters();
    };

    const restoreAdminDivisionRecords = () => {
        if (!documentsTableBody && !billingTableBody) return;
        const savedRecords = readAdminDivisionRecords().map((record) => normalizeRecord(record));
        if (!savedRecords.length) return;
        writeAdminDivisionRecords(savedRecords);
        renderAdminDivisionRecords(savedRecords);
    };

    const createRecordsFromForm = async (form, options = {}) => {
        if (!form) return false;
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());
        delete values.scanned_file;
        const scannedFile = formData.get("scanned_file");
        let scannedFilePayload = null;

        if (scannedFile instanceof File && scannedFile.size > 0) {
            try {
                scannedFilePayload = {
                    scanned_file_name: scannedFile.name,
                    scanned_file_type: scannedFile.type || "",
                    scanned_file_data: await readFileAsDataUrl(scannedFile),
                };
            } catch (error) {
                showPeoGeneralToast("Unable to read the scanned file. Please try again.", {
                    title: "Upload Error",
                    variant: "danger",
                });
                return false;
            }
        }

        values.status = values.status || "Draft";
        values.division = values.division || "Admin";
        values.doc_type = values.doc_type || "Other";

        if (options.recordId) {
            const records = readAdminDivisionRecords();
            const recordIndex = records.findIndex((record) => record.__record_id === options.recordId);
            if (recordIndex === -1) return false;

            const currentRecord = records[recordIndex];
            const tableType = options.tableType || "documents";
            const updatedRecord = normalizeRecord({
                ...currentRecord,
                ...values,
                __record_id: options.recordId,
            });
            if (scannedFilePayload) {
                updatedRecord.scanned_file_name = scannedFilePayload.scanned_file_name;
                updatedRecord.scanned_file_type = scannedFilePayload.scanned_file_type;
                updatedRecord.scanned_file_data = scannedFilePayload.scanned_file_data;
            }
            if (tableType === "billing") {
                const previousSnapshot = buildBillingHistoryEntry(currentRecord);
                updatedRecord.billing_status = values.status;
                updatedRecord.doc_status = currentRecord.doc_status;
                const nextSnapshot = buildBillingHistoryEntry(updatedRecord);
                const currentHistory = ensureBillingHistory(currentRecord);
                if (hasBillingHistoryChange(previousSnapshot, nextSnapshot)) {
                    updatedRecord.billing_history = [...currentHistory, nextSnapshot];
                } else {
                    updatedRecord.billing_history = currentHistory;
                }
            } else {
                updatedRecord.doc_status = values.status;
                updatedRecord.billing_status = currentRecord.billing_status;
                updatedRecord.billing_history = ensureBillingHistory(currentRecord);
            }
            updatedRecord.status = updatedRecord.doc_status;
            records[recordIndex] = updatedRecord;
            writeAdminDivisionRecords(records);
            renderAdminDivisionRecords(records);
            return true;
        }

        if (scannedFilePayload) {
            values.scanned_file_name = scannedFilePayload.scanned_file_name;
            values.scanned_file_type = scannedFilePayload.scanned_file_type;
            values.scanned_file_data = scannedFilePayload.scanned_file_data;
        }
        addAdminDivisionRecord(values);
        form.reset();
        setExistingScannedFileName(form, "");
        return true;
    };

    const buildNewDocumentModal = () => {
        const existingModal = document.getElementById("admin-new-document-modal");
        if (existingModal) {
            return existingModal;
        }

        const overlay = document.createElement("div");
        overlay.id = "admin-new-document-modal";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.className = "pa-doc-modal-overlay";
        overlay.style.display = "none";

        overlay.innerHTML = `
            <div class="pa-doc-modal">
                <div class="pa-doc-modal-head">
                    <div class="pa-doc-modal-heading">
                        <span class="pa-doc-modal-kicker">Document Register</span>
                        <h3 id="admin-new-document-title">Create New Document</h3>
                        <p id="admin-new-document-subtitle">Add a new document to the register</p>
                    </div>
                    <button type="button" class="pa-doc-modal-close" data-close-modal aria-label="Close document modal">
                        <span class="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                </div>
                <form id="admin-new-document-form" class="pa-doc-form">
                    <div class="pa-doc-form-section">
                        <div class="pa-doc-form-section-head">
                            <div class="pa-doc-form-section-icon" aria-hidden="true">
                                <span class="material-symbols-outlined">description</span>
                            </div>
                            <div>
                                <h4>Document Details</h4>
                                <p>Core document identity and classification.</p>
                            </div>
                        </div>

                        <label class="pa-doc-field pa-doc-field--wide">
                            <span>Slip No. *</span>
                            <input name="slip_no" required placeholder="E.g., SLP-0001">
                        </label>

                        <label class="pa-doc-field pa-doc-field--wide">
                            <span>Document Name *</span>
                            <input name="document_name" required placeholder="E.g., Site Instruction No. 03">
                        </label>

                        <div class="pa-doc-form-grid">
                            <label class="pa-doc-field">
                                <span>Location</span>
                                <input name="location" placeholder="E.g., City Hall Annex">
                            </label>
                            <label class="pa-doc-field">
                                <span>Contractor</span>
                                <input name="contractor" placeholder="E.g., ABC Builders">
                            </label>
                        </div>

                        <div class="pa-doc-form-grid">
                            <label class="pa-doc-field">
                                <span>Type *</span>
                                <select name="doc_type" required>
                                    <option value="Site Instruction" selected>Site Instruction</option>
                                    <option>NCR</option>
                                    <option>DED Package</option>
                                    <option>Billing Packet</option>
                                    <option>Work Order</option>
                                    <option>Report</option>
                                    <option>Contract</option>
                                    <option>Other</option>
                                </select>
                            </label>
                            <label class="pa-doc-field">
                                <span>Division *</span>
                                <select name="division" required>
                                    <option value="Admin" selected>Admin</option>
                                    <option>Planning Division</option>
                                    <option>Construction</option>
                                    <option>Quality</option>
                                    <option>Maintenance</option>
                                </select>
                            </label>
                        </div>

                        <div class="pa-doc-form-grid pa-doc-form-grid--compact">
                            <label class="pa-doc-field">
                                <span>Status *</span>
                                <select data-admin-status-select name="status" required>
                                    <option>Draft</option>
                                    <option>For Review</option>
                                    <option>Routed</option>
                                    <option>Processing</option>
                                    <option>Approved</option>
                                    <option>Open</option>
                                    <option>Closed</option>
                                </select>
                            </label>
                        </div>

                        <label class="pa-doc-field pa-doc-field--wide">
                            <span>Description</span>
                            <textarea name="description" rows="2" placeholder="Optional description"></textarea>
                        </label>
                    </div>

                    <div class="pa-doc-form-section">
                        <div class="pa-doc-form-section-head">
                            <div class="pa-doc-form-section-icon" aria-hidden="true">
                                <span class="material-symbols-outlined">share</span>
                            </div>
                            <div>
                                <h4>File and Routing</h4>
                                <p>Upload the scanned file and track document movement.</p>
                            </div>
                        </div>

                        <div class="pa-scan-upload-field pa-doc-field pa-doc-field--wide">
                            <span>Scanned File</span>
                            <div class="pa-doc-file-row">
                                <input
                                    class="pa-scan-upload-input"
                                    type="file"
                                    name="scanned_file"
                                    accept=".pdf,image/*"
                                >
                                <small class="pa-scan-upload-help">Accepted file types: PDF or image scans.</small>
                            </div>
                            <small class="pa-scan-upload-current" data-admin-file-current>No scanned file uploaded.</small>
                        </div>

                        <div class="pa-doc-form-grid">
                            <label class="pa-doc-field">
                                <span>Date Received by PEO</span>
                                <input type="date" name="date_received_peo">
                            </label>
                            <label class="pa-doc-field">
                                <span>Date Released to Admin</span>
                                <input type="date" name="date_released_admin">
                            </label>
                            <label class="pa-doc-field">
                                <span>Date Received from Admin</span>
                                <input type="date" name="date_received_admin">
                            </label>
                            <label class="pa-doc-field">
                                <span>Date Released to Accounting</span>
                                <input type="date" name="date_released_accounting">
                            </label>
                        </div>
                    </div>

                    <div class="pa-doc-form-section">
                        <div class="pa-doc-form-section-head">
                            <div class="pa-doc-form-section-icon" aria-hidden="true">
                                <span class="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <h4>Billing Information</h4>
                                <p>Record billing type, value, period, and receipt details.</p>
                            </div>
                        </div>

                        <div class="pa-doc-form-grid">
                            <label class="pa-doc-field">
                                <span>Type of Billing</span>
                                <select data-admin-billing-type-select name="billing_type">
                                    <option value="">Select billing type</option>
                                    <option>First Billing</option>
                                    <option>Second Billing</option>
                                    <option>Partial</option>
                                    <option>First Partial</option>
                                    <option>Second Partial</option>
                                    <option>Advance Payment</option>
                                    <option>Final</option>
                                    <option value="Others">Others</option>
                                </select>
                            </label>
                            <label class="pa-doc-field">
                                <span>Percentage</span>
                                <input name="percentage" placeholder="e.g., 30%">
                            </label>

                            <div class="pa-doc-field pa-doc-field--wide pa-form-hidden-field" data-admin-billing-type-other-wrap>
                                <span>Specify Other Billing Type</span>
                                <textarea name="billing_type_other" rows="2" placeholder="Enter billing type"></textarea>
                            </div>

                            <label class="pa-doc-field">
                                <span>Contract Amount</span>
                                <input name="contract_amount" placeholder="e.g., PHP 5,000,000">
                            </label>
                            <label class="pa-doc-field">
                                <span>Revised Contract Amount</span>
                                <input name="revised_contract_amount" placeholder="e.g., PHP 5,500,000">
                            </label>
                            <label class="pa-doc-field">
                                <span>Period Covered</span>
                                <input name="period_covered" placeholder="e.g., Jan-Mar 2026">
                            </label>
                            <label class="pa-doc-field">
                                <span>Date Started</span>
                                <input type="date" name="date_started">
                            </label>
                            <label class="pa-doc-field">
                                <span>Completion Date</span>
                                <input type="date" name="completion_date">
                            </label>
                            <label class="pa-doc-field pa-form-hidden-field" data-admin-received-date-wrap>
                                <span>Date Received</span>
                                <input type="date" name="date_received">
                            </label>
                            <label class="pa-doc-field pa-form-hidden-field" data-admin-received-by-wrap>
                                <span>Received By</span>
                                <input name="received_by" placeholder="Name of receiver">
                            </label>
                        </div>
                    </div>

                    <div class="pa-doc-form-actions">
                        <button type="button" class="pa-doc-btn pa-doc-btn-secondary" data-close-modal>Cancel</button>
                        <button id="admin-new-document-submit" class="pa-doc-btn pa-doc-btn-primary" type="submit">Create</button>
                    </div>
                </form>
            </div>
        `;

        const closeModal = () => {
            overlay.style.display = "none";
            document.body.style.overflow = "";
            editingRecordId = null;
            editingTableType = null;
        };

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeModal();
            }
        });

        overlay.querySelectorAll("[data-close-modal]").forEach((button) => {
            button.addEventListener("click", closeModal);
        });

        const form = overlay.querySelector("#admin-new-document-form");
        const statusSelect = form.querySelector('[data-admin-status-select]');
        const billingTypeSelect = form.querySelector('[data-admin-billing-type-select]');
        const scannedFileInput = form.querySelector('[name="scanned_file"]');
        setFormStatusOptionsByMode(form, "documents");
        enhanceAdminFormSelects(form);
        toggleBillingTypeOtherField(form);
        toggleBillingReceivedFields(form);
        setExistingScannedFileName(form, "");

        if (statusSelect) {
            statusSelect.addEventListener("change", () => {
                toggleBillingReceivedFields(form);
            });
        }
        if (billingTypeSelect) {
            billingTypeSelect.addEventListener("change", () => {
                toggleBillingTypeOtherField(form);
            });
        }
        if (scannedFileInput) {
            scannedFileInput.addEventListener("change", () => {
                refreshScannedFileLabel(form);
            });
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const isEditing = Boolean(editingRecordId);
            const created = await createRecordsFromForm(form, {
                recordId: editingRecordId,
                tableType: editingTableType,
            });
            if (created) {
                closeModal();
                showAdminStatusToast(
                    isEditing
                        ? "Data was updated successfully."
                        : "New data was created successfully.",
                    "success"
                );
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && overlay.style.display === "flex") {
                closeModal();
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    };

    if (newDocumentButton) {
        newDocumentButton.addEventListener("click", () => {
            const modal = buildNewDocumentModal();
            const form = modal.querySelector("#admin-new-document-form");
            const title = modal.querySelector("#admin-new-document-title");
            const subtitle = modal.querySelector("#admin-new-document-subtitle");
            const submitButton = modal.querySelector("#admin-new-document-submit");
            editingRecordId = null;
            editingTableType = null;
            if (form) form.reset();
            if (form) {
                setFormStatusOptionsByMode(form, "documents");
                enhanceAdminFormSelects(form);
                toggleBillingTypeOtherField(form);
                toggleBillingReceivedFields(form);
                setExistingScannedFileName(form, "");
            }
            const kicker = modal.querySelector(".pa-doc-modal-kicker");
            if (kicker) kicker.textContent = "Document Register";
            if (title) title.textContent = "Create New Document";
            if (subtitle) subtitle.textContent = "Add a new document to the register";
            if (submitButton) submitButton.textContent = "Create";
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    const adminTabs = document.querySelectorAll("[data-admin-tab]");
    const adminPanels = document.querySelectorAll("[data-admin-panel]");

    const setActiveAdminTab = (targetTab) => {
        adminTabs.forEach((tab) => {
            const isActive = tab.dataset.adminTab === targetTab;
            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        adminPanels.forEach((panel) => {
            const shouldShow = panel.dataset.adminPanel === targetTab;
            panel.classList.toggle("pa-hidden", !shouldShow);
            panel.hidden = !shouldShow;
        });
    };

    if (adminTabs.length && adminPanels.length) {
        adminTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActiveAdminTab(tab.dataset.adminTab);
            });
        });

        const initialTab =
            document.querySelector("[data-admin-tab].active")?.dataset.adminTab
            || adminTabs[0].dataset.adminTab;
        setActiveAdminTab(initialTab);
    }

    if (documentSearchInput) {
        documentSearchInput.addEventListener("input", applyDocumentFilters);
    }
    if (documentDivisionFilter) {
        documentDivisionFilter.addEventListener("change", applyDocumentFilters);
    }
    if (documentStatusFilter) {
        documentStatusFilter.addEventListener("change", applyDocumentFilters);
    }
    if (billingSearchInput) {
        billingSearchInput.addEventListener("input", applyBillingFilters);
    }
    if (billingStatusFilter) {
        billingStatusFilter.addEventListener("change", applyBillingFilters);
    }
    if (documentSelectAllCheckbox) {
        documentSelectAllCheckbox.addEventListener("change", () => {
            getTableDataRows(documentsTableBody, "pa-empty-documents")
                .filter((row) => !row.hidden)
                .forEach((row) => {
                    const checkbox = row.querySelector(".js-admin-row-select");
                    if (checkbox) checkbox.checked = documentSelectAllCheckbox.checked;
                });
            syncSelectionControls();
        });
    }
    if (billingSelectAllCheckbox) {
        billingSelectAllCheckbox.addEventListener("change", () => {
            getTableDataRows(billingTableBody, "pa-empty-billing")
                .filter((row) => !row.hidden)
                .forEach((row) => {
                    const checkbox = row.querySelector(".js-admin-row-select");
                    if (checkbox) checkbox.checked = billingSelectAllCheckbox.checked;
                });
            syncSelectionControls();
        });
    }
    if (documentBulkDeleteButton) {
        documentBulkDeleteButton.addEventListener("click", async () => {
            const selected = getSelectedRecordIds(documentsTableBody, "pa-empty-documents");
            if (!selected.length) return;
            const shouldDelete = await showAdminConfirmToast({
                title: "Delete Selected Data",
                message: selected.length === 1
                    ? "Are you sure to delete this data?"
                    : `Are you sure to delete ${selected.length} selected records?`,
                confirmLabel: "Yes, Delete",
                cancelLabel: "Cancel",
            });
            if (!shouldDelete) return;
            deleteRecordsByIds(selected);
            showAdminStatusToast("This data was deleted permanently.", "success");
        });
    }
    if (billingBulkDeleteButton) {
        billingBulkDeleteButton.addEventListener("click", async () => {
            const selected = getSelectedRecordIds(billingTableBody, "pa-empty-billing");
            if (!selected.length) return;
            const shouldDelete = await showAdminConfirmToast({
                title: "Delete Selected Data",
                message: selected.length === 1
                    ? "Are you sure to delete this data?"
                    : `Are you sure to delete ${selected.length} selected records?`,
                confirmLabel: "Yes, Delete",
                cancelLabel: "Cancel",
            });
            if (!shouldDelete) return;
            deleteRecordsByIds(selected);
            showAdminStatusToast("This data was deleted permanently.", "success");
        });
    }
    if (documentsTableBody) {
        documentsTableBody.addEventListener("change", (event) => {
            const target = event.target;
            if (target && target.classList.contains("js-admin-row-select")) {
                syncSelectionControls();
            }
        });
        documentsTableBody.addEventListener("click", async (event) => {
            const actionButton = event.target.closest("[data-admin-action]");
            if (!actionButton) return;
            const action = actionButton.dataset.adminAction;
            const recordId = actionButton.dataset.recordId;
            if (!recordId) return;

            if (action === "view-file") {
                const record = readAdminDivisionRecords().find((item) => item.__record_id === recordId);
                if (!record?.scanned_file_data) {
                    showPeoGeneralToast("No scanned file is available for this record.", {
                        title: "File Unavailable",
                        variant: "warning",
                    });
                    return;
                }
                const openedWindow = window.open(record.scanned_file_data, "_blank", "noopener");
                if (!openedWindow) {
                    window.location.href = record.scanned_file_data;
                }
                return;
            }
            if (action === "edit") {
                openEditModalForRecord(recordId, "documents");
                return;
            }
            if (action === "delete") {
                const shouldDelete = await showAdminConfirmToast({
                    title: "Delete Data",
                    message: "Are you sure to delete this data?",
                    confirmLabel: "Yes, Delete",
                    cancelLabel: "Cancel",
                });
                if (!shouldDelete) return;
                deleteRecordsByIds([recordId]);
                showAdminStatusToast("This data was deleted permanently.", "success");
            }
        });
    }
    if (billingTableBody) {
        billingTableBody.addEventListener("change", (event) => {
            const target = event.target;
            if (target && target.classList.contains("js-admin-row-select")) {
                syncSelectionControls();
            }
        });
        billingTableBody.addEventListener("click", async (event) => {
            const actionButton = event.target.closest("[data-admin-action]");
            if (!actionButton) return;
            const action = actionButton.dataset.adminAction;
            const recordId = actionButton.dataset.recordId;
            if (!recordId) return;

            if (action === "edit") {
                openEditModalForRecord(recordId, "billing");
                return;
            }
            if (action === "delete") {
                const shouldDelete = await showAdminConfirmToast({
                    title: "Delete Data",
                    message: "Are you sure to delete this data?",
                    confirmLabel: "Yes, Delete",
                    cancelLabel: "Cancel",
                });
                if (!shouldDelete) return;
                deleteRecordsByIds([recordId]);
                showAdminStatusToast("This data was deleted permanently.", "success");
            }
        });
    }

    refreshDocumentCounters();
    refreshBillingCounters();
    applyDocumentFilters();
    applyBillingFilters();
    restoreAdminDivisionRecords();
    syncSelectionControls();
    enableAdminDivisionCardFloat();
});

/* ROAD_MAINTENANCE_SCRIPT_START */
document.addEventListener("DOMContentLoaded", () => {
    const equipmentModal = document.querySelector(".js-equipment-modal");
    const equipmentModalTitle = document.getElementById("equipment-modal-title");
    const openEquipmentModalButtons = document.querySelectorAll(".js-open-equipment-modal");
    const closeEquipmentModalButtons = document.querySelectorAll(".js-close-equipment-modal");
    const equipmentForm = document.querySelector(".js-equipment-form");
    const equipmentSubmitButton = equipmentForm?.querySelector('button[type="submit"]');
    const equipmentTableBody = document.querySelector(".js-equipment-table-body");
    const equipmentRecordMeta = document.querySelector(".js-equipment-record-meta");
    const equipmentStatAvailable = document.querySelector(".js-equipment-stat-available");
    const equipmentStatInUse = document.querySelector(".js-equipment-stat-in-use");
    const equipmentStatMaintenance = document.querySelector(".js-equipment-stat-maintenance");
    const equipmentStatOutService = document.querySelector(".js-equipment-stat-out-service");
    const topEquipmentCount = document.querySelector(".js-top-equipment-count");
    const scheduleModal = document.querySelector(".js-schedule-modal");
    const scheduleModalTitle = document.getElementById("schedule-modal-title");
    const openScheduleModalButtons = document.querySelectorAll(".js-open-schedule-modal");
    const closeScheduleModalButtons = document.querySelectorAll(".js-close-schedule-modal");
    const scheduleForm = document.querySelector(".js-schedule-form");
    const scheduleSubmitButton = scheduleForm?.querySelector('button[type="submit"]');
    const scheduleTableBody = document.querySelector(".js-schedule-table-body");
    const scheduleCountText = document.querySelector(".js-schedule-count-text");
    const scheduleStatScheduled = document.querySelector(".js-schedule-stat-scheduled");
    const scheduleStatProgress = document.querySelector(".js-schedule-stat-progress");
    const scheduleStatCompleted = document.querySelector(".js-schedule-stat-completed");
    const scheduleStatUrgent = document.querySelector(".js-schedule-stat-urgent");
    const topScheduledCount = document.querySelector(".js-top-scheduled-count");
    const roadUploadInput = document.getElementById("road-upload-input");
    const roadSearchInput = document.querySelector(".js-road-search-input");
    const roadSearchShell = document.querySelector(".js-road-search-shell");
    const roadSearchToggle = document.querySelector(".js-road-search-toggle");
    const roadMunicipalityList = document.querySelector(".js-road-municipality-list");
    const roadRecordMeta = document.querySelector(".js-road-record-meta");
    const topRoadCount = document.querySelector(".js-top-road-count");
    const topRoadLength = document.querySelector(".js-top-road-length");
    const roadConditionGood = document.querySelector(".js-road-condition-good");
    const roadConditionFair = document.querySelector(".js-road-condition-fair");
    const roadConditionPoor = document.querySelector(".js-road-condition-poor");
    const roadConditionBad = document.querySelector(".js-road-condition-bad");
    const roadConditionFillGood = document.querySelector(".js-road-condition-fill-good");
    const roadConditionFillFair = document.querySelector(".js-road-condition-fill-fair");
    const roadConditionFillPoor = document.querySelector(".js-road-condition-fill-poor");
    const roadConditionFillBad = document.querySelector(".js-road-condition-fill-bad");
    const municipalityDropdown = document.querySelector('[data-road-filter="municipality"]');
    const roadEditModal = document.querySelector(".js-road-edit-modal");
    const closeRoadEditModalButtons = document.querySelectorAll(".js-close-road-edit-modal");
    const roadEditForm = document.querySelector(".js-road-edit-form");
    const roadEditSubtitle = document.querySelector(".js-road-edit-subtitle");
    const roadEditRecordSelect = document.querySelector(".js-road-edit-record-select");
    const roadEditRecordsBody = document.querySelector(".js-road-edit-records-body");
    const roadEditRoadIdInput = document.querySelector(".js-road-edit-road-id");
    const roadEditRoadNameInput = document.querySelector(".js-road-edit-road-name");
    const roadEditLengthInput = document.querySelector(".js-road-edit-length");
    const roadEditConditionInput = document.querySelector(".js-road-edit-condition");
    const roadEditSurfaceTypeInput = document.querySelector(".js-road-edit-surface-type");
    const roadDeleteModal = document.querySelector(".js-road-delete-modal");
    const closeRoadDeleteModalButtons = document.querySelectorAll(".js-close-road-delete-modal");
    const roadDeleteForm = document.querySelector(".js-road-delete-form");
    const roadDeleteSubtitle = document.querySelector(".js-road-delete-subtitle");
    const roadDeleteRecordSelect = document.querySelector(".js-road-delete-record-select");
    const roadAddModal = document.querySelector(".js-road-add-modal");
    const openRoadAddModalButtons = document.querySelectorAll(".js-open-road-add-modal");
    const closeRoadAddModalButtons = document.querySelectorAll(".js-close-road-add-modal");
    const roadAddForm = document.querySelector(".js-road-add-form");
    const roadAddRoadIdInput = document.querySelector(".js-road-add-road-id");
    const roadAddRoadNameInput = document.querySelector(".js-road-add-road-name");
    const roadAddLengthInput = document.querySelector(".js-road-add-length");
    const roadAddLocationSelect = document.querySelector(".js-road-add-location");
    const roadAddMunicipalitySelect = document.querySelector(".js-road-add-municipality");
    const roadAddSurfaceTypeSelect = document.querySelector(".js-road-add-surface-type");
    const roadAddSurfaceTypeDetailsInput = document.querySelector(".js-road-add-surface-type-details");
    const roadAddConditionSelect = document.querySelector(".js-road-add-condition");
    const taskSearchInput = document.querySelector(".js-task-search");
    const taskTableBody = document.querySelector(".js-task-table-body");
    const taskResultsSummary = document.querySelector(".js-task-results-summary");
    const taskTableTotal = document.querySelector(".js-task-table-total");
    const taskStatTotal = document.querySelector(".js-task-stat-total");
    const taskStatPending = document.querySelector(".js-task-stat-pending");
    const taskStatProgress = document.querySelector(".js-task-stat-progress");
    const taskStatCompleted = document.querySelector(".js-task-stat-completed");
    const taskStatOverdue = document.querySelector(".js-task-stat-overdue");
    const taskModal = document.querySelector(".js-task-modal");
    const openTaskModalButtons = document.querySelectorAll(".js-open-task-modal");
    const closeTaskModalButtons = document.querySelectorAll(".js-close-task-modal");
    const taskForm = document.querySelector(".js-task-form");
    const taskAssignedInput = document.querySelector(".js-task-assigned-input");
    const taskAssignedList = document.querySelector(".js-task-assigned-list");
    const contractorManagement = document.querySelector(".js-contractor-management");
    const contractorSearchInput = document.querySelector(".js-contractor-search");
    const contractorStatusFilter = document.querySelector(".js-contractor-status-filter");
    const contractorPcabFilter = document.querySelector(".js-contractor-pcab-filter");
    const taskPersonnelModal = document.querySelector(".js-task-personnel-modal");
    const openTaskPersonnelButtons = document.querySelectorAll(".js-open-task-personnel-modal");
    const closeTaskPersonnelButtons = document.querySelectorAll(".js-close-task-personnel-modal");
    const taskPersonnelForm = document.querySelector(".js-task-personnel-form");
    const contractorAddOpenButton = document.querySelector(".js-open-contractor-add");
    const contractorAddModal = document.querySelector(".js-contractor-add-modal");
    const closeContractorAddButtons = document.querySelectorAll(".js-close-contractor-add");
    const contractorAddForm = document.querySelector(".js-contractor-add-form");
    const contractorCardList = document.querySelector(".contractor-card-list");
    const contractorFoundCount = document.querySelector(".js-contractor-found-count");
    const contractorRows = Array.from(document.querySelectorAll(".js-contractor-row"));
    const contractorEmptyRow = document.querySelector(".js-contractor-empty-row");
    const contractorStatTotal = document.querySelector(".js-contractor-stat-total");
    const contractorStatActive = document.querySelector(".js-contractor-stat-active");
    const contractorStatRating = document.querySelector(".js-contractor-stat-rating");
    const contractorStatBlacklisted = document.querySelector(".js-contractor-stat-blacklisted");
    const contractorFloatCard = document.querySelector(".js-contractor-float-card");
    const closeContractorFloatButtons = document.querySelectorAll(".js-close-contractor-float");
    const contractorFloatName = document.querySelector(".js-contractor-float-name");
    const contractorFloatStatus = document.querySelector(".js-contractor-float-status");
    const contractorFloatStatusPill = document.querySelector(".js-contractor-float-status-pill");
    const contractorFloatTabs = Array.from(document.querySelectorAll(".js-contractor-float-tab"));
    const contractorFloatPanels = Array.from(document.querySelectorAll(".js-contractor-float-panel"));
    const contractorFloatContractCount = document.querySelector(".js-contractor-float-contract-count");
    const contractorFloatTin = document.querySelector(".js-contractor-float-tin");
    const contractorFloatPhilgeps = document.querySelector(".js-contractor-float-philgeps");
    const contractorFloatPcab = document.querySelector(".js-contractor-float-pcab");
    const contractorFloatClassification = document.querySelector(".js-contractor-float-classification");
    const contractorFloatLicenseExpiry = document.querySelector(".js-contractor-float-license-expiry");
    const contractorFloatContactPerson = document.querySelector(".js-contractor-float-contact-person");
    const contractorFloatContactEmail = document.querySelector(".js-contractor-float-contact-email");
    const contractorFloatContactPhone = document.querySelector(".js-contractor-float-contact-phone");
    const contractorFloatContactAddress = document.querySelector(".js-contractor-float-contact-address");
    const contractorFloatContracts = document.querySelector(".js-contractor-float-contracts");
    const contractorFloatCompletedContracts = document.querySelector(".js-contractor-float-completed-contracts");
    const contractorFloatOngoingContracts = document.querySelector(".js-contractor-float-ongoing-contracts");
    const contractorFloatTotalValue = document.querySelector(".js-contractor-float-total-value");
    const contractorFloatTotalCost = document.querySelector(".js-contractor-float-total-cost");
    const contractorFloatContractList = document.querySelector(".js-contractor-float-contract-list");
    const contractorDeleteToast = document.querySelector(".js-contractor-delete-toast");
    const contractorDeleteMessage = document.querySelector(".js-contractor-delete-message");
    const contractorDeleteConfirmButton = document.querySelector(".js-contractor-delete-confirm");
    const contractorDeleteCancelButtons = document.querySelectorAll(".js-contractor-delete-cancel");
    const contractorSuccessToast = document.querySelector(".js-contractor-success-toast");
    const contractorEditModal = document.querySelector(".js-contractor-edit-modal");
    const closeContractorEditButtons = document.querySelectorAll(".js-close-contractor-edit");
    const contractorEditForm = document.querySelector(".js-contractor-edit-form");
    const contractorEvalModal = document.querySelector(".js-contractor-eval-modal");
    const closeContractorEvalButtons = document.querySelectorAll(".js-close-contractor-eval");
    const contractorEvalForm = document.querySelector(".js-contractor-eval-form");
    const contractorEvalCompanyInput = document.querySelector(".js-contractor-eval-company");
    const contractorEvalDateInput = document.querySelector(".js-contractor-eval-date");

    const contractorEvalRatings = Array.from(document.querySelectorAll(".js-contractor-eval-rating"));
    const contractorEvalTotal = document.querySelector(".js-contractor-eval-total");
    const contractorEvalOverall = document.querySelector(".js-contractor-eval-overall");
    const contractorEvalResetButton = document.querySelector(".js-contractor-eval-reset");

    const roadRecords = [];
    const roadMunicipalityPageState = new Map();
    const roadMunicipalityToastState = new Map();
    const roadMunicipalityToastTimers = new Map();
    const roadRowsPerMunicipalityPage = 15;
    const maintenanceStorageKey = "peo_maintenance_state_v1";
    const roadAcceptedUploadTypes = ".xlsx,.xls,.csv,.txt,.json";
    let editingMunicipalityKey = "";
    let editingMunicipalityName = "";
    let editingMunicipalityRecordIndexes = [];
    let deletingMunicipalityKey = "";
    let deletingMunicipalityName = "";
    let editingEquipmentRow = null;
    let editingScheduleRow = null;
    let editingContractorRow = null;
    let deletingContractorRow = null;
    let contractorSuccessToastTimer = null;
    let xlsxLibraryPromise = null;
    let refreshRoadRegister = null;
    let roadUploadStatusToastTimer = null;
    let roadUploadStatusToastElement = null;
    let roadUploadDuplicatePromptElement = null;
    let roadUploadAddConfirmPromptElement = null;
    let roadDeleteConfirmToastElement = null;
    let personnelRecords = [];

    const setBodyScrollLock = () => {
        const isAnyModalOpen = [equipmentModal, scheduleModal, roadEditModal, roadAddModal, roadDeleteModal, taskPersonnelModal, taskModal, contractorAddModal, contractorFloatCard, contractorEditModal, contractorEvalModal].some((modal) => modal && !modal.hidden);
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

    const normalizeKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizeStatus = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
    const normalizeMunicipalityName = (value) =>
        String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    const toTitleCase = (value) =>
        String(value || "")
            .toLocaleLowerCase("en-US")
            .replace(/(^|[\s/-])(\p{L})/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("en-US")}`);

    const municipalityAreas = {
        south: [
            "Puerto Princesa City",
            "Aborlan",
            "Narra",
            "Quezon",
            "Rizal",
            "Bataraza",
            "Brooke's Point",
            "Sofronio Espa\u00f1ola",
            "Balabac",
        ],
        north: [
            "Roxas",
            "San Vicente",
            "Taytay",
            "El Nido",
            "Coron",
            "Busuanga",
            "Culion",
            "Linapacan",
            "Cuyo",
            "Agutaya",
            "Magsaysay",
        ],
    };

    const municipalityAreaByKey = new Map();
    const municipalityDisplayNameByKey = new Map();
    Object.entries(municipalityAreas).forEach(([areaKey, names]) => {
        names.forEach((name) => {
            const normalizedNameKey = normalizeMunicipalityName(name);
            municipalityAreaByKey.set(normalizedNameKey, areaKey);
            municipalityDisplayNameByKey.set(normalizedNameKey, name);
        });
    });

    const normalizeMunicipalityDisplayName = (value, fallback = "Unknown") => {
        const rawValue = String(value || "").trim();
        if (!rawValue) {
            return fallback;
        }

        const normalizedNameKey = normalizeMunicipalityName(rawValue);
        if (normalizedNameKey && municipalityDisplayNameByKey.has(normalizedNameKey)) {
            return municipalityDisplayNameByKey.get(normalizedNameKey);
        }

        return toTitleCase(rawValue);
    };

    const getMunicipalityNamesByArea = (locationValue = "") => {
        const normalized = String(locationValue || "").trim().toLowerCase();
        let sourceNames = [];
        if (normalized === "south") {
            sourceNames = municipalityAreas.south;
        } else if (normalized === "north") {
            sourceNames = municipalityAreas.north;
        } else {
            sourceNames = [...municipalityAreas.south, ...municipalityAreas.north];
        }

        return [...new Set(sourceNames)]
            .map((name) => String(name || "").trim())
            .filter(Boolean)
            .sort((nameA, nameB) => nameA.localeCompare(nameB));
    };

    const getAreaFromLocationFilter = (value) => {
        const normalized = String(value || "").trim().toLowerCase();
        if (normalized === "north") {
            return "north";
        }
        if (normalized === "south") {
            return "south";
        }
        return "";
    };

    const resolveMunicipalityArea = (municipalityName, locationName = "") => {
        const municipalityKey = normalizeMunicipalityName(municipalityName);
        if (municipalityKey && municipalityAreaByKey.has(municipalityKey)) {
            return municipalityAreaByKey.get(municipalityKey);
        }

        const locationValue = String(locationName || "").toLowerCase();
        if (locationValue.includes("north")) {
            return "north";
        }
        if (locationValue.includes("south")) {
            return "south";
        }
        return "";
    };

    const parseNumber = (value) => {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        const matched = String(value || "")
            .replaceAll(",", "")
            .match(/-?\d+(\.\d+)?/);

        if (!matched) {
            return null;
        }
        const parsed = Number.parseFloat(matched[0]);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const getFilterValue = (filterKey) => {
        const filterLabel = document.querySelector(`[data-road-filter="${filterKey}"] .dropdown-label`);
        return filterLabel ? filterLabel.textContent.trim() : "";
    };

    const refreshRoadMunicipalityOptions = () => {
        if (!municipalityDropdown) {
            return;
        }

        const dropdownLabel = municipalityDropdown.querySelector(".dropdown-label");
        const dropdownMenu = municipalityDropdown.querySelector(".dropdown-menu");
        if (!dropdownLabel || !dropdownMenu) {
            return;
        }

        const selectedMunicipality = dropdownLabel.textContent.trim() || "All Municipalities";
        const selectedArea = getAreaFromLocationFilter(getFilterValue("location"));
        const municipalityNames = [...new Set(
            roadRecords
                .filter((record) => {
                    if (!selectedArea) {
                        return true;
                    }
                    return resolveMunicipalityArea(record.municipality, record.location) === selectedArea;
                })
                .map((record) => normalizeMunicipalityDisplayName(record.municipality, "Unknown"))
                .filter(Boolean)
        )].sort((nameA, nameB) => nameA.localeCompare(nameB));

        const options = ["All Municipalities", ...municipalityNames];
        const activeSelection = options.includes(selectedMunicipality) ? selectedMunicipality : "All Municipalities";

        dropdownMenu.innerHTML = options
            .map((optionLabel) => `
                <li>
                    <button type="button" class="dropdown-option${optionLabel === activeSelection ? " is-selected" : ""}">
                        ${escapeHtml(optionLabel)}
                    </button>
                </li>
            `)
            .join("");

        dropdownLabel.textContent = activeSelection;
    };

    const getRowValue = (row, aliases) => {
        if (!row || typeof row !== "object") {
            return "";
        }

        const normalizedAliases = aliases.map((alias) => normalizeKey(alias));
        const entries = Object.entries(row);

        for (const [rawKey, rawValue] of entries) {
            const normalizedKey = normalizeKey(rawKey);
            if (!normalizedKey) {
                continue;
            }
            const matched = normalizedAliases.some((alias) =>
                normalizedKey === alias || normalizedKey.includes(alias) || alias.includes(normalizedKey)
            );
            if (matched && String(rawValue || "").trim()) {
                return String(rawValue).trim();
            }
        }

        return "";
    };

    const normalizeRoadRecord = (row) => {
        const conditionRaw = getRowValue(row, ["condition", "status", "road condition", "rating"]);
        const normalizedCondition = normalizeStatus(conditionRaw).replaceAll("_", " ");

        const roadId = getRowValue(row, ["road id", "roadid", "id", "road no", "road number", "ref"]);
        const roadName = getRowValue(row, ["road name", "roadname", "name", "road"]);
        const municipality = getRowValue(row, ["municipality", "town", "city", "barangay", "district"]) || "Unknown";
        const location = getRowValue(row, ["location", "zone", "area", "north south", "region"]);
        const surfaceType = getRowValue(row, ["surface type", "surface", "surface details", "pavement type", "material"]);
        const lengthRaw = getRowValue(row, ["length", "length km", "length(km)", "distance", "km"]);
        const lengthKm = parseNumber(lengthRaw);

        if (!roadId && !roadName) {
            return null;
        }

        return {
            roadId: roadId || "-",
            roadName: roadName || "-",
            municipality: normalizeMunicipalityDisplayName(municipality, "Unknown"),
            location,
            surfaceType: surfaceType || "-",
            lengthKm,
            condition: normalizedCondition || "unknown",
        };
    };

    const parseDelimitedLine = (line, delimiter) => {
        const values = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const character = line[i];
            const nextCharacter = line[i + 1];

            if (character === '"') {
                if (inQuotes && nextCharacter === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (character === delimiter && !inQuotes) {
                values.push(current.trim());
                current = "";
                continue;
            }

            current += character;
        }

        values.push(current.trim());
        return values;
    };

    const guessDelimiter = (line) => {
        const delimiters = [",", "\t", ";", "|"];
        let bestDelimiter = ",";
        let bestCount = -1;

        delimiters.forEach((delimiter) => {
            const count = line.split(delimiter).length - 1;
            if (count > bestCount) {
                bestCount = count;
                bestDelimiter = delimiter;
            }
        });

        return bestDelimiter;
    };

    const parseDelimitedText = (text) => {
        const lines = String(text || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length < 2) {
            return [];
        }

        const delimiter = guessDelimiter(lines[0]);
        const headers = parseDelimitedLine(lines[0], delimiter);

        if (!headers.length) {
            return [];
        }

        return lines.slice(1).map((line) => {
            const values = parseDelimitedLine(line, delimiter);
            const row = {};
            headers.forEach((header, index) => {
                row[header || `column_${index + 1}`] = values[index] || "";
            });
            return row;
        });
    };

    const parseJsonRecords = (jsonValue) => {
        if (Array.isArray(jsonValue)) {
            return jsonValue;
        }
        if (!jsonValue || typeof jsonValue !== "object") {
            return [];
        }

        const arrayEntry = Object.values(jsonValue).find((value) => Array.isArray(value));
        return Array.isArray(arrayEntry) ? arrayEntry : [];
    };

    const guessLocationFromSheetName = (sheetName) => {
        const normalizedName = String(sheetName || "").toLowerCase();
        if (normalizedName.includes("south")) return "South";
        if (normalizedName.includes("north")) return "North";
        if (normalizedName.includes("island")) return "Islands";
        return "";
    };

    const extractMunicipalityName = (textValue) => {
        const text = String(textValue || "").trim();
        if (!text) return "";

        const matched = text.match(/municipality\s+of\s+(.+)/i);
        if (matched) {
            return matched[1].trim().replace(/\s+/g, " ");
        }
        return "";
    };

    const parseSurfaceTypeFromRow = (rowValues, surfaceColumns) => {
        if (!surfaceColumns.length) {
            return "-";
        }

        const chunks = [];
        surfaceColumns.forEach((surfaceColumn) => {
            const rawValue = String(rowValues[surfaceColumn.index] || "").trim();
            const numericValue = parseNumber(rawValue);
            if (numericValue && numericValue > 0) {
                chunks.push(`${surfaceColumn.label}: ${numericValue.toFixed(3)}km`);
            }
        });

        return chunks.length ? chunks.join("  ") : "-";
    };

    const dedupeRoadRecords = (records) => {
        const deduped = new Map();

        records.forEach((record) => {
            const key = [
                normalizeKey(record.municipality || ""),
                normalizeKey(record.roadId || ""),
                normalizeKey(record.roadName || ""),
            ].join("|");

            if (!key.replaceAll("|", "")) {
                return;
            }

            if (!deduped.has(key)) {
                deduped.set(key, record);
                return;
            }

            const existing = deduped.get(key);
            const existingLength = existing.lengthKm || 0;
            const incomingLength = record.lengthKm || 0;

            if (incomingLength > existingLength) {
                deduped.set(key, record);
            }
        });

        return [...deduped.values()];
    };

    const extractRoadRecordsFromSheetRows = (sheetRows, sheetName) => {
        const records = [];
        const sheetLocation = guessLocationFromSheetName(sheetName);
        let currentMunicipality = "";
        let headerConfig = null;

        const isInventoryRow = (normalizedRow) =>
            normalizedRow.some((value) => value.includes("roadid"))
            && normalizedRow.some((value) => value.includes("roadname"));

        const buildHeaderConfig = (rows, rowIndex) => {
            const headerRow = rows[rowIndex] || [];
            const nextRow = rows[rowIndex + 1] || [];
            const normalizedHeader = headerRow.map((value) => normalizeKey(value));
            const normalizedNext = nextRow.map((value) => normalizeKey(value));

            const findIndexByKeyword = (keywords) => normalizedHeader.findIndex((key) => keywords.some((keyword) => key.includes(keyword)));

            const roadIdIndex = findIndexByKeyword(["roadid"]);
            const roadNameIndex = findIndexByKeyword(["roadname"]);
            const conditionIndex = findIndexByKeyword(["roadcondition", "condition"]);
            const municipalityIndex = findIndexByKeyword(["municipality", "city", "town"]);

            const lengthCandidates = normalizedHeader
                .map((key, index) => ({ key, index }))
                .filter(({ key }) => key.includes("length") && !key.includes("oldlength"));
            const lengthIndex = lengthCandidates.length ? lengthCandidates[0].index : -1;

            const surfaceColumns = [];
            const addSurfaceColumn = (normalizedCells, sourceRow) => {
                [
                    { key: "concrete", label: "Concrete" },
                    { key: "asphalt", label: "Asphalt" },
                    { key: "earth", label: "Earth" },
                    { key: "gravel", label: "Gravel" },
                    { key: "mixed", label: "Mixed" },
                ].forEach((surfaceType) => {
                    const index = normalizedCells.findIndex((cell) => cell === surfaceType.key || cell.includes(surfaceType.key));
                    if (index >= 0 && !surfaceColumns.some((item) => item.index === index)) {
                        surfaceColumns.push({ index, label: surfaceType.label, sourceRow });
                    }
                });
            };

            addSurfaceColumn(normalizedHeader, "header");
            addSurfaceColumn(normalizedNext, "next");

            return {
                roadIdIndex,
                roadNameIndex,
                conditionIndex,
                municipalityIndex,
                lengthIndex,
                surfaceColumns,
            };
        };

        sheetRows.forEach((rawRow, rowIndex) => {
            const rowValues = Array.isArray(rawRow) ? rawRow.map((value) => String(value || "").trim()) : [];
            if (!rowValues.some((value) => value)) {
                return;
            }

            const municipalityCell = rowValues.find((value) => /municipality\s+of/i.test(value));
            if (municipalityCell) {
                const parsedMunicipality = extractMunicipalityName(municipalityCell);
                if (parsedMunicipality) {
                    currentMunicipality = parsedMunicipality;
                }
                return;
            }

            const normalizedRow = rowValues.map((value) => normalizeKey(value));
            if (isInventoryRow(normalizedRow)) {
                headerConfig = buildHeaderConfig(sheetRows, rowIndex);
                return;
            }

            if (!headerConfig || headerConfig.roadNameIndex < 0 || headerConfig.roadIdIndex < 0) {
                return;
            }

            const roadId = String(rowValues[headerConfig.roadIdIndex] || "").trim();
            const roadName = String(rowValues[headerConfig.roadNameIndex] || "").trim();
            if (!roadName || /^(roadname|road name|total|remarks?)$/i.test(roadName)) {
                return;
            }

            if (/municipality\s+of/i.test(roadName)) {
                const parsedMunicipality = extractMunicipalityName(roadName);
                if (parsedMunicipality) {
                    currentMunicipality = parsedMunicipality;
                }
                return;
            }

            const conditionRaw = headerConfig.conditionIndex >= 0 ? rowValues[headerConfig.conditionIndex] : "";
            const normalizedCondition = normalizeStatus(conditionRaw).replaceAll("_", " ");

            const municipalityRaw = headerConfig.municipalityIndex >= 0
                ? String(rowValues[headerConfig.municipalityIndex] || "").trim()
                : "";
            const municipality = extractMunicipalityName(municipalityRaw) || municipalityRaw || currentMunicipality || "Unknown";

            const lengthRaw = headerConfig.lengthIndex >= 0 ? rowValues[headerConfig.lengthIndex] : "";
            const lengthKm = parseNumber(lengthRaw);
            const surfaceType = parseSurfaceTypeFromRow(rowValues, headerConfig.surfaceColumns);

            if (!roadId && !roadName) {
                return;
            }

            records.push({
                roadId: roadId || "-",
                roadName,
                municipality: normalizeMunicipalityDisplayName(municipality, "Unknown"),
                location: sheetLocation,
                surfaceType,
                lengthKm,
                condition: normalizedCondition || "unknown",
                __roadNormalized: true,
            });
        });

        return records;
    };

    const ensureXlsxLibrary = async () => {
        if (window.XLSX) {
            return window.XLSX;
        }

        if (xlsxLibraryPromise) {
            return xlsxLibraryPromise;
        }

        xlsxLibraryPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-xlsx-loader="true"]');
            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(window.XLSX));
                existingScript.addEventListener("error", () => reject(new Error("Failed to load XLSX parser")));
                return;
            }

            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
            script.async = true;
            script.dataset.xlsxLoader = "true";
            script.onload = () => resolve(window.XLSX);
            script.onerror = () => reject(new Error("Failed to load XLSX parser"));
            document.head.appendChild(script);
        });

        return xlsxLibraryPromise;
    };

    const parseRoadFile = async (file) => {
        const lowerName = file.name.toLowerCase();

        if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
            const XLSX = await ensureXlsxLibrary();
            const fileBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(fileBuffer, { type: "array" });
            const nonInventoryNamePattern = /(summary|graph|indicator|good\s*to\s*fair|core\s*road|bridge|chart)/i;

            const allSheetRecords = [];
            workbook.SheetNames.forEach((sheetName) => {
                if (nonInventoryNamePattern.test(sheetName)) {
                    return;
                }

                const sheet = workbook.Sheets[sheetName];
                const sheetRows = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    defval: "",
                    raw: false,
                    blankrows: false,
                });

                const extractedRecords = extractRoadRecordsFromSheetRows(sheetRows, sheetName);
                if (extractedRecords.length) {
                    allSheetRecords.push(...extractedRecords);
                }
            });

            return dedupeRoadRecords(allSheetRecords);
        }

        if (lowerName.endsWith(".json")) {
            const text = await file.text();
            const parsed = JSON.parse(text);
            return parseJsonRecords(parsed);
        }

        const text = await file.text();
        return parseDelimitedText(text);
    };

    const getRoadConditionClass = (condition) => {
        if (condition.includes("good")) return "is-good";
        if (condition.includes("fair")) return "is-fair";
        if (condition.includes("poor")) return "is-poor";
        if (condition.includes("bad")) return "is-bad";
        return "is-unknown";
    };

    const isSubtotalRoadRecord = (record) => {
        const roadNameKey = normalizeKey(record?.roadName || "");
        return roadNameKey.includes("subtotal");
    };

    const formatLengthValue = (lengthKm) => {
        if (typeof lengthKm !== "number" || Number.isNaN(lengthKm)) {
            return "-";
        }
        return lengthKm.toFixed(2);
    };

    const renderRoadMunicipalityCards = (records) => {
        if (!roadMunicipalityList) {
            return;
        }

        if (!records.length) {
            const emptyMessage = roadRecords.length
                ? "No matching road records found."
                : "No road records available yet. Upload files to start.";
            roadMunicipalityList.innerHTML = `<p class="road-municipality-empty">${emptyMessage}</p>`;
            return;
        }

        const groupedByMunicipality = new Map();
        records.forEach((record) => {
            const municipalityKey = normalizeMunicipalityDisplayName(record.municipality, "Unknown");
            if (!groupedByMunicipality.has(municipalityKey)) {
                groupedByMunicipality.set(municipalityKey, []);
            }
            groupedByMunicipality.get(municipalityKey).push(record);
        });

        const municipalityBlocks = [...groupedByMunicipality.entries()]
            .sort(([municipalityA], [municipalityB]) => municipalityA.localeCompare(municipalityB))
            .map(([municipalityName, municipalityRows]) => {
                const normalizedMunicipalityKey = normalizeMunicipalityName(municipalityName);
                const pageKey = normalizedMunicipalityKey || "unknown";
                const municipalityToastMessage = roadMunicipalityToastState.get(pageKey) || "";
                const municipalityToastHtml = municipalityToastMessage
                    ? `<span class="road-municipality-toast" role="status" aria-live="polite">${escapeHtml(municipalityToastMessage)}</span>`
                    : "";
                const regularRows = municipalityRows.filter((record) => !isSubtotalRoadRecord(record));
                const subtotalRows = municipalityRows.filter((record) => isSubtotalRoadRecord(record));
                const orderedMunicipalityRows = [...regularRows, ...subtotalRows];
                const editableMunicipalityRows = regularRows.length ? regularRows : municipalityRows;
                const municipalityRecordIndexes = editableMunicipalityRows
                    .map((record) => roadRecords.indexOf(record))
                    .filter((recordIndex) => recordIndex >= 0);
                const totalPages = Math.max(1, Math.ceil(orderedMunicipalityRows.length / roadRowsPerMunicipalityPage));
                const savedPage = roadMunicipalityPageState.get(pageKey) || 1;
                const currentPage = Math.min(Math.max(savedPage, 1), totalPages);
                const startIndex = (currentPage - 1) * roadRowsPerMunicipalityPage;
                const pageRows = orderedMunicipalityRows.slice(startIndex, startIndex + roadRowsPerMunicipalityPage);
                const isPrevDisabled = currentPage <= 1;
                const isNextDisabled = currentPage >= totalPages;

                roadMunicipalityPageState.set(pageKey, currentPage);

                const rowsHtml = pageRows
                    .map((record) => {
                        const conditionText = toTitleCase(record.condition || "Unknown");
                        const conditionClass = getRoadConditionClass(record.condition || "unknown");
                        const roadRecordIndex = roadRecords.indexOf(record);
                        const hasDeleteTarget = roadRecordIndex >= 0;
                        const roadNameLabel = record.roadName || "road record";
                        const deleteActionHtml = hasDeleteTarget
                            ? `
                                <button
                                    type="button"
                                    class="road-row-delete-btn js-road-row-delete"
                                    data-record-index="${roadRecordIndex}"
                                    data-municipality-name="${escapeHtml(municipalityName)}"
                                    aria-label="Delete ${escapeHtml(roadNameLabel)}"
                                    title="Delete row"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM7 10h2v8H7v-8z"></path>
                                    </svg>
                                </button>
                            `
                            : `<span class="road-row-delete-placeholder">-</span>`;

                        return `
                            <tr>
                                <td>${escapeHtml(record.roadId || "-")}</td>
                                <td>${escapeHtml(record.roadName || "-")}</td>
                                <td>${escapeHtml(formatLengthValue(record.lengthKm))}</td>
                                <td><span class="road-condition-pill ${conditionClass}">${escapeHtml(conditionText)}</span></td>
                                <td>${escapeHtml(record.surfaceType || "-")}</td>
                                <td class="road-row-actions">${deleteActionHtml}</td>
                            </tr>
                        `;
                    })
                    .join("");

                const paginationHtml = totalPages > 1
                    ? `
                        <div class="road-municipality-pagination">
                            <button
                                type="button"
                                class="road-page-btn js-road-page-btn"
                                data-page-direction="prev"
                                data-page-key="${escapeHtml(pageKey)}"
                                ${isPrevDisabled ? "disabled" : ""}
                            >
                                Previous
                            </button>
                            <span class="road-page-info">Page ${currentPage} of ${totalPages}</span>
                            <button
                                type="button"
                                class="road-page-btn js-road-page-btn"
                                data-page-direction="next"
                                data-page-key="${escapeHtml(pageKey)}"
                                ${isNextDisabled ? "disabled" : ""}
                            >
                                Next
                            </button>
                        </div>
                    `
                    : "";

                return `
                    <article class="road-municipality-card" data-municipality-page-key="${escapeHtml(pageKey)}">
                        <div class="road-municipality-head">
                            <div class="road-municipality-name">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"></path>
                                    <circle cx="12" cy="10" r="2.5"></circle>
                                </svg>
                                <span>${escapeHtml(municipalityName)}</span>
                            </div>
                            <div class="road-municipality-actions">
                                ${municipalityToastHtml}
                                <span class="road-municipality-count">${municipalityRows.length} road${municipalityRows.length === 1 ? "" : "s"}</span>
                                <button
                                    type="button"
                                    class="road-municipality-update-btn js-road-municipality-update"
                                    data-municipality-key="${escapeHtml(pageKey)}"
                                    data-municipality-name="${escapeHtml(municipalityName)}"
                                    data-record-indexes="${escapeHtml(municipalityRecordIndexes.join(","))}"
                                >
                                    Update Data
                                </button>
                            </div>
                        </div>
                        <table class="road-table road-municipality-table">
                            <thead>
                                <tr>
                                    <th>Road ID</th>
                                    <th>Road Name</th>
                                    <th>Length (km)</th>
                                    <th>Condition</th>
                                    <th>Surface Type</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                        ${paginationHtml}
                    </article>
                `;
            })
            .join("");

        roadMunicipalityList.innerHTML = municipalityBlocks;
    };

    refreshRoadRegister = () => {
        const searchValue = (roadSearchInput?.value || "").trim().toLowerCase();
        const municipalityFilter = getFilterValue("municipality");
        const locationFilter = getFilterValue("location");
        const conditionFilter = getFilterValue("condition");
        const sortBy = getFilterValue("sort_by");
        const sortOrder = getFilterValue("sort_order");

        const filteredRecords = roadRecords.filter((record) => {
            if (municipalityFilter && municipalityFilter !== "All Municipalities" && record.municipality !== municipalityFilter) {
                return false;
            }

            if (locationFilter && locationFilter !== "Select Location") {
                const selectedArea = getAreaFromLocationFilter(locationFilter);
                const locationMatched = resolveMunicipalityArea(record.municipality, record.location) === selectedArea;
                if (!locationMatched) {
                    return false;
                }
            }

            if (conditionFilter && conditionFilter !== "All Conditions") {
                const normalizedCondition = normalizeStatus(record.condition).replaceAll("_", " ");
                if (normalizedCondition !== conditionFilter.toLowerCase()) {
                    return false;
                }
            }

            if (!searchValue) {
                return true;
            }

            return [
                record.roadId,
                record.roadName,
                record.municipality,
                record.surfaceType,
                record.condition,
                record.location,
            ]
                .map((value) => String(value || "").toLowerCase())
                .some((value) => value.includes(searchValue));
        });

        const sortedRecords = [...filteredRecords].sort((recordA, recordB) => {
            const direction = sortOrder === "Descending" ? -1 : 1;
            let valueA = "";
            let valueB = "";

            if (sortBy === "Road Name") {
                valueA = recordA.roadName;
                valueB = recordB.roadName;
            } else if (sortBy === "Municipality") {
                valueA = recordA.municipality;
                valueB = recordB.municipality;
            } else if (sortBy === "Length") {
                valueA = recordA.lengthKm ?? -1;
                valueB = recordB.lengthKm ?? -1;
                return (Number(valueA) - Number(valueB)) * direction;
            } else if (sortBy === "Condition") {
                valueA = recordA.condition;
                valueB = recordB.condition;
            } else {
                valueA = recordA.roadId;
                valueB = recordB.roadId;
            }

            return String(valueA).localeCompare(String(valueB), undefined, { numeric: true }) * direction;
        });

        renderRoadMunicipalityCards(sortedRecords);

        if (roadRecordMeta) {
            roadRecordMeta.textContent = `${sortedRecords.length} road${sortedRecords.length === 1 ? "" : "s"} found`;
        }

        if (topRoadCount) {
            topRoadCount.textContent = String(roadRecords.length);
        }

        const totalLength = roadRecords.reduce((sum, record) => sum + (record.lengthKm || 0), 0);
        if (topRoadLength) {
            topRoadLength.textContent = `${totalLength.toFixed(1)} km`;
        }

        const roadConditionCounts = {
            good: 0,
            fair: 0,
            poor: 0,
            bad: 0,
        };

        roadRecords.forEach((record) => {
            const normalizedCondition = normalizeStatus(record.condition).replaceAll("_", " ");
            if (normalizedCondition.includes("good")) roadConditionCounts.good += 1;
            if (normalizedCondition.includes("fair")) roadConditionCounts.fair += 1;
            if (normalizedCondition.includes("poor")) roadConditionCounts.poor += 1;
            if (normalizedCondition.includes("bad")) roadConditionCounts.bad += 1;
        });

        if (roadConditionGood) roadConditionGood.textContent = String(roadConditionCounts.good);
        if (roadConditionFair) roadConditionFair.textContent = String(roadConditionCounts.fair);
        if (roadConditionPoor) roadConditionPoor.textContent = String(roadConditionCounts.poor);
        if (roadConditionBad) roadConditionBad.textContent = String(roadConditionCounts.bad);

        const totalRoadCount = roadRecords.length;
        const getFillPercent = (count) => {
            if (!totalRoadCount) {
                return "0%";
            }
            const percent = (count / totalRoadCount) * 100;
            return `${Math.min(100, Math.max(0, percent)).toFixed(1)}%`;
        };

        if (roadConditionFillGood) roadConditionFillGood.style.width = getFillPercent(roadConditionCounts.good);
        if (roadConditionFillFair) roadConditionFillFair.style.width = getFillPercent(roadConditionCounts.fair);
        if (roadConditionFillPoor) roadConditionFillPoor.style.width = getFillPercent(roadConditionCounts.poor);
        if (roadConditionFillBad) roadConditionFillBad.style.width = getFillPercent(roadConditionCounts.bad);
    };

    const refreshRoadAddMunicipalityOptions = () => {
        if (!roadAddMunicipalitySelect) {
            return;
        }

        const locationValue = roadAddLocationSelect ? roadAddLocationSelect.value : "";
        const normalizedLocation = String(locationValue || "").trim().toLowerCase();
        const hasSelectedLocation = normalizedLocation === "south" || normalizedLocation === "north";
        const municipalities = hasSelectedLocation ? getMunicipalityNamesByArea(locationValue) : [];
        const selectedMunicipality = String(roadAddMunicipalitySelect.value || "").trim();
        const isSelectedValid = municipalities.includes(selectedMunicipality);

        roadAddMunicipalitySelect.innerHTML = [
            `<option value="">${hasSelectedLocation ? "Select municipality" : "Select location first"}</option>`,
            ...municipalities.map((municipalityName) => `<option value="${escapeHtml(municipalityName)}">${escapeHtml(municipalityName)}</option>`),
        ].join("");
        roadAddMunicipalitySelect.disabled = !hasSelectedLocation;

        if (hasSelectedLocation && isSelectedValid) {
            roadAddMunicipalitySelect.value = selectedMunicipality;
        }
    };

    const closeRoadAddModal = () => {
        if (!roadAddModal) {
            return;
        }
        roadAddModal.hidden = true;
        if (roadAddForm) {
            roadAddForm.reset();
        }
        refreshRoadAddMunicipalityOptions();
        setBodyScrollLock();
    };

    const openRoadAddModal = () => {
        if (!roadAddModal) {
            return;
        }
        roadAddModal.hidden = false;
        refreshRoadAddMunicipalityOptions();
        setBodyScrollLock();
        const firstInput = roadAddRoadNameInput || roadAddRoadIdInput;
        if (firstInput) {
            firstInput.focus();
        }
    };

    openRoadAddModalButtons.forEach((button) => {
        button.addEventListener("click", openRoadAddModal);
    });

    closeRoadAddModalButtons.forEach((button) => {
        button.addEventListener("click", closeRoadAddModal);
    });

    if (roadAddLocationSelect) {
        roadAddLocationSelect.addEventListener("change", () => {
            refreshRoadAddMunicipalityOptions();
        });
    }

    if (roadAddForm) {
        roadAddForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const roadId = String(roadAddRoadIdInput?.value || "").trim() || "-";
            const roadName = String(roadAddRoadNameInput?.value || "").trim();
            const selectedLocation = String(roadAddLocationSelect?.value || "").trim();
            const selectedMunicipality = String(roadAddMunicipalitySelect?.value || "").trim();
            const selectedSurfaceType = String(roadAddSurfaceTypeSelect?.value || "").trim();
            const selectedSurfaceTypeDetails = String(roadAddSurfaceTypeDetailsInput?.value || "")
                .replace(/\s+/g, " ")
                .trim();
            const selectedCondition = String(roadAddConditionSelect?.value || "unknown").trim().toLowerCase();
            const lengthKm = parseNumber(String(roadAddLengthInput?.value || "").trim());

            if (!roadName) {
                if (roadAddRoadNameInput) {
                    roadAddRoadNameInput.focus();
                }
                showRoadUploadStatusToast("Please enter Road Name before adding.", "warning");
                return;
            }

            if (!selectedLocation) {
                if (roadAddLocationSelect) {
                    roadAddLocationSelect.focus();
                }
                showRoadUploadStatusToast("Please select Location before adding.", "warning");
                return;
            }

            if (!selectedMunicipality) {
                if (roadAddMunicipalitySelect) {
                    roadAddMunicipalitySelect.focus();
                }
                showRoadUploadStatusToast("Please select Municipality before adding.", "warning");
                return;
            }

            const areaFromMunicipality = resolveMunicipalityArea(selectedMunicipality);
            const resolvedLocation = selectedLocation
                || (areaFromMunicipality ? toTitleCase(areaFromMunicipality) : "");
            const formattedSurfaceType = selectedSurfaceTypeDetails
                ? (selectedSurfaceTypeDetails.includes(":")
                    ? selectedSurfaceTypeDetails
                    : `${selectedSurfaceType}: ${selectedSurfaceTypeDetails}`)
                : (selectedSurfaceType || "-");

            roadRecords.push({
                roadId,
                roadName,
                municipality: normalizeMunicipalityDisplayName(selectedMunicipality, "Unknown"),
                location: resolvedLocation,
                surfaceType: formattedSurfaceType,
                lengthKm,
                condition: ["good", "fair", "poor", "bad"].includes(selectedCondition) ? selectedCondition : "unknown",
                __roadNormalized: true,
            });

            roadMunicipalityPageState.set(normalizeMunicipalityName(selectedMunicipality), 1);
            refreshRoadMunicipalityOptions();
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
            persistMaintenanceState();
            closeRoadAddModal();
            showRoadUploadStatusToast("Provincial road added successfully.", "success");
        });
    }

    const parseSelectedRoadFiles = async (selectedFiles) => {
        const parsedRows = [];
        const skippedFiles = [];

        for (const file of selectedFiles) {
            try {
                const rawRows = await parseRoadFile(file);
                if (!rawRows.length) {
                    skippedFiles.push(file.name);
                    continue;
                }

                rawRows.forEach((rawRow) => {
                    const normalizedRecord = rawRow && rawRow.__roadNormalized
                        ? rawRow
                        : normalizeRoadRecord(rawRow);
                    if (normalizedRecord) {
                        parsedRows.push(normalizedRecord);
                    }
                });
            } catch (error) {
                skippedFiles.push(file.name);
            }
        }

        return { parsedRows, skippedFiles };
    };

    const ensureRoadUploadStatusToast = () => {
        if (roadUploadStatusToastElement) {
            return roadUploadStatusToastElement;
        }

        const toast = document.createElement("aside");
        toast.className = "road-upload-status-toast";
        toast.hidden = true;
        document.body.appendChild(toast);
        roadUploadStatusToastElement = toast;
        return toast;
    };

    const showRoadUploadStatusToast = (message, variant = "info") => {
        const toastMessage = String(message || "").trim();
        if (!toastMessage) {
            return;
        }

        const toast = ensureRoadUploadStatusToast();
        toast.classList.remove("is-success", "is-warning", "is-danger", "is-info");
        toast.classList.add(`is-${variant}`);
        toast.textContent = toastMessage;
        toast.hidden = false;

        if (roadUploadStatusToastTimer) {
            window.clearTimeout(roadUploadStatusToastTimer);
        }

        roadUploadStatusToastTimer = window.setTimeout(() => {
            toast.hidden = true;
            roadUploadStatusToastTimer = null;
        }, 3600);
    };

    const closeRoadDeleteConfirmToast = () => {
        if (!roadDeleteConfirmToastElement) {
            return;
        }
        roadDeleteConfirmToastElement.remove();
        roadDeleteConfirmToastElement = null;
    };

    const showRoadDeleteConfirmToast = (roadLabel, options = {}) => {
        closeRoadDeleteConfirmToast();

        const titleText = String(options.title || "Delete Road Data").trim() || "Delete Data";
        const copyText = String(options.copy || "Are you sure to delete this data?").trim() || "Are you sure to delete this data?";
        const confirmLabel = String(options.confirmLabel || "Yes, Delete").trim() || "Yes";
        const cancelLabel = String(options.cancelLabel || "Cancel").trim() || "Cancel";
        const variant = String(options.variant || "danger").trim().toLowerCase();
        const normalizedRoadLabel = String(roadLabel || "").trim() || "Selected road data";
        const prompt = document.createElement("aside");
        prompt.className = `road-delete-confirm-toast${variant === "info" ? " is-info" : ""}`;
        prompt.setAttribute("role", "alertdialog");
        prompt.setAttribute("aria-modal", "true");
        prompt.innerHTML = `
            <div class="road-delete-confirm-head">
                <h4>${escapeHtml(titleText)}</h4>
                <button type="button" class="road-delete-confirm-close" aria-label="Close delete confirmation">&times;</button>
            </div>
            <p class="road-delete-confirm-copy">${escapeHtml(copyText)}</p>
            <p class="road-delete-confirm-target">${escapeHtml(normalizedRoadLabel)}</p>
            <div class="road-delete-confirm-actions">
                <button type="button" class="road-delete-confirm-btn ${variant === "info" ? "road-delete-confirm-btn-info" : "road-delete-confirm-btn-danger"}" data-action="yes">${escapeHtml(confirmLabel)}</button>
                <button type="button" class="road-delete-confirm-btn road-delete-confirm-btn-cancel" data-action="cancel">${escapeHtml(cancelLabel)}</button>
            </div>
        `;

        document.body.appendChild(prompt);
        roadDeleteConfirmToastElement = prompt;

        return new Promise((resolve) => {
            const settle = (approved) => {
                closeRoadDeleteConfirmToast();
                resolve(Boolean(approved));
            };

            const closeButton = prompt.querySelector(".road-delete-confirm-close");
            if (closeButton) {
                closeButton.addEventListener("click", () => settle(false));
            }

            prompt.querySelectorAll("[data-action]").forEach((button) => {
                button.addEventListener("click", () => {
                    const action = String(button.getAttribute("data-action") || "");
                    settle(action === "yes");
                });
            });
        });
    };

    const createRoadIdentityKey = (record) => {
        const municipalityKey = normalizeMunicipalityName(record?.municipality || "");
        const roadIdKey = normalizeKey(record?.roadId || "");
        const roadNameKey = normalizeKey(record?.roadName || "");
        return `${municipalityKey}|${roadIdKey}|${roadNameKey}`;
    };

    const createRoadSignatureKey = (record) => {
        const identityKey = createRoadIdentityKey(record);
        const normalizedLength = typeof record?.lengthKm === "number" && Number.isFinite(record.lengthKm)
            ? record.lengthKm.toFixed(4)
            : "";
        const conditionKey = normalizeStatus(record?.condition || "unknown");
        const surfaceTypeKey = normalizeKey(record?.surfaceType || "");
        const locationKey = normalizeKey(record?.location || "");
        return `${identityKey}|${normalizedLength}|${conditionKey}|${surfaceTypeKey}|${locationKey}`;
    };

    const buildRoadUploadMergePlan = (uploadedRows) => {
        const dedupedUploadedByIdentity = new Map();
        let uploadDuplicateCount = 0;

        uploadedRows.forEach((row) => {
            const normalizedRow = row && row.__roadNormalized ? row : normalizeRoadRecord(row);
            if (!normalizedRow) {
                return;
            }

            const identityKey = createRoadIdentityKey(normalizedRow);
            if (!identityKey.replace(/\|/g, "")) {
                return;
            }

            if (dedupedUploadedByIdentity.has(identityKey)) {
                uploadDuplicateCount += 1;
            }
            dedupedUploadedByIdentity.set(identityKey, normalizedRow);
        });

        const dedupedUploadedRows = [...dedupedUploadedByIdentity.values()];
        const existingByIdentity = new Map();
        const existingMunicipalityKeys = new Set();
        roadRecords.forEach((record, index) => {
            const identityKey = createRoadIdentityKey(record);
            if (!identityKey.replace(/\|/g, "")) {
                return;
            }
            if (!existingByIdentity.has(identityKey)) {
                existingByIdentity.set(identityKey, { index, record });
            }
            const municipalityKey = normalizeMunicipalityName(record?.municipality || "");
            if (municipalityKey) {
                existingMunicipalityKeys.add(municipalityKey);
            }
        });

        const newRows = [];
        const newRowsSameMunicipality = [];
        const newRowsNewMunicipality = [];
        const duplicateExact = [];
        const duplicateChanged = [];

        dedupedUploadedRows.forEach((row) => {
            const identityKey = createRoadIdentityKey(row);
            const existingEntry = existingByIdentity.get(identityKey);
            if (!existingEntry) {
                newRows.push(row);
                const municipalityKey = normalizeMunicipalityName(row?.municipality || "");
                if (municipalityKey && existingMunicipalityKeys.has(municipalityKey)) {
                    newRowsSameMunicipality.push(row);
                } else {
                    newRowsNewMunicipality.push(row);
                }
                return;
            }

            const sameSignature = createRoadSignatureKey(existingEntry.record) === createRoadSignatureKey(row);
            if (sameSignature) {
                duplicateExact.push({ index: existingEntry.index, row });
            } else {
                duplicateChanged.push({ index: existingEntry.index, row });
            }
        });

        return {
            newRows,
            newRowsSameMunicipality,
            newRowsNewMunicipality,
            duplicateExact,
            duplicateChanged,
            uploadDuplicateCount,
            dedupedUploadedCount: dedupedUploadedRows.length,
        };
    };

    const closeRoadUploadDuplicatePrompt = () => {
        if (!roadUploadDuplicatePromptElement) {
            return;
        }
        roadUploadDuplicatePromptElement.remove();
        roadUploadDuplicatePromptElement = null;
    };

    const closeRoadUploadAddConfirmPrompt = () => {
        if (!roadUploadAddConfirmPromptElement) {
            return;
        }
        roadUploadAddConfirmPromptElement.remove();
        roadUploadAddConfirmPromptElement = null;
    };

    const showRoadUploadAddConfirmPrompt = ({
        rowCount = 0,
        municipalityNames = [],
    }) => {
        closeRoadUploadAddConfirmPrompt();

        const uniqueMunicipalityNames = [...new Set(
            (Array.isArray(municipalityNames) ? municipalityNames : [])
                .map((name) => String(name || "").trim())
                .filter(Boolean)
        )];
        const municipalityPreview = uniqueMunicipalityNames.slice(0, 3).join(", ");
        const hasMoreMunicipalities = uniqueMunicipalityNames.length > 3;

        const prompt = document.createElement("aside");
        prompt.className = "road-upload-duplicate-toast";
        prompt.innerHTML = `
            <div class="road-upload-duplicate-head">
                <h4>Add Municipality Data</h4>
                <button type="button" class="road-upload-duplicate-close" aria-label="Close add data confirmation">&times;</button>
            </div>
            <p class="road-upload-duplicate-copy">
                The upload includes ${rowCount} road row${rowCount === 1 ? "" : "s"} in existing municipality records
                with different details (Road ID, Road Name, Length, Condition, Surface).
                Are you sure to add this data?
            </p>
            ${uniqueMunicipalityNames.length ? `
                <div class="road-upload-duplicate-meta">
                    <span>Municipality${uniqueMunicipalityNames.length === 1 ? "" : "ies"}:
                        <strong>${escapeHtml(municipalityPreview)}${hasMoreMunicipalities ? ", ..." : ""}</strong>
                    </span>
                    <span>Rows to add: <strong>${rowCount}</strong></span>
                </div>
            ` : ""}
            <div class="road-upload-duplicate-actions">
                <button type="button" class="road-upload-duplicate-btn road-upload-duplicate-btn-primary" data-action="yes">Yes, Add</button>
                <button type="button" class="road-upload-duplicate-btn road-upload-duplicate-btn-secondary" data-action="no">No, Skip</button>
            </div>
        `;

        document.body.appendChild(prompt);
        roadUploadAddConfirmPromptElement = prompt;

        return new Promise((resolve) => {
            const settle = (approved) => {
                closeRoadUploadAddConfirmPrompt();
                resolve(Boolean(approved));
            };

            const closeButton = prompt.querySelector(".road-upload-duplicate-close");
            if (closeButton) {
                closeButton.addEventListener("click", () => settle(false));
            }

            prompt.querySelectorAll("[data-action]").forEach((button) => {
                button.addEventListener("click", () => {
                    const action = String(button.getAttribute("data-action") || "");
                    settle(action === "yes");
                });
            });
        });
    };

    const showRoadUploadDuplicatePrompt = ({
        duplicateTotal = 0,
        exactCount = 0,
        changedCount = 0,
        newCount = 0,
        uploadDuplicateCount = 0,
    }) => {
        closeRoadUploadDuplicatePrompt();

        const prompt = document.createElement("aside");
        prompt.className = "road-upload-duplicate-toast";
        prompt.innerHTML = `
            <div class="road-upload-duplicate-head">
                <h4>Duplicate Road Data Detected</h4>
                <button type="button" class="road-upload-duplicate-close" aria-label="Close duplicate upload prompt">&times;</button>
            </div>
            <p class="road-upload-duplicate-copy">
                ${duplicateTotal} uploaded road row${duplicateTotal === 1 ? "" : "s"} match existing records.
                Do you want to replace existing data with uploaded values?
            </p>
            <div class="road-upload-duplicate-meta">
                <span>New rows: <strong>${newCount}</strong></span>
                <span>Exact duplicates: <strong>${exactCount}</strong></span>
                <span>Rows with changes: <strong>${changedCount}</strong></span>
                ${uploadDuplicateCount > 0 ? `<span>Repeated in upload: <strong>${uploadDuplicateCount}</strong></span>` : ""}
            </div>
            <div class="road-upload-duplicate-actions">
                <button type="button" class="road-upload-duplicate-btn road-upload-duplicate-btn-primary" data-action="replace">Replace Data</button>
                <button type="button" class="road-upload-duplicate-btn road-upload-duplicate-btn-secondary" data-action="keep">Keep Existing</button>
                <button type="button" class="road-upload-duplicate-btn road-upload-duplicate-btn-ghost" data-action="cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(prompt);
        roadUploadDuplicatePromptElement = prompt;

        return new Promise((resolve) => {
            const settle = (action) => {
                closeRoadUploadDuplicatePrompt();
                resolve(action);
            };

            const closeButton = prompt.querySelector(".road-upload-duplicate-close");
            if (closeButton) {
                closeButton.addEventListener("click", () => settle("cancel"));
            }

            prompt.querySelectorAll("[data-action]").forEach((button) => {
                button.addEventListener("click", () => {
                    const action = String(button.getAttribute("data-action") || "cancel");
                    settle(action);
                });
            });
        });
    };

    const applyRoadUploadMergePlan = (plan, strategy = "keep") => {
        const normalizedStrategy = strategy === "replace" ? "replace" : "keep";
        const affectedRows = [];

        if (normalizedStrategy === "replace") {
            [...plan.duplicateExact, ...plan.duplicateChanged].forEach((entry) => {
                const targetIndex = entry.index;
                if (!Number.isInteger(targetIndex) || !roadRecords[targetIndex]) {
                    return;
                }
                roadRecords[targetIndex] = { ...entry.row, __roadNormalized: true };
                affectedRows.push(roadRecords[targetIndex]);
            });
        }

        const appendedRows = plan.newRows.map((row) => ({ ...row, __roadNormalized: true }));
        if (appendedRows.length) {
            roadRecords.push(...appendedRows);
            affectedRows.push(...appendedRows);
        }

        affectedRows.forEach((record) => {
            roadMunicipalityPageState.set(normalizeMunicipalityName(record.municipality || "Unknown"), 1);
        });

        refreshRoadMunicipalityOptions();
        if (typeof refreshRoadRegister === "function") {
            refreshRoadRegister();
        }
        persistMaintenanceState();
    };

    const getConditionFormValue = (conditionValue) => {
        const normalized = normalizeStatus(conditionValue).replaceAll("_", " ");
        if (normalized.includes("good")) return "good";
        if (normalized.includes("fair")) return "fair";
        if (normalized.includes("poor")) return "poor";
        if (normalized.includes("bad")) return "bad";
        return "unknown";
    };

    const getMunicipalityRecordIndexes = (municipalityKey) => {
        const normalizedKey = normalizeMunicipalityName(municipalityKey);
        const recordIndexes = [];
        roadRecords.forEach((record, recordIndex) => {
            if (normalizeMunicipalityName(record.municipality || "") === normalizedKey) {
                recordIndexes.push(recordIndex);
            }
        });
        return recordIndexes;
    };

    const populateRoadEditForm = (recordIndex) => {
        const record = roadRecords[recordIndex];
        if (!record) {
            return;
        }

        if (roadEditRoadIdInput) roadEditRoadIdInput.value = String(record.roadId || "");
        if (roadEditRoadNameInput) roadEditRoadNameInput.value = String(record.roadName || "");
        if (roadEditLengthInput) {
            roadEditLengthInput.value = typeof record.lengthKm === "number" && Number.isFinite(record.lengthKm)
                ? String(record.lengthKm)
                : "";
        }
        if (roadEditConditionInput) roadEditConditionInput.value = getConditionFormValue(record.condition);
        if (roadEditSurfaceTypeInput) roadEditSurfaceTypeInput.value = String(record.surfaceType || "");
    };

    const renderRoadEditRecordRows = (recordIndexes, selectedIndex) => {
        if (!roadEditRecordsBody) {
            return;
        }

        const validIndexes = Array.isArray(recordIndexes)
            ? recordIndexes.filter((recordIndex) => Number.isInteger(recordIndex) && roadRecords[recordIndex])
            : [];

        if (!validIndexes.length) {
            roadEditRecordsBody.innerHTML = `
                <tr>
                    <td colspan="5">No road records available.</td>
                </tr>
            `;
            return;
        }

        roadEditRecordsBody.innerHTML = validIndexes
            .map((recordIndex) => {
                const record = roadRecords[recordIndex] || {};
                const conditionText = toTitleCase(record.condition || "Unknown");
                const conditionClass = getRoadConditionClass(record.condition || "unknown");
                const isSelected = recordIndex === selectedIndex;

                return `
                    <tr class="${isSelected ? "is-selected" : ""}">
                        <td>${escapeHtml(record.roadId || "-")}</td>
                        <td>
                            <button
                                type="button"
                                class="road-edit-record-select-btn js-road-edit-record-row"
                                data-record-index="${recordIndex}"
                                ${isSelected ? 'aria-current="true"' : ""}
                            >
                                ${escapeHtml(record.roadName || "-")}
                            </button>
                        </td>
                        <td>${escapeHtml(formatLengthValue(record.lengthKm))}</td>
                        <td><span class="road-condition-pill ${conditionClass}">${escapeHtml(conditionText)}</span></td>
                        <td>${escapeHtml(record.surfaceType || "-")}</td>
                    </tr>
                `;
            })
            .join("");
    };

    const closeRoadEditModal = () => {
        if (!roadEditModal) {
            return;
        }
        roadEditModal.hidden = true;
        editingMunicipalityKey = "";
        editingMunicipalityName = "";
        editingMunicipalityRecordIndexes = [];
        if (roadEditForm) {
            roadEditForm.reset();
        }
        if (roadEditRecordSelect) {
            roadEditRecordSelect.innerHTML = "";
        }
        if (roadEditRecordsBody) {
            roadEditRecordsBody.innerHTML = `
                <tr>
                    <td colspan="5">No road records available.</td>
                </tr>
            `;
        }
        setBodyScrollLock();
    };

    const showMunicipalityToast = (municipalityKey, message) => {
        const normalizedKey = normalizeMunicipalityName(municipalityKey);
        const toastMessage = String(message || "").trim();
        if (!normalizedKey || !toastMessage) {
            return;
        }

        roadMunicipalityToastState.set(normalizedKey, toastMessage);
        const existingTimer = roadMunicipalityToastTimers.get(normalizedKey);
        if (existingTimer) {
            window.clearTimeout(existingTimer);
        }

        const timeoutId = window.setTimeout(() => {
            roadMunicipalityToastState.delete(normalizedKey);
            roadMunicipalityToastTimers.delete(normalizedKey);
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
        }, 3200);

        roadMunicipalityToastTimers.set(normalizedKey, timeoutId);
    };

    const parseRecordIndexes = (value) => {
        const uniqueIndexes = new Set();
        String(value || "")
            .split(",")
            .forEach((rawValue) => {
                const parsedIndex = Number.parseInt(rawValue, 10);
                if (Number.isInteger(parsedIndex) && roadRecords[parsedIndex]) {
                    uniqueIndexes.add(parsedIndex);
                }
            });
        return [...uniqueIndexes];
    };

    const openRoadEditModal = (municipalityKey, municipalityName, providedRecordIndexes = []) => {
        if (!roadEditModal || !roadEditRecordSelect) {
            return;
        }

        const normalizedKey = normalizeMunicipalityName(municipalityKey || municipalityName);
        let recordIndexes = Array.isArray(providedRecordIndexes)
            ? providedRecordIndexes
                .filter((recordIndex) => Number.isInteger(recordIndex) && roadRecords[recordIndex])
            : [];

        if (!recordIndexes.length) {
            recordIndexes = getMunicipalityRecordIndexes(normalizedKey);
        }
        if (!recordIndexes.length && municipalityName) {
            recordIndexes = getMunicipalityRecordIndexes(municipalityName);
        }
        recordIndexes = [...new Set(recordIndexes)];
        if (!recordIndexes.length) {
            showPeoGeneralToast("No road records found for this municipality.", {
                title: "Road Management",
                variant: "warning",
            });
            return;
        }

        editingMunicipalityKey = normalizedKey;
        editingMunicipalityName = municipalityName || roadRecords[recordIndexes[0]]?.municipality || "Unknown";
        editingMunicipalityRecordIndexes = [...recordIndexes];

        roadEditRecordSelect.innerHTML = recordIndexes
            .map((recordIndex, optionIndex) => {
                const record = roadRecords[recordIndex] || {};
                const optionLabel = `${record.roadId || "-"}-${record.roadName || `Road ${optionIndex + 1}`}`;
                return `<option value="${recordIndex}">${escapeHtml(optionLabel)}</option>`;
            })
            .join("");

        roadEditRecordSelect.value = String(recordIndexes[0]);
        populateRoadEditForm(recordIndexes[0]);
        renderRoadEditRecordRows(editingMunicipalityRecordIndexes, recordIndexes[0]);
        if (roadEditSubtitle) {
            roadEditSubtitle.textContent = `Edit road data for ${editingMunicipalityName} (${recordIndexes.length} road${recordIndexes.length === 1 ? "" : "s"})`;
        }

        roadEditModal.hidden = false;
        setBodyScrollLock();
        const focusTarget = roadEditRoadNameInput || roadEditRecordSelect;
        if (focusTarget) {
            focusTarget.focus();
        }
    };

    closeRoadEditModalButtons.forEach((button) => {
        button.addEventListener("click", closeRoadEditModal);
    });

    if (roadEditRecordSelect) {
        roadEditRecordSelect.addEventListener("change", () => {
            const selectedIndex = Number.parseInt(roadEditRecordSelect.value, 10);
            if (Number.isInteger(selectedIndex)) {
                populateRoadEditForm(selectedIndex);
                renderRoadEditRecordRows(editingMunicipalityRecordIndexes, selectedIndex);
            }
        });
    }

    if (roadEditRecordsBody && roadEditRecordSelect) {
        roadEditRecordsBody.addEventListener("click", (event) => {
            const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
            if (!clickTarget) {
                return;
            }

            const rowButton = clickTarget.closest(".js-road-edit-record-row");
            if (!rowButton) {
                return;
            }

            const recordIndex = Number.parseInt(String(rowButton.dataset.recordIndex || ""), 10);
            if (!Number.isInteger(recordIndex) || !roadRecords[recordIndex]) {
                return;
            }

            roadEditRecordSelect.value = String(recordIndex);
            populateRoadEditForm(recordIndex);
            renderRoadEditRecordRows(editingMunicipalityRecordIndexes, recordIndex);
        });
    }

    if (roadEditForm && roadEditRecordSelect) {
        roadEditForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const selectedIndex = Number.parseInt(roadEditRecordSelect.value, 10);
            if (!Number.isInteger(selectedIndex) || !roadRecords[selectedIndex]) {
                return;
            }

            const targetRecord = roadRecords[selectedIndex];
            const updatedRoadId = (roadEditRoadIdInput?.value || "").trim() || "-";
            const updatedRoadName = (roadEditRoadNameInput?.value || "").trim();
            const updatedLengthKm = parseNumber((roadEditLengthInput?.value || "").trim());
            const selectedCondition = String(roadEditConditionInput?.value || "unknown")
                .trim()
                .toLowerCase();
            const updatedCondition = ["good", "fair", "poor", "bad"].includes(selectedCondition)
                ? selectedCondition
                : "unknown";
            const updatedSurfaceType = (roadEditSurfaceTypeInput?.value || "").trim() || "-";
            const originalSnapshot = {
                roadId: String(targetRecord.roadId || "-"),
                roadName: String(targetRecord.roadName || "-"),
                lengthKm: typeof targetRecord.lengthKm === "number" && Number.isFinite(targetRecord.lengthKm)
                    ? targetRecord.lengthKm
                    : null,
                condition: getConditionFormValue(targetRecord.condition),
                surfaceType: String(targetRecord.surfaceType || "-"),
            };

            if (!updatedRoadName) {
                if (roadEditRoadNameInput) {
                    roadEditRoadNameInput.focus();
                }
                return;
            }

            const municipalityKey = normalizeMunicipalityName(editingMunicipalityName || targetRecord.municipality || "");
            const originalRoadIdKey = normalizeKey(targetRecord.roadId || "");
            const originalRoadNameKey = normalizeKey(targetRecord.roadName || "");

            let updatedCount = 0;
            roadRecords.forEach((record) => {
                const sameMunicipality = normalizeMunicipalityName(record.municipality || "") === municipalityKey;
                const sameRoadId = normalizeKey(record.roadId || "") === originalRoadIdKey;
                const sameRoadName = normalizeKey(record.roadName || "") === originalRoadNameKey;

                if (!sameMunicipality || !sameRoadId || !sameRoadName) {
                    return;
                }

                record.roadId = updatedRoadId;
                record.roadName = updatedRoadName;
                record.lengthKm = updatedLengthKm;
                record.condition = updatedCondition;
                record.surfaceType = updatedSurfaceType;
                record.municipality = editingMunicipalityName || record.municipality || "Unknown";
                record.__roadNormalized = true;
                updatedCount += 1;
            });

            if (!updatedCount) {
                roadRecords.forEach((record) => {
                    const sameMunicipality = normalizeMunicipalityName(record.municipality || "") === municipalityKey;
                    const sameRoadName = normalizeKey(record.roadName || "") === originalRoadNameKey;
                    if (!sameMunicipality || !sameRoadName) {
                        return;
                    }

                    record.roadId = updatedRoadId;
                    record.roadName = updatedRoadName;
                    record.lengthKm = updatedLengthKm;
                    record.condition = updatedCondition;
                    record.surfaceType = updatedSurfaceType;
                    record.municipality = editingMunicipalityName || record.municipality || "Unknown";
                    record.__roadNormalized = true;
                    updatedCount += 1;
                });
            }

            if (!updatedCount) {
                targetRecord.roadId = updatedRoadId;
                targetRecord.roadName = updatedRoadName;
                targetRecord.lengthKm = updatedLengthKm;
                targetRecord.condition = updatedCondition;
                targetRecord.surfaceType = updatedSurfaceType;
                targetRecord.municipality = editingMunicipalityName || targetRecord.municipality || "Unknown";
                targetRecord.__roadNormalized = true;
            }

            const selectedOption = roadEditRecordSelect.selectedOptions[0];
            if (selectedOption) {
                selectedOption.textContent = `${updatedRoadId}-${updatedRoadName}`;
            }

            roadMunicipalityPageState.set(normalizeMunicipalityName(editingMunicipalityName || targetRecord.municipality), 1);
            refreshRoadMunicipalityOptions();
            const changeMessages = [];
            if (normalizeKey(originalSnapshot.roadId) !== normalizeKey(updatedRoadId)) {
                changeMessages.push(`Road ID -> ${updatedRoadId}`);
            }
            if (normalizeKey(originalSnapshot.roadName) !== normalizeKey(updatedRoadName)) {
                changeMessages.push(`Road Name -> ${updatedRoadName}`);
            }
            const updatedLengthValue = typeof updatedLengthKm === "number" && Number.isFinite(updatedLengthKm) ? updatedLengthKm : null;
            const isLengthChanged = (originalSnapshot.lengthKm === null && updatedLengthValue !== null)
                || (originalSnapshot.lengthKm !== null && updatedLengthValue === null)
                || (originalSnapshot.lengthKm !== null && updatedLengthValue !== null
                    && Math.abs(originalSnapshot.lengthKm - updatedLengthValue) > 0.0001);
            if (isLengthChanged) {
                const formattedLength = updatedLengthValue === null ? "-" : updatedLengthValue.toFixed(2);
                changeMessages.push(`Length -> ${formattedLength} km`);
            }
            if (originalSnapshot.condition !== updatedCondition) {
                changeMessages.push(`Condition -> ${toTitleCase(updatedCondition)}`);
            }
            if (normalizeKey(originalSnapshot.surfaceType) !== normalizeKey(updatedSurfaceType)) {
                changeMessages.push(`Surface -> ${updatedSurfaceType}`);
            }

            const roadDetail = normalizeKey(originalSnapshot.roadName) !== normalizeKey(updatedRoadName)
                ? `Road: ${originalSnapshot.roadName} -> ${updatedRoadName}`
                : `Road: ${updatedRoadName}`;

            const toastSummary = changeMessages.length
                ? `${roadDetail}; Updated ${changeMessages.join(", ")}`
                : `${roadDetail}; No field changes detected`;
            showMunicipalityToast(editingMunicipalityName || targetRecord.municipality, toastSummary);
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
            persistMaintenanceState();
            closeRoadEditModal();
        });
    }

    const closeRoadDeleteModal = () => {
        if (!roadDeleteModal) {
            return;
        }
        roadDeleteModal.hidden = true;
        deletingMunicipalityKey = "";
        deletingMunicipalityName = "";
        if (roadDeleteForm) {
            roadDeleteForm.reset();
        }
        if (roadDeleteRecordSelect) {
            roadDeleteRecordSelect.innerHTML = "";
        }
        setBodyScrollLock();
    };

    const openRoadDeleteModal = (municipalityKey, municipalityName) => {
        if (!roadDeleteModal || !roadDeleteRecordSelect) {
            return;
        }

        const normalizedKey = normalizeMunicipalityName(municipalityKey || municipalityName);
        const recordIndexes = getMunicipalityRecordIndexes(normalizedKey);
        if (!recordIndexes.length) {
            showPeoGeneralToast("No road records found for this municipality.", {
                title: "Road Management",
                variant: "warning",
            });
            return;
        }

        deletingMunicipalityKey = normalizedKey;
        deletingMunicipalityName = municipalityName || roadRecords[recordIndexes[0]]?.municipality || "Unknown";

        roadDeleteRecordSelect.innerHTML = recordIndexes
            .map((recordIndex, optionIndex) => {
                const record = roadRecords[recordIndex] || {};
                const optionLabel = `${record.roadId || "-"}-${record.roadName || `Road ${optionIndex + 1}`}`;
                return `<option value="${recordIndex}">${escapeHtml(optionLabel)}</option>`;
            })
            .join("");

        if (roadDeleteSubtitle) {
            roadDeleteSubtitle.textContent = `Delete a road record from ${deletingMunicipalityName}`;
        }

        roadDeleteModal.hidden = false;
        setBodyScrollLock();
    };

    closeRoadDeleteModalButtons.forEach((button) => {
        button.addEventListener("click", closeRoadDeleteModal);
    });

    if (roadDeleteForm && roadDeleteRecordSelect) {
        roadDeleteForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const selectedIndex = Number.parseInt(roadDeleteRecordSelect.value, 10);
            if (!Number.isInteger(selectedIndex) || !roadRecords[selectedIndex]) {
                return;
            }

            const targetRecord = roadRecords[selectedIndex];
            const roadLabel = `${targetRecord.roadId || "-"}-${targetRecord.roadName || "-"}`;
            const shouldDelete = await showRoadDeleteConfirmToast(roadLabel);
            if (!shouldDelete) {
                return;
            }

            roadRecords.splice(selectedIndex, 1);

            const municipalityName = deletingMunicipalityName || targetRecord.municipality || "Unknown";
            roadMunicipalityPageState.set(normalizeMunicipalityName(municipalityName), 1);
            refreshRoadMunicipalityOptions();
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
            showMunicipalityToast(municipalityName, `Deleted Road: ${targetRecord.roadName || targetRecord.roadId || "-"}`);
            showRoadUploadStatusToast("The data was deleted permanently.", "success");
            persistMaintenanceState();
            closeRoadDeleteModal();
        });
    }

    document.addEventListener("click", async (event) => {
        const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement;
        if (!clickTarget) {
            return;
        }
        if (!clickTarget.closest(".js-road-municipality-list")) {
            return;
        }

        const updateButton = clickTarget.closest(".js-road-municipality-update");
        if (updateButton) {
            const municipalityKey = String(updateButton.dataset.municipalityKey || "").trim();
            const municipalityName = String(updateButton.dataset.municipalityName || "").trim();
            const recordIndexes = parseRecordIndexes(updateButton.dataset.recordIndexes);
            openRoadEditModal(municipalityKey, municipalityName, recordIndexes);
            return;
        }

        const rowDeleteButton = clickTarget.closest(".js-road-row-delete");
        if (rowDeleteButton) {
            const recordIndex = Number.parseInt(String(rowDeleteButton.dataset.recordIndex || ""), 10);
            if (!Number.isInteger(recordIndex) || !roadRecords[recordIndex]) {
                return;
            }

            const targetRecord = roadRecords[recordIndex];
            const roadLabel = `${targetRecord.roadId || "-"}-${targetRecord.roadName || "-"}`;
            const shouldDelete = await showRoadDeleteConfirmToast(roadLabel);
            if (!shouldDelete) {
                return;
            }

            roadRecords.splice(recordIndex, 1);

            const municipalityName = String(
                rowDeleteButton.dataset.municipalityName || targetRecord.municipality || "Unknown"
            ).trim() || "Unknown";

            roadMunicipalityPageState.set(normalizeMunicipalityName(municipalityName), 1);
            refreshRoadMunicipalityOptions();
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
            showMunicipalityToast(
                municipalityName,
                `Deleted Road: ${targetRecord.roadName || targetRecord.roadId || "-"}`
            );
            showRoadUploadStatusToast("The data was deleted permanently.", "success");
            persistMaintenanceState();
            return;
        }

        const button = clickTarget.closest(".js-road-page-btn");
        if (!button) {
            return;
        }

        const pageKey = String(button.dataset.pageKey || "").trim();
        const direction = String(button.dataset.pageDirection || "").trim();
        if (!pageKey) {
            return;
        }

        const currentPage = roadMunicipalityPageState.get(pageKey) || 1;
        const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
        roadMunicipalityPageState.set(pageKey, Math.max(1, nextPage));

        if (typeof refreshRoadRegister === "function") {
            refreshRoadRegister();
        }
    });

    const setRoadSearchExpanded = (expand) => {
        if (!roadSearchShell) {
            return;
        }
        const hasSearchText = Boolean((roadSearchInput?.value || "").trim());
        const shouldExpand = Boolean(expand || hasSearchText);
        roadSearchShell.classList.toggle("is-expanded", shouldExpand);
        if (roadSearchToggle) {
            roadSearchToggle.setAttribute("aria-expanded", shouldExpand ? "true" : "false");
        }
    };

    if (roadSearchShell && roadSearchInput) {
        setRoadSearchExpanded(Boolean((roadSearchInput.value || "").trim()));

        if (roadSearchToggle) {
            roadSearchToggle.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const isExpanded = roadSearchShell.classList.contains("is-expanded");
                const hasSearchText = Boolean((roadSearchInput.value || "").trim());
                if (isExpanded && !hasSearchText) {
                    setRoadSearchExpanded(false);
                    return;
                }
                setRoadSearchExpanded(true);
                roadSearchInput.focus();
            });
        }

        roadSearchInput.addEventListener("focus", () => {
            setRoadSearchExpanded(true);
        });

        roadSearchInput.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") {
                return;
            }
            event.stopPropagation();
            if ((roadSearchInput.value || "").trim()) {
                roadSearchInput.value = "";
                if (typeof refreshRoadRegister === "function") {
                    refreshRoadRegister();
                }
            }
            setRoadSearchExpanded(false);
            roadSearchInput.blur();
        });

        document.addEventListener("click", (event) => {
            if (!roadSearchShell.contains(event.target)) {
                setRoadSearchExpanded(false);
            }
        });
    }

    if (roadUploadInput) {
        roadUploadInput.accept = roadAcceptedUploadTypes;
        roadUploadInput.addEventListener("change", async (event) => {
            const selectedFiles = Array.from(event.target.files || []);
            if (!selectedFiles.length) {
                return;
            }

            const { parsedRows, skippedFiles } = await parseSelectedRoadFiles(selectedFiles);
            const uploadPlan = buildRoadUploadMergePlan(parsedRows);
            const duplicateTotal = uploadPlan.duplicateExact.length + uploadPlan.duplicateChanged.length;
            const hasAnyValidRows = uploadPlan.dedupedUploadedCount > 0;

            if (!hasAnyValidRows && skippedFiles.length) {
                showRoadUploadStatusToast(
                    `No valid rows were imported. Unreadable file(s): ${skippedFiles.join(", ")}`,
                    "warning",
                );
                roadUploadInput.value = "";
                return;
            }

            if (!hasAnyValidRows) {
                showRoadUploadStatusToast("No valid road rows were found in the selected file(s).", "warning");
                roadUploadInput.value = "";
                return;
            }

            const sameMunicipalityDifferentRows = Array.isArray(uploadPlan.newRowsSameMunicipality)
                ? uploadPlan.newRowsSameMunicipality
                : [];
            const newMunicipalityRows = Array.isArray(uploadPlan.newRowsNewMunicipality)
                ? uploadPlan.newRowsNewMunicipality
                : [];
            let includeSameMunicipalityRows = true;
            let addedDifferentDataInExistingMunicipality = false;

            if (sameMunicipalityDifferentRows.length) {
                const municipalityNames = sameMunicipalityDifferentRows
                    .map((row) => normalizeMunicipalityDisplayName(row?.municipality, "Unknown"))
                    .filter(Boolean);

                includeSameMunicipalityRows = await showRoadUploadAddConfirmPrompt({
                    rowCount: sameMunicipalityDifferentRows.length,
                    municipalityNames,
                });

                if (includeSameMunicipalityRows) {
                    addedDifferentDataInExistingMunicipality = true;
                }
            }

            const effectivePlan = {
                ...uploadPlan,
                newRows: [
                    ...newMunicipalityRows,
                    ...(includeSameMunicipalityRows ? sameMunicipalityDifferentRows : []),
                ],
            };

            let finalToastMessage = "";
            let finalToastVariant = "info";

            if (duplicateTotal > 0) {
                const action = await showRoadUploadDuplicatePrompt({
                    duplicateTotal,
                    exactCount: uploadPlan.duplicateExact.length,
                    changedCount: uploadPlan.duplicateChanged.length,
                    newCount: effectivePlan.newRows.length,
                    uploadDuplicateCount: uploadPlan.uploadDuplicateCount,
                });

                if (action === "cancel") {
                    showRoadUploadStatusToast("Upload cancelled. Existing road data was not changed.", "info");
                    roadUploadInput.value = "";
                    return;
                }

                applyRoadUploadMergePlan(effectivePlan, action === "replace" ? "replace" : "keep");
                if (addedDifferentDataInExistingMunicipality) {
                    finalToastMessage = "The Data Added.";
                    finalToastVariant = "success";
                } else if (action === "replace") {
                    finalToastMessage = `Upload complete: ${effectivePlan.newRows.length} new row(s) added, ${duplicateTotal} duplicate row(s) replaced.`;
                    finalToastVariant = "success";
                } else {
                    finalToastMessage = `Upload complete: ${effectivePlan.newRows.length} new row(s) added. ${duplicateTotal} duplicate row(s) kept unchanged.`;
                    finalToastVariant = "info";
                }
            } else if (effectivePlan.newRows.length) {
                applyRoadUploadMergePlan(effectivePlan, "keep");
                if (addedDifferentDataInExistingMunicipality) {
                    finalToastMessage = "The Data Added.";
                    finalToastVariant = "success";
                } else {
                    finalToastMessage = `Upload complete: ${effectivePlan.newRows.length} road row(s) added.`;
                    finalToastVariant = "success";
                }
            } else {
                finalToastMessage = "No new data was added.";
                finalToastVariant = "info";
            }

            if (skippedFiles.length) {
                const skippedNote = `Some files were skipped: ${skippedFiles.join(", ")}`;
                if (finalToastMessage) {
                    finalToastMessage = `${finalToastMessage} ${skippedNote}`;
                } else {
                    finalToastMessage = skippedNote;
                    finalToastVariant = "warning";
                }
            }

            if (finalToastMessage) {
                showRoadUploadStatusToast(finalToastMessage, finalToastVariant);
            }

            roadUploadInput.value = "";
        });
    }

    if (roadSearchInput) {
        roadSearchInput.addEventListener("input", () => {
            setRoadSearchExpanded(true);
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
        });
    }

    const refreshContractorSummary = () => {
        if (!contractorManagement) {
            return;
        }

        const total = contractorRows.length;
        const active = contractorRows.filter((row) => String(row.dataset.status || "").toLowerCase() === "active").length;
        const blacklisted = contractorRows.filter((row) => String(row.dataset.status || "").toLowerCase() === "blacklisted").length;

        const ratings = contractorRows
            .map((row) => Number.parseFloat(row.dataset.rating || "0"))
            .filter((value) => Number.isFinite(value));
        const averageRating = ratings.length
            ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
            : 0;

        if (contractorStatTotal) contractorStatTotal.textContent = String(total);
        if (contractorStatActive) contractorStatActive.textContent = String(active);
        if (contractorStatRating) contractorStatRating.textContent = averageRating.toFixed(1);
        if (contractorStatBlacklisted) contractorStatBlacklisted.textContent = String(blacklisted);
    };

    const getContractorDropdownFilterValue = (filterElement, fallbackValue = "all") => {
        if (!filterElement) {
            return fallbackValue;
        }

        if (typeof filterElement.value !== "undefined") {
            return String(filterElement.value || fallbackValue).trim().toLowerCase();
        }

        const selectedOption = filterElement.querySelector(".dropdown-option.is-selected");
        if (!selectedOption) {
            return fallbackValue;
        }

        const explicitValue = String(selectedOption.dataset.value || "").trim();
        if (explicitValue) {
            return explicitValue.toLowerCase();
        }

        const labelValue = String(selectedOption.textContent || "").trim().toLowerCase();
        if (!labelValue) {
            return fallbackValue;
        }
        if (labelValue === "all status" || labelValue === "all pcab") {
            return "all";
        }

        return labelValue.replace(/^pcab\s+/, "").trim();
    };

    const updateContractorDropdownFilterState = (filterElement) => {
        if (!filterElement || !filterElement.classList.contains("contractor-dropdown")) {
            return;
        }
        const selectedValue = getContractorDropdownFilterValue(filterElement, "all");
        filterElement.classList.toggle("is-filtered", selectedValue !== "all");
    };

    const showContractorSuccessToast = (message, variant = "success") => {
        if (!contractorSuccessToast) {
            return;
        }

        contractorSuccessToast.classList.toggle("is-delete", variant === "delete");
        contractorSuccessToast.textContent = String(message || "Contractor added successfully.");
        contractorSuccessToast.hidden = false;

        if (contractorSuccessToastTimer) {
            clearTimeout(contractorSuccessToastTimer);
        }
        contractorSuccessToastTimer = window.setTimeout(() => {
            contractorSuccessToast.hidden = true;
            contractorSuccessToastTimer = null;
        }, 2800);
    };

    const refreshContractorTable = () => {
        if (!contractorManagement) {
            return;
        }

        const searchValue = String(contractorSearchInput?.value || "").trim().toLowerCase();
        const statusValue = getContractorDropdownFilterValue(contractorStatusFilter, "all");
        const pcabValue = getContractorDropdownFilterValue(contractorPcabFilter, "all");

        let visibleCount = 0;
        contractorRows.forEach((row) => {
            const rowStatus = String(row.dataset.status || "").toLowerCase();
            const rowPcab = String(row.dataset.pcab || "").toLowerCase();
            const searchableText = String(row.dataset.search || row.textContent || "").toLowerCase();

            const matchesSearch = !searchValue || searchableText.includes(searchValue);
            const matchesStatus = statusValue === "all" || rowStatus === statusValue;
            const matchesPcab = pcabValue === "all" || rowPcab === pcabValue;
            const shouldShow = matchesSearch && matchesStatus && matchesPcab;

            row.style.display = shouldShow ? "" : "none";
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (contractorFoundCount) {
            contractorFoundCount.textContent = String(visibleCount);
        }
        if (contractorEmptyRow) {
            contractorEmptyRow.hidden = visibleCount !== 0;
        }
    };

    const closeContractorFloatCard = () => {
        if (!contractorFloatCard) {
            return;
        }
        contractorFloatCard.hidden = true;
        setBodyScrollLock();
    };

    const closeContractorAddModal = () => {
        if (!contractorAddModal) {
            return;
        }
        contractorAddModal.hidden = true;
        if (contractorAddForm) {
            contractorAddForm.reset();
        }
        setBodyScrollLock();
    };

    const openContractorAddModal = () => {
        if (!contractorAddModal) {
            return;
        }

        closeContractorDeleteToast();
        contractorAddModal.hidden = false;
        setBodyScrollLock();

        const firstField = contractorAddForm?.querySelector('[name="company_name"]');
        if (firstField) {
            firstField.focus();
            firstField.select();
        }
    };

    const createContractorRowElement = (record) => {
        const name = String(record.name || "").trim() || "Contractor";
        const tradeName = String(record.tradeName || "").trim();
        const tin = String(record.tin || "").trim();
        const philgeps = String(record.philgeps || "").trim();
        const pcab = String(record.pcab || "").trim().toLowerCase();
        const status = String(record.status || "active").trim().toLowerCase();
        const contracts = String(record.contracts || "0").trim() || "0";
        const value = String(record.value || "P 0").trim() || "P 0";
        const rating = String(record.rating || "").trim();
        const classification = String(record.classification || "").trim();
        const licenseExpiry = String(record.licenseExpiry || "").trim();
        const contactPerson = String(record.contactPerson || "").trim();
        const contactEmail = String(record.contactEmail || "").trim();
        const contactPhone = String(record.contactPhone || "").trim();
        const contactAddress = String(record.contactAddress || "").trim();
        const pcabLicense = String(record.pcabLicense || "").trim();
        const address = String(record.address || "").trim();
        const contactCity = String(record.contactCity || "").trim();
        const contactProvince = String(record.contactProvince || "").trim();
        const contactMobile = String(record.contactMobile || "").trim();
        const remarks = String(record.remarks || "").trim();

        const statusLabel = getContractorStatusLabel(status);
        const statusClassName = getContractorStatusClassName(status);
        const pcabSummary = pcab ? pcab.toUpperCase() : "-";
        const searchText = [
            name,
            tradeName,
            tin,
            philgeps,
            pcabLicense,
            pcab ? `PCAB ${pcab.toUpperCase()}` : "",
            classification,
            address,
            contactCity,
            contactProvince,
            contactPerson,
            contactEmail,
            contactPhone,
            contactMobile,
            statusLabel,
        ].join(" ");

        const rowElement = document.createElement("article");
        rowElement.className = "contractor-list-card js-contractor-row";
        rowElement.dataset.name = name;
        rowElement.dataset.tradeName = tradeName;
        rowElement.dataset.tin = tin;
        rowElement.dataset.philgeps = philgeps;
        rowElement.dataset.pcab = pcab;
        rowElement.dataset.status = status;
        rowElement.dataset.contracts = contracts;
        rowElement.dataset.value = value;
        rowElement.dataset.rating = rating;
        rowElement.dataset.classification = classification;
        rowElement.dataset.licenseExpiry = licenseExpiry;
        rowElement.dataset.contactPerson = contactPerson;
        rowElement.dataset.contactEmail = contactEmail;
        rowElement.dataset.contactPhone = contactPhone;
        rowElement.dataset.contactAddress = contactAddress;
        rowElement.dataset.pcabLicense = pcabLicense;
        rowElement.dataset.address = address;
        rowElement.dataset.contactCity = contactCity;
        rowElement.dataset.contactProvince = contactProvince;
        rowElement.dataset.contactMobile = contactMobile;
        rowElement.dataset.remarks = remarks;
        rowElement.dataset.search = searchText;

        rowElement.innerHTML = `
            <div class="contractor-list-main">
                <div class="contractor-list-title-row">
                    <button type="button" class="contractor-name contractor-name-btn js-contractor-open-card">${escapeHtml(name)}</button>
                    <span class="contractor-status-badge ${escapeHtml(statusClassName)}">${escapeHtml(statusLabel)}</span>
                </div>
                <p class="contractor-list-line contractor-list-line--muted">TIN: ${escapeHtml(tin || "-")} | PhilGEPS: ${escapeHtml(philgeps || "-")} | PCAB ${escapeHtml(pcabSummary)}</p>
                <p class="contractor-list-line">
                    <span><span class="material-symbols-outlined" aria-hidden="true">description</span> ${escapeHtml(contracts)} contracts</span>
                    <span>Value: <strong>${escapeHtml(value)}</strong></span>
                </p>
            </div>

            <div class="contractor-actions">
                <button type="button" class="contractor-icon-btn js-contractor-open-card" aria-label="View contractor">
                    <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                </button>
                <button type="button" class="contractor-icon-btn contractor-icon-btn-star js-contractor-open-eval" aria-label="Evaluate contractor">
                    <span class="material-symbols-outlined" aria-hidden="true">star</span>
                </button>
                <button type="button" class="contractor-icon-btn js-contractor-open-edit" aria-label="Edit contractor">
                    <span class="material-symbols-outlined" aria-hidden="true">edit_square</span>
                </button>
                <button type="button" class="contractor-icon-btn js-contractor-delete" aria-label="Delete contractor">
                    <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                </button>
            </div>
        `;

        return rowElement;
    };

    const closeContractorDeleteToast = () => {
        if (!contractorDeleteToast) {
            return;
        }
        contractorDeleteToast.hidden = true;
        deletingContractorRow = null;
    };

    const openContractorDeleteToast = (row) => {
        if (!contractorDeleteToast || !row) {
            return;
        }

        deletingContractorRow = row;
        const contractorName = String(row.dataset.name || row.querySelector(".contractor-name")?.textContent || "this contractor").trim();
        if (contractorDeleteMessage) {
            contractorDeleteMessage.textContent = `Are you sure to delete data? ${contractorName}`;
        }

        contractorDeleteToast.hidden = false;
    };

    const confirmContractorDelete = () => {
        if (!deletingContractorRow) {
            closeContractorDeleteToast();
            return;
        }

        const row = deletingContractorRow;
        const deletedContractorName = String(row.dataset.name || row.querySelector(".contractor-name")?.textContent || "Contractor").trim() || "Contractor";
        deletingContractorRow = null;

        if (editingContractorRow === row) {
            closeContractorEditModal();
        }

        const rowIndex = contractorRows.indexOf(row);
        if (rowIndex >= 0) {
            contractorRows.splice(rowIndex, 1);
        }

        row.remove();
        closeContractorFloatCard();
        closeContractorDeleteToast();
        refreshContractorSummary();
        refreshContractorTable();
        persistMaintenanceState();
        showContractorSuccessToast(`Contractor "${deletedContractorName}" deleted.`, "delete");
    };

    contractorDeleteCancelButtons.forEach((button) => {
        button.addEventListener("click", closeContractorDeleteToast);
    });

    if (contractorDeleteConfirmButton) {
        contractorDeleteConfirmButton.addEventListener("click", confirmContractorDelete);
    }

    if (contractorAddOpenButton) {
        contractorAddOpenButton.addEventListener("click", openContractorAddModal);
    }

    closeContractorAddButtons.forEach((button) => {
        button.addEventListener("click", closeContractorAddModal);
    });

    if (contractorAddForm) {
        contractorAddForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const companyNameField = contractorAddForm.querySelector('[name="company_name"]');
            const formData = new FormData(contractorAddForm);
            const companyName = getFormDataText(formData, "company_name");
            if (!companyName) {
                if (companyNameField) {
                    companyNameField.focus();
                }
                return;
            }

            const tradeName = getFormDataText(formData, "trade_name");
            const tin = getFormDataText(formData, "tin");
            const philgeps = getFormDataText(formData, "philgeps");
            const pcabLicense = getFormDataText(formData, "pcab_license");
            const pcabCategory = getFormDataText(formData, "pcab_category").toLowerCase();
            const licenseExpiryInput = getFormDataText(formData, "license_expiry");
            const licenseExpiryLabel = toContractorLicenseExpiryLabel(licenseExpiryInput) || "-";
            const classification = getFormDataText(formData, "pcab_classification");
            const address = getFormDataText(formData, "address");
            const city = getFormDataText(formData, "city");
            const province = getFormDataText(formData, "province");
            const contactPerson = getFormDataText(formData, "contact_person");
            const email = getFormDataText(formData, "email");
            const phone = getFormDataText(formData, "phone");
            const mobile = getFormDataText(formData, "mobile");
            const remarks = getFormDataText(formData, "remarks");
            const contactAddress = [address, city, province].filter(Boolean).join(", ");

            const newRow = createContractorRowElement({
                name: companyName,
                tradeName,
                tin,
                philgeps,
                pcab: pcabCategory,
                status: "active",
                contracts: "0",
                value: "P 0",
                rating: "",
                classification,
                licenseExpiry: licenseExpiryLabel,
                contactPerson,
                contactEmail: email,
                contactPhone: phone || mobile,
                contactAddress,
                pcabLicense,
                address,
                contactCity: city,
                contactProvince: province,
                contactMobile: mobile,
                remarks,
            });

            if (contractorCardList) {
                if (contractorEmptyRow && contractorEmptyRow.parentElement === contractorCardList) {
                    contractorCardList.insertBefore(newRow, contractorEmptyRow);
                } else {
                    contractorCardList.prepend(newRow);
                }
            }
            contractorRows.unshift(newRow);

            refreshContractorSummary();
            refreshContractorTable();
            persistMaintenanceState();
            closeContractorAddModal();
            showContractorSuccessToast(`Contractor "${companyName}" created.`);
        });
    }

    const contractorStatusClassNames = ["is-active", "is-pending", "is-blacklisted", "is-suspended", "is-inactive"];

    const getContractorStatusLabel = (statusValue) => {
        const normalized = normalizeStatus(statusValue);
        if (normalized === "active") return "Active";
        if (normalized === "pending") return "Pending";
        if (normalized === "blacklisted") return "Blacklisted";
        if (normalized === "suspended") return "Suspended";
        if (normalized === "inactive") return "Inactive";
        return toTitleCase(String(statusValue || "Unknown").replaceAll("_", " "));
    };

    const getContractorStatusClassName = (statusValue) => {
        const normalized = normalizeStatus(statusValue);
        if (normalized === "active") return "is-active";
        if (normalized === "pending") return "is-pending";
        if (normalized === "blacklisted") return "is-blacklisted";
        if (normalized === "suspended") return "is-suspended";
        if (normalized === "inactive") return "is-inactive";
        return "";
    };

    const applyContractorStatusBadge = (badgeElement, statusValue) => {
        if (!badgeElement) {
            return;
        }

        const nextLabel = getContractorStatusLabel(statusValue);
        const nextClassName = getContractorStatusClassName(statusValue);

        badgeElement.textContent = nextLabel;
        badgeElement.classList.remove(...contractorStatusClassNames);
        if (nextClassName) {
            badgeElement.classList.add(nextClassName);
        }
    };

    const toContractorInputDate = (value) => {
        const rawValue = String(value || "").trim();
        if (!rawValue) {
            return "";
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
            return rawValue;
        }
        const parsedDate = new Date(rawValue);
        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const toContractorLicenseExpiryLabel = (value) => {
        const rawValue = String(value || "").trim();
        if (!rawValue) {
            return "";
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
            return rawValue;
        }

        const [yearText, monthText, dayText] = rawValue.split("-");
        const year = Number.parseInt(yearText, 10);
        const month = Number.parseInt(monthText, 10);
        const day = Number.parseInt(dayText, 10);
        const parsedDate = new Date(year, month - 1, day);

        if (Number.isNaN(parsedDate.getTime())) {
            return rawValue;
        }

        return parsedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getContractorFormField = (name) => contractorEditForm?.querySelector(`[name="${name}"]`) || null;

    const setContractorFormValue = (name, value) => {
        const field = getContractorFormField(name);
        if (!field) {
            return;
        }
        field.value = String(value || "");
    };

    const getFormDataText = (formData, key) => String(formData.get(key) || "").trim();

    const inferContractorCityProvince = (addressValue) => {
        const segments = String(addressValue || "")
            .split(",")
            .map((segment) => segment.trim())
            .filter(Boolean);

        if (segments.length >= 2) {
            return {
                city: segments[segments.length - 2],
                province: segments[segments.length - 1],
            };
        }
        return {
            city: "",
            province: "",
        };
    };

    const closeContractorEditModal = () => {
        if (!contractorEditModal) {
            return;
        }
        contractorEditModal.hidden = true;
        editingContractorRow = null;
        setBodyScrollLock();
    };

    const openContractorEditModal = (row) => {
        if (!contractorEditModal || !contractorEditForm || !row) {
            return;
        }

        closeContractorDeleteToast();

        editingContractorRow = row;
        contractorEditForm.reset();

        const rawAddress = String(row.dataset.address || row.dataset.contactAddress || "").trim();
        const inferredLocation = inferContractorCityProvince(rawAddress);
        const currentStatus = normalizeStatus(
            row.dataset.status
            || row.querySelector(".contractor-status-badge")?.textContent
            || "active"
        );
        const allowedStatuses = new Set(["active", "pending", "blacklisted", "suspended", "inactive"]);
        const safeStatus = allowedStatuses.has(currentStatus) ? currentStatus : "active";

        setContractorFormValue("company_name", row.dataset.name || row.querySelector(".contractor-name")?.textContent.trim() || "");
        setContractorFormValue("trade_name", row.dataset.tradeName || "");
        setContractorFormValue("tin", row.dataset.tin || "");
        setContractorFormValue("philgeps", row.dataset.philgeps || "");
        setContractorFormValue("pcab_license", row.dataset.pcabLicense || "");
        setContractorFormValue("pcab_category", String(row.dataset.pcab || "").trim().toLowerCase());
        setContractorFormValue("license_expiry", toContractorInputDate(row.dataset.licenseExpiry || ""));
        setContractorFormValue("pcab_classification", row.dataset.classification || "");
        setContractorFormValue("address", row.dataset.address || rawAddress);
        setContractorFormValue("city", row.dataset.contactCity || inferredLocation.city);
        setContractorFormValue("province", row.dataset.contactProvince || inferredLocation.province);
        setContractorFormValue("contact_person", row.dataset.contactPerson || "");
        setContractorFormValue("email", row.dataset.contactEmail || "");
        setContractorFormValue("phone", row.dataset.contactPhone || "");
        setContractorFormValue("mobile", row.dataset.contactMobile || "");
        setContractorFormValue("status", safeStatus);
        setContractorFormValue("remarks", row.dataset.remarks || "");

        contractorEditModal.hidden = false;
        setBodyScrollLock();

        const firstField = getContractorFormField("company_name");
        if (firstField) {
            firstField.focus();
            firstField.select();
        }
    };

    closeContractorEditButtons.forEach((button) => {
        button.addEventListener("click", closeContractorEditModal);
    });

    if (contractorEditForm) {
        contractorEditForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!editingContractorRow) {
                closeContractorEditModal();
                return;
            }

            const formData = new FormData(contractorEditForm);
            const companyName = getFormDataText(formData, "company_name");
            if (!companyName) {
                const nameField = getContractorFormField("company_name");
                if (nameField) {
                    nameField.focus();
                }
                return;
            }

            const tradeName = getFormDataText(formData, "trade_name");
            const tin = getFormDataText(formData, "tin");
            const philgeps = getFormDataText(formData, "philgeps");
            const pcabLicense = getFormDataText(formData, "pcab_license");
            const pcabCategory = getFormDataText(formData, "pcab_category").toLowerCase();
            const licenseExpiryInput = getFormDataText(formData, "license_expiry");
            const licenseExpiryLabel = toContractorLicenseExpiryLabel(licenseExpiryInput);
            const classification = getFormDataText(formData, "pcab_classification");
            const address = getFormDataText(formData, "address");
            const city = getFormDataText(formData, "city");
            const province = getFormDataText(formData, "province");
            const contactPerson = getFormDataText(formData, "contact_person");
            const email = getFormDataText(formData, "email");
            const phone = getFormDataText(formData, "phone");
            const mobile = getFormDataText(formData, "mobile");
            const statusValue = normalizeStatus(getFormDataText(formData, "status") || "active");
            const remarks = getFormDataText(formData, "remarks");
            const contactAddress = [address, city, province].filter(Boolean).join(", ");

            const row = editingContractorRow;
            row.dataset.name = companyName;
            row.dataset.tradeName = tradeName;
            row.dataset.tin = tin;
            row.dataset.philgeps = philgeps;
            row.dataset.pcab = pcabCategory;
            row.dataset.pcabLicense = pcabLicense;
            row.dataset.licenseExpiry = licenseExpiryLabel;
            row.dataset.classification = classification;
            row.dataset.address = address;
            row.dataset.contactCity = city;
            row.dataset.contactProvince = province;
            row.dataset.contactAddress = contactAddress;
            row.dataset.contactPerson = contactPerson;
            row.dataset.contactEmail = email;
            row.dataset.contactPhone = phone;
            row.dataset.contactMobile = mobile;
            row.dataset.status = statusValue;
            row.dataset.remarks = remarks;
            row.dataset.search = [
                companyName,
                tradeName,
                tin,
                philgeps,
                pcabLicense,
                pcabCategory ? `PCAB ${pcabCategory.toUpperCase()}` : "",
                classification,
                address,
                city,
                province,
                contactPerson,
                email,
                phone,
                mobile,
                getContractorStatusLabel(statusValue),
            ].join(" ");

            const rowName = row.querySelector(".contractor-name");
            if (rowName) {
                rowName.textContent = companyName;
            }

            const rowStatusBadge = row.querySelector(".contractor-status-badge");
            applyContractorStatusBadge(rowStatusBadge, statusValue);

            const rowMeta = row.querySelector(".contractor-list-line--muted");
            if (rowMeta) {
                const pcabSummary = pcabCategory ? pcabCategory.toUpperCase() : "-";
                rowMeta.textContent = `TIN: ${tin || "-"} | PhilGEPS: ${philgeps || "-"} | PCAB ${pcabSummary}`;
            }

            refreshContractorSummary();
            refreshContractorTable();
            persistMaintenanceState();
            closeContractorEditModal();
            showContractorSuccessToast("The data has been updated.");
        });
    }

    const parseContractorEvalScore = (value) => {
        const parsedValue = Number.parseFloat(String(value || "").trim());
        if (!Number.isFinite(parsedValue)) {
            return 0;
        }
        return Math.max(0, Math.min(5, parsedValue));
    };

    const formatContractorEvalScore = (value) => parseContractorEvalScore(value).toFixed(1);
    const getContractorEvalToday = () => new Date().toISOString().slice(0, 10);

    const getContractorEvaluationLabel = (overallScore) => {
        if (overallScore >= 4.5) return "Excellent";
        if (overallScore >= 4.0) return "Very Good";
        if (overallScore >= 3.0) return "Good";
        if (overallScore >= 2.0) return "Needs Improvement";
        if (overallScore > 0) return "Poor";
        return "Not Rated";
    };

    const refreshContractorEvaluationSummary = () => {
        if (!contractorEvalRatings.length) {
            return;
        }

        let weightedScore = 0;
        let totalWeight = 0;

        contractorEvalRatings.forEach((ratingRow) => {
            const input = ratingRow.querySelector(".js-contractor-eval-rating-input");
            const score = parseContractorEvalScore(input?.value);
            const weight = Number.parseFloat(String(ratingRow.dataset.weight || "0"));
            if (!Number.isFinite(weight) || weight <= 0) {
                return;
            }
            weightedScore += (score / 5) * weight;
            totalWeight += weight;
        });

        const totalPercent = totalWeight ? (weightedScore / totalWeight) * 100 : 0;
        const overallScore = totalPercent / 20;
        const overallLabel = getContractorEvaluationLabel(overallScore);

        if (contractorEvalTotal) {
            contractorEvalTotal.textContent = `${totalPercent.toFixed(1)}%`;
        }
        if (contractorEvalOverall) {
            contractorEvalOverall.textContent = overallLabel === "Not Rated"
                ? overallLabel
                : `${overallScore.toFixed(1)} / 5 - ${overallLabel}`;
            contractorEvalOverall.classList.toggle("is-neutral", overallLabel === "Not Rated");
        }
    };

    const setContractorEvalRating = (ratingRow, score, shouldRefreshSummary = true) => {
        if (!ratingRow) {
            return;
        }

        const quantizedScore = Math.round(Math.max(0, Math.min(5, score)) * 2) / 2;
        const stars = ratingRow.querySelector(".js-contractor-eval-stars");
        const input = ratingRow.querySelector(".js-contractor-eval-rating-input");
        const valueLabel = ratingRow.querySelector(".js-contractor-eval-rating-value");
        const scoreText = formatContractorEvalScore(quantizedScore);

        if (stars) {
            stars.style.setProperty("--rating-fill", `${(quantizedScore / 5) * 100}%`);
            stars.dataset.score = scoreText;
            stars.setAttribute("aria-valuenow", scoreText);
            stars.setAttribute("aria-valuetext", `${scoreText} stars`);
        }
        if (input) {
            input.value = scoreText;
        }
        if (valueLabel) {
            valueLabel.textContent = `${scoreText} / 5`;
        }

        if (shouldRefreshSummary) {
            refreshContractorEvaluationSummary();
        }
    };

    const getContractorEvalScoreFromPointer = (event, starsElement) => {
        if (!starsElement) {
            return 0;
        }

        const rect = starsElement.getBoundingClientRect();
        if (!rect.width) {
            return 0;
        }

        const pointerX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
        const rawScore = (pointerX / rect.width) * 5;
        return Math.round(rawScore * 2) / 2;
    };

    const closeContractorEvalModal = () => {
        if (!contractorEvalModal) {
            return;
        }
        contractorEvalModal.hidden = true;
        setBodyScrollLock();
    };

    const resetContractorEvaluationForm = (companyName = "") => {
        if (contractorEvalForm) {
            contractorEvalForm.reset();
        }
        if (contractorEvalCompanyInput) {
            contractorEvalCompanyInput.value = companyName;
        }
        if (contractorEvalDateInput) {
            contractorEvalDateInput.value = getContractorEvalToday();
        }

        contractorEvalRatings.forEach((ratingRow) => {
            setContractorEvalRating(ratingRow, 0, false);
        });
        refreshContractorEvaluationSummary();
    };

    const openContractorEvalModal = (row) => {
        if (!contractorEvalModal || !row) {
            return;
        }

        closeContractorDeleteToast();

        const companyName = String(row.dataset.name || "").trim()
            || row.querySelector(".contractor-name")?.textContent.trim()
            || "Contractor";

        resetContractorEvaluationForm(companyName);
        contractorEvalModal.hidden = false;
        setBodyScrollLock();

        const firstInput = contractorEvalForm?.querySelector('input[name="project_name"]');
        if (firstInput) {
            firstInput.focus();
        }
    };

    contractorEvalRatings.forEach((ratingRow) => {
        const stars = ratingRow.querySelector(".js-contractor-eval-stars");
        if (!stars) {
            return;
        }

        stars.addEventListener("click", (event) => {
            const score = getContractorEvalScoreFromPointer(event, stars);
            setContractorEvalRating(ratingRow, score);
        });

        stars.addEventListener("keydown", (event) => {
            const input = ratingRow.querySelector(".js-contractor-eval-rating-input");
            const currentScore = parseContractorEvalScore(input?.value);
            let nextScore = currentScore;

            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                nextScore = currentScore + 0.5;
            } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                nextScore = currentScore - 0.5;
            } else if (event.key === "Home") {
                nextScore = 0;
            } else if (event.key === "End") {
                nextScore = 5;
            } else {
                return;
            }

            event.preventDefault();
            setContractorEvalRating(ratingRow, nextScore);
        });

        setContractorEvalRating(ratingRow, parseContractorEvalScore(stars.dataset.score || "0"), false);
    });

    closeContractorEvalButtons.forEach((button) => {
        button.addEventListener("click", closeContractorEvalModal);
    });

    if (contractorEvalResetButton) {
        contractorEvalResetButton.addEventListener("click", () => {
            const currentCompanyName = String(contractorEvalCompanyInput?.value || "").trim();
            resetContractorEvaluationForm(currentCompanyName);
        });
    }

    if (contractorEvalForm) {
        contractorEvalForm.addEventListener("submit", (event) => {
            event.preventDefault();
            refreshContractorEvaluationSummary();
            closeContractorEvalModal();
            showContractorSuccessToast("Evaluation rating is submitted.");
        });
    }

    const setContractorFloatPanel = (panelKey) => {
        contractorFloatTabs.forEach((tab) => {
            const isActive = tab.dataset.contractorPanel === panelKey;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        contractorFloatPanels.forEach((panel) => {
            const isActive = panel.dataset.contractorPanel === panelKey;
            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });
    };

    const parseCurrencyValue = (value) => {
        const numericValue = Number.parseFloat(String(value || "").replace(/[^\d.]/g, ""));
        return Number.isFinite(numericValue) ? numericValue : 0;
    };

    const formatCurrency = (amount) => `P ${Math.round(amount).toLocaleString("en-US")}`;

    const contractorContractHistory = {
        northshorecivilworks: [
            {
                title: "Provincial Road Drainage Rehabilitation",
                code: "PEO-PR-26-011",
                location: "Quezon, Palawan",
                cost: 15200000,
                fy: "FY 2026",
                progress: "100%",
                status: "Completed",
            },
            {
                title: "Bridge Shoulder Widening Package",
                code: "PEO-BR-25-104",
                location: "Narra, Palawan",
                cost: 9800000,
                fy: "FY 2025",
                progress: "100%",
                status: "Completed",
            },
            {
                title: "Slope Protection and Guardrail Works",
                code: "PEO-SP-26-032",
                location: "Aborlan, Palawan",
                cost: 7200000,
                fy: "FY 2026",
                progress: "42%",
                status: "Ongoing",
            },
        ],
        harborlinebuilders: [
            {
                title: "Coastal Access Road Patching Program",
                code: "PEO-CA-25-077",
                location: "Roxas, Palawan",
                cost: 6400000,
                fy: "FY 2025",
                progress: "100%",
                status: "Completed",
            },
            {
                title: "Asphalt Overlay - Section B",
                code: "PEO-AO-26-003",
                location: "Taytay, Palawan",
                cost: 8300000,
                fy: "FY 2026",
                progress: "68%",
                status: "Ongoing",
            },
        ],
        summitridgeinfra: [
            {
                title: "Roadside Drainage Cleaning",
                code: "PEO-DC-26-018",
                location: "Narra, Palawan",
                cost: 2500000,
                fy: "FY 2026",
                progress: "55%",
                status: "Ongoing",
            },
        ],
        redcliffengineering: [
            {
                title: "Culvert Repair Assistance",
                code: "PEO-CR-24-009",
                location: "Bataraza, Palawan",
                cost: 1950000,
                fy: "FY 2024",
                progress: "100%",
                status: "Completed",
            },
        ],
    };

    const openContractorFloatCard = (row) => {
        if (!contractorFloatCard || !row) {
            return;
        }

        closeContractorDeleteToast();

        const detailLines = Array.from(row.querySelectorAll(".contractor-meta, .contractor-list-line--muted"))
            .map((item) => item.textContent.trim())
            .filter(Boolean);

        const name = String(row.dataset.name || "").trim()
            || row.querySelector(".contractor-name")?.textContent.trim()
            || "Contractor";
        const tin = String(row.dataset.tin || "").trim()
            || detailLines.find((value) => normalizeKey(value).includes("tin"))
            || "-";
        const philgepsRaw = String(row.dataset.philgeps || "").trim();
        const philgeps = philgepsRaw
            ? `PhilGEPS: ${philgepsRaw}`
            : (detailLines.find((value) => normalizeKey(value).includes("philgeps")) || "-");
        const pcabRaw = String(row.dataset.pcab || "").trim();
        const pcab = pcabRaw
            ? `PCAB ${pcabRaw.toUpperCase()}`
            : (detailLines.find((value) => normalizeKey(value).includes("pcab")) || "-");
        const status = row.querySelector(".contractor-status-badge")?.textContent.trim()
            || toTitleCase(row.dataset.status || "Unknown");
        const contracts = String(row.dataset.contracts || "").trim() || "0";
        const value = String(row.dataset.value || "").trim() || "P 0";
        const classification = String(row.dataset.classification || "").trim() || "-";
        const licenseExpiry = String(row.dataset.licenseExpiry || "").trim() || "-";
        const contactPerson = String(row.dataset.contactPerson || "").trim() || "-";
        const contactEmail = String(row.dataset.contactEmail || "").trim() || "-";
        const contactPhone = String(row.dataset.contactPhone || "").trim() || "-";
        const contactAddress = String(row.dataset.contactAddress || "").trim() || "-";
        const contractorKey = normalizeKey(name);
        const contractHistory = contractorContractHistory[contractorKey] || [];
        const totalContracts = Number.parseInt(contracts, 10) || contractHistory.length || 0;
        const computedCompleted = contractHistory.filter((item) => normalizeStatus(item.status) === "completed").length;
        const computedOngoing = contractHistory.filter((item) => normalizeStatus(item.status) === "ongoing").length;
        const completedContracts = contractHistory.length ? computedCompleted : 0;
        const ongoingContracts = contractHistory.length ? computedOngoing : Math.max(0, totalContracts - completedContracts);
        const totalCostValue = contractHistory.reduce((sum, item) => sum + parseCurrencyValue(item.cost), 0);

        if (contractorFloatName) contractorFloatName.textContent = name;
        if (contractorFloatStatus) contractorFloatStatus.textContent = status;
        if (contractorFloatStatusPill) {
            applyContractorStatusBadge(contractorFloatStatusPill, status);
        }
        if (contractorFloatTin) contractorFloatTin.textContent = tin;
        if (contractorFloatPhilgeps) contractorFloatPhilgeps.textContent = philgeps;
        if (contractorFloatPcab) contractorFloatPcab.textContent = pcab;
        if (contractorFloatClassification) contractorFloatClassification.textContent = classification;
        if (contractorFloatLicenseExpiry) contractorFloatLicenseExpiry.textContent = licenseExpiry;
        if (contractorFloatContactPerson) contractorFloatContactPerson.textContent = contactPerson;
        if (contractorFloatContactEmail) contractorFloatContactEmail.textContent = contactEmail;
        if (contractorFloatContactPhone) contractorFloatContactPhone.textContent = contactPhone;
        if (contractorFloatContactAddress) contractorFloatContactAddress.textContent = contactAddress;

        if (contractorFloatContracts) contractorFloatContracts.textContent = String(totalContracts);
        if (contractorFloatCompletedContracts) contractorFloatCompletedContracts.textContent = String(completedContracts);
        if (contractorFloatOngoingContracts) contractorFloatOngoingContracts.textContent = String(ongoingContracts);
        if (contractorFloatTotalValue) contractorFloatTotalValue.textContent = totalCostValue ? formatCurrency(totalCostValue) : value;
        if (contractorFloatTotalCost) contractorFloatTotalCost.textContent = totalCostValue ? formatCurrency(totalCostValue) : value;
        if (contractorFloatContractCount) contractorFloatContractCount.textContent = String(totalContracts);

        if (contractorFloatContractList) {
            if (!contractHistory.length) {
                contractorFloatContractList.innerHTML = `<div class="contractor-float-contract-card"><p class="contractor-float-contract-meta">No contract history available.</p></div>`;
            } else {
                contractorFloatContractList.innerHTML = contractHistory
                    .map((contract) => `
                        <article class="contractor-float-contract-card">
                            <div class="contractor-float-contract-top">
                                <p class="contractor-float-contract-title">${escapeHtml(contract.title || "-")}</p>
                                <span class="contractor-float-contract-status">${escapeHtml(contract.status || "-")}</span>
                            </div>
                            <p class="contractor-float-contract-meta">${escapeHtml(contract.code || "-")}</p>
                            <p class="contractor-float-contract-meta">${escapeHtml(contract.location || "-")}</p>
                            <div class="contractor-float-contract-tags">
                                <span>Cost: <strong>${escapeHtml(formatCurrency(parseCurrencyValue(contract.cost)))}</strong></span>
                                <span>${escapeHtml(contract.fy || "-")}</span>
                                <span>Progress: ${escapeHtml(contract.progress || "-")}</span>
                            </div>
                        </article>
                    `)
                    .join("");
            }
        }

        setContractorFloatPanel("info");

        contractorFloatCard.hidden = false;
        setBodyScrollLock();
    };

    closeContractorFloatButtons.forEach((button) => {
        button.addEventListener("click", closeContractorFloatCard);
    });

    contractorFloatTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const panelKey = String(tab.dataset.contractorPanel || "info");
            setContractorFloatPanel(panelKey);
        });
    });

    if (contractorManagement) {
        refreshContractorSummary();
        refreshContractorTable();

        if (contractorSearchInput) {
            contractorSearchInput.addEventListener("input", refreshContractorTable);
        }
        if (contractorStatusFilter) {
            if (typeof contractorStatusFilter.value !== "undefined") {
                contractorStatusFilter.addEventListener("change", refreshContractorTable);
            }
            updateContractorDropdownFilterState(contractorStatusFilter);
        }
        if (contractorPcabFilter) {
            if (typeof contractorPcabFilter.value !== "undefined") {
                contractorPcabFilter.addEventListener("change", refreshContractorTable);
            }
            updateContractorDropdownFilterState(contractorPcabFilter);
        }

        contractorManagement.addEventListener("click", (event) => {
            const evaluationOpener = event.target.closest(".js-contractor-open-eval");
            if (evaluationOpener) {
                const row = evaluationOpener.closest(".js-contractor-row");
                if (!row) {
                    return;
                }
                openContractorEvalModal(row);
                return;
            }

            const editOpener = event.target.closest(".js-contractor-open-edit");
            if (editOpener) {
                const row = editOpener.closest(".js-contractor-row");
                if (!row) {
                    return;
                }
                openContractorEditModal(row);
                return;
            }

            const deleteOpener = event.target.closest(".js-contractor-delete");
            if (deleteOpener) {
                const row = deleteOpener.closest(".js-contractor-row");
                if (!row) {
                    return;
                }
                openContractorDeleteToast(row);
                return;
            }

            const opener = event.target.closest(".js-contractor-open-card");
            if (!opener) {
                return;
            }
            const row = opener.closest(".js-contractor-row");
            if (!row) {
                return;
            }
            openContractorFloatCard(row);
        });
    }

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
        editingEquipmentRow = null;
        if (equipmentForm) {
            equipmentForm.reset();
        }
        if (equipmentModalTitle) {
            equipmentModalTitle.textContent = "Add Equipment";
        }
        if (equipmentSubmitButton) {
            equipmentSubmitButton.textContent = "Add Equipment";
        }
        setBodyScrollLock();
    };

    const openEquipmentModal = (rowToEdit = null) => {
        if (!equipmentModal) {
            return;
        }
        editingEquipmentRow = rowToEdit instanceof HTMLTableRowElement ? rowToEdit : null;

        if (equipmentModalTitle) {
            equipmentModalTitle.textContent = editingEquipmentRow ? "Edit Equipment" : "Add Equipment";
        }
        if (equipmentSubmitButton) {
            equipmentSubmitButton.textContent = editingEquipmentRow ? "Save Changes" : "Add Equipment";
        }
        if (equipmentForm) {
            equipmentForm.reset();
        }

        if (editingEquipmentRow && equipmentForm) {
            const [codeCell, nameCell, typeCell, modelCell, plateCell, statusCell, locationCell, operatorCell] = editingEquipmentRow.cells;
            const setField = (fieldName, value) => {
                const field = equipmentForm.elements.namedItem(fieldName);
                if (field) {
                    field.value = String(value || "").trim();
                }
            };
            setField("code", codeCell?.textContent);
            setField("name", nameCell?.textContent);
            setField("type", typeCell?.textContent);
            setField("model", modelCell?.textContent);
            setField("plate_number", plateCell?.textContent);
            setField("status", statusCell?.textContent);
            setField("location", locationCell?.textContent);
            setField("operator", operatorCell?.textContent);
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

    const resetTaskPersonnelDivision = () => {
        if (!taskPersonnelModal) {
            return;
        }
        const divisionDropdown = taskPersonnelModal.querySelector(".task-personnel-dropdown");
        const label = divisionDropdown?.querySelector(".dropdown-label");
        const hiddenInput = taskPersonnelForm?.elements?.namedItem("division");
        divisionDropdown?.querySelectorAll(".dropdown-option").forEach((option) => {
            option.classList.remove("is-selected");
        });
        if (label) {
            label.textContent = "Select division";
        }
        if (hiddenInput instanceof HTMLInputElement) {
            hiddenInput.value = "";
        }
    };

    const closeTaskPersonnelModal = () => {
        if (!taskPersonnelModal) {
            return;
        }
        taskPersonnelModal.hidden = true;
        if (taskPersonnelForm) {
            taskPersonnelForm.reset();
        }
        resetTaskPersonnelDivision();
        setBodyScrollLock();
    };

    const openTaskPersonnelModal = () => {
        if (!taskPersonnelModal) {
            return;
        }
        if (taskPersonnelForm) {
            taskPersonnelForm.reset();
        }
        resetTaskPersonnelDivision();
        taskPersonnelModal.hidden = false;
        setBodyScrollLock();
        const firstInput = taskPersonnelModal.querySelector("input[name='full_name']");
        if (firstInput instanceof HTMLInputElement) {
            firstInput.focus();
        }
    };

    const resetTaskModal = () => {
        if (!taskForm) {
            return;
        }

        taskForm.reset();
        resetTaskFormDropdown(".task-personnel-dropdown[data-input-target='division']", "Select division", "division");
        resetTaskFormDropdown(".task-personnel-dropdown[data-input-target='priority']", "Select priority", "priority");

        const statusDropdown = taskForm.querySelector(".task-personnel-dropdown[data-input-target='status']");
        const statusLabel = statusDropdown?.querySelector(".dropdown-label");
        const statusInput = taskForm.elements.namedItem("status");
        statusDropdown?.querySelectorAll(".dropdown-option").forEach((option) => {
            option.classList.toggle("is-selected", String(option.dataset.value || "") === "Pending");
        });
        if (statusLabel) {
            statusLabel.textContent = "Pending";
        }
        if (statusInput instanceof HTMLInputElement) {
            statusInput.value = "Pending";
        }

        syncTaskPersonnelDropdownOptions();
    };

    const closeTaskModal = () => {
        if (!taskModal) {
            return;
        }
        taskModal.hidden = true;
        resetTaskModal();
        setBodyScrollLock();
    };

    const openTaskModal = () => {
        if (!taskModal) {
            return;
        }
        resetTaskModal();
        taskModal.hidden = false;
        setBodyScrollLock();
        const firstInput = taskModal.querySelector("input[name='title']");
        if (firstInput instanceof HTMLInputElement) {
            firstInput.focus();
        }
    };

    openTaskPersonnelButtons.forEach((button) => {
        button.addEventListener("click", openTaskPersonnelModal);
    });

    closeTaskPersonnelButtons.forEach((button) => {
        button.addEventListener("click", closeTaskPersonnelModal);
    });

    openTaskModalButtons.forEach((button) => {
        button.addEventListener("click", openTaskModal);
    });

    closeTaskModalButtons.forEach((button) => {
        button.addEventListener("click", closeTaskModal);
    });

    if (taskPersonnelForm) {
        taskPersonnelForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(taskPersonnelForm);
            const fullName = (formData.get("full_name") || "").toString().trim();
            const division = (formData.get("division") || "").toString().trim();

            if (!fullName || !division) {
                showRoadUploadStatusToast("Please complete Full Name and Division before saving personnel.", "warning");
                return;
            }

            personnelRecords.unshift({
                fullName,
                employeeId: (formData.get("employee_id") || "").toString().trim(),
                division,
                position: (formData.get("position") || "").toString().trim(),
                email: (formData.get("email") || "").toString().trim(),
                phone: (formData.get("phone") || "").toString().trim(),
                divisionHead: Boolean(formData.get("division_head")),
            });

            personnelRecords = personnelRecords.filter((record, index, records) => {
                return records.findIndex((candidate) => candidate.fullName === record.fullName) === index;
            });

            syncTaskPersonnelDropdownOptions();
            persistMaintenanceState();
            closeTaskPersonnelModal();
            showRoadUploadStatusToast("Personnel added successfully.", "success");
        });
    }

    if (taskForm && taskTableBody) {
        taskForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(taskForm);
            const title = (formData.get("title") || "").toString().trim();
            const division = (formData.get("division") || "").toString().trim();
            const dueDateIso = (formData.get("due_date") || "").toString().trim();
            const priority = (formData.get("priority") || "").toString().trim();
            const status = (formData.get("status") || "").toString().trim() || "Pending";
            const assignedTo = (formData.get("assigned_to") || "").toString().trim();
            const notes = (formData.get("notes") || "").toString().trim();

            if (!title || !division || !dueDateIso || !priority) {
                showRoadUploadStatusToast("Please complete Task Name, Division, Due Date, and Priority.", "warning");
                return;
            }

            const emptyRow = taskTableBody.querySelector(".js-task-empty-row");
            if (emptyRow) {
                emptyRow.remove();
            }

            taskTableBody.prepend(createTaskRowElement({
                title,
                division,
                assignedTo,
                dueDateIso,
                dueDateDisplay: formatTaskDateValue(dueDateIso),
                priority,
                status,
                notes,
            }));

            updateTaskSummary();
            applyTaskFilters();
            persistMaintenanceState();
            closeTaskModal();
            showRoadUploadStatusToast("Task created successfully.", "success");
        });
    }

    const closeScheduleModal = () => {
        if (!scheduleModal) {
            return;
        }
        scheduleModal.hidden = true;
        editingScheduleRow = null;
        if (scheduleForm) {
            scheduleForm.reset();
        }
        if (scheduleModalTitle) {
            scheduleModalTitle.textContent = "New Maintenance Schedule";
        }
        if (scheduleSubmitButton) {
            scheduleSubmitButton.textContent = "Create Schedule";
        }
        setBodyScrollLock();
    };

    const openScheduleModal = (rowToEdit = null) => {
        if (!scheduleModal) {
            return;
        }
        editingScheduleRow = rowToEdit instanceof HTMLTableRowElement ? rowToEdit : null;

        if (scheduleModalTitle) {
            scheduleModalTitle.textContent = editingScheduleRow ? "Edit Maintenance Schedule" : "New Maintenance Schedule";
        }
        if (scheduleSubmitButton) {
            scheduleSubmitButton.textContent = editingScheduleRow ? "Save Changes" : "Create Schedule";
        }
        if (scheduleForm) {
            scheduleForm.reset();
        }

        if (editingScheduleRow && scheduleForm) {
            const [titleCell, roadCell, typeCell, priorityCell, , startDateCell, teamCell] = editingScheduleRow.cells;
            const setField = (fieldName, value) => {
                const field = scheduleForm.elements.namedItem(fieldName);
                if (field) {
                    field.value = String(value || "").trim();
                }
            };
            setField("title", titleCell?.textContent);
            setField("road", roadCell?.textContent);
            setField("type", typeCell?.textContent);
            setField("priority", priorityCell?.textContent);
            setField("team", teamCell?.textContent);
            setField("start_date", parseDisplayDateValue(startDateCell?.textContent));
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
        equipmentForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const isEditingEquipment = Boolean(editingEquipmentRow);

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

            const equipmentPayload = {
                code: code || "-",
                name,
                type: type || "-",
                model: model || "-",
                plateNumber: plateNumber || "-",
                status: status || "-",
                location: location || "-",
                operator: operator || "-",
            };

            if (editingEquipmentRow) {
                const currentRowLabel = `${editingEquipmentRow.cells[0]?.textContent || "-"}-${editingEquipmentRow.cells[1]?.textContent || "-"}`;
                const shouldSave = await showRoadDeleteConfirmToast(currentRowLabel, {
                    title: "Edit Equipment",
                    copy: "Are you sure to save this equipment update?",
                    confirmLabel: "Yes, Save",
                    cancelLabel: "Cancel",
                    variant: "info",
                });
                if (!shouldSave) {
                    return;
                }

                editingEquipmentRow.cells[0].textContent = equipmentPayload.code;
                editingEquipmentRow.cells[1].textContent = equipmentPayload.name;
                editingEquipmentRow.cells[2].textContent = equipmentPayload.type;
                editingEquipmentRow.cells[3].textContent = equipmentPayload.model;
                editingEquipmentRow.cells[4].textContent = equipmentPayload.plateNumber;
                editingEquipmentRow.cells[5].textContent = equipmentPayload.status;
                editingEquipmentRow.cells[6].textContent = equipmentPayload.location;
                editingEquipmentRow.cells[7].textContent = equipmentPayload.operator;
            } else {
                const emptyRow = equipmentTableBody.querySelector(".equipment-empty-row");
                if (emptyRow) {
                    emptyRow.remove();
                }
                const newRow = createEquipmentRowElement(equipmentPayload);
                equipmentTableBody.prepend(newRow);
            }

            updateEquipmentSummary();
            persistMaintenanceState();
            closeEquipmentModal();
            showRoadUploadStatusToast(isEditingEquipment ? "Equipment updated successfully." : "Equipment added successfully.", "success");
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

    const parseDisplayDateValue = (value) => {
        const raw = String(value || "").trim();
        if (!raw || raw === "-") {
            return "";
        }

        const matched = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (matched) {
            return `${matched[3]}-${matched[2]}-${matched[1]}`;
        }
        return "";
    };

    const formatTaskDateValue = (value) => {
        const rawValue = String(value || "").trim();
        if (!rawValue) {
            return "-";
        }

        const parsedDate = new Date(`${rawValue}T00:00:00`);
        if (Number.isNaN(parsedDate.getTime())) {
            return rawValue;
        }

        return parsedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const getTaskInitials = (value) => {
        const words = String(value || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2);

        if (!words.length) {
            return "NA";
        }

        return words.map((word) => word.charAt(0).toUpperCase()).join("");
    };

    const getTaskRows = () => {
        if (!taskTableBody) {
            return [];
        }
        return Array.from(taskTableBody.querySelectorAll("tr")).filter((row) => !row.classList.contains("js-task-empty-row"));
    };

    const restoreTaskEmptyRow = () => {
        if (!taskTableBody) {
            return;
        }
        taskTableBody.innerHTML = `
            <tr class="task-empty-row js-task-empty-row">
                <td colspan="6">
                    <div class="task-empty-state">
                        <svg viewBox="0 0 64 64" aria-hidden="true">
                            <rect x="18" y="14" width="12" height="12" rx="2"></rect>
                            <rect x="18" y="38" width="12" height="12" rx="2"></rect>
                            <path d="m21 44 4 4 7-9"></path>
                            <path d="M38 20h12"></path>
                            <path d="M38 32h12"></path>
                            <path d="M38 44h12"></path>
                        </svg>
                        <div class="task-empty-copy">
                            <strong>No tasks yet</strong>
                            <p>New tasks will appear here once you start assigning work.</p>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    };

    const getTaskFilterValue = (filterKey) => {
        const filterDropdown = document.querySelector(`.task-filter-panel [data-task-filter="${filterKey}"]`);
        const selectedOption = filterDropdown?.querySelector(".dropdown-option.is-selected");
        return String(selectedOption?.dataset.value || "all").trim().toLowerCase();
    };

    const buildTaskPriorityPill = (value) => {
        const label = String(value || "Medium").trim() || "Medium";
        const normalized = normalizeStatus(label);
        return `<span class="task-table-pill task-table-pill--priority task-table-pill--${escapeHtml(normalized)}">${escapeHtml(label)}</span>`;
    };

    const buildTaskStatusPill = (value) => {
        const label = String(value || "Pending").trim() || "Pending";
        const normalized = normalizeStatus(label);
        return `<span class="task-table-pill task-table-pill--status task-table-pill--${escapeHtml(normalized)}">${escapeHtml(label)}</span>`;
    };

    const buildTaskAssignedMarkup = (value) => {
        const label = String(value || "").trim();
        if (!label) {
            return `
                <div class="task-assignee task-assignee--empty">
                    <span class="task-avatar task-avatar--empty">NA</span>
                    <span class="task-assignee-name">Unassigned</span>
                </div>
            `;
        }

        return `
            <div class="task-assignee">
                <span class="task-avatar">${escapeHtml(getTaskInitials(label))}</span>
                <span class="task-assignee-name">${escapeHtml(label)}</span>
            </div>
        `;
    };

    const isTaskOverdue = (record) => {
        const statusValue = normalizeStatus(record?.status || "");
        if (statusValue === "completed" || statusValue === "cancelled") {
            return false;
        }

        const dueDateValue = String(record?.dueDateIso || "").trim();
        if (!dueDateValue) {
            return false;
        }

        const dueDate = new Date(`${dueDateValue}T23:59:59`);
        if (Number.isNaN(dueDate.getTime())) {
            return false;
        }

        return dueDate.getTime() < Date.now();
    };

    function createTaskRowElement(record) {
        const row = document.createElement("tr");
        const normalizedPriority = normalizeStatus(record.priority || "medium");
        const normalizedStatus = normalizeStatus(record.status || "pending");
        const overdue = isTaskOverdue(record);

        row.dataset.search = [
            record.title,
            record.division,
            record.assignedTo,
            record.priority,
            record.status,
            record.notes,
        ].filter(Boolean).join(" ").toLowerCase();
        row.dataset.division = normalizeKey(record.division || "");
        row.dataset.divisionLabel = String(record.division || "").trim();
        row.dataset.priority = normalizedPriority;
        row.dataset.status = normalizedStatus;
        row.dataset.dueDateIso = String(record.dueDateIso || "").trim();
        row.dataset.overdue = overdue ? "true" : "false";
        row.dataset.title = String(record.title || "").trim();
        row.dataset.assignedTo = String(record.assignedTo || "").trim();
        row.dataset.notes = String(record.notes || "").trim();

        row.innerHTML = `
            <td>
                <div class="task-title-cell">
                    <span class="task-row-dot${overdue ? " task-row-dot--alert" : ""}" aria-hidden="true"></span>
                    <div class="task-title-copy">
                        <strong>${escapeHtml(record.title || "-")}</strong>
                        <span>Div: ${escapeHtml(record.division || "-")}</span>
                    </div>
                </div>
            </td>
            <td>${buildTaskAssignedMarkup(record.assignedTo)}</td>
            <td>
                <span class="task-due-date${overdue ? " task-due-date--overdue" : ""}">${escapeHtml(record.dueDateDisplay || "-")}</span>
            </td>
            <td>${buildTaskPriorityPill(record.priority)}</td>
            <td>${buildTaskStatusPill(record.status)}</td>
            <td>
                <button type="button" class="task-row-action" aria-label="Task actions" title="Task actions">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </td>
        `;

        return row;
    }

    function serializeTaskRows() {
        return getTaskRows().map((row) => ({
            title: String(row.dataset.title || "").trim(),
            division: String(row.dataset.divisionLabel || "").trim(),
            assignedTo: String(row.dataset.assignedTo || "").trim(),
            dueDateIso: String(row.dataset.dueDateIso || "").trim(),
            dueDateDisplay: (row.querySelector(".task-due-date")?.textContent || "").trim(),
            priority: (row.querySelector(".task-table-pill--priority")?.textContent || "").trim(),
            status: (row.querySelector(".task-table-pill--status")?.textContent || "").trim(),
            notes: String(row.dataset.notes || "").trim(),
        }));
    }

    const syncTaskPersonnelDropdownOptions = (preferredValue = "") => {
        if (!taskAssignedList) {
            return;
        }

        const names = [...new Set(
            personnelRecords
                .map((record) => String(record?.fullName || "").trim())
                .filter(Boolean)
        )].sort((nameA, nameB) => nameA.localeCompare(nameB));

        taskAssignedList.innerHTML = names
            .map((name) => `<option value="${escapeHtml(name)}"></option>`)
            .join("");

        if (taskAssignedInput instanceof HTMLInputElement && preferredValue) {
            taskAssignedInput.value = preferredValue;
        }
    };

    const resetTaskFormDropdown = (selector, labelText, hiddenFieldName = "") => {
        if (!taskForm) {
            return;
        }

        const dropdown = taskForm.querySelector(selector);
        const label = dropdown?.querySelector(".dropdown-label");
        dropdown?.querySelectorAll(".dropdown-option").forEach((option) => {
            option.classList.remove("is-selected");
        });

        if (label) {
            label.textContent = labelText;
        }

        if (hiddenFieldName) {
            const field = taskForm.elements.namedItem(hiddenFieldName);
            if (field instanceof HTMLInputElement) {
                field.value = "";
            }
        }
    };

    const updateTaskSummary = () => {
        const rows = getTaskRows();
        const totalCount = rows.length;
        const visibleRows = rows.filter((row) => !row.hidden);
        const pendingCount = rows.filter((row) => row.dataset.status === "pending").length;
        const progressCount = rows.filter((row) => row.dataset.status === "in_progress").length;
        const completedCount = rows.filter((row) => row.dataset.status === "completed").length;
        const overdueCount = rows.filter((row) => row.dataset.overdue === "true").length;

        if (taskStatTotal) {
            taskStatTotal.textContent = String(totalCount);
        }
        if (taskStatPending) {
            taskStatPending.textContent = String(pendingCount);
        }
        if (taskStatProgress) {
            taskStatProgress.textContent = String(progressCount);
        }
        if (taskStatCompleted) {
            taskStatCompleted.textContent = String(completedCount);
        }
        if (taskStatOverdue) {
            taskStatOverdue.textContent = String(overdueCount);
        }
        if (taskTableTotal) {
            taskTableTotal.textContent = `${totalCount} Total`;
        }
        if (taskResultsSummary) {
            const visibleCount = visibleRows.length;
            const startCount = visibleCount ? 1 : 0;
            taskResultsSummary.textContent = totalCount
                ? `Showing ${startCount} to ${visibleCount} of ${totalCount} tasks`
                : "Showing 0 to 0 of 0 tasks";
        }
    };

    const applyTaskFilters = () => {
        if (!taskTableBody) {
            return;
        }

        const searchValue = String(taskSearchInput?.value || "").trim().toLowerCase();
        const divisionValue = getTaskFilterValue("division");
        const statusValue = getTaskFilterValue("status");
        const priorityValue = getTaskFilterValue("priority");
        const rows = getTaskRows();

        rows.forEach((row) => {
            const matchesSearch = !searchValue || String(row.dataset.search || "").includes(searchValue);
            const matchesDivision = divisionValue === "all" || String(row.dataset.division || "") === normalizeKey(divisionValue);
            const matchesStatus = statusValue === "all" || String(row.dataset.status || "") === statusValue;
            const matchesPriority = priorityValue === "all" || String(row.dataset.priority || "") === priorityValue;
            row.hidden = !(matchesSearch && matchesDivision && matchesStatus && matchesPriority);
        });

        updateTaskSummary();
    };

    const buildTableActionButtonsHtml = (recordType) => {
        return `
            <td class="table-action-cell">
                <button type="button" class="table-icon-btn table-icon-btn--edit js-table-action-edit" data-record-type="${recordType}" aria-label="Edit row" title="Edit">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m3 17.25 9.06-9.06 3.75 3.75L6.75 21H3v-3.75zm13.71-10.04a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.09 1.09 3.75 3.75 1.25-1.93z"></path>
                    </svg>
                </button>
                <button type="button" class="table-icon-btn table-icon-btn--delete js-table-action-delete" data-record-type="${recordType}" aria-label="Delete row" title="Delete">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM7 10h2v8H7v-8z"></path>
                    </svg>
                </button>
            </td>
        `;
    };

    function createEquipmentRowElement(record) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(record.code || "-")}</td>
            <td>${escapeHtml(record.name || "-")}</td>
            <td>${escapeHtml(record.type || "-")}</td>
            <td>${escapeHtml(record.model || "-")}</td>
            <td>${escapeHtml(record.plateNumber || "-")}</td>
            <td>${escapeHtml(record.status || "-")}</td>
            <td>${escapeHtml(record.location || "-")}</td>
            <td>${escapeHtml(record.operator || "-")}</td>
            ${buildTableActionButtonsHtml("equipment")}
        `;
        return row;
    }

    function createScheduleRowElement(record) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(record.title || "-")}</td>
            <td>${escapeHtml(record.road || "-")}</td>
            <td>${escapeHtml(record.type || "-")}</td>
            <td>${escapeHtml(record.priority || "-")}</td>
            <td>${escapeHtml(record.status || "Scheduled")}</td>
            <td>${escapeHtml(record.startDate || "-")}</td>
            <td>${escapeHtml(record.team || "-")}</td>
            ${buildTableActionButtonsHtml("schedule")}
        `;
        return row;
    }

    function restoreScheduleEmptyRow() {
        if (!scheduleTableBody) {
            return;
        }
        scheduleTableBody.innerHTML = `
            <tr class="schedule-empty-row">
                <td colspan="8">No maintenance schedules available yet.</td>
            </tr>
        `;
    }

    function serializeEquipmentRows() {
        return getEquipmentRows().map((row) => ({
            code: (row.cells[0]?.textContent || "").trim(),
            name: (row.cells[1]?.textContent || "").trim(),
            type: (row.cells[2]?.textContent || "").trim(),
            model: (row.cells[3]?.textContent || "").trim(),
            plateNumber: (row.cells[4]?.textContent || "").trim(),
            status: (row.cells[5]?.textContent || "").trim(),
            location: (row.cells[6]?.textContent || "").trim(),
            operator: (row.cells[7]?.textContent || "").trim(),
        }));
    }

    function serializeScheduleRows() {
        return getScheduleRows().map((row) => ({
            title: (row.cells[0]?.textContent || "").trim(),
            road: (row.cells[1]?.textContent || "").trim(),
            type: (row.cells[2]?.textContent || "").trim(),
            priority: (row.cells[3]?.textContent || "").trim(),
            status: (row.cells[4]?.textContent || "").trim(),
            startDate: (row.cells[5]?.textContent || "").trim(),
            team: (row.cells[6]?.textContent || "").trim(),
        }));
    }

    function persistMaintenanceState() {
        const hasMaintenanceTargets = Boolean(roadMunicipalityList || equipmentTableBody || scheduleTableBody || taskTableBody);
        if (!hasMaintenanceTargets) {
            return;
        }

        const payload = {
            version: 1,
            roadRecords,
            equipmentRows: serializeEquipmentRows(),
            scheduleRows: serializeScheduleRows(),
            taskRows: serializeTaskRows(),
            personnelRecords,
        };

        try {
            window.localStorage.setItem(maintenanceStorageKey, JSON.stringify(payload));
        } catch (error) {
            // Ignore storage errors (quota/private mode).
        }
    }

    function restoreMaintenanceState() {
        const hasMaintenanceTargets = Boolean(roadMunicipalityList || equipmentTableBody || scheduleTableBody || taskTableBody);
        if (!hasMaintenanceTargets) {
            return;
        }

        let savedState = null;
        try {
            savedState = JSON.parse(window.localStorage.getItem(maintenanceStorageKey) || "null");
        } catch (error) {
            savedState = null;
        }

        if (!savedState || typeof savedState !== "object") {
            return;
        }

        if (Array.isArray(savedState.roadRecords) && savedState.roadRecords.length) {
            const restoredRoads = savedState.roadRecords
                .map((rawRecord) => {
                    if (!rawRecord || typeof rawRecord !== "object") {
                        return null;
                    }

                    const normalized = rawRecord.__roadNormalized
                        ? rawRecord
                        : normalizeRoadRecord(rawRecord);

                    if (!normalized) {
                        return null;
                    }

                    return {
                        roadId: String(normalized.roadId || "-"),
                        roadName: String(normalized.roadName || "-"),
                        municipality: normalizeMunicipalityDisplayName(normalized.municipality, "Unknown"),
                        location: String(normalized.location || ""),
                        surfaceType: String(normalized.surfaceType || "-"),
                        lengthKm: parseNumber(normalized.lengthKm),
                        condition: String(normalized.condition || "unknown"),
                        __roadNormalized: true,
                    };
                })
                .filter(Boolean);

            if (restoredRoads.length) {
                roadRecords.push(...dedupeRoadRecords(restoredRoads));
            }
        }

        if (equipmentTableBody && Array.isArray(savedState.equipmentRows)) {
            equipmentTableBody.innerHTML = "";
            savedState.equipmentRows.forEach((record) => {
                if (!record || typeof record !== "object") {
                    return;
                }

                const hasValues = [
                    record.code,
                    record.name,
                    record.type,
                    record.model,
                    record.plateNumber,
                    record.status,
                    record.location,
                    record.operator,
                ].some((value) => String(value || "").trim());

                if (!hasValues) {
                    return;
                }

                equipmentTableBody.append(createEquipmentRowElement(record));
            });
        }

        if (scheduleTableBody && Array.isArray(savedState.scheduleRows)) {
            scheduleTableBody.innerHTML = "";
            savedState.scheduleRows.forEach((record) => {
                if (!record || typeof record !== "object") {
                    return;
                }
                if (!String(record.title || "").trim()) {
                    return;
                }
                scheduleTableBody.append(createScheduleRowElement(record));
            });

            if (!scheduleTableBody.children.length) {
                restoreScheduleEmptyRow();
            }
        }

        if (Array.isArray(savedState.personnelRecords)) {
            personnelRecords = savedState.personnelRecords
                .filter((record) => record && typeof record === "object")
                .map((record) => ({
                    fullName: String(record.fullName || "").trim(),
                    employeeId: String(record.employeeId || "").trim(),
                    division: String(record.division || "").trim(),
                    position: String(record.position || "").trim(),
                    email: String(record.email || "").trim(),
                    phone: String(record.phone || "").trim(),
                    divisionHead: Boolean(record.divisionHead),
                }))
                .filter((record) => record.fullName);
        }

        if (taskTableBody && Array.isArray(savedState.taskRows)) {
            taskTableBody.innerHTML = "";
            savedState.taskRows.forEach((record) => {
                if (!record || typeof record !== "object") {
                    return;
                }
                if (!String(record.title || "").trim()) {
                    return;
                }
                taskTableBody.append(createTaskRowElement({
                    title: String(record.title || "").trim(),
                    division: String(record.division || "").trim() || "-",
                    assignedTo: String(record.assignedTo || "").trim(),
                    dueDateIso: String(record.dueDateIso || "").trim(),
                    dueDateDisplay: String(record.dueDateDisplay || "").trim() || formatTaskDateValue(record.dueDateIso),
                    priority: String(record.priority || "").trim() || "Medium",
                    status: String(record.status || "").trim() || "Pending",
                    notes: String(record.notes || "").trim(),
                }));
            });

            if (!taskTableBody.children.length) {
                restoreTaskEmptyRow();
            }
        }

        syncTaskPersonnelDropdownOptions();
    }

    if (scheduleForm && scheduleTableBody) {
        scheduleForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const isEditingSchedule = Boolean(editingScheduleRow);

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

            const schedulePayload = {
                title,
                road: road || "-",
                type: type || "-",
                priority: priority || "-",
                status: editingScheduleRow ? ((editingScheduleRow.cells[4]?.textContent || "").trim() || "Scheduled") : "Scheduled",
                startDate: formatDateValue(startDate),
                team: team || "-",
            };

            if (editingScheduleRow) {
                const currentRowLabel = `${editingScheduleRow.cells[0]?.textContent || "-"}`;
                const shouldSave = await showRoadDeleteConfirmToast(currentRowLabel, {
                    title: "Edit Schedule",
                    copy: "Are you sure to save this schedule update?",
                    confirmLabel: "Yes, Save",
                    cancelLabel: "Cancel",
                    variant: "info",
                });
                if (!shouldSave) {
                    return;
                }

                editingScheduleRow.cells[0].textContent = schedulePayload.title;
                editingScheduleRow.cells[1].textContent = schedulePayload.road;
                editingScheduleRow.cells[2].textContent = schedulePayload.type;
                editingScheduleRow.cells[3].textContent = schedulePayload.priority;
                editingScheduleRow.cells[4].textContent = schedulePayload.status;
                editingScheduleRow.cells[5].textContent = schedulePayload.startDate;
                editingScheduleRow.cells[6].textContent = schedulePayload.team;
            } else {
                const emptyRow = scheduleTableBody.querySelector(".schedule-empty-row");
                if (emptyRow) {
                    emptyRow.remove();
                }
                const newRow = createScheduleRowElement(schedulePayload);
                scheduleTableBody.prepend(newRow);
            }

            updateScheduleSummary();
            persistMaintenanceState();
            closeScheduleModal();
            showRoadUploadStatusToast(isEditingSchedule ? "Schedule updated successfully." : "Schedule added successfully.", "success");
        });
    }

    if (equipmentTableBody) {
        equipmentTableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const row = target.closest("tr");
            if (!row || row.classList.contains("equipment-empty-row")) {
                return;
            }

            const editButton = target.closest('.js-table-action-edit[data-record-type="equipment"]');
            if (editButton) {
                openEquipmentModal(row);
                return;
            }

            const deleteButton = target.closest('.js-table-action-delete[data-record-type="equipment"]');
            if (!deleteButton) {
                return;
            }

            const equipmentLabel = `${row.cells[0]?.textContent || "-"}-${row.cells[1]?.textContent || "-"}`;
            const shouldDelete = await showRoadDeleteConfirmToast(equipmentLabel, {
                title: "Delete Equipment",
                copy: "Are you sure to delete this data?",
                confirmLabel: "Yes, Delete",
                cancelLabel: "Cancel",
                variant: "danger",
            });
            if (!shouldDelete) {
                return;
            }

            row.remove();
            updateEquipmentSummary();
            persistMaintenanceState();
            showRoadUploadStatusToast("Equipment data deleted successfully.", "success");
        });
    }

    if (scheduleTableBody) {
        scheduleTableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            const row = target.closest("tr");
            if (!row || row.classList.contains("schedule-empty-row")) {
                return;
            }

            const editButton = target.closest('.js-table-action-edit[data-record-type="schedule"]');
            if (editButton) {
                openScheduleModal(row);
                return;
            }

            const deleteButton = target.closest('.js-table-action-delete[data-record-type="schedule"]');
            if (!deleteButton) {
                return;
            }

            const scheduleLabel = `${row.cells[0]?.textContent || "-"}`;
            const shouldDelete = await showRoadDeleteConfirmToast(scheduleLabel, {
                title: "Delete Schedule",
                copy: "Are you sure to delete this data?",
                confirmLabel: "Yes, Delete",
                cancelLabel: "Cancel",
                variant: "danger",
            });
            if (!shouldDelete) {
                return;
            }

            row.remove();
            if (!getScheduleRows().length) {
                restoreScheduleEmptyRow();
            }
            updateScheduleSummary();
            persistMaintenanceState();
            showRoadUploadStatusToast("Schedule data deleted successfully.", "success");
        });
    }

    if (taskSearchInput) {
        taskSearchInput.addEventListener("input", applyTaskFilters);
    }

    restoreMaintenanceState();
    updateEquipmentSummary();
    updateScheduleSummary();
    updateTaskSummary();
    applyTaskFilters();
    refreshRoadMunicipalityOptions();
    if (typeof refreshRoadRegister === "function") {
        refreshRoadRegister();
    }

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
            const dropdownMenu = dropdown.querySelector(".dropdown-menu");

            if (trigger) {
                trigger.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const opening = !dropdown.classList.contains("is-open");
                    closeDropdowns(dropdown);
                    dropdown.classList.toggle("is-open", opening);
                    trigger.setAttribute("aria-expanded", String(opening));
                });
            }

            if (dropdownMenu) {
                dropdownMenu.addEventListener("click", (event) => {
                    const option = event.target.closest(".dropdown-option");
                    if (!option) {
                        return;
                    }
                    event.preventDefault();

                    const options = dropdown.querySelectorAll(".dropdown-option");
                    options.forEach((item) => item.classList.remove("is-selected"));
                    option.classList.add("is-selected");

                    if (label) {
                        label.textContent = option.textContent.trim();
                    }

                    const inputTargetName = String(dropdown.dataset.inputTarget || "").trim();
                    if (inputTargetName) {
                        const targetInput = dropdown.closest("form")?.elements?.namedItem(inputTargetName);
                        if (targetInput instanceof HTMLInputElement || targetInput instanceof HTMLSelectElement || targetInput instanceof HTMLTextAreaElement) {
                            targetInput.value = String(option.dataset.value || option.textContent || "").trim();
                        }
                    }

                    dropdown.classList.remove("is-open");
                    if (trigger) {
                        trigger.setAttribute("aria-expanded", "false");
                    }

                    if (dropdown.dataset.contractorFilter) {
                        updateContractorDropdownFilterState(dropdown);
                        refreshContractorTable();
                    }

                    if (dropdown.dataset.taskFilter) {
                        applyTaskFilters();
                    }

                    refreshRoadMunicipalityOptions();
                    if (typeof refreshRoadRegister === "function") {
                        refreshRoadRegister();
                    }
                });
            }
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
            closeRoadEditModal();
            closeRoadDeleteModal();
            closeRoadAddModal();
            closeTaskPersonnelModal();
            closeTaskModal();
            closeRoadDeleteConfirmToast();
            closeRoadUploadDuplicatePrompt();
            closeRoadUploadAddConfirmPrompt();
            closeContractorFloatCard();
            closeContractorDeleteToast();
            closeContractorAddModal();
            closeContractorEditModal();
            closeContractorEvalModal();
        }
    });
});

/* ROAD_MAINTENANCE_SCRIPT_END */

/* CONSTRUCTION_DIVISION_SCRIPT_START */
document.addEventListener("DOMContentLoaded", () => {
    const constructionDashboard = document.querySelector(".js-construction-dashboard");
    if (!constructionDashboard) return;

    const constructionTableBody = constructionDashboard.querySelector(".js-construction-table-body");
    const constructionRecordMeta = constructionDashboard.querySelector(".js-construction-record-meta");
    const addRecordButton = constructionDashboard.querySelector(".js-construction-add-record");
    const uploadInput = constructionDashboard.querySelector("#construction-upload-input");
    const deleteSelectedButton = constructionDashboard.querySelector(".js-construction-delete-selected");
    const deleteAllButton = constructionDashboard.querySelector(".js-construction-delete-all");
    const selectAllCheckbox = constructionDashboard.querySelector(".js-construction-select-all");
    const prevPageButton = constructionDashboard.querySelector(".js-construction-prev-page");
    const nextPageButton = constructionDashboard.querySelector(".js-construction-next-page");
    const pageMeta = constructionDashboard.querySelector(".js-construction-page-meta");
    const constructionModal = document.querySelector(".js-construction-modal");
    const constructionForm = constructionModal ? constructionModal.querySelector(".js-construction-form") : null;
    const closeConstructionModalButtons = constructionModal
        ? Array.from(constructionModal.querySelectorAll(".js-close-construction-modal"))
        : [];
    const CONSTRUCTION_STORAGE_KEY = "peo_construction_records_v1";
    const CONSTRUCTION_PAGE_SIZE = 10;
    const CONSTRUCTION_FIELDS = [
        "project_name",
        "location",
        "mun",
        "contractor",
        "contract_cost",
        "ntp_date",
        "cd",
        "original_expiry_date",
        "addl_cd",
        "revised_expiry_date",
        "date_completed",
        "revised_contract_cost",
        "status_previous",
        "status_current",
        "time_elapsed",
        "slippage",
        "remarks",
    ];
    const CONSTRUCTION_FIELD_ALIASES = {
        project_name: ["project_name", "project name"],
        location: ["location"],
        mun: ["mun", "municipality"],
        contractor: ["contractor"],
        contract_cost: ["contract_cost", "contract cost"],
        ntp_date: ["ntp_date", "ntp date", "ntp"],
        cd: ["cd", "c.d", "contract duration", "cal days", "calendar days", "contract period c.d", "contract period cd"],
        original_expiry_date: ["original_expiry_date", "original expiry date"],
        addl_cd: ["addl_cd", "addl c d", "add'l. c.d", "additional cd", "addl. c.d", "contract period add'l. c.d", "contract period addl. c.d", "contract period addl c d"],
        revised_expiry_date: ["revised_expiry_date", "revised expiry date"],
        date_completed: ["date_completed", "date completed"],
        revised_contract_cost: ["revised_contract_cost", "revised contract cost", "revised cost"],
        status_previous: ["status_previous", "previous", "status previous", "status (%) december 2025 previous"],
        status_current: ["status_current", "current", "status current", "status (%) december 2025 current"],
        time_elapsed: ["time_elapsed", "% of time elapsed", "time elapsed"],
        slippage: ["slippage", "slippage (+) (-) %"],
        remarks: ["remarks"],
    };
    const CONSTRUCTION_FIELD_TOKENS = {
        project_name: ["project", "name"],
        location: ["location"],
        mun: ["mun"],
        contractor: ["contractor"],
        contract_cost: ["contract", "cost"],
        ntp_date: ["ntp", "date"],
        cd: ["c", "d"],
        original_expiry_date: ["original", "expiry", "date"],
        addl_cd: ["add", "l", "c", "d"],
        revised_expiry_date: ["revised", "expiry", "date"],
        date_completed: ["date", "completed"],
        revised_contract_cost: ["revised", "contract", "cost"],
        status_previous: ["previous"],
        status_current: ["current"],
        time_elapsed: ["time", "elapsed"],
        slippage: ["slippage"],
        remarks: ["remarks"],
    };

    const escapeHtml = (value) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const toDisplay = (value) => {
        const text = String(value ?? "").trim();
        return text || "-";
    };

    const normalizeHeader = (value) => {
        return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    };

    let constructionXlsxPromise = null;
    const ensureConstructionXlsx = () => {
        if (window.XLSX) return Promise.resolve(window.XLSX);
        if (constructionXlsxPromise) return constructionXlsxPromise;

        constructionXlsxPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-construction-xlsx-loader="true"]');
            if (existingScript) {
                existingScript.addEventListener("load", () => resolve(window.XLSX));
                existingScript.addEventListener("error", () => reject(new Error("Failed to load XLSX parser")));
                return;
            }

            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
            script.async = true;
            script.dataset.constructionXlsxLoader = "true";
            script.onload = () => resolve(window.XLSX);
            script.onerror = () => reject(new Error("Failed to load XLSX parser"));
            document.head.appendChild(script);
        });

        return constructionXlsxPromise;
    };

    const formatMoney = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "-";
        if (/php|₱/i.test(text)) return text;
        const numeric = Number(text.replace(/,/g, ""));
        if (Number.isNaN(numeric)) return text;
        return `PHP ${numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (value) => {
        if (value === null || value === undefined || value === "") return "-";

        const toDisplay = (date) => {
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        };

        if (typeof value === "number" && Number.isFinite(value)) {
            if (value > 59) {
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                const parsed = new Date(excelEpoch.getTime() + (value * 86400000));
                if (!Number.isNaN(parsed.getTime())) return toDisplay(parsed);
            }
            return String(value);
        }

        const text = String(value).trim();
        if (!text) return "-";

        const dmyMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmyMatch) {
            const day = Number(dmyMatch[1]);
            const month = Number(dmyMatch[2]);
            const year = Number(dmyMatch[3]);
            const parsed = new Date(year, month - 1, day);
            if (!Number.isNaN(parsed.getTime())) return toDisplay(parsed);
        }

        const numeric = Number(text.replace(/,/g, ""));
        if (!Number.isNaN(numeric) && numeric > 59) {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const parsed = new Date(excelEpoch.getTime() + (numeric * 86400000));
            if (!Number.isNaN(parsed.getTime())) return toDisplay(parsed);
        }

        const date = new Date(text);
        if (Number.isNaN(date.getTime())) return text;
        return toDisplay(date);
    };

    const parsePercent = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "-";
        return text.replace(/%/g, "").trim() || "-";
    };

    const getHeadersMap = (row) => {
        const map = new Map();
        Object.keys(row || {}).forEach((key) => {
            const normalized = normalizeHeader(key);
            if (!normalized || map.has(normalized)) return;
            map.set(normalized, row[key]);
        });
        return map;
    };

    const getByHeader = (map, keys) => {
        for (const key of keys) {
            const normalized = normalizeHeader(key);
            if (map.has(normalized)) {
                return map.get(normalized);
            }
        }
        return "";
    };

    const parseConstructionRow = (rawRow) => {
        const alreadyMapped = CONSTRUCTION_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(rawRow || {}, field));
        if (alreadyMapped) {
            return CONSTRUCTION_FIELDS.reduce((acc, field) => {
                acc[field] = rawRow[field] ?? "";
                return acc;
            }, {});
        }

        const map = getHeadersMap(rawRow);
        const parsed = {};

        CONSTRUCTION_FIELDS.forEach((field) => {
            const byHeader = getByHeader(map, CONSTRUCTION_FIELD_ALIASES[field] || [field]);
            parsed[field] = byHeader ?? "";
        });

        return parsed;
    };

    const normalizeText = (value) => {
        return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    };

    const makeRecordSignature = (record) => {
        return CONSTRUCTION_FIELDS
            .map((field) => normalizeText(record?.[field]))
            .join("|");
    };

    const isHeaderLikeConstructionRow = (record) => {
        const projectValue = normalizeText(record?.project_name).replace(/[^a-z0-9]/g, "");
        if (!projectValue) return true;
        if (projectValue === "projectname" || projectValue === "project") return true;

        const headerLikeCount = CONSTRUCTION_FIELDS.reduce((count, field) => {
            const value = normalizeText(record?.[field]).replace(/[^a-z0-9]/g, "");
            const aliasMatch = (CONSTRUCTION_FIELD_ALIASES[field] || []).some((alias) => {
                return value === normalizeHeader(alias);
            });
            return count + (aliasMatch ? 1 : 0);
        }, 0);

        return headerLikeCount >= 3;
    };

    const readStoredRecords = () => {
        try {
            const raw = window.localStorage.getItem(CONSTRUCTION_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    };

    const writeStoredRecords = (records) => {
        try {
            window.localStorage.setItem(CONSTRUCTION_STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            // Ignore storage errors.
        }
    };

    let records = readStoredRecords();
    let currentPage = 1;
    let editingRecordId = null;

    const getTotalPages = () => {
        return Math.max(1, Math.ceil(records.length / CONSTRUCTION_PAGE_SIZE));
    };

    const clampCurrentPage = () => {
        currentPage = Math.min(Math.max(1, currentPage), getTotalPages());
    };

    const getCurrentPageRecords = () => {
        const start = (currentPage - 1) * CONSTRUCTION_PAGE_SIZE;
        return records.slice(start, start + CONSTRUCTION_PAGE_SIZE);
    };

    const getVisibleRowCheckboxes = () => {
        if (!constructionTableBody) return [];
        return Array.from(constructionTableBody.querySelectorAll(".js-construction-row-select"));
    };

    const renderPagination = () => {
        clampCurrentPage();
        const totalPages = getTotalPages();

        if (pageMeta) {
            pageMeta.textContent = `Page ${currentPage} of ${totalPages}`;
        }
        if (prevPageButton) {
            prevPageButton.disabled = currentPage <= 1;
        }
        if (nextPageButton) {
            nextPageButton.disabled = currentPage >= totalPages;
        }
    };

    const updateSelectionControls = () => {
        const rowCheckboxes = getVisibleRowCheckboxes();
        const selectedCount = rowCheckboxes.filter((checkbox) => checkbox.checked).length;

        if (deleteSelectedButton) {
            deleteSelectedButton.disabled = selectedCount === 0;
            deleteSelectedButton.textContent = selectedCount
                ? `Delete Selected (${selectedCount})`
                : "Delete Selected";
        }

        if (!selectAllCheckbox) return;
        if (!rowCheckboxes.length) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
            return;
        }

        selectAllCheckbox.checked = selectedCount === rowCheckboxes.length;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < rowCheckboxes.length;
    };

    const renderTable = () => {
        if (!constructionTableBody) return;
        constructionTableBody.innerHTML = "";

        const pagedRecords = getCurrentPageRecords();
        const pageStartIndex = (currentPage - 1) * CONSTRUCTION_PAGE_SIZE;

        if (!records.length) {
            constructionTableBody.innerHTML = `
                <tr class="construction-empty-row">
                    <td colspan="20">No construction records available yet.</td>
                </tr>
            `;
        } else {
            pagedRecords.forEach((record, index) => {
                const row = document.createElement("tr");
                row.dataset.recordId = record.__id;
                row.innerHTML = `
                    <td class="pa-select-col">
                        <input type="checkbox" class="js-construction-row-select" aria-label="Select row" data-record-id="${escapeHtml(record.__id)}">
                    </td>
                    <td>${pageStartIndex + index + 1}</td>
                    <td>${escapeHtml(toDisplay(record.project_name))}</td>
                    <td>${escapeHtml(toDisplay(record.location))}</td>
                    <td>${escapeHtml(toDisplay(record.mun))}</td>
                    <td>${escapeHtml(toDisplay(record.contractor))}</td>
                    <td>${escapeHtml(formatMoney(record.contract_cost))}</td>
                    <td>${escapeHtml(formatDate(record.ntp_date))}</td>
                    <td>${escapeHtml(toDisplay(record.cd))}</td>
                    <td>${escapeHtml(formatDate(record.original_expiry_date))}</td>
                    <td>${escapeHtml(toDisplay(record.addl_cd))}</td>
                    <td>${escapeHtml(formatDate(record.revised_expiry_date))}</td>
                    <td>${escapeHtml(formatDate(record.date_completed))}</td>
                    <td>${escapeHtml(formatMoney(record.revised_contract_cost))}</td>
                    <td>${escapeHtml(parsePercent(record.status_previous))}</td>
                    <td>${escapeHtml(parsePercent(record.status_current))}</td>
                    <td>${escapeHtml(parsePercent(record.time_elapsed))}</td>
                    <td>${escapeHtml(parsePercent(record.slippage))}</td>
                    <td>${escapeHtml(toDisplay(record.remarks))}</td>
                    <td>
                        <div class="construction-actions">
                            <button type="button" class="construction-action-btn construction-action-btn--edit js-construction-edit-row" data-record-id="${escapeHtml(record.__id)}" aria-label="Edit record" title="Edit">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="m3 17.25 9.06-9.06 3.75 3.75L6.75 21H3v-3.75zm13.71-10.04a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.09 1.09 3.75 3.75 1.25-1.93z"></path>
                                </svg>
                            </button>
                            <button type="button" class="construction-action-btn construction-action-btn--delete js-construction-delete-row" data-record-id="${escapeHtml(record.__id)}" aria-label="Delete record" title="Delete">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM7 10h2v8H7v-8z"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                `;
                constructionTableBody.appendChild(row);
            });
        }

        if (constructionRecordMeta) {
            constructionRecordMeta.textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;
        }
        renderPagination();
        updateSelectionControls();
    };

    const createRecordId = () => {
        return `construction_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    };

    const getTrimmedFormValue = (formData, key) => {
        return String(formData.get(key) ?? "").trim();
    };

    const setConstructionFormMode = (mode) => {
        if (!constructionModal) return;
        const title = constructionModal.querySelector("#construction-modal-title");
        const submitButton = constructionForm?.querySelector('button[type="submit"]');
        if (title) {
            title.textContent = mode === "edit"
                ? "Edit Construction Record"
                : "Create Construction Record";
        }
        if (submitButton) {
            submitButton.textContent = mode === "edit" ? "Save Changes" : "Create";
        }
    };

    const fillConstructionForm = (record) => {
        if (!constructionForm || !record) return;
        CONSTRUCTION_FIELDS.forEach((field) => {
            const input = constructionForm.querySelector(`[name="${field}"]`);
            if (!input) return;
            input.value = record[field] ?? "";
        });
    };

    const openConstructionModal = (mode = "create", record = null) => {
        if (!constructionModal) return;
        editingRecordId = mode === "edit" ? record?.__id || null : null;
        setConstructionFormMode(mode);
        if (constructionForm) {
            constructionForm.reset();
            if (mode === "edit" && record) {
                fillConstructionForm(record);
            }
        }
        constructionModal.hidden = false;
        document.body.classList.add("construction-modal-open");
        requestAnimationFrame(() => {
            const firstField = constructionForm?.querySelector('[name="project_name"]');
            if (firstField) firstField.focus();
        });
    };

    const closeConstructionModal = () => {
        if (!constructionModal) return;
        constructionModal.hidden = true;
        document.body.classList.remove("construction-modal-open");
        editingRecordId = null;
        setConstructionFormMode("create");
        if (constructionForm) constructionForm.reset();
    };

    const buildRecordFromForm = () => {
        if (!constructionForm) return null;
        const formData = new FormData(constructionForm);
        const projectName = getTrimmedFormValue(formData, "project_name");
        if (!projectName) return null;

        return {
            __id: createRecordId(),
            project_name: projectName,
            location: getTrimmedFormValue(formData, "location"),
            mun: getTrimmedFormValue(formData, "mun"),
            contractor: getTrimmedFormValue(formData, "contractor"),
            contract_cost: getTrimmedFormValue(formData, "contract_cost"),
            ntp_date: getTrimmedFormValue(formData, "ntp_date"),
            cd: getTrimmedFormValue(formData, "cd"),
            original_expiry_date: getTrimmedFormValue(formData, "original_expiry_date"),
            addl_cd: getTrimmedFormValue(formData, "addl_cd"),
            revised_expiry_date: getTrimmedFormValue(formData, "revised_expiry_date"),
            date_completed: getTrimmedFormValue(formData, "date_completed"),
            revised_contract_cost: getTrimmedFormValue(formData, "revised_contract_cost"),
            status_previous: getTrimmedFormValue(formData, "status_previous"),
            status_current: getTrimmedFormValue(formData, "status_current"),
            time_elapsed: getTrimmedFormValue(formData, "time_elapsed"),
            slippage: getTrimmedFormValue(formData, "slippage"),
            remarks: getTrimmedFormValue(formData, "remarks"),
        };
    };

    const parseCsvText = (text) => {
        const lines = String(text || "")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
        if (!lines.length) return [];

        const headers = lines[0].split(",").map((header) => header.trim());
        const rows = lines.slice(1);
        return rows.map((line) => {
            const values = line.split(",");
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : "";
            });
            return row;
        });
    };

    const hasKeyword = (text, keyword) => {
        return String(text || "").includes(keyword);
    };

    const countMatchingCells = (row, tokens) => {
        const normalizedCells = (row || []).map((cell) => normalizeHeader(cell));
        return tokens.reduce((count, token) => {
            return count + (normalizedCells.some((cell) => hasKeyword(cell, token)) ? 1 : 0);
        }, 0);
    };

    const scoreConstructionHeaderRow = (row) => {
        const normalizedCells = (row || []).map((cell) => normalizeHeader(cell));
        const base = [
            normalizedCells.some((cell) => hasKeyword(cell, "projectname")),
            normalizedCells.some((cell) => hasKeyword(cell, "location")),
            normalizedCells.some((cell) => hasKeyword(cell, "mun")),
            normalizedCells.some((cell) => hasKeyword(cell, "contractor")),
            normalizedCells.some((cell) => hasKeyword(cell, "contractcost")),
            normalizedCells.some((cell) => hasKeyword(cell, "ntp")),
            normalizedCells.some((cell) => hasKeyword(cell, "remarks")),
        ].filter(Boolean).length;

        const strongSignals = countMatchingCells(row, [
            "datecompleted",
            "revisedcontractcost",
            "timeelapsed",
            "slippage",
            "status",
            "previous",
            "current",
            "contractperiod",
            "december2025",
        ]);

        const duplicateProjectNameCount = normalizedCells.filter((cell) => hasKeyword(cell, "projectname")).length;
        const duplicatePenalty = duplicateProjectNameCount > 1 ? 1 : 0;

        return base + (strongSignals * 2) - duplicatePenalty;
    };

    const findConstructionHeaderRowIndex = (rows) => {
        for (let i = 0; i < rows.length; i += 1) {
            const score = scoreConstructionHeaderRow(rows[i]);
            if (score >= 5) {
                return i;
            }
        }
        return -1;
    };

    const getBestConstructionSheetRows = (workbook, XLSX) => {
        let best = { score: -1, rows: [] };

        workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) return;
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            if (!rows.length) return;

            let sheetBestScore = 0;
            for (let i = 0; i < Math.min(rows.length, 80); i += 1) {
                sheetBestScore = Math.max(sheetBestScore, scoreConstructionHeaderRow(rows[i]));
            }

            if (sheetBestScore > best.score) {
                best = { score: sheetBestScore, rows };
            }
        });

        return best.rows;
    };

    const isLikelySubHeaderRow = (row) => {
        const normalizedCells = (row || [])
            .map((cell) => normalizeHeader(cell))
            .filter(Boolean);
        if (!normalizedCells.length) return false;

        const keywordCount = normalizedCells.filter((cell) => (
            hasKeyword(cell, "date")
            || hasKeyword(cell, "original")
            || hasKeyword(cell, "revised")
            || hasKeyword(cell, "previous")
            || hasKeyword(cell, "current")
            || hasKeyword(cell, "todate")
            || hasKeyword(cell, "status")
        )).length;

        const startsWithRowNumber = /^\d+$/.test(String((row || [])[0] || "").trim());
        return !startsWithRowNumber && keywordCount >= 2;
    };

    const findConstructionSubHeaderRowIndex = (rows, headerIndex) => {
        const maxLookAhead = Math.min(rows.length - 1, headerIndex + 4);
        for (let i = headerIndex + 1; i <= maxLookAhead; i += 1) {
            if (isLikelySubHeaderRow(rows[i])) {
                return i;
            }
        }
        return -1;
    };

    const buildObjectsFromRows = (rows, headers) => {
        return rows.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header || `column_${index + 1}`] = row[index] ?? "";
            });
            return obj;
        });
    };

    const hasAnyKeyword = (text, keywords) => {
        return keywords.some((keyword) => hasKeyword(text, keyword));
    };

    const tokenizeHeader = (header) => {
        return String(header || "")
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .map((token) => token.trim())
            .filter(Boolean);
    };

    const findFieldIndexFromHeaders = (normalizedHeaders, headerTokensList, startIndex, endIndex, field) => {
        const aliases = (CONSTRUCTION_FIELD_ALIASES[field] || [field]).map((alias) => normalizeHeader(alias));
        const tokenRules = CONSTRUCTION_FIELD_TOKENS[field] || [];

        // First pass: exact alias match for safest mapping.
        for (let i = startIndex; i < endIndex; i += 1) {
            const header = normalizedHeaders[i];
            if (!header) continue;
            if (aliases.includes(header)) return i;
        }

        // Second pass: token-based fallback for label variants.
        for (let i = startIndex; i < endIndex; i += 1) {
            const header = normalizedHeaders[i];
            if (!header) continue;

            if (tokenRules.length) {
                const tokens = headerTokensList[i];
                const hasAllTokens = tokenRules.every((ruleToken) => tokens.includes(ruleToken));
                if (hasAllTokens) return i;
            }
        }

        return -1;
    };

    const findFieldCandidateIndexes = (normalizedHeaders, headerTokensList, field) => {
        const aliases = (CONSTRUCTION_FIELD_ALIASES[field] || [field]).map((alias) => normalizeHeader(alias));
        const tokenRules = CONSTRUCTION_FIELD_TOKENS[field] || [];
        const matches = [];

        for (let i = 0; i < normalizedHeaders.length; i += 1) {
            const header = normalizedHeaders[i];
            if (!header) continue;

            const aliasMatch = aliases.some((alias) => {
                return header === alias || header.includes(alias) || alias.includes(header);
            });
            if (aliasMatch) {
                matches.push(i);
                continue;
            }

            if (tokenRules.length) {
                const tokens = headerTokensList[i];
                const hasAllTokens = tokenRules.every((ruleToken) => tokens.includes(ruleToken));
                if (hasAllTokens) {
                    matches.push(i);
                }
            }
        }

        return matches;
    };

    const findConstructionFieldIndexes = (headers) => {
        const normalizedHeaders = headers.map((header) => normalizeHeader(header));
        const headerTokensList = headers.map((header) => tokenizeHeader(header));
        const fieldIndexes = {};
        const projectNameCandidates = findFieldCandidateIndexes(normalizedHeaders, headerTokensList, "project_name");
        const primaryProjectIndex = projectNameCandidates.length ? projectNameCandidates[0] : -1;
        let firstRemarksIndex = -1;
        if (primaryProjectIndex >= 0) {
            for (let i = primaryProjectIndex + 1; i < normalizedHeaders.length; i += 1) {
                if (normalizedHeaders[i] === "remarks") {
                    firstRemarksIndex = i;
                    break;
                }
            }
        }

        const searchStart = primaryProjectIndex >= 0 ? primaryProjectIndex : 0;
        const searchEnd = firstRemarksIndex >= 0 ? (firstRemarksIndex + 1) : normalizedHeaders.length;
        CONSTRUCTION_FIELDS.forEach((field) => {
            if (field === "project_name") {
                fieldIndexes[field] = primaryProjectIndex;
                return;
            }
            fieldIndexes[field] = findFieldIndexFromHeaders(
                normalizedHeaders,
                headerTokensList,
                searchStart,
                searchEnd,
                field,
            );
        });

        if (fieldIndexes.cd < 0) {
            for (let i = searchStart; i < searchEnd; i += 1) {
                const h = normalizedHeaders[i];
                if (!h) continue;
                if (h.includes("caldays") || h.includes("contractperiodcd") || h === "cd") {
                    fieldIndexes.cd = i;
                    break;
                }
            }
        }

        if (fieldIndexes.addl_cd < 0) {
            for (let i = searchStart; i < searchEnd; i += 1) {
                const h = normalizedHeaders[i];
                if (!h) continue;
                if (h.includes("addlcd") || h.includes("additionalcd")) {
                    fieldIndexes.addl_cd = i;
                    break;
                }
            }
        }

        return fieldIndexes;
    };

    const mapRowByFieldIndexes = (row, fieldIndexes) => {
        const normalizeImportedValue = (value) => {
            if (value === null || value === undefined) return "";
            if (typeof value === "number") return value;
            return String(value).trim();
        };

        const parsed = {};
        CONSTRUCTION_FIELDS.forEach((field) => {
            const index = fieldIndexes[field];
            parsed[field] = index >= 0 ? normalizeImportedValue(row[index]) : "";
        });
        return parsed;
    };

    const parseFileRows = async (file) => {
        const name = String(file.name || "").toLowerCase();
        if (name.endsWith(".csv")) {
            const text = await file.text();
            return parseCsvText(text);
        }

        const XLSX = await ensureConstructionXlsx();
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const allRows = getBestConstructionSheetRows(workbook, XLSX);
        if (!allRows.length) return [];

        const headerIndex = findConstructionHeaderRowIndex(allRows);
        if (headerIndex < 0) {
            const fallback = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
            return Array.isArray(fallback) ? fallback : [];
        }

        const primaryHeaderRow = allRows[headerIndex] || [];
        const subHeaderIndex = findConstructionSubHeaderRowIndex(allRows, headerIndex);
        const secondHeaderRow = subHeaderIndex >= 0 ? (allRows[subHeaderIndex] || []) : [];
        const useSecondHeaderRow = subHeaderIndex >= 0;
        const maxCols = Math.max(primaryHeaderRow.length, useSecondHeaderRow ? secondHeaderRow.length : 0);

        const headers = Array.from({ length: maxCols }, (_, index) => {
            const top = String(primaryHeaderRow[index] ?? "").trim();
            const sub = useSecondHeaderRow ? String(secondHeaderRow[index] ?? "").trim() : "";
            if (top && sub) return `${top} ${sub}`.trim();
            return top || sub || `column_${index + 1}`;
        });

        const dataStart = useSecondHeaderRow ? (subHeaderIndex + 1) : (headerIndex + 1);
        const dataRows = allRows.slice(dataStart).filter((row) => {
            return Array.isArray(row) && row.some((cell) => String(cell ?? "").trim() !== "");
        });

        const fieldIndexes = findConstructionFieldIndexes(headers);
        if (fieldIndexes.project_name < 0) {
            return buildObjectsFromRows(dataRows, headers);
        }

        return dataRows
            .map((row) => mapRowByFieldIndexes(row, fieldIndexes))
            .filter((row) => {
                const hasAnyValue = CONSTRUCTION_FIELDS.some((field) => String(row[field] ?? "").trim() !== "");
                if (!hasAnyValue) return false;

                const projectNorm = normalizeHeader(row.project_name);
                const locationNorm = normalizeHeader(row.location);
                const contractorNorm = normalizeHeader(row.contractor);
                if (hasAnyKeyword(projectNorm, ["projectname"]) || hasAnyKeyword(locationNorm, ["location"]) || hasAnyKeyword(contractorNorm, ["contractor"])) {
                    return false;
                }
                return true;
            });
    };

    if (addRecordButton) {
        addRecordButton.addEventListener("click", () => {
            openConstructionModal("create");
        });
    }

    if (constructionForm) {
        constructionForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!constructionForm.checkValidity()) {
                constructionForm.reportValidity();
                return;
            }

            const formRecord = buildRecordFromForm();
            if (!formRecord) return;
            const isEditingRecord = Boolean(editingRecordId);

            if (editingRecordId) {
                const index = records.findIndex((record) => record.__id === editingRecordId);
                if (index >= 0) {
                    records[index] = { ...formRecord, __id: editingRecordId };
                }
            } else {
                records.unshift(formRecord);
            }
            currentPage = 1;
            writeStoredRecords(records);
            renderTable();
            closeConstructionModal();
            showPeoGeneralToast(
                isEditingRecord ? "Construction record updated successfully." : "Construction record added successfully.",
                {
                    title: "Construction Division",
                    variant: "success",
                }
            );
        });
    }

    if (closeConstructionModalButtons.length) {
        closeConstructionModalButtons.forEach((button) => {
            button.addEventListener("click", closeConstructionModal);
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (!constructionModal || constructionModal.hidden) return;
        closeConstructionModal();
    });

    if (uploadInput) {
        uploadInput.addEventListener("change", async (event) => {
            const selectedFiles = Array.from(event.target.files || []);
            if (!selectedFiles.length) return;

            const uploaded = [];
            const existingSignatures = new Set(records.map((record) => makeRecordSignature(record)));
            const uploadSignatures = new Set();
            for (const file of selectedFiles) {
                try {
                    const rows = await parseFileRows(file);
                    rows.forEach((rawRow) => {
                        const parsed = parseConstructionRow(rawRow);
                        if (isHeaderLikeConstructionRow(parsed)) return;

                        const signature = makeRecordSignature(parsed);
                        if (!signature.replace(/\|/g, "")) return;
                        if (existingSignatures.has(signature)) return;
                        if (uploadSignatures.has(signature)) return;

                        uploadSignatures.add(signature);
                        uploaded.push({ __id: createRecordId(), ...parsed });
                    });
                } catch (error) {
                    // Skip files that cannot be parsed.
                }
            }

            if (!uploaded.length) {
                showPeoGeneralToast("No valid construction rows were found in the selected file(s).", {
                    title: "Construction Upload",
                    variant: "warning",
                });
                uploadInput.value = "";
                return;
            }

            records = [...uploaded, ...records];
            currentPage = 1;
            writeStoredRecords(records);
            renderTable();
            uploadInput.value = "";
            showPeoGeneralToast(
                `${uploaded.length} construction record${uploaded.length === 1 ? "" : "s"} uploaded successfully.`,
                {
                    title: "Construction Upload",
                    variant: "success",
                }
            );
        });
    }

    if (prevPageButton) {
        prevPageButton.addEventListener("click", () => {
            if (currentPage <= 1) return;
            currentPage -= 1;
            renderTable();
        });
    }

    if (nextPageButton) {
        nextPageButton.addEventListener("click", () => {
            if (currentPage >= getTotalPages()) return;
            currentPage += 1;
            renderTable();
        });
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", () => {
            getVisibleRowCheckboxes().forEach((checkbox) => {
                checkbox.checked = selectAllCheckbox.checked;
            });
            updateSelectionControls();
        });
    }

    if (constructionTableBody) {
        constructionTableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target.classList.contains("js-construction-edit-row")) {
                const recordId = target.dataset.recordId;
                if (!recordId) return;
                const record = records.find((item) => item.__id === recordId);
                if (!record) return;
                openConstructionModal("edit", record);
                return;
            }
            if (!target.classList.contains("js-construction-delete-row")) return;

            const recordId = target.dataset.recordId;
            if (!recordId) return;

            const approved = await showPeoGeneralConfirm({
                title: "Delete Construction Record",
                message: "Are you sure you want to delete this construction record?",
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                variant: "danger",
            });
            if (!approved) return;
            records = records.filter((record) => record.__id !== recordId);
            clampCurrentPage();
            writeStoredRecords(records);
            renderTable();
            showPeoGeneralToast("Construction record deleted successfully.", {
                title: "Construction Division",
                variant: "success",
            });
        });

        constructionTableBody.addEventListener("change", (event) => {
            const target = event.target;
            if (target && target.classList.contains("js-construction-row-select")) {
                updateSelectionControls();
            }
        });
    }

    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener("click", async () => {
            const selectedIds = getVisibleRowCheckboxes()
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.dataset.recordId);
            if (!selectedIds.length) return;

            const approved = await showPeoGeneralConfirm({
                title: "Delete Selected Records",
                message: `Delete ${selectedIds.length} selected construction record(s)?`,
                confirmLabel: "Delete Selected",
                cancelLabel: "Cancel",
                variant: "danger",
            });
            if (!approved) return;

            const removeSet = new Set(selectedIds);
            records = records.filter((record) => !removeSet.has(record.__id));
            clampCurrentPage();
            writeStoredRecords(records);
            renderTable();
            showPeoGeneralToast(`${selectedIds.length} construction record(s) deleted successfully.`, {
                title: "Construction Division",
                variant: "success",
            });
        });
    }

    if (deleteAllButton) {
        deleteAllButton.addEventListener("click", async () => {
            if (!records.length) return;
            const approved = await showPeoGeneralConfirm({
                title: "Delete All Construction Records",
                message: "Delete all construction records? This action cannot be undone.",
                confirmLabel: "Delete All",
                cancelLabel: "Cancel",
                variant: "danger",
            });
            if (!approved) return;

            records = [];
            currentPage = 1;
            writeStoredRecords(records);
            renderTable();
            showPeoGeneralToast("All construction records were deleted.", {
                title: "Construction Division",
                variant: "success",
            });
        });
    }

    renderTable();
});
/* CONSTRUCTION_DIVISION_SCRIPT_END */

/* PLANNING_DIVISION_MODAL_SCRIPT_START */
document.addEventListener("DOMContentLoaded", () => {
    const planningBudgetModal = document.querySelector(".js-planning-budget-modal");
    const planningEditBudgetModal = document.querySelector(".js-planning-edit-budget-modal");
    const planningPpaModal = document.querySelector(".js-planning-ppa-modal");
    const planningEditPpaModal = document.querySelector(".js-planning-edit-ppa-modal");
    const hasPlanningDashboard = planningBudgetModal instanceof HTMLElement;

    if (hasPlanningDashboard) {

    const planningEmptyState = document.querySelector(".planning-empty-state");
    const planningBudgetCards = document.getElementById("planning-budget-cards");
    const planningBudgetSummaryAllocated = document.querySelector('[data-planning-budget-summary="allocated"]');
    const planningBudgetSummaryBalance = document.querySelector('[data-planning-budget-summary="balance"]');
    const planningBudgetSummaryDraft = document.querySelector('[data-planning-budget-summary="draft"]');
    const planningBudgetSummaryApproved = document.querySelector('[data-planning-budget-summary="approved"]');
    const planningBudgetSummaryYear = document.querySelector('[data-planning-budget-summary="year"]');
    const planningPpaTableBody = document.querySelector(".planning-ppa-table tbody");
    const planningPpaFooterSummary = document.querySelector(".planning-ppa-footer > span");
    const planningPpaCount = document.getElementById("planning-ppa-count");
    const planningPpaFloatCards = document.querySelectorAll(".planning-ppa-float-card");
    const planningPpaSummaryTotal = document.querySelector('[data-planning-ppa-summary="total"]');
    const planningPpaSummaryDraft = document.querySelector('[data-planning-ppa-summary="draft"]');
    const planningPpaSummaryReview = document.querySelector('[data-planning-ppa-summary="review"]');
    const planningPpaSummaryApproved = document.querySelector('[data-planning-ppa-summary="approved"]');
    const planningPpaSummaryBidding = document.querySelector('[data-planning-ppa-summary="bidding"]');
    const planningPpaSummaryAwarded = document.querySelector('[data-planning-ppa-summary="awarded"]');
    const planningPpaSummaryCancelled = document.querySelector('[data-planning-ppa-summary="cancelled"]');
    const PLANNING_BUDGET_STORAGE_KEY = "peo_planning_budget_records_v1";
    const PLANNING_PPA_SAMPLE_IDS = new Set([
        "PPA-2026-0042",
        "PPA-2026-0115",
        "PPA-2026-0089",
        "PPA-2026-0021",
    ]);

    const closeModalButtons = planningBudgetModal.querySelectorAll(".js-close-planning-budget-modal");
    const budgetForm = planningBudgetModal.querySelector("#planning-budget-form");
    const budgetNameInput = planningBudgetModal.querySelector('input[name="budget_name"]');
    const closeEditModalButtons = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelectorAll(".js-close-planning-edit-modal")
        : [];
    const editBudgetForm = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector("#planning-edit-budget-form")
        : null;
    const editBudgetSubtitle = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-budget-subtitle")
        : null;
    const editTotalBudgetInput = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-total-budget")
        : null;
    const editBudgetHelper = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-budget-helper")
        : null;
    const editRemarksInput = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-remarks")
        : null;
    const closePpaModalButtons = planningPpaModal instanceof HTMLElement
        ? planningPpaModal.querySelectorAll(".js-close-planning-ppa-modal")
        : [];
    const ppaForm = planningPpaModal instanceof HTMLElement
        ? planningPpaModal.querySelector("#planning-ppa-form")
        : null;
    const ppaProjectTitleInput = planningPpaModal instanceof HTMLElement
        ? planningPpaModal.querySelector('input[name="project_title"]')
        : null;
    const closeEditPpaModalButtons = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelectorAll(".js-close-planning-edit-ppa-modal")
        : [];
    const editPpaForm = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector("#planning-edit-ppa-form")
        : null;
    const editPpaSubtitle = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-subtitle")
        : null;
    const editPpaNameInput = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-name")
        : null;
    const editPpaIdInput = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-id")
        : null;
    const editPpaFundInput = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-fund")
        : null;
    const editPpaAmountInput = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-amount")
        : null;
    const editPpaStatusSelect = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-status-select")
        : null;
    const editPpaStatusInput = planningEditPpaModal instanceof HTMLElement
        ? planningEditPpaModal.querySelector(".js-planning-edit-ppa-status-input")
        : null;

    const statusSelect = planningBudgetModal.querySelector(".js-planning-status-select");
    const statusTrigger = planningBudgetModal.querySelector(".js-planning-status-trigger");
    const statusMenu = planningBudgetModal.querySelector(".js-planning-status-menu");
    const statusLabel = planningBudgetModal.querySelector(".js-planning-status-label");
    const statusInput = planningBudgetModal.querySelector(".js-planning-status-input");
    const yearSelect = planningBudgetModal.querySelector(".js-planning-year-select");
    const yearTrigger = planningBudgetModal.querySelector(".js-planning-year-trigger");
    const yearMenu = planningBudgetModal.querySelector(".js-planning-year-menu");
    const yearLabel = planningBudgetModal.querySelector(".js-planning-year-label");
    const yearInput = planningBudgetModal.querySelector(".js-planning-year-input");
    const editStatusSelect = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-status-select")
        : null;
    const editStatusTrigger = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-status-trigger")
        : null;
    const editStatusMenu = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-status-menu")
        : null;
    const editStatusLabel = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-status-label")
        : null;
    const editStatusInput = planningEditBudgetModal instanceof HTMLElement
        ? planningEditBudgetModal.querySelector(".js-planning-edit-status-input")
        : null;
    const planningTabs = document.querySelectorAll(".planning-tab[data-planning-tab]");
    const planningPanels = document.querySelectorAll("[data-planning-panel]");
    const ppaFilterSelects = document.querySelectorAll(".js-planning-ppa-select");
    const ppaFormSelects = document.querySelectorAll(".js-planning-ppa-form-select");

    const normalizeStatus = (value) => {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "approved") return "Approved";
        if (raw === "for approval") return "For Approval";
        return "Draft";
    };

    const normalizePpaStatus = (value) => {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "approved") return "Approved";
        if (raw === "for bidding") return "For Bidding";
        if (raw === "awarded") return "Awarded";
        if (raw === "for review") return "For Review";
        if (raw === "cancelled") return "Cancelled";
        return "Draft";
    };

    const getPpaStatusClassName = (status) => {
        const normalized = normalizePpaStatus(status);
        if (normalized === "Approved") return "is-approved";
        if (normalized === "For Bidding") return "is-bidding";
        if (normalized === "Awarded") return "is-awarded";
        if (normalized === "For Review") return "is-review";
        if (normalized === "Cancelled") return "is-cancelled";
        return "is-draft";
    };

    const getStatusMeta = (status) => {
        if (status === "Approved") {
            return { badgeClass: "is-approved", badgeText: "APPROVED" };
        }
        if (status === "For Approval") {
            return { badgeClass: "is-pending", badgeText: "PENDING" };
        }
        return { badgeClass: "is-draft", badgeText: "DRAFT" };
    };

    const escapeHtml = (value) => String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    const formatPhp = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return "PHP 0.00";
        return `PHP ${numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatNumber = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return "0.00";
        return numeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const parseCurrencyValue = (value) => {
        const sanitized = String(value || "").replace(/[^0-9.-]+/g, "");
        const numeric = Number(sanitized);
        return Number.isFinite(numeric) ? numeric : 0;
    };

    const parsePercentageValue = (value) => {
        const sanitized = String(value || "").replace(/[^0-9.-]+/g, "");
        const numeric = Number(sanitized);
        return Number.isFinite(numeric) ? numeric : null;
    };

    const clampPercentage = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return 0;
        return Math.max(0, Math.min(100, numeric));
    };

    const getBudgetMetrics = (record) => {
        const totalBudget = Number(record?.totalBudget);
        const safeTotalBudget = Number.isFinite(totalBudget) && totalBudget > 0 ? totalBudget : 0;

        const rawAllocatedBudget = Number(
            record?.allocatedBudget
            ?? record?.allocated
            ?? record?.allocatedAmount
            ?? NaN
        );
        const hasAllocatedBudget = Number.isFinite(rawAllocatedBudget);

        const rawUtilization = Number(record?.utilization ?? record?.utilizationRate ?? record?.progress ?? NaN);
        const hasUtilization = Number.isFinite(rawUtilization);

        let allocatedBudget = hasAllocatedBudget ? rawAllocatedBudget : 0;
        let utilization = 0;

        if (safeTotalBudget > 0 && hasAllocatedBudget) {
            utilization = (allocatedBudget / safeTotalBudget) * 100;
        } else if (hasUtilization) {
            utilization = rawUtilization;
            allocatedBudget = safeTotalBudget * (clampPercentage(rawUtilization) / 100);
        }

        const normalizedAllocatedBudget = Math.max(0, allocatedBudget);
        const normalizedUtilization = clampPercentage(utilization);
        const remainingBudget = Math.max(0, safeTotalBudget - normalizedAllocatedBudget);

        return {
            totalBudget: safeTotalBudget,
            allocatedBudget: normalizedAllocatedBudget,
            remainingBudget,
            utilization: normalizedUtilization,
        };
    };

    const getPlanningPpaDataRows = () => {
        if (!(planningPpaTableBody instanceof HTMLTableSectionElement)) return [];
        return Array.from(planningPpaTableBody.querySelectorAll("tr")).filter((row) => {
            return row instanceof HTMLTableRowElement && row.dataset.ppaEmptyRow !== "true";
        });
    };

    const getPlanningPpaStatusCounts = () => {
        const counts = {
            total: 0,
            draft: 0,
            review: 0,
            approved: 0,
            bidding: 0,
            awarded: 0,
            cancelled: 0,
        };

        getPlanningPpaDataRows().forEach((row) => {
            const statusCell = row.cells[2];
            const statusValue = normalizePpaStatus(
                statusCell?.querySelector(".planning-ppa-status")?.textContent
                || statusCell?.textContent
                || ""
            );

            counts.total += 1;
            if (statusValue === "Draft") counts.draft += 1;
            if (statusValue === "For Review") counts.review += 1;
            if (statusValue === "Approved") counts.approved += 1;
            if (statusValue === "For Bidding") counts.bidding += 1;
            if (statusValue === "Awarded") counts.awarded += 1;
            if (statusValue === "Cancelled") counts.cancelled += 1;
        });

        return counts;
    };

    const renderPlanningPpaStatusSummaries = () => {
        const counts = getPlanningPpaStatusCounts();

        if (planningPpaSummaryTotal instanceof HTMLElement) {
            planningPpaSummaryTotal.textContent = String(counts.total);
        }
        if (planningPpaSummaryDraft instanceof HTMLElement) {
            planningPpaSummaryDraft.textContent = String(counts.draft);
        }
        if (planningPpaSummaryReview instanceof HTMLElement) {
            planningPpaSummaryReview.textContent = String(counts.review);
        }
        if (planningPpaSummaryApproved instanceof HTMLElement) {
            planningPpaSummaryApproved.textContent = String(counts.approved);
        }
        if (planningPpaSummaryBidding instanceof HTMLElement) {
            planningPpaSummaryBidding.textContent = String(counts.bidding);
        }
        if (planningPpaSummaryAwarded instanceof HTMLElement) {
            planningPpaSummaryAwarded.textContent = String(counts.awarded);
        }
        if (planningPpaSummaryCancelled instanceof HTMLElement) {
            planningPpaSummaryCancelled.textContent = String(counts.cancelled);
        }
    };

    const syncPpaTableState = () => {
        if (!(planningPpaTableBody instanceof HTMLTableSectionElement)) return;

        const dataRows = getPlanningPpaDataRows();

        const emptyRow = planningPpaTableBody.querySelector('tr[data-ppa-empty-row="true"]');
        if (dataRows.length) {
            emptyRow?.remove();
        } else if (!(emptyRow instanceof HTMLTableRowElement)) {
            const row = document.createElement("tr");
            row.dataset.ppaEmptyRow = "true";
            row.className = "planning-ppa-empty-row";
            row.innerHTML = '<td colspan="5">No PPA records available.</td>';
            planningPpaTableBody.appendChild(row);
        }

        if (planningPpaFooterSummary instanceof HTMLElement) {
            planningPpaFooterSummary.textContent = dataRows.length
                ? `Showing 1 to ${dataRows.length} of ${dataRows.length} results`
                : "No PPA records available";
        }
        if (planningPpaCount instanceof HTMLElement) {
            planningPpaCount.textContent = `${dataRows.length} project${dataRows.length === 1 ? "" : "s"} tracked`;
        }
        renderPlanningPpaStatusSummaries();
        renderPlanningSummaries(planningBudgetRecords);
    };

    const removePlanningPpaSampleRows = () => {
        if (!(planningPpaTableBody instanceof HTMLTableSectionElement)) return;

        planningPpaTableBody.querySelectorAll("tr").forEach((row) => {
            if (!(row instanceof HTMLTableRowElement)) return;
            const rowId = row.querySelector("small")?.textContent?.replace(/^ID:\s*/i, "").trim() || "";
            if (PLANNING_PPA_SAMPLE_IDS.has(rowId)) {
                row.remove();
            }
        });
    };

    const setActivePlanningPanel = (panelName) => {
        planningTabs.forEach((tab) => {
            if (!(tab instanceof HTMLElement)) return;
            const isActive = tab.dataset.planningTab === panelName;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        planningPanels.forEach((panel) => {
            if (!(panel instanceof HTMLElement)) return;
            const shouldShow = panel.dataset.planningPanel === panelName;
            panel.hidden = !shouldShow;
        });
    };

    const closePpaFilterMenus = (exceptSelect = null) => {
        ppaFilterSelects.forEach((selectRoot) => {
            if (!(selectRoot instanceof HTMLElement)) return;
            if (exceptSelect && selectRoot === exceptSelect) return;
            const trigger = selectRoot.querySelector(".js-planning-ppa-trigger");
            const menu = selectRoot.querySelector(".js-planning-ppa-menu");
            selectRoot.classList.remove("is-open");
            if (trigger instanceof HTMLElement) {
                trigger.setAttribute("aria-expanded", "false");
            }
            if (menu instanceof HTMLElement) {
                menu.hidden = true;
            }
        });
    };

    const setPpaFilterValue = (selectRoot, value) => {
        if (!(selectRoot instanceof HTMLElement)) return;
        const normalized = String(value || "").trim();
        const label = selectRoot.querySelector(".js-planning-ppa-label");
        const input = selectRoot.querySelector(".js-planning-ppa-input");
        const options = selectRoot.querySelectorAll(".planning-ppa-option");

        if (label instanceof HTMLElement) {
            label.textContent = normalized;
        }
        if (input instanceof HTMLInputElement) {
            input.value = normalized;
        }

        options.forEach((option) => {
            if (!(option instanceof HTMLElement)) return;
            option.classList.toggle("is-selected", option.dataset.value === normalized);
        });
    };

    const closePpaFormSelectMenus = (exceptSelect = null) => {
        ppaFormSelects.forEach((selectRoot) => {
            if (!(selectRoot instanceof HTMLElement)) return;
            if (exceptSelect && selectRoot === exceptSelect) return;
            const trigger = selectRoot.querySelector(".js-planning-ppa-form-trigger");
            const menu = selectRoot.querySelector(".js-planning-ppa-form-menu");
            selectRoot.classList.remove("is-open");
            if (trigger instanceof HTMLElement) {
                trigger.setAttribute("aria-expanded", "false");
            }
            if (menu instanceof HTMLElement) {
                menu.hidden = true;
            }
        });
    };

    const setPpaFormSelectValue = (selectRoot, value) => {
        if (!(selectRoot instanceof HTMLElement)) return;
        const normalized = String(value || "").trim();
        const label = selectRoot.querySelector(".js-planning-ppa-form-label");
        const input = selectRoot.querySelector(".js-planning-ppa-form-input");
        const options = selectRoot.querySelectorAll(".planning-ppa-form-option");
        const matchedOption = Array.from(options).find((option) => {
            return option instanceof HTMLElement && option.dataset.value === normalized;
        });
        const matchedLabel = matchedOption?.querySelector("span")?.textContent?.trim() || normalized;

        if (label instanceof HTMLElement) {
            label.textContent = matchedLabel;
        }
        if (input instanceof HTMLInputElement) {
            input.value = normalized;
        }

        options.forEach((option) => {
            if (!(option instanceof HTMLElement)) return;
            option.classList.toggle("is-selected", option.dataset.value === normalized);
        });
    };

    const readStoredBudgets = () => {
        try {
            const raw = localStorage.getItem(PLANNING_BUDGET_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed
                .map((item) => {
                    const totalBudget = Number(item?.totalBudget);
                    if (!Number.isFinite(totalBudget) || totalBudget < 0) return null;
                    const allocatedBudget = Number(
                        item?.allocatedBudget
                        ?? item?.allocated
                        ?? item?.allocatedAmount
                        ?? NaN
                    );
                    const utilization = Number(item?.utilization ?? item?.utilizationRate ?? item?.progress ?? NaN);
                    return {
                        id: String(item?.id || ""),
                        source: "local",
                        budgetName: String(item?.budgetName || "").trim(),
                        fiscalYear: String(item?.fiscalYear || "").trim(),
                        totalBudget,
                        allocatedBudget: Number.isFinite(allocatedBudget) ? allocatedBudget : null,
                        utilization: Number.isFinite(utilization) ? utilization : null,
                        status: normalizeStatus(item?.status),
                        remarks: String(item?.remarks || "").trim(),
                        createdAt: Number(item?.createdAt) || Date.now(),
                    };
                })
                .filter((item) => item && item.budgetName && item.fiscalYear);
        } catch (error) {
            return [];
        }
    };

    const writeStoredBudgets = (records) => {
        try {
            localStorage.setItem(PLANNING_BUDGET_STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            // Ignore storage errors silently.
        }
    };

    const renderPlanningSummaries = (records) => {
        if (!(planningBudgetSummaryAllocated instanceof HTMLElement)
            || !(planningBudgetSummaryBalance instanceof HTMLElement)
            || !(planningBudgetSummaryDraft instanceof HTMLElement)
            || !(planningBudgetSummaryApproved instanceof HTMLElement)
            || !(planningBudgetSummaryYear instanceof HTMLElement)) {
            return;
        }

        const allocated = records.reduce((sum, record) => sum + getBudgetMetrics(record).allocatedBudget, 0);
        const balance = records.reduce((sum, record) => sum + getBudgetMetrics(record).remainingBudget, 0);
        const draftCount = records.filter((record) => normalizeStatus(record.status) !== "Approved").length;
        const approvedCount = records.filter((record) => normalizeStatus(record.status) === "Approved").length;
        const currentYear = new Date().getFullYear();

        planningBudgetSummaryAllocated.textContent = formatPhp(allocated);
        planningBudgetSummaryBalance.textContent = formatPhp(balance);
        planningBudgetSummaryDraft.textContent = String(draftCount);
        planningBudgetSummaryApproved.textContent = String(approvedCount);
        planningBudgetSummaryYear.textContent = String(currentYear);
    };

    const enablePlanningPpaCardFloat = () => {
        if (!planningPpaFloatCards.length) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        planningPpaFloatCards.forEach((card) => {
            if (!(card instanceof HTMLElement)) return;

            card.addEventListener("pointermove", (event) => {
                const bounds = card.getBoundingClientRect();
                const relativeX = (event.clientX - bounds.left) / bounds.width;
                const relativeY = (event.clientY - bounds.top) / bounds.height;
                const rotateY = (relativeX - 0.5) * 9;
                const rotateX = (0.5 - relativeY) * 9;
                const shiftX = (relativeX - 0.5) * 8;
                const shiftY = (relativeY - 0.5) * 8;

                card.style.setProperty("--planning-ppa-card-rotate-x", `${rotateX.toFixed(2)}deg`);
                card.style.setProperty("--planning-ppa-card-rotate-y", `${rotateY.toFixed(2)}deg`);
                card.style.setProperty("--planning-ppa-card-shift-x", `${shiftX.toFixed(2)}px`);
                card.style.setProperty("--planning-ppa-card-shift-y", `${shiftY.toFixed(2)}px`);
            });

            const resetPlanningPpaCardFloat = () => {
                card.style.setProperty("--planning-ppa-card-rotate-x", "0deg");
                card.style.setProperty("--planning-ppa-card-rotate-y", "0deg");
                card.style.setProperty("--planning-ppa-card-shift-x", "0px");
                card.style.setProperty("--planning-ppa-card-shift-y", "0px");
            };

            card.addEventListener("pointerleave", resetPlanningPpaCardFloat);
            card.addEventListener("pointercancel", resetPlanningPpaCardFloat);
        });
    };

    const renderPlanningBudgets = (records) => {
        if (!(planningBudgetCards instanceof HTMLElement)) return;

        if (!records.length) {
            if (planningEmptyState instanceof HTMLElement) {
                planningEmptyState.hidden = false;
            }
            planningBudgetCards.hidden = true;
            planningBudgetCards.innerHTML = "";
            renderPlanningSummaries([]);
            return;
        }

        if (planningEmptyState instanceof HTMLElement) {
            planningEmptyState.hidden = true;
        }
        planningBudgetCards.hidden = false;

        const cards = records
            .slice()
            .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
            .map((record) => {
                const statusMeta = getStatusMeta(record.status);
                const metrics = getBudgetMetrics(record);
                const utilization = metrics.utilization;
                const allocated = metrics.allocatedBudget;
                const remaining = metrics.remainingBudget;

                return `
                    <article class="planning-budget-card">
                        <div class="planning-budget-card-head">
                            <h4>${escapeHtml(record.budgetName)}</h4>
                            <div class="planning-budget-card-actions">
                                <button type="button" class="js-planning-edit-budget" data-record-id="${escapeHtml(record.id)}" title="Edit budget" aria-label="Edit budget">
                                    <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                                </button>
                                <button type="button" class="js-planning-delete-budget" data-record-id="${escapeHtml(record.id)}" title="Delete budget" aria-label="Delete budget">
                                    <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                                </button>
                            </div>
                        </div>
                        <span class="planning-status-chip ${statusMeta.badgeClass}">${statusMeta.badgeText}</span>
                        <div class="planning-budget-metrics">
                            <p><span>Total Budget</span><strong>${escapeHtml(formatNumber(record.totalBudget))}</strong></p>
                            <p><span>Allocated</span><strong>${escapeHtml(formatNumber(allocated))}</strong></p>
                            <p><span>Remaining Balance</span><strong class="${remaining > 0 ? "planning-value-positive" : ""}">${escapeHtml(formatNumber(remaining))}</strong></p>
                        </div>
                        <div class="planning-budget-utilization">
                            <div class="planning-budget-utilization-row">
                                <span>Utilization</span>
                                <strong>${utilization.toFixed(1)}%</strong>
                            </div>
                            <div class="planning-budget-progress-track">
                                <span class="planning-budget-progress-fill ${utilization >= 70 ? "is-high" : ""}" style="width:${utilization.toFixed(1)}%;"></span>
                            </div>
                        </div>
                    </article>
                `;
            })
            .join("");

        planningBudgetCards.innerHTML = cards;
        renderPlanningSummaries(records);
    };

    let planningBudgetRecords = readStoredBudgets();
    let editingBudgetRecordId = null;
    let editingPpaRow = null;
    let planningToastElement = null;
    let planningToastTimer = null;
    let planningConfirmOverlay = null;

    const syncPlanningModalBodyState = () => {
        const createVisible = planningBudgetModal instanceof HTMLElement && !planningBudgetModal.hidden;
        const editVisible = planningEditBudgetModal instanceof HTMLElement && !planningEditBudgetModal.hidden;
        const ppaVisible = planningPpaModal instanceof HTMLElement && !planningPpaModal.hidden;
        const editPpaVisible = planningEditPpaModal instanceof HTMLElement && !planningEditPpaModal.hidden;
        document.body.classList.toggle("planning-modal-open", createVisible || editVisible || ppaVisible || editPpaVisible);
    };

    const closePlanningToast = () => {
        if (!planningToastElement) return;
        planningToastElement.classList.remove("is-visible");
        const toastToRemove = planningToastElement;
        planningToastElement = null;
        window.setTimeout(() => {
            toastToRemove.remove();
        }, 180);
        if (planningToastTimer) {
            window.clearTimeout(planningToastTimer);
            planningToastTimer = null;
        }
    };

    const showPlanningToast = (message, variant = "success") => {
        closePlanningToast();
        const toast = document.createElement("div");
        toast.className = `planning-toast planning-toast--${variant === "info" ? "info" : "success"}`;
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.innerHTML = `
            <span class="planning-toast__icon" aria-hidden="true">
                <span class="material-symbols-outlined">${variant === "info" ? "info" : "check"}</span>
            </span>
            <span class="planning-toast__message">${escapeHtml(String(message || "").trim() || "Action completed successfully.")}</span>
        `;
        document.body.appendChild(toast);
        planningToastElement = toast;
        window.requestAnimationFrame(() => {
            toast.classList.add("is-visible");
        });
        planningToastTimer = window.setTimeout(() => {
            closePlanningToast();
        }, 3200);
    };

    const closePlanningConfirm = () => {
        if (!planningConfirmOverlay) return;
        planningConfirmOverlay.remove();
        planningConfirmOverlay = null;
    };

    const showPlanningConfirm = (options = {}) => {
        closePlanningConfirm();
        return new Promise((resolve) => {
            const titleText = String(options.title || "Delete Data").trim() || "Delete Data";
            const messageText = String(options.message || "Are you sure you want to delete this data?").trim() || "Are you sure you want to delete this data?";
            const confirmLabel = String(options.confirmLabel || "Yes, Delete").trim() || "Yes, Delete";
            const cancelLabel = String(options.cancelLabel || "Cancel").trim() || "Cancel";

            const overlay = document.createElement("div");
            overlay.className = "planning-confirm-overlay";
            overlay.innerHTML = `
                <div class="planning-confirm-dialog" role="alertdialog" aria-live="assertive">
                    <h4 class="planning-confirm-title">${escapeHtml(titleText)}</h4>
                    <p class="planning-confirm-message">${escapeHtml(messageText)}</p>
                    <div class="planning-confirm-actions">
                        <button type="button" class="planning-confirm-btn planning-confirm-btn--danger" data-action="confirm">${escapeHtml(confirmLabel)}</button>
                        <button type="button" class="planning-confirm-btn planning-confirm-btn--cancel" data-action="cancel">${escapeHtml(cancelLabel)}</button>
                    </div>
                </div>
            `;

            planningConfirmOverlay = overlay;
            document.body.appendChild(overlay);

            let settled = false;
            const settle = (approved) => {
                if (settled) return;
                settled = true;
                document.removeEventListener("keydown", onKeyDown);
                closePlanningConfirm();
                resolve(Boolean(approved));
            };

            const onKeyDown = (event) => {
                if (event.key === "Escape") {
                    settle(false);
                }
            };

            document.addEventListener("keydown", onKeyDown);

            overlay.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                if (target === overlay) {
                    settle(false);
                    return;
                }
                const actionButton = target.closest("[data-action]");
                if (!actionButton) return;
                settle(actionButton.getAttribute("data-action") === "confirm");
            });
        });
    };

    const closeStatusMenu = () => {
        if (!(statusSelect instanceof HTMLElement) || !(statusTrigger instanceof HTMLElement) || !(statusMenu instanceof HTMLElement)) {
            return;
        }
        statusSelect.classList.remove("is-open");
        statusTrigger.setAttribute("aria-expanded", "false");
        statusMenu.hidden = true;
    };

    const setStatusValue = (value) => {
        if (!(statusMenu instanceof HTMLElement)) return;
        const normalizedValue = normalizeStatus(value);
        if (statusLabel instanceof HTMLElement) {
            statusLabel.textContent = normalizedValue;
        }
        if (statusInput instanceof HTMLInputElement) {
            statusInput.value = normalizedValue;
        }
        statusMenu.querySelectorAll(".planning-status-option").forEach((option) => {
            if (!(option instanceof HTMLElement)) return;
            option.classList.toggle("is-selected", option.dataset.value === normalizedValue);
        });
    };

    const closeYearMenu = () => {
        if (!(yearSelect instanceof HTMLElement) || !(yearTrigger instanceof HTMLElement) || !(yearMenu instanceof HTMLElement)) {
            return;
        }
        yearSelect.classList.remove("is-open");
        yearTrigger.setAttribute("aria-expanded", "false");
        yearMenu.hidden = true;
    };

    const setYearValue = (value) => {
        if (!(yearMenu instanceof HTMLElement)) return;
        const normalizedValue = String(value || "").trim() || "2026";
        if (yearLabel instanceof HTMLElement) {
            yearLabel.textContent = normalizedValue;
        }
        if (yearInput instanceof HTMLInputElement) {
            yearInput.value = normalizedValue;
        }
        yearMenu.querySelectorAll(".planning-status-option").forEach((option) => {
            if (!(option instanceof HTMLElement)) return;
            option.classList.toggle("is-selected", option.dataset.value === normalizedValue);
        });
    };

    const closeEditStatusMenu = () => {
        if (!(editStatusSelect instanceof HTMLElement) || !(editStatusTrigger instanceof HTMLElement) || !(editStatusMenu instanceof HTMLElement)) {
            return;
        }
        editStatusSelect.classList.remove("is-open");
        editStatusTrigger.setAttribute("aria-expanded", "false");
        editStatusMenu.hidden = true;
    };

    const setEditStatusValue = (value) => {
        if (!(editStatusMenu instanceof HTMLElement)) return;
        const normalizedValue = normalizeStatus(value);
        if (editStatusLabel instanceof HTMLElement) {
            editStatusLabel.textContent = normalizedValue;
        }
        if (editStatusInput instanceof HTMLInputElement) {
            editStatusInput.value = normalizedValue;
        }
        editStatusMenu.querySelectorAll(".planning-status-option").forEach((option) => {
            if (!(option instanceof HTMLElement)) return;
            option.classList.toggle("is-selected", option.dataset.value === normalizedValue);
        });
    };

    const updateEditBudgetHelper = () => {
        if (!(editBudgetHelper instanceof HTMLElement) || !(editTotalBudgetInput instanceof HTMLInputElement)) {
            return;
        }
        const amount = Number(editTotalBudgetInput.value);
        editBudgetHelper.textContent = formatPhp(Number.isFinite(amount) ? amount : 0);
    };

    const openModal = () => {
        closeEditPpaModal();
        if (planningEditBudgetModal instanceof HTMLElement && !planningEditBudgetModal.hidden) {
            planningEditBudgetModal.classList.remove("is-open");
            planningEditBudgetModal.hidden = true;
            planningEditBudgetModal.setAttribute("hidden", "");
            planningEditBudgetModal.style.display = "none";
        }
        planningBudgetModal.classList.add("is-open");
        planningBudgetModal.hidden = false;
        planningBudgetModal.removeAttribute("hidden");
        planningBudgetModal.style.display = "flex";
        syncPlanningModalBodyState();
        closeStatusMenu();
        closeYearMenu();
        const initialStatus = statusInput instanceof HTMLInputElement ? statusInput.value : "Draft";
        setStatusValue(initialStatus || "Draft");
        const initialYear = yearInput instanceof HTMLInputElement ? yearInput.value : "2026";
        setYearValue(initialYear || "2026");
        window.requestAnimationFrame(() => {
            if (budgetNameInput instanceof HTMLInputElement) {
                budgetNameInput.focus();
            }
        });
    };

    const closeModal = () => {
        planningBudgetModal.classList.remove("is-open");
        planningBudgetModal.hidden = true;
        planningBudgetModal.setAttribute("hidden", "");
        planningBudgetModal.style.display = "none";
        syncPlanningModalBodyState();
        closeStatusMenu();
        closeYearMenu();
    };

    const openEditModal = (recordId) => {
        if (!(planningEditBudgetModal instanceof HTMLElement)) return;
        const record = planningBudgetRecords.find((item) => item.id === recordId);
        if (!record) return;
        editingBudgetRecordId = record.id;

        if (editBudgetSubtitle instanceof HTMLElement) {
            editBudgetSubtitle.textContent = `Update budget allocation for FY ${record.fiscalYear}`;
        }
        if (editTotalBudgetInput instanceof HTMLInputElement) {
            editTotalBudgetInput.value = Number(record.totalBudget || 0).toFixed(2);
        }
        if (editRemarksInput instanceof HTMLTextAreaElement) {
            editRemarksInput.value = record.remarks || "";
        }
        setEditStatusValue(record.status || "Draft");
        updateEditBudgetHelper();
        closeEditStatusMenu();

        closeModal();
        closeEditPpaModal();
        planningEditBudgetModal.classList.add("is-open");
        planningEditBudgetModal.hidden = false;
        planningEditBudgetModal.removeAttribute("hidden");
        planningEditBudgetModal.style.display = "flex";
        syncPlanningModalBodyState();

        window.requestAnimationFrame(() => {
            if (editTotalBudgetInput instanceof HTMLInputElement) {
                editTotalBudgetInput.focus();
                editTotalBudgetInput.select();
            }
        });
    };

    const closeEditModal = () => {
        if (!(planningEditBudgetModal instanceof HTMLElement)) return;
        planningEditBudgetModal.classList.remove("is-open");
        planningEditBudgetModal.hidden = true;
        planningEditBudgetModal.setAttribute("hidden", "");
        planningEditBudgetModal.style.display = "none";
        editingBudgetRecordId = null;
        syncPlanningModalBodyState();
        closeEditStatusMenu();
    };

    const openPpaModal = () => {
        if (!(planningPpaModal instanceof HTMLElement)) return;
        closeModal();
        closeEditModal();
        closeEditPpaModal();
        planningPpaModal.classList.add("is-open");
        planningPpaModal.hidden = false;
        planningPpaModal.removeAttribute("hidden");
        planningPpaModal.style.display = "flex";
        syncPlanningModalBodyState();
        closePpaFormSelectMenus();
        window.requestAnimationFrame(() => {
            if (ppaProjectTitleInput instanceof HTMLInputElement) {
                ppaProjectTitleInput.focus();
            }
        });
    };

    const closePpaModal = () => {
        if (!(planningPpaModal instanceof HTMLElement)) return;
        planningPpaModal.classList.remove("is-open");
        planningPpaModal.hidden = true;
        planningPpaModal.setAttribute("hidden", "");
        planningPpaModal.style.display = "none";
        syncPlanningModalBodyState();
        closePpaFormSelectMenus();
    };

    const openEditPpaModal = (row) => {
        if (!(planningEditPpaModal instanceof HTMLElement) || !(row instanceof HTMLTableRowElement)) return;
        const firstCell = row.cells[0];
        const fundCell = row.cells[1];
        const statusCell = row.cells[2];
        const amountCell = row.cells[3];

        if (!firstCell || !fundCell || !statusCell || !amountCell) return;

        const nameValue = firstCell.querySelector("strong")?.textContent?.trim() || "";
        const idValue = (firstCell.querySelector("small")?.textContent || "").replace(/^ID:\s*/i, "").trim();
        const fundValue = fundCell.textContent?.trim() || "";
        const statusValue = normalizePpaStatus(statusCell.querySelector(".planning-ppa-status")?.textContent || statusCell.textContent || "");
        const amountValue = parseCurrencyValue(amountCell.textContent || "");

        editingPpaRow = row;

        if (editPpaSubtitle instanceof HTMLElement) {
            editPpaSubtitle.textContent = `Update project details for ${nameValue || "the selected record"}`;
        }
        if (editPpaNameInput instanceof HTMLInputElement) {
            editPpaNameInput.value = nameValue;
        }
        if (editPpaIdInput instanceof HTMLInputElement) {
            editPpaIdInput.value = idValue;
        }
        if (editPpaFundInput instanceof HTMLInputElement) {
            editPpaFundInput.value = fundValue;
        }
        if (editPpaAmountInput instanceof HTMLInputElement) {
            editPpaAmountInput.value = amountValue.toFixed(2);
        }
        if (editPpaStatusSelect instanceof HTMLElement) {
            setPpaFormSelectValue(editPpaStatusSelect, statusValue);
        }

        closeModal();
        closeEditModal();
        closePpaModal();
        planningEditPpaModal.classList.add("is-open");
        planningEditPpaModal.hidden = false;
        planningEditPpaModal.removeAttribute("hidden");
        planningEditPpaModal.style.display = "flex";
        syncPlanningModalBodyState();

        window.requestAnimationFrame(() => {
            if (editPpaNameInput instanceof HTMLInputElement) {
                editPpaNameInput.focus();
                editPpaNameInput.select();
            }
        });
    };

    const closeEditPpaModal = () => {
        if (!(planningEditPpaModal instanceof HTMLElement)) return;
        planningEditPpaModal.classList.remove("is-open");
        planningEditPpaModal.hidden = true;
        planningEditPpaModal.setAttribute("hidden", "");
        planningEditPpaModal.style.display = "none";
        editingPpaRow = null;
        syncPlanningModalBodyState();
        closePpaFormSelectMenus();
    };

    closeModal();
    closeEditModal();
    closePpaModal();
    closeEditPpaModal();

    if (planningTabs.length && planningPanels.length) {
        planningTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActivePlanningPanel(tab.dataset.planningTab || "budget");
            });
        });
        const initialPanel = document.querySelector(".planning-tab.is-active")?.getAttribute("data-planning-tab") || "budget";
        setActivePlanningPanel(initialPanel);
    }

    if (ppaFilterSelects.length) {
        ppaFilterSelects.forEach((selectRoot) => {
            if (!(selectRoot instanceof HTMLElement)) return;
            const trigger = selectRoot.querySelector(".js-planning-ppa-trigger");
            const menu = selectRoot.querySelector(".js-planning-ppa-menu");
            const options = selectRoot.querySelectorAll(".planning-ppa-option");
            const initialOption = selectRoot.querySelector(".planning-ppa-option.is-selected");
            if (initialOption instanceof HTMLElement) {
                setPpaFilterValue(selectRoot, initialOption.dataset.value || "");
            }

            if (trigger instanceof HTMLElement && menu instanceof HTMLElement) {
                trigger.addEventListener("click", () => {
                    const willOpen = menu.hidden;
                    if (!willOpen) {
                        closePpaFilterMenus();
                        return;
                    }
                    closePpaFilterMenus(selectRoot);
                    selectRoot.classList.add("is-open");
                    trigger.setAttribute("aria-expanded", "true");
                    menu.hidden = false;
                });
            }

            options.forEach((option) => {
                option.addEventListener("click", () => {
                    if (!(option instanceof HTMLElement)) return;
                    setPpaFilterValue(selectRoot, option.dataset.value || "");
                    closePpaFilterMenus();
                });
            });
        });
    }

    if (ppaFormSelects.length) {
        ppaFormSelects.forEach((selectRoot) => {
            if (!(selectRoot instanceof HTMLElement)) return;
            const trigger = selectRoot.querySelector(".js-planning-ppa-form-trigger");
            const menu = selectRoot.querySelector(".js-planning-ppa-form-menu");
            const options = selectRoot.querySelectorAll(".planning-ppa-form-option");
            const initialOption = selectRoot.querySelector(".planning-ppa-form-option.is-selected");

            if (initialOption instanceof HTMLElement) {
                setPpaFormSelectValue(selectRoot, initialOption.dataset.value || "");
            }

            if (trigger instanceof HTMLElement && menu instanceof HTMLElement) {
                trigger.addEventListener("click", () => {
                    const willOpen = menu.hidden;
                    if (!willOpen) {
                        closePpaFormSelectMenus();
                        return;
                    }
                    closePpaFormSelectMenus(selectRoot);
                    selectRoot.classList.add("is-open");
                    trigger.setAttribute("aria-expanded", "true");
                    menu.hidden = false;
                });
            }

            options.forEach((option) => {
                option.addEventListener("click", () => {
                    if (!(option instanceof HTMLElement)) return;
                    setPpaFormSelectValue(selectRoot, option.dataset.value || "");
                    closePpaFormSelectMenus();
                });
            });
        });
    }

    document.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const openPpaButton = target.closest(".planning-new-ppa-btn");
        if (openPpaButton) {
            event.preventDefault();
            openPpaModal();
            return;
        }

        const openButton = target.closest(".planning-new-budget-btn");
        if (openButton) {
            event.preventDefault();
            openModal();
            return;
        }

        const closeButton = target.closest(".js-close-planning-budget-modal");
        if (closeButton) {
            closeModal();
            return;
        }

        const closeEditButton = target.closest(".js-close-planning-edit-modal");
        if (closeEditButton) {
            closeEditModal();
            return;
        }

        const closePpaButton = target.closest(".js-close-planning-ppa-modal");
        if (closePpaButton) {
            closePpaModal();
            return;
        }

        const closeEditPpaButton = target.closest(".js-close-planning-edit-ppa-modal");
        if (closeEditPpaButton) {
            closeEditPpaModal();
            return;
        }

        const editButton = target.closest(".js-planning-edit-budget");
        if (editButton) {
            const recordId = editButton.getAttribute("data-record-id");
            if (!recordId) return;
            openEditModal(recordId);
            return;
        }

        const editPpaButton = target.closest(".js-planning-edit-ppa");
        if (editPpaButton) {
            const row = editPpaButton.closest("tr");
            if (!(row instanceof HTMLTableRowElement)) return;
            openEditPpaModal(row);
            return;
        }

        const deletePpaButton = target.closest(".planning-ppa-action-btn.is-delete");
        if (deletePpaButton) {
            const row = deletePpaButton.closest("tr");
            if (!(row instanceof HTMLTableRowElement)) return;
            const approved = await showPlanningConfirm({
                title: "Delete Data",
                message: "Are you sure to delete this data?",
                confirmLabel: "Yes, Delete",
                cancelLabel: "Cancel",
            });
            if (!approved) return;
            if (editingPpaRow === row) {
                editingPpaRow = null;
            }
            row.remove();
            syncPpaTableState();
            showPlanningToast("The data is permanently deleted.", "info");
            return;
        }

        const deleteButton = target.closest(".js-planning-delete-budget");
        if (deleteButton) {
            const recordId = deleteButton.getAttribute("data-record-id");
            if (!recordId) return;
            const approved = await showPlanningConfirm({
                title: "Delete Budget",
                message: "Are you sure you want to delete this budget record?",
                confirmLabel: "Yes, Delete",
                cancelLabel: "Cancel",
            });
            if (!approved) return;
            planningBudgetRecords = planningBudgetRecords.filter((record) => record.id !== recordId);
            writeStoredBudgets(planningBudgetRecords);
            renderPlanningBudgets(planningBudgetRecords);
            showPlanningToast("Budget record deleted successfully.", "info");
            return;
        }

        if (target === planningBudgetModal) {
            closeModal();
            return;
        }

        if (target === planningEditBudgetModal) {
            closeEditModal();
            return;
        }

        if (target === planningPpaModal) {
            closePpaModal();
            return;
        }

        if (target === planningEditPpaModal) {
            closeEditPpaModal();
        }
    });

    closeModalButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closeModal();
        });
    });

    closeEditModalButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closeEditModal();
        });
    });

    closeEditPpaModalButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closeEditPpaModal();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closePpaFilterMenus();
        if (planningEditPpaModal instanceof HTMLElement && !planningEditPpaModal.hidden) {
            closeEditPpaModal();
            return;
        }
        if (planningEditBudgetModal instanceof HTMLElement && !planningEditBudgetModal.hidden) {
            closeEditModal();
            return;
        }
        if (planningPpaModal instanceof HTMLElement && !planningPpaModal.hidden) {
            closePpaModal();
            return;
        }
        if (!planningBudgetModal.hidden) {
            closeModal();
        }
    });

    if (
        statusSelect instanceof HTMLElement
        && statusTrigger instanceof HTMLElement
        && statusMenu instanceof HTMLElement
    ) {
        statusTrigger.addEventListener("click", () => {
            const willOpen = statusMenu.hidden;
            if (!willOpen) {
                closeStatusMenu();
                return;
            }
            statusSelect.classList.add("is-open");
            statusTrigger.setAttribute("aria-expanded", "true");
            statusMenu.hidden = false;
        });

        statusMenu.querySelectorAll(".planning-status-option").forEach((option) => {
            option.addEventListener("click", () => {
                if (!(option instanceof HTMLElement)) return;
                setStatusValue(option.dataset.value || "Draft");
                closeStatusMenu();
            });
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (!statusSelect.contains(target)) {
                closeStatusMenu();
            }
        });
    }

    if (
        yearSelect instanceof HTMLElement
        && yearTrigger instanceof HTMLElement
        && yearMenu instanceof HTMLElement
    ) {
        yearTrigger.addEventListener("click", () => {
            const willOpen = yearMenu.hidden;
            if (!willOpen) {
                closeYearMenu();
                return;
            }
            yearSelect.classList.add("is-open");
            yearTrigger.setAttribute("aria-expanded", "true");
            yearMenu.hidden = false;
        });

        yearMenu.querySelectorAll(".planning-status-option").forEach((option) => {
            option.addEventListener("click", () => {
                if (!(option instanceof HTMLElement)) return;
                setYearValue(option.dataset.value || "2026");
                closeYearMenu();
            });
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (!yearSelect.contains(target)) {
                closeYearMenu();
            }
        });
    }

    if (
        editStatusSelect instanceof HTMLElement
        && editStatusTrigger instanceof HTMLElement
        && editStatusMenu instanceof HTMLElement
    ) {
        editStatusTrigger.addEventListener("click", () => {
            const willOpen = editStatusMenu.hidden;
            if (!willOpen) {
                closeEditStatusMenu();
                return;
            }
            editStatusSelect.classList.add("is-open");
            editStatusTrigger.setAttribute("aria-expanded", "true");
            editStatusMenu.hidden = false;
        });

        editStatusMenu.querySelectorAll(".planning-status-option").forEach((option) => {
            option.addEventListener("click", () => {
                if (!(option instanceof HTMLElement)) return;
                setEditStatusValue(option.dataset.value || "Draft");
                closeEditStatusMenu();
            });
        });

        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (!editStatusSelect.contains(target)) {
                closeEditStatusMenu();
            }
        });
    }

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        const clickedInsidePpaSelect = Array.from(ppaFilterSelects).some((selectRoot) => {
            return selectRoot instanceof HTMLElement && selectRoot.contains(target);
        });
        if (!clickedInsidePpaSelect) {
            closePpaFilterMenus();
        }
    });

    if (editTotalBudgetInput instanceof HTMLInputElement) {
        editTotalBudgetInput.addEventListener("input", () => {
            updateEditBudgetHelper();
        });
    }

    if (budgetForm instanceof HTMLFormElement) {
        budgetForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(budgetForm);
            const budgetName = String(formData.get("budget_name") || "").trim();
            const fiscalYear = String(formData.get("fiscal_year") || "").trim();
            const totalBudget = Number(formData.get("total_budget"));
            const status = normalizeStatus(statusInput instanceof HTMLInputElement ? statusInput.value : formData.get("status"));
            const remarks = String(formData.get("remarks") || "").trim();

            if (!budgetName || !fiscalYear || !Number.isFinite(totalBudget) || totalBudget < 0) {
                showPeoGeneralToast("Please complete all required fields before creating a budget.", {
                    title: "Planning Division",
                    variant: "warning",
                });
                return;
            }

            planningBudgetRecords.unshift({
                id: `planning_budget_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                budgetName,
                fiscalYear,
                totalBudget,
                status,
                remarks,
                createdAt: Date.now(),
            });

            writeStoredBudgets(planningBudgetRecords);
            renderPlanningBudgets(planningBudgetRecords);
            budgetForm.reset();
            setStatusValue("Draft");
            setYearValue("2026");
            closeModal();
            showPlanningToast("New budget added successfully.", "success");
        });
    }

    if (editBudgetForm instanceof HTMLFormElement) {
        editBudgetForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!editingBudgetRecordId) {
                closeEditModal();
                return;
            }

            const totalBudget = Number(editTotalBudgetInput instanceof HTMLInputElement ? editTotalBudgetInput.value : NaN);
            const status = normalizeStatus(editStatusInput instanceof HTMLInputElement ? editStatusInput.value : "Draft");
            const remarks = String(editRemarksInput instanceof HTMLTextAreaElement ? editRemarksInput.value : "").trim();

            if (!Number.isFinite(totalBudget) || totalBudget < 0) {
                showPeoGeneralToast("Please enter a valid total budget.", {
                    title: "Planning Division",
                    variant: "warning",
                });
                return;
            }

            planningBudgetRecords = planningBudgetRecords.map((record) => {
                if (record.id !== editingBudgetRecordId) return record;
                return {
                    ...record,
                    totalBudget,
                    status,
                    remarks,
                };
            });

            writeStoredBudgets(planningBudgetRecords);
            renderPlanningBudgets(planningBudgetRecords);
            closeEditModal();
            showPlanningToast("Budget data updated successfully.", "success");
        });
    }

    if (editPpaForm instanceof HTMLFormElement) {
        editPpaForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!(editingPpaRow instanceof HTMLTableRowElement)) {
                closeEditPpaModal();
                return;
            }

            const projectName = String(editPpaNameInput instanceof HTMLInputElement ? editPpaNameInput.value : "").trim();
            const projectId = String(editPpaIdInput instanceof HTMLInputElement ? editPpaIdInput.value : "").trim();
            const fundSource = String(editPpaFundInput instanceof HTMLInputElement ? editPpaFundInput.value : "").trim();
            const amount = Number(editPpaAmountInput instanceof HTMLInputElement ? editPpaAmountInput.value : NaN);
            const status = normalizePpaStatus(editPpaStatusInput instanceof HTMLInputElement ? editPpaStatusInput.value : "Draft");

            if (!projectName || !projectId || !fundSource || !Number.isFinite(amount) || amount < 0) {
                showPeoGeneralToast("Please complete all PPA edit fields with valid values.", {
                    title: "Planning Division",
                    variant: "warning",
                });
                return;
            }

            const firstCell = editingPpaRow.cells[0];
            const fundCell = editingPpaRow.cells[1];
            const statusCell = editingPpaRow.cells[2];
            const amountCell = editingPpaRow.cells[3];

            if (!firstCell || !fundCell || !statusCell || !amountCell) {
                closeEditPpaModal();
                return;
            }

            let titleElement = firstCell.querySelector("strong");
            if (!(titleElement instanceof HTMLElement)) {
                titleElement = document.createElement("strong");
                firstCell.prepend(titleElement);
            }
            titleElement.textContent = projectName;

            let idElement = firstCell.querySelector("small");
            if (!(idElement instanceof HTMLElement)) {
                idElement = document.createElement("small");
                firstCell.appendChild(idElement);
            }
            idElement.textContent = `ID: ${projectId}`;

            fundCell.textContent = fundSource;

            let statusElement = statusCell.querySelector(".planning-ppa-status");
            if (!(statusElement instanceof HTMLElement)) {
                statusElement = document.createElement("span");
                statusElement.className = "planning-ppa-status";
                statusCell.textContent = "";
                statusCell.appendChild(statusElement);
            }
            statusElement.className = `planning-ppa-status ${getPpaStatusClassName(status)}`;
            statusElement.textContent = status;

            amountCell.textContent = formatPhp(amount);

            closeEditPpaModal();
            showPlanningToast("PPA record updated successfully.", "success");
        });
    }

        renderPlanningBudgets(planningBudgetRecords);
        removePlanningPpaSampleRows();
        syncPpaTableState();
        enablePlanningPpaCardFloat();
    }

    const projectBoard = document.querySelector(".project-board");
    if (projectBoard) {
        const projectBody = document.body;
        const projectModal = projectBoard.querySelector(".js-project-modal");
        const deleteModal = projectBoard.querySelector(".js-project-delete-modal");
        const projectForm = projectBoard.querySelector("[data-project-form]");
        const projectTableBody = projectBoard.querySelector("[data-project-table-body]");
        const projectResultsSummary = projectBoard.querySelector("[data-project-results-summary]");
        const projectPanelTitle = projectBoard.querySelector(".js-project-panel-title");
        const projectPanelSubtitle = projectBoard.querySelector(".js-project-panel-subtitle");
        const divisionFilter = projectBoard.querySelector('[data-project-filter="division"]');
        const projectFilterSelects = projectBoard.querySelectorAll(".project-filter select[data-project-filter]");
        const projectTotalSummary = projectBoard.querySelector('[data-project-summary="total"]');
        const projectBudgetSummary = projectBoard.querySelector('[data-project-summary="budget"]');
        const projectApprovedSummary = projectBoard.querySelector('[data-project-summary="approved"]');
        const projectPlanningSummary = projectBoard.querySelector("#project-summary-planning");
        const projectApprovedTotalSummary = projectBoard.querySelector("#project-summary-approved-total");
        const projectOngoingSummary = projectBoard.querySelector("#project-summary-ongoing");
        const projectCompletedSummary = projectBoard.querySelector("#project-summary-completed");
        const projectOnHoldSummary = projectBoard.querySelector("#project-summary-onhold");
        const divisionSummaryCards = projectBoard.querySelectorAll("[data-project-division-count]");
        const divisionCards = projectBoard.querySelectorAll("[data-project-division-card]");
        const projectFloatCards = projectBoard.querySelectorAll(".project-float-card");
        const openProjectButtons = projectBoard.querySelectorAll(".js-project-open-modal");
        const closeProjectButtons = projectBoard.querySelectorAll(".js-project-close-modal");
        const closeDeleteButtons = projectBoard.querySelectorAll(".js-project-close-delete-modal");
        const projectFilterDropdownSyncers = [];

        const formatProjectCurrency = (amount) => {
            const numericAmount = Number.isFinite(amount) ? amount : 0;
            return new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(numericAmount);
        };

        const parseProjectAmount = (value) => {
            const normalizedValue = String(value || "").replace(/[^0-9.-]/g, "");
            const parsedValue = Number.parseFloat(normalizedValue);
            return Number.isFinite(parsedValue) ? parsedValue : 0;
        };

        const escapeProjectHtml = (value) =>
            String(value || "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#39;");

        const enhanceProjectFilterSelect = (select) => {
            if (!(select instanceof HTMLSelectElement)) {
                return;
            }

            const projectFilterRoot = select.closest(".project-filter");
            if (!(projectFilterRoot instanceof HTMLElement) || projectFilterRoot.querySelector(".project-filter-dropdown")) {
                return;
            }

            select.classList.add("project-filter-select-hidden");

            const dropdownRoot = document.createElement("div");
            dropdownRoot.className = "project-filter-dropdown";
            dropdownRoot.innerHTML = `
                <button type="button" class="project-filter-dropdown__trigger" aria-haspopup="listbox" aria-expanded="false">
                    <span class="project-filter-dropdown__label"></span>
                    <span class="material-symbols-outlined project-filter-dropdown__caret" aria-hidden="true">expand_more</span>
                </button>
                <div class="project-filter-dropdown__menu-wrap">
                    <ul class="project-filter-dropdown__menu" role="listbox"></ul>
                </div>
            `;
            projectFilterRoot.appendChild(dropdownRoot);

            const trigger = dropdownRoot.querySelector(".project-filter-dropdown__trigger");
            const label = dropdownRoot.querySelector(".project-filter-dropdown__label");
            const menu = dropdownRoot.querySelector(".project-filter-dropdown__menu");

            const syncSelectOptionAttributes = () => {
                Array.from(select.options).forEach((option) => {
                    const isSelected = option.value === select.value;
                    option.selected = isSelected;
                    option.toggleAttribute("selected", isSelected);
                });
            };

            const closeDropdown = () => {
                dropdownRoot.classList.remove("is-open");
                if (trigger instanceof HTMLElement) {
                    trigger.setAttribute("aria-expanded", "false");
                }
            };

            const renderDropdown = () => {
                if (!(menu instanceof HTMLElement) || !(label instanceof HTMLElement)) {
                    return;
                }

                syncSelectOptionAttributes();
                const selectedOption = select.options[select.selectedIndex];
                label.textContent = selectedOption?.textContent?.trim() || "Select";

                menu.innerHTML = Array.from(select.options).map((option) => {
                    const optionValue = String(option.value || "").trim();
                    const optionLabel = String(option.textContent || "").trim();
                    const isSelected = option.selected;
                    return `
                        <li>
                            <button
                                type="button"
                                class="project-filter-dropdown__option${isSelected ? " is-selected" : ""}"
                                data-value="${escapeProjectHtml(optionValue)}"
                                role="option"
                                aria-selected="${isSelected ? "true" : "false"}"
                            >
                                <span>${escapeProjectHtml(optionLabel)}</span>
                            </button>
                        </li>
                    `;
                }).join("");
            };

            if (trigger instanceof HTMLElement) {
                trigger.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    projectBoard.querySelectorAll(".project-filter-dropdown.is-open").forEach((dropdown) => {
                        if (dropdown !== dropdownRoot) {
                            dropdown.classList.remove("is-open");
                            const dropdownTrigger = dropdown.querySelector(".project-filter-dropdown__trigger");
                            if (dropdownTrigger instanceof HTMLElement) {
                                dropdownTrigger.setAttribute("aria-expanded", "false");
                            }
                        }
                    });
                    const opening = !dropdownRoot.classList.contains("is-open");
                    dropdownRoot.classList.toggle("is-open", opening);
                    trigger.setAttribute("aria-expanded", opening ? "true" : "false");
                });
            }

            if (menu instanceof HTMLElement) {
                menu.addEventListener("click", (event) => {
                    const optionButton = event.target.closest(".project-filter-dropdown__option");
                    if (!(optionButton instanceof HTMLButtonElement)) {
                        return;
                    }

                    const nextValue = String(optionButton.dataset.value || "").trim();
                    if (select.value !== nextValue) {
                        select.value = nextValue;
                        syncSelectOptionAttributes();
                        select.dispatchEvent(new Event("change", { bubbles: true }));
                    } else {
                        renderDropdown();
                    }
                    closeDropdown();
                });
            }

            document.addEventListener("click", (event) => {
                if (!dropdownRoot.contains(event.target)) {
                    closeDropdown();
                }
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    closeDropdown();
                }
            });

            renderDropdown();
            projectFilterDropdownSyncers.push(renderDropdown);
        };

        const getProjectRows = () => {
            if (!(projectTableBody instanceof HTMLElement)) return [];
            return Array.from(projectTableBody.querySelectorAll("tr")).filter((row) => {
                return row instanceof HTMLTableRowElement && row.dataset.projectEmptyRow !== "true";
            });
        };

        const syncActiveProjectDivision = (divisionName) => {
            const normalizedDivision = String(divisionName || "").trim();
            const effectiveDivision = normalizedDivision || "Admin Division";
            const isAllDivisions = effectiveDivision.toLowerCase() === "all divisions" || effectiveDivision.toLowerCase() === "all";

            if (projectPanelTitle instanceof HTMLElement) {
                projectPanelTitle.textContent = isAllDivisions
                    ? "All Division Projects"
                    : `${effectiveDivision} Projects`;
            }

            if (projectPanelSubtitle instanceof HTMLElement) {
                projectPanelSubtitle.textContent = isAllDivisions
                    ? "Showing project records and activity across all divisions."
                    : "Showing project records and activity for the selected division.";
            }

            divisionCards.forEach((card) => {
                const cardDivision = String(card.getAttribute("data-project-division-card") || "").trim();
                const isActive = !isAllDivisions && cardDivision === effectiveDivision;
                card.classList.toggle("is-active", isActive);
            });

            if (divisionFilter instanceof HTMLSelectElement && divisionFilter.value !== effectiveDivision) {
                divisionFilter.value = effectiveDivision;
            }
            projectFilterDropdownSyncers.forEach((syncDropdown) => syncDropdown());
        };

        const syncProjectRegistrySummary = () => {
            const rows = getProjectRows();
            const divisionCounts = {
                "Admin Division": 0,
                "Planning Division": 0,
                "Construction Division": 0,
                "Quality Division": 0,
                "Maintenance Division": 0,
            };
            let totalBudget = 0;
            let approvedCount = 0;
            let planningCount = 0;
            let ongoingCount = 0;
            let completedCount = 0;
            let onHoldCount = 0;

            rows.forEach((row) => {
                const divisionValue = String(row.cells[1]?.textContent || "").trim();
                const amountValue = parseProjectAmount(row.cells[3]?.textContent || "");
                const statusValue = String(row.cells[4]?.textContent || "").trim().toLowerCase();

                if (divisionValue in divisionCounts) {
                    divisionCounts[divisionValue] += 1;
                }
                totalBudget += amountValue;
                if (statusValue.includes("approved")) {
                    approvedCount += 1;
                }
                if (statusValue.includes("in planning")) {
                    planningCount += 1;
                }
                if (statusValue.includes("ongoing")) {
                    ongoingCount += 1;
                }
                if (statusValue.includes("completed")) {
                    completedCount += 1;
                }
                if (statusValue.includes("on hold")) {
                    onHoldCount += 1;
                }
            });

            if (projectTotalSummary instanceof HTMLElement) {
                projectTotalSummary.textContent = String(rows.length);
            }
            if (projectBudgetSummary instanceof HTMLElement) {
                projectBudgetSummary.textContent = formatProjectCurrency(totalBudget);
            }
            if (projectApprovedSummary instanceof HTMLElement) {
                projectApprovedSummary.textContent = String(approvedCount);
            }
            if (projectPlanningSummary instanceof HTMLElement) {
                projectPlanningSummary.textContent = String(planningCount);
            }
            if (projectApprovedTotalSummary instanceof HTMLElement) {
                projectApprovedTotalSummary.textContent = String(approvedCount);
            }
            if (projectOngoingSummary instanceof HTMLElement) {
                projectOngoingSummary.textContent = String(ongoingCount);
            }
            if (projectCompletedSummary instanceof HTMLElement) {
                projectCompletedSummary.textContent = String(completedCount);
            }
            if (projectOnHoldSummary instanceof HTMLElement) {
                projectOnHoldSummary.textContent = String(onHoldCount);
            }
            if (projectResultsSummary instanceof HTMLElement) {
                projectResultsSummary.textContent = rows.length
                    ? `${rows.length} project record${rows.length === 1 ? "" : "s"} in the registry.`
                    : "No project records available.";
            }

            divisionSummaryCards.forEach((card) => {
                const divisionName = String(card.getAttribute("data-project-division-count") || "").trim();
                const count = divisionCounts[divisionName] || 0;
                card.textContent = `${count} active project${count === 1 ? "" : "s"}`;
            });
        };

        const enableProjectCardFloat = () => {
            if (!projectFloatCards.length) return;
            if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

            projectFloatCards.forEach((card) => {
                if (!(card instanceof HTMLElement)) return;

                card.addEventListener("pointermove", (event) => {
                    const bounds = card.getBoundingClientRect();
                    const relativeX = (event.clientX - bounds.left) / bounds.width;
                    const relativeY = (event.clientY - bounds.top) / bounds.height;
                    const rotateY = (relativeX - 0.5) * 9;
                    const rotateX = (0.5 - relativeY) * 9;
                    const shiftX = (relativeX - 0.5) * 8;
                    const shiftY = (relativeY - 0.5) * 8;

                    card.style.setProperty("--project-card-rotate-x", `${rotateX.toFixed(2)}deg`);
                    card.style.setProperty("--project-card-rotate-y", `${rotateY.toFixed(2)}deg`);
                    card.style.setProperty("--project-card-shift-x", `${shiftX.toFixed(2)}px`);
                    card.style.setProperty("--project-card-shift-y", `${shiftY.toFixed(2)}px`);
                });

                const resetProjectCardFloat = () => {
                    card.style.setProperty("--project-card-rotate-x", "0deg");
                    card.style.setProperty("--project-card-rotate-y", "0deg");
                    card.style.setProperty("--project-card-shift-x", "0px");
                    card.style.setProperty("--project-card-shift-y", "0px");
                };

                card.addEventListener("pointerleave", resetProjectCardFloat);
                card.addEventListener("pointercancel", resetProjectCardFloat);
            });
        };

        const syncProjectModalState = () => {
            const hasVisibleModal = [projectModal, deleteModal].some((modal) => {
                return modal instanceof HTMLElement && !modal.hidden;
            });
            projectBody.classList.toggle("project-modal-open", hasVisibleModal);
        };

        const closeProjectModal = () => {
            if (projectModal instanceof HTMLElement) {
                projectModal.hidden = true;
            }
            syncProjectModalState();
        };

        const openProjectModal = () => {
            if (!(projectModal instanceof HTMLElement)) return;
            if (deleteModal instanceof HTMLElement) {
                deleteModal.hidden = true;
            }
            projectModal.hidden = false;
            syncProjectModalState();
            const firstInput = projectForm?.querySelector('input[name="project_name"]');
            if (firstInput instanceof HTMLInputElement) {
                window.setTimeout(() => firstInput.focus(), 0);
            }
        };

        const closeDeleteModal = () => {
            if (deleteModal instanceof HTMLElement) {
                deleteModal.hidden = true;
            }
            syncProjectModalState();
        };

        closeProjectModal();
        closeDeleteModal();

        openProjectButtons.forEach((button) => {
            button.addEventListener("click", () => {
                openProjectModal();
            });
        });

        closeProjectButtons.forEach((button) => {
            button.addEventListener("click", () => {
                closeProjectModal();
            });
        });

        closeDeleteButtons.forEach((button) => {
            button.addEventListener("click", () => {
                closeDeleteModal();
            });
        });

        [projectModal, deleteModal].forEach((modal) => {
            if (!(modal instanceof HTMLElement)) return;
            modal.addEventListener("click", (event) => {
                if (event.target !== modal) return;
                if (modal === projectModal) {
                    closeProjectModal();
                    return;
                }
                closeDeleteModal();
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            if (deleteModal instanceof HTMLElement && !deleteModal.hidden) {
                closeDeleteModal();
                return;
            }
            if (projectModal instanceof HTMLElement && !projectModal.hidden) {
                closeProjectModal();
            }
        });

        divisionCards.forEach((card) => {
            card.addEventListener("click", () => {
                const nextDivision = String(card.getAttribute("data-project-division-card") || "").trim();
                if (!nextDivision) return;
                syncActiveProjectDivision(nextDivision);
            });
        });

        if (divisionFilter instanceof HTMLSelectElement) {
            divisionFilter.addEventListener("change", () => {
                syncActiveProjectDivision(divisionFilter.value);
            });
        }

        projectFilterSelects.forEach((select) => {
            enhanceProjectFilterSelect(select);
        });

        enhanceAdminFormSelects(projectForm);

        syncProjectRegistrySummary();
        syncActiveProjectDivision(divisionFilter instanceof HTMLSelectElement ? divisionFilter.value : "Admin Division");
        enableProjectCardFloat();

        if (projectTableBody instanceof HTMLElement && typeof MutationObserver !== "undefined") {
            const projectSummaryObserver = new MutationObserver(() => {
                syncProjectRegistrySummary();
            });
            projectSummaryObserver.observe(projectTableBody, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }
    }

});
/* PLANNING_DIVISION_MODAL_SCRIPT_END */

const peoEscapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

let peoGeneralToastElement = null;
let peoGeneralToastTimer = null;
let peoGeneralConfirmElement = null;
const PEO_PERSISTED_TOAST_KEY = "peo_persisted_system_toast_v1";

const closePeoGeneralToast = () => {
    if (!(peoGeneralToastElement instanceof HTMLElement)) return;
    peoGeneralToastElement.classList.remove("is-visible");
    const toastToRemove = peoGeneralToastElement;
    peoGeneralToastElement = null;
    window.setTimeout(() => {
        toastToRemove.remove();
    }, 180);
    if (peoGeneralToastTimer) {
        window.clearTimeout(peoGeneralToastTimer);
        peoGeneralToastTimer = null;
    }
};

const showPeoGeneralToast = (message, options = {}) => {
    const text = String(message || "").trim() || "Action completed successfully.";
    const variant = ["success", "info", "warning", "danger"].includes(String(options.variant || "").trim())
        ? String(options.variant).trim()
        : "success";
    const title = String(options.title || "").trim();
    const iconMap = {
        success: "check_circle",
        info: "info",
        warning: "warning",
        danger: "error",
    };

    closePeoGeneralToast();

    const toast = document.createElement("aside");
    toast.className = `peo-general-toast is-${variant}`;
    toast.setAttribute("role", variant === "danger" ? "alert" : "status");
    toast.setAttribute("aria-live", variant === "danger" ? "assertive" : "polite");
    toast.innerHTML = `
        <span class="peo-general-toast__icon material-symbols-outlined" aria-hidden="true">${iconMap[variant]}</span>
        <div class="peo-general-toast__content">
            ${title ? `<strong class="peo-general-toast__title">${peoEscapeHtml(title)}</strong>` : ""}
            <span class="peo-general-toast__message">${peoEscapeHtml(text)}</span>
        </div>
    `;

    document.body.appendChild(toast);
    peoGeneralToastElement = toast;
    window.requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });

    const duration = Number(options.duration);
    peoGeneralToastTimer = window.setTimeout(() => {
        closePeoGeneralToast();
    }, Number.isFinite(duration) && duration > 0 ? duration : 3200);

    return toast;
};

const closePeoGeneralConfirm = () => {
    if (!(peoGeneralConfirmElement instanceof HTMLElement)) return;
    peoGeneralConfirmElement.remove();
    peoGeneralConfirmElement = null;
};

const showPeoGeneralConfirm = (options = {}) => {
    closePeoGeneralConfirm();

    return new Promise((resolve) => {
        const variant = ["danger", "warning", "info"].includes(String(options.variant || "").trim())
            ? String(options.variant).trim()
            : "danger";
        const titleText = String(options.title || "Confirm Action").trim() || "Confirm Action";
        const messageText = String(options.message || "Are you sure you want to continue?").trim() || "Are you sure you want to continue?";
        const confirmLabel = String(options.confirmLabel || "Confirm").trim() || "Confirm";
        const cancelLabel = String(options.cancelLabel || "Cancel").trim() || "Cancel";
        const iconMap = {
            danger: "delete_forever",
            warning: "warning",
            info: "help",
        };

        const overlay = document.createElement("div");
        overlay.className = "peo-general-confirm";
        overlay.setAttribute("role", "alertdialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-live", "assertive");
        overlay.innerHTML = `
            <div class="peo-general-confirm__dialog is-${variant}">
                <div class="peo-general-confirm__head">
                    <span class="peo-general-confirm__icon material-symbols-outlined" aria-hidden="true">${iconMap[variant]}</span>
                    <div class="peo-general-confirm__copy">
                        <h4>${peoEscapeHtml(titleText)}</h4>
                        <p>${peoEscapeHtml(messageText)}</p>
                    </div>
                </div>
                <div class="peo-general-confirm__actions">
                    <button type="button" class="peo-general-confirm__btn peo-general-confirm__btn--cancel" data-action="cancel">${peoEscapeHtml(cancelLabel)}</button>
                    <button type="button" class="peo-general-confirm__btn peo-general-confirm__btn--confirm" data-action="confirm">${peoEscapeHtml(confirmLabel)}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        peoGeneralConfirmElement = overlay;
        const confirmButton = overlay.querySelector('[data-action="confirm"]');
        if (confirmButton instanceof HTMLButtonElement) {
            window.setTimeout(() => confirmButton.focus(), 0);
        }

        let settled = false;
        const settle = (approved) => {
            if (settled) return;
            settled = true;
            document.removeEventListener("keydown", onKeyDown);
            closePeoGeneralConfirm();
            resolve(Boolean(approved));
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                settle(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);

        overlay.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            if (target === overlay) {
                settle(false);
                return;
            }

            const actionButton = target.closest("[data-action]");
            if (!(actionButton instanceof HTMLElement)) return;
            settle(actionButton.getAttribute("data-action") === "confirm");
        });
    });
};

window.PEOSystemMessages = Object.freeze({
    showToast: showPeoGeneralToast,
    closeToast: closePeoGeneralToast,
    showConfirm: showPeoGeneralConfirm,
    closeConfirm: closePeoGeneralConfirm,
});

document.addEventListener("DOMContentLoaded", () => {
    try {
        const persistedToast = window.sessionStorage.getItem(PEO_PERSISTED_TOAST_KEY);
        if (persistedToast) {
            window.sessionStorage.removeItem(PEO_PERSISTED_TOAST_KEY);
            const parsedToast = JSON.parse(persistedToast);
            showPeoGeneralToast(parsedToast.message, {
                title: parsedToast.title,
                variant: parsedToast.variant,
            });
        }
    } catch (error) {
        // Ignore storage failures and continue without a persisted toast.
    }

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const trigger = target.closest("[data-peo-toast-message]");
        if (!(trigger instanceof HTMLElement)) return;
        if (trigger.matches(":disabled, [aria-disabled='true']")) return;

        const toastPayload = {
            message: trigger.getAttribute("data-peo-toast-message") || "",
            title: trigger.getAttribute("data-peo-toast-title") || "",
            variant: trigger.getAttribute("data-peo-toast-variant") || "info",
        };

        if (trigger instanceof HTMLAnchorElement) {
            const href = String(trigger.getAttribute("href") || "").trim();
            const shouldPersistToNextPage = trigger.dataset.peoToastPersist === "navigation";
            const isRealNavigation = href && href !== "#" && !href.startsWith("javascript:");

            if (shouldPersistToNextPage && isRealNavigation) {
                try {
                    window.sessionStorage.setItem(PEO_PERSISTED_TOAST_KEY, JSON.stringify(toastPayload));
                } catch (error) {
                    // Ignore storage failures and allow navigation to continue.
                }
                return;
            }

            event.preventDefault();
        }

        showPeoGeneralToast(toastPayload.message, {
            title: toastPayload.title,
            variant: toastPayload.variant,
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const qualityDashboard = document.querySelector(".js-quality-dashboard");
    if (!(qualityDashboard instanceof HTMLElement)) return;

    const qualityTableWrap = qualityDashboard.querySelector(".quality-table-wrap");
    const qualityTableBody = qualityDashboard.querySelector(".js-quality-table-body");
    const qualityRecordMeta = qualityDashboard.querySelector(".js-quality-record-meta");
    const qualityResultsSummary = qualityDashboard.querySelector(".js-quality-results-summary");
    const qualityPagination = qualityDashboard.querySelector(".js-quality-pagination");
    const qualitySummaryTotalDocuments = qualityDashboard.querySelector("#quality-summary-total-documents");
    const qualitySummaryPending = qualityDashboard.querySelector("#quality-summary-pending");
    const qualitySummaryOngoing = qualityDashboard.querySelector("#quality-summary-ongoing");
    const qualitySummaryProgress = qualityDashboard.querySelector("#quality-summary-progress");
    const qualitySummaryRelease = qualityDashboard.querySelector("#quality-summary-release");
    const qualitySummaryRemarks = qualityDashboard.querySelector("#quality-summary-remarks");
    const qualitySummaryCompleted = qualityDashboard.querySelector("#quality-summary-completed");
    const qualitySummaryTodo = qualityDashboard.querySelector("#quality-summary-todo");
    const qualityOverviewCards = Array.from(qualityDashboard.querySelectorAll(".quality-overview-card"));
    const qualitySearchInput = qualityDashboard.querySelector(".js-quality-search");
    const qualityTabs = Array.from(qualityDashboard.querySelectorAll("[data-quality-tab]"));
    const routeFilterButton = qualityDashboard.querySelector(".js-quality-route-filter");
    const openModalButton = qualityDashboard.querySelector(".js-quality-open-modal");
    const qualityModal = document.querySelector(".js-quality-modal");
    const qualityForm = qualityModal ? qualityModal.querySelector(".js-quality-form") : null;
    const qualityModalTitle = qualityModal ? qualityModal.querySelector("#quality-modal-title") : null;
    const qualityModalSubtitle = qualityModal ? qualityModal.querySelector(".js-quality-modal-subtitle") : null;
    const closeQualityButtons = qualityModal
        ? Array.from(qualityModal.querySelectorAll(".js-quality-close-modal"))
        : [];
    const deleteQualityButton = qualityModal ? qualityModal.querySelector(".js-quality-delete-record") : null;

    if (!(qualityTableWrap instanceof HTMLElement) || !(qualityTableBody instanceof HTMLElement) || !(qualityPagination instanceof HTMLElement)) {
        return;
    }

    const QUALITY_STORAGE_KEY = "peo_quality_records_v1";
    const QUALITY_PAGE_SIZE = 10;
    const ROUTE_FILTERS = ["all", "incoming", "outgoing"];
    const DEFAULT_QUALITY_RECORDS = [
        {
            __id: "quality_seed_1",
            received_from: "Admin Division",
            doc_date: "2026-02-28",
            particulars: "Other",
            doc_no: "#245",
            project_location: "Construction of Bridge",
            location_detail: "Brgy. Paglaum, Taytay",
            scan_url: "",
            route: "Incoming",
            received_by: "Quality Division",
            date_recv: "2026-03-02",
            status: "For Action",
            remarks: "",
        },
        {
            __id: "quality_seed_2",
            received_from: "Site Operations",
            doc_date: "2026-03-01",
            particulars: "Concrete",
            doc_no: "#246",
            project_location: "Road Expansion PH-2",
            location_detail: "Arterial Material, Sector 4",
            scan_url: "",
            route: "Outgoing",
            received_by: "Technical Team",
            date_recv: "2026-03-03",
            status: "In Progress",
            remarks: "",
        },
        {
            __id: "quality_seed_3",
            received_from: "Procurement",
            doc_date: "2026-03-02",
            particulars: "Steel",
            doc_no: "#247",
            project_location: "Substation Delta",
            location_detail: "Industrial Zone A",
            scan_url: "",
            route: "Incoming",
            received_by: "Quality Division",
            date_recv: "2026-03-03",
            status: "Completed",
            remarks: "",
        },
        {
            __id: "quality_seed_4",
            received_from: "Construction Team",
            doc_date: "2026-03-03",
            particulars: "Structural",
            doc_no: "#248",
            project_location: "Flood Control Package A",
            location_detail: "Riverbank Zone 3",
            scan_url: "",
            route: "Incoming",
            received_by: "QA Inspector",
            date_recv: "2026-03-04",
            status: "For Release",
            remarks: "",
        },
        {
            __id: "quality_seed_5",
            received_from: "Materials Unit",
            doc_date: "2026-03-04",
            particulars: "Concrete",
            doc_no: "#249",
            project_location: "Bridge Retrofit Lot 6",
            location_detail: "San Isidro, Block 2",
            scan_url: "",
            route: "Outgoing",
            received_by: "Materials Lab",
            date_recv: "2026-03-04",
            status: "In Progress",
            remarks: "",
        },
        {
            __id: "quality_seed_6",
            received_from: "Electrical Section",
            doc_date: "2026-03-04",
            particulars: "Electrical",
            doc_no: "#250",
            project_location: "Streetlight Restoration",
            location_detail: "Poblacion Main Road",
            scan_url: "",
            route: "Incoming",
            received_by: "Quality Division",
            date_recv: "2026-03-05",
            status: "For Action",
            remarks: "",
        },
        {
            __id: "quality_seed_7",
            received_from: "Procurement",
            doc_date: "2026-03-05",
            particulars: "Steel",
            doc_no: "#251",
            project_location: "Steel Truss Fabrication",
            location_detail: "Warehouse Compound",
            scan_url: "",
            route: "Outgoing",
            received_by: "Release Desk",
            date_recv: "2026-03-05",
            status: "For Release",
            remarks: "",
        },
        {
            __id: "quality_seed_8",
            received_from: "Road Maintenance",
            doc_date: "2026-03-05",
            particulars: "Other",
            doc_no: "#252",
            project_location: "Asphalt Patching Program",
            location_detail: "District 5 Corridor",
            scan_url: "",
            route: "Incoming",
            received_by: "QA Inspector",
            date_recv: "2026-03-05",
            status: "Completed",
            remarks: "",
        },
        {
            __id: "quality_seed_9",
            received_from: "Laboratory Unit",
            doc_date: "2026-03-05",
            particulars: "Concrete",
            doc_no: "#253",
            project_location: "Slope Protection Works",
            location_detail: "Hillside Section B",
            scan_url: "",
            route: "Outgoing",
            received_by: "Technical Team",
            date_recv: "2026-03-06",
            status: "In Progress",
            remarks: "",
        },
        {
            __id: "quality_seed_10",
            received_from: "Planning Division",
            doc_date: "2026-03-06",
            particulars: "Structural",
            doc_no: "#254",
            project_location: "Public Market Rehab",
            location_detail: "Central District",
            scan_url: "",
            route: "Incoming",
            received_by: "Quality Division",
            date_recv: "2026-03-06",
            status: "For Action",
            remarks: "",
        },
        {
            __id: "quality_seed_11",
            received_from: "Field Engineering",
            doc_date: "2026-03-06",
            particulars: "Electrical",
            doc_no: "#255",
            project_location: "Solar Water System",
            location_detail: "Barangay New Hope",
            scan_url: "",
            route: "Outgoing",
            received_by: "Release Desk",
            date_recv: "2026-03-06",
            status: "For Release",
            remarks: "",
        },
        {
            __id: "quality_seed_12",
            received_from: "Admin Division",
            doc_date: "2026-03-06",
            particulars: "Other",
            doc_no: "#256",
            project_location: "Records Archival Batch",
            location_detail: "PEO Main Office",
            scan_url: "",
            route: "Incoming",
            received_by: "Quality Division",
            date_recv: "2026-03-06",
            status: "Completed",
            remarks: "",
        },
    ];

    const escapeHtml = (value) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const normalizeText = (value) => {
        return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    };

    const createRecordId = () => {
        return `quality_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    };

    const formatDate = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "-";

        const parsed = new Date(text);
        if (Number.isNaN(parsed.getTime())) return text;

        return parsed.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const readStoredRecords = () => {
        try {
            const raw = window.localStorage.getItem(QUALITY_STORAGE_KEY);
            if (raw === null) {
                return DEFAULT_QUALITY_RECORDS.map((record) => ({ ...record }));
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return DEFAULT_QUALITY_RECORDS.map((record) => ({ ...record }));
        }
    };

    const writeStoredRecords = (records) => {
        try {
            window.localStorage.setItem(QUALITY_STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            // Ignore storage errors.
        }
    };

    const getParticularBadgeClass = (value) => {
        const normalized = normalizeText(value);
        if (normalized === "concrete") return "is-concrete";
        if (normalized === "steel") return "is-steel";
        if (normalized === "electrical") return "is-electrical";
        if (normalized === "structural") return "is-structural";
        return "is-neutral";
    };

    const getStatusClassName = (value) => {
        const normalized = normalizeText(value);
        if (normalized === "for action") return "is-action";
        if (normalized === "for release") return "is-release";
        if (normalized === "completed") return "is-complete";
        return "is-progress";
    };

    const getRouteClassName = (value) => {
        return normalizeText(value) === "outgoing" ? "is-outgoing" : "is-incoming";
    };

    const getRouteFilterLabel = (value) => {
        if (value === "incoming") return "Incoming only";
        if (value === "outgoing") return "Outgoing only";
        return "All routes";
    };

    const buildRecordFromForm = () => {
        if (!(qualityForm instanceof HTMLFormElement)) return null;

        const formData = new FormData(qualityForm);
        const record = {
            __id: createRecordId(),
            received_from: String(formData.get("received_from") ?? "").trim(),
            doc_date: String(formData.get("doc_date") ?? "").trim(),
            particulars: String(formData.get("particulars") ?? "").trim(),
            doc_no: String(formData.get("doc_no") ?? "").trim(),
            project_location: String(formData.get("project_location") ?? "").trim(),
            location_detail: String(formData.get("location_detail") ?? "").trim(),
            scan_url: String(formData.get("scan_url") ?? "").trim(),
            route: String(formData.get("route") ?? "").trim(),
            received_by: String(formData.get("received_by") ?? "").trim(),
            date_recv: String(formData.get("date_recv") ?? "").trim(),
            initial_status: String(formData.get("initial_status") ?? "").trim(),
            owner_representative: String(formData.get("owner_representative") ?? "").trim(),
            contact_info: String(formData.get("contact_info") ?? "").trim(),
            status: String(formData.get("status") ?? "").trim(),
            remarks: String(formData.get("remarks") ?? "").trim(),
        };

        return record.received_from && record.doc_date && record.doc_no ? record : null;
    };

    const setQualityFormFieldValue = (fieldName, nextValue) => {
        if (!(qualityForm instanceof HTMLFormElement)) return;

        const radioFields = Array.from(qualityForm.querySelectorAll(`[name="${fieldName}"]`)).filter((field) => {
            return field instanceof HTMLInputElement && field.type === "radio";
        });
        if (radioFields.length) {
            const normalizedValue = String(nextValue ?? "");
            const hasMatch = radioFields.some((field) => field.value === normalizedValue);
            if (!hasMatch) return;
            radioFields.forEach((field) => {
                field.checked = field.value === normalizedValue;
            });
            return;
        }

        const field = qualityForm.elements.namedItem(fieldName);
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
            field.value = String(nextValue ?? "");
        }
    };

    const fillQualityForm = (record) => {
        if (!(qualityForm instanceof HTMLFormElement) || !record) return;

        const fieldNames = [
            "received_from",
            "doc_date",
            "particulars",
            "doc_no",
            "project_location",
            "location_detail",
            "scan_url",
            "route",
            "received_by",
            "date_recv",
            "initial_status",
            "owner_representative",
            "contact_info",
            "status",
            "remarks",
        ];

        fieldNames.forEach((fieldName) => {
            setQualityFormFieldValue(fieldName, record[fieldName] ?? "");
        });
    };

    let records = readStoredRecords();
    let currentPage = 1;
    let activeTab = "all";
    let activeRouteFilter = "all";
    let searchQuery = "";
    let editingRecordId = null;
    const TABLE_DRAG_THRESHOLD = 8;
    const DRAG_CLICK_SUPPRESSION_MS = 220;
    const tableDragState = {
        activePointerId: null,
        isPointerDown: false,
        hasMoved: false,
        startX: 0,
        startScrollLeft: 0,
        suppressClickUntil: 0,
    };

    const getFilteredRecords = () => {
        return records.filter((record) => {
            const normalizedStatus = normalizeText(record.status);
            const normalizedRoute = normalizeText(record.route);
            const matchesTab = (
                activeTab === "all"
                || (activeTab === "for-action" && normalizedStatus === "for action")
                || (activeTab === "for-release" && normalizedStatus === "for release")
                || (activeTab === "completed" && normalizedStatus === "completed")
            );
            const matchesRoute = activeRouteFilter === "all" || normalizedRoute === activeRouteFilter;
            const haystack = [
                record.received_from,
                record.particulars,
                record.doc_no,
                record.project_location,
                record.location_detail,
                record.received_by,
                record.initial_status,
                record.owner_representative,
                record.contact_info,
                record.route,
                record.status,
                record.remarks,
            ].map(normalizeText).join(" ");
            const matchesSearch = !searchQuery || haystack.includes(searchQuery);

            return matchesTab && matchesRoute && matchesSearch;
        });
    };

    const getTotalPages = (filteredRecords) => {
        return Math.max(1, Math.ceil(filteredRecords.length / QUALITY_PAGE_SIZE));
    };

    const clampCurrentPage = (filteredRecords) => {
        currentPage = Math.min(Math.max(1, currentPage), getTotalPages(filteredRecords));
    };

    const hasHorizontalOverflow = () => {
        return qualityTableWrap.scrollWidth - qualityTableWrap.clientWidth > 2;
    };

    const syncHorizontalScrollState = () => {
        const canScroll = hasHorizontalOverflow();
        qualityTableWrap.style.cursor = canScroll ? (tableDragState.hasMoved ? "grabbing" : "grab") : "default";
    };

    const shouldSuppressTableClick = () => {
        return Date.now() < tableDragState.suppressClickUntil;
    };

    const resetTableDragState = () => {
        tableDragState.activePointerId = null;
        tableDragState.isPointerDown = false;
        tableDragState.hasMoved = false;
        qualityTableWrap.classList.remove("is-dragging");
        syncHorizontalScrollState();
    };

    const stopDragging = () => {
        if (!tableDragState.isPointerDown && tableDragState.activePointerId === null) return;

        const activePointerId = tableDragState.activePointerId;
        const didMove = tableDragState.hasMoved;

        tableDragState.activePointerId = null;
        tableDragState.isPointerDown = false;

        if (didMove) {
            tableDragState.suppressClickUntil = Date.now() + DRAG_CLICK_SUPPRESSION_MS;
        }

        if (
            activePointerId !== null
            && qualityTableWrap.hasPointerCapture
            && qualityTableWrap.hasPointerCapture(activePointerId)
        ) {
            qualityTableWrap.releasePointerCapture(activePointerId);
        }

        resetTableDragState();
    };

    const createEmptyStateRow = () => {
        qualityTableBody.innerHTML = `
            <tr class="quality-empty-row">
                <td colspan="12">No quality records match the current filters.</td>
            </tr>
        `;
    };

    const createRecordRow = (record) => {
        const row = document.createElement("tr");
        row.className = "quality-data-row";
        row.dataset.recordId = record.__id;
        row.innerHTML = `
            <td class="quality-source">${escapeHtml(record.received_from)}</td>
            <td>${escapeHtml(formatDate(record.doc_date))}</td>
            <td><span class="quality-badge ${getParticularBadgeClass(record.particulars)}">${escapeHtml(record.particulars || "Other")}</span></td>
            <td>${escapeHtml(record.doc_no || "-")}</td>
            <td>${escapeHtml(record.project_location || "-")}</td>
            <td>${escapeHtml(record.location_detail || "-")}</td>
            <td>
                <a href="${escapeHtml(record.scan_url || "#")}" class="quality-scan-link ${record.scan_url ? "" : "is-disabled"}" ${record.scan_url ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true" tabindex="-1"'}>
                    <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
                    <span>Scan</span>
                </a>
            </td>
            <td><span class="quality-route ${getRouteClassName(record.route)}">${escapeHtml(record.route || "Incoming")}</span></td>
            <td>${escapeHtml(record.received_by || "-")}</td>
            <td>${escapeHtml(formatDate(record.date_recv))}</td>
            <td><span class="quality-status ${getStatusClassName(record.status)}">${escapeHtml(record.status || "For Action")}</span></td>
            <td>
                <div class="quality-actions">
                    <button type="button" class="quality-action-btn quality-action-btn--edit" data-quality-action="edit" aria-label="Edit record" title="Edit">
                        <span class="material-symbols-outlined" aria-hidden="true">edit</span>
                    </button>
                    <button type="button" class="quality-action-btn quality-action-btn--delete" data-quality-action="delete" aria-label="Delete record" title="Delete">
                        <span class="material-symbols-outlined" aria-hidden="true">delete</span>
                    </button>
                </div>
            </td>
        `;
        return row;
    };

    const syncTableSummary = (filteredRecords, pagedRecords, startIndex) => {
        if (qualityRecordMeta instanceof HTMLElement) {
            qualityRecordMeta.textContent = `Showing ${filteredRecords.length} active record${filteredRecords.length === 1 ? "" : "s"}`;
        }

        if (qualityResultsSummary instanceof HTMLElement) {
            const start = filteredRecords.length ? startIndex + 1 : 0;
            const end = filteredRecords.length ? startIndex + pagedRecords.length : 0;
            qualityResultsSummary.textContent = `Showing ${start} to ${end} of ${filteredRecords.length} records`;
        }
    };

    const syncRouteFilterButton = () => {
        if (!(routeFilterButton instanceof HTMLElement)) return;
        const label = getRouteFilterLabel(activeRouteFilter);
        routeFilterButton.classList.toggle("is-active", activeRouteFilter !== "all");
        routeFilterButton.setAttribute("aria-label", `Filter route: ${label}`);
        routeFilterButton.setAttribute("title", `Filter route: ${label}`);
    };

    const syncTabs = () => {
        qualityTabs.forEach((tab) => {
            const isActive = tab.getAttribute("data-quality-tab") === activeTab;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });
    };

    const syncQualitySummaryCards = () => {
        const totalDocuments = records.length;
        const pendingCount = records.filter((record) => normalizeText(record.status) === "for action").length;
        const inProgressCount = records.filter((record) => normalizeText(record.status) === "in progress").length;
        const forReleaseCount = records.filter((record) => normalizeText(record.status) === "for release").length;
        const completedCount = records.filter((record) => normalizeText(record.status) === "completed").length;
        const remarksCount = records.filter((record) => String(record.remarks || "").trim().length > 0).length;
        const ongoingCount = totalDocuments - completedCount;
        const tasksToDoCount = pendingCount + inProgressCount;

        if (qualitySummaryTotalDocuments instanceof HTMLElement) {
            qualitySummaryTotalDocuments.textContent = String(totalDocuments);
        }
        if (qualitySummaryPending instanceof HTMLElement) {
            qualitySummaryPending.textContent = String(pendingCount);
        }
        if (qualitySummaryOngoing instanceof HTMLElement) {
            qualitySummaryOngoing.textContent = String(ongoingCount);
        }
        if (qualitySummaryProgress instanceof HTMLElement) {
            qualitySummaryProgress.textContent = String(inProgressCount);
        }
        if (qualitySummaryRelease instanceof HTMLElement) {
            qualitySummaryRelease.textContent = String(forReleaseCount);
        }
        if (qualitySummaryRemarks instanceof HTMLElement) {
            qualitySummaryRemarks.textContent = String(remarksCount);
        }
        if (qualitySummaryCompleted instanceof HTMLElement) {
            qualitySummaryCompleted.textContent = String(completedCount);
        }
        if (qualitySummaryTodo instanceof HTMLElement) {
            qualitySummaryTodo.textContent = String(tasksToDoCount);
        }
    };

    const enableQualityCardFloat = () => {
        if (!qualityOverviewCards.length) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        qualityOverviewCards.forEach((card) => {
            if (!(card instanceof HTMLElement)) return;

            card.addEventListener("pointermove", (event) => {
                const bounds = card.getBoundingClientRect();
                const relativeX = (event.clientX - bounds.left) / bounds.width;
                const relativeY = (event.clientY - bounds.top) / bounds.height;
                const rotateY = (relativeX - 0.5) * 9;
                const rotateX = (0.5 - relativeY) * 9;
                const shiftX = (relativeX - 0.5) * 8;
                const shiftY = (relativeY - 0.5) * 8;

                card.style.setProperty("--quality-card-rotate-x", `${rotateX.toFixed(2)}deg`);
                card.style.setProperty("--quality-card-rotate-y", `${rotateY.toFixed(2)}deg`);
                card.style.setProperty("--quality-card-shift-x", `${shiftX.toFixed(2)}px`);
                card.style.setProperty("--quality-card-shift-y", `${shiftY.toFixed(2)}px`);
            });

            const resetCardFloat = () => {
                card.style.setProperty("--quality-card-rotate-x", "0deg");
                card.style.setProperty("--quality-card-rotate-y", "0deg");
                card.style.setProperty("--quality-card-shift-x", "0px");
                card.style.setProperty("--quality-card-shift-y", "0px");
            };

            card.addEventListener("pointerleave", resetCardFloat);
            card.addEventListener("pointercancel", resetCardFloat);
        });
    };

    const renderPagination = (filteredRecords) => {
        qualityPagination.innerHTML = "";
        const totalPages = getTotalPages(filteredRecords);

        const makeButton = (label, page, disabled = false, active = false) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;
            if (active) {
                button.classList.add("is-active");
                button.setAttribute("aria-current", "page");
            }
            button.dataset.page = String(page);
            return button;
        };

        qualityPagination.appendChild(makeButton("Previous", currentPage - 1, currentPage <= 1));

        for (let page = 1; page <= totalPages; page += 1) {
            qualityPagination.appendChild(makeButton(String(page), page, false, page === currentPage));
        }

        qualityPagination.appendChild(makeButton("Next", currentPage + 1, currentPage >= totalPages));
    };

    const renderTable = () => {
        const filteredRecords = getFilteredRecords();
        clampCurrentPage(filteredRecords);

        const startIndex = (currentPage - 1) * QUALITY_PAGE_SIZE;
        const pagedRecords = filteredRecords.slice(startIndex, startIndex + QUALITY_PAGE_SIZE);
        qualityTableBody.innerHTML = "";

        if (!pagedRecords.length) {
            createEmptyStateRow();
        } else {
            pagedRecords.forEach((record) => {
                qualityTableBody.appendChild(createRecordRow(record));
            });
        }

        syncTableSummary(filteredRecords, pagedRecords, startIndex);
        syncQualitySummaryCards();
        syncTabs();
        syncRouteFilterButton();
        renderPagination(filteredRecords);
        window.requestAnimationFrame(syncHorizontalScrollState);
    };

    const syncModalState = () => {
        const isOpen = qualityModal instanceof HTMLElement && !qualityModal.hidden;
        document.body.classList.toggle("quality-modal-open", isOpen);
    };

    const openQualityModal = (mode = "create", record = null) => {
        if (!(qualityModal instanceof HTMLElement) || !(qualityForm instanceof HTMLFormElement)) return;

        qualityForm.reset();
        editingRecordId = mode === "edit" ? record?.__id || null : null;

        if (qualityModalTitle instanceof HTMLElement) {
            qualityModalTitle.textContent = mode === "edit" ? "Edit Quality Record" : "Add Quality Record";
        }
        if (qualityModalSubtitle instanceof HTMLElement) {
            qualityModalSubtitle.textContent = mode === "edit"
                ? "Update the selected Quality Division tracker record."
                : "Create a new Quality Division tracker record.";
        }
        if (deleteQualityButton instanceof HTMLElement) {
            deleteQualityButton.hidden = mode !== "edit";
        }
        if (mode === "edit" && record) {
            fillQualityForm(record);
        }

        qualityModal.hidden = false;
        syncModalState();
        const firstField = qualityForm.elements.namedItem("received_from");
        if (firstField instanceof HTMLElement) {
            window.setTimeout(() => firstField.focus(), 0);
        }
    };

    const closeQualityModal = () => {
        if (!(qualityModal instanceof HTMLElement)) return;
        qualityModal.hidden = true;
        editingRecordId = null;
        syncModalState();
    };

    if (openModalButton instanceof HTMLElement) {
        openModalButton.addEventListener("click", () => {
            openQualityModal("create");
        });
    }

    closeQualityButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closeQualityModal();
        });
    });

    if (qualityModal instanceof HTMLElement) {
        qualityModal.addEventListener("click", (event) => {
            if (event.target === qualityModal) {
                closeQualityModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && qualityModal instanceof HTMLElement && !qualityModal.hidden) {
            closeQualityModal();
        }
    });

    if (qualityForm instanceof HTMLFormElement) {
        qualityForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!qualityForm.checkValidity()) {
                qualityForm.reportValidity();
                return;
            }

            const formRecord = buildRecordFromForm();
            if (!formRecord) return;
            const isEditingRecord = Boolean(editingRecordId);

            if (editingRecordId) {
                const targetIndex = records.findIndex((record) => record.__id === editingRecordId);
                if (targetIndex >= 0) {
                    records[targetIndex] = { ...formRecord, __id: editingRecordId };
                }
            } else {
                records.unshift(formRecord);
            }

            currentPage = 1;
            writeStoredRecords(records);
            renderTable();
            closeQualityModal();
            showPeoGeneralToast(
                isEditingRecord ? "Quality record updated successfully." : "Quality record added successfully.",
                {
                    title: "Quality Division",
                    variant: "success",
                }
            );
        });
    }

    if (deleteQualityButton instanceof HTMLElement) {
        deleteQualityButton.addEventListener("click", async () => {
            if (!editingRecordId) return;
            const approved = await showPeoGeneralConfirm({
                title: "Delete Quality Record",
                message: "Are you sure you want to delete this quality record?",
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                variant: "danger",
            });
            if (!approved) return;

            records = records.filter((record) => record.__id !== editingRecordId);
            writeStoredRecords(records);
            renderTable();
            closeQualityModal();
            showPeoGeneralToast("Quality record deleted successfully.", {
                title: "Quality Division",
                variant: "success",
            });
        });
    }

    if (qualitySearchInput instanceof HTMLInputElement) {
        qualitySearchInput.addEventListener("input", () => {
            searchQuery = normalizeText(qualitySearchInput.value);
            currentPage = 1;
            renderTable();
        });
    }

    qualityTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            activeTab = tab.getAttribute("data-quality-tab") || "all";
            currentPage = 1;
            renderTable();
        });
    });

    if (routeFilterButton instanceof HTMLElement) {
        routeFilterButton.addEventListener("click", () => {
            const currentIndex = ROUTE_FILTERS.indexOf(activeRouteFilter);
            activeRouteFilter = ROUTE_FILTERS[(currentIndex + 1) % ROUTE_FILTERS.length];
            currentPage = 1;
            renderTable();
        });
    }

    qualityPagination.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) return;

        const nextPage = Number.parseInt(target.dataset.page || "", 10);
        if (!Number.isFinite(nextPage) || target.disabled) return;
        currentPage = nextPage;
        renderTable();
    });

    qualityTableBody.addEventListener("click", async (event) => {
        if (shouldSuppressTableClick()) return;

        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.closest(".quality-scan-link")) return;

        const row = target.closest("tr[data-record-id]");
        if (!(row instanceof HTMLTableRowElement)) return;

        const recordId = row.dataset.recordId;
        const record = records.find((item) => item.__id === recordId);
        if (!record) return;

        const actionButton = target.closest("[data-quality-action]");
        if (actionButton instanceof HTMLButtonElement) {
            const action = actionButton.dataset.qualityAction;
            if (action === "delete") {
                const approved = await showPeoGeneralConfirm({
                    title: "Delete Quality Record",
                    message: "Are you sure you want to delete this quality record?",
                    confirmLabel: "Delete",
                    cancelLabel: "Cancel",
                    variant: "danger",
                });
                if (!approved) return;
                records = records.filter((item) => item.__id !== recordId);
                writeStoredRecords(records);
                renderTable();
                showPeoGeneralToast("Quality record deleted successfully.", {
                    title: "Quality Division",
                    variant: "success",
                });
                return;
            }

            if (action === "edit") {
                openQualityModal("edit", record);
                return;
            }
        }

        openQualityModal("edit", record);
    });

    qualityTableWrap.addEventListener(
        "wheel",
        (event) => {
            if (!hasHorizontalOverflow()) return;

            const shouldScrollHorizontally = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
            if (!shouldScrollHorizontally) return;

            event.preventDefault();
            qualityTableWrap.scrollLeft += event.deltaX || event.deltaY;
            syncHorizontalScrollState();
        },
        { passive: false }
    );

    qualityTableWrap.addEventListener("pointerdown", (event) => {
        if (!hasHorizontalOverflow()) return;

        const target = event.target;
        if (target instanceof HTMLElement && target.closest("a, button, input, select, textarea, label")) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;

        tableDragState.activePointerId = event.pointerId;
        tableDragState.isPointerDown = true;
        tableDragState.hasMoved = false;
        tableDragState.startX = event.clientX;
        tableDragState.startScrollLeft = qualityTableWrap.scrollLeft;
        qualityTableWrap.setPointerCapture(event.pointerId);
    });

    qualityTableWrap.addEventListener("pointermove", (event) => {
        if (!tableDragState.isPointerDown) return;
        if (tableDragState.activePointerId !== event.pointerId) return;

        const deltaX = event.clientX - tableDragState.startX;
        if (!tableDragState.hasMoved && Math.abs(deltaX) < TABLE_DRAG_THRESHOLD) return;

        tableDragState.hasMoved = true;
        qualityTableWrap.classList.add("is-dragging");
        qualityTableWrap.scrollLeft = tableDragState.startScrollLeft - deltaX;
        syncHorizontalScrollState();
        event.preventDefault();
    });

    qualityTableWrap.addEventListener("scroll", syncHorizontalScrollState);
    qualityTableWrap.addEventListener("keydown", (event) => {
        if (!hasHorizontalOverflow()) return;

        const pageStep = Math.max(240, Math.round(qualityTableWrap.clientWidth * 0.8));
        let nextScrollLeft = qualityTableWrap.scrollLeft;

        if (event.key === "ArrowLeft") nextScrollLeft -= 120;
        if (event.key === "ArrowRight") nextScrollLeft += 120;
        if (event.key === "Home") nextScrollLeft = 0;
        if (event.key === "End") nextScrollLeft = qualityTableWrap.scrollWidth;
        if (event.key === "PageUp") nextScrollLeft -= pageStep;
        if (event.key === "PageDown") nextScrollLeft += pageStep;

        if (nextScrollLeft === qualityTableWrap.scrollLeft) return;

        event.preventDefault();
        qualityTableWrap.scrollTo({
            left: nextScrollLeft,
            behavior: "smooth",
        });
        window.requestAnimationFrame(syncHorizontalScrollState);
    });

    qualityTableWrap.addEventListener("pointerup", stopDragging);
    qualityTableWrap.addEventListener("pointercancel", stopDragging);
    qualityTableWrap.addEventListener("lostpointercapture", stopDragging);
    qualityTableWrap.addEventListener("mouseleave", stopDragging);
    window.addEventListener("resize", syncHorizontalScrollState);

    enableQualityCardFloat();
    renderTable();
});

