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
    const billingMetricTotal = document.querySelector('[data-billing-metric="total"]');
    const billingMetricForReview = document.querySelector('[data-billing-metric="for_review"]');
    const billingMetricProcessing = document.querySelector('[data-billing-metric="processing"]');
    const billingMetricApproved = document.querySelector('[data-billing-metric="approved"]');

    const normalizeStatus = (value) => {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
    };

    const statusLabel = (value) => {
        const normalized = normalizeStatus(value);
        if (normalized === "for_review") return "For Review";
        if (normalized === "processing") return "Processing";
        if (normalized === "approved") return "Approved";
        if (normalized === "draft") return "Draft";
        return value || "Draft";
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

    const setRowActionsCell = (cell) => {
        cell.textContent = "View";
        cell.style.fontWeight = "600";
        cell.style.color = "#1b4f82";
    };

    const getTableDataRows = (tableBody, emptyClass) => {
        if (!tableBody) return [];
        return Array.from(tableBody.querySelectorAll("tr")).filter((row) => !row.classList.contains(emptyClass));
    };

    const refreshDocumentCounters = () => {
        if (!documentsTableBody) return;

        const rows = getTableDataRows(documentsTableBody, "pa-empty-documents");
        const statuses = rows.map((row) => normalizeStatus(row.children[6]?.textContent));
        const total = rows.length;
        const forReview = statuses.filter((status) => status === "for_review").length;
        const processing = statuses.filter((status) => status === "processing").length;
        const openIssues = statuses.filter((status) => status === "draft").length;

        if (documentsFoundLabel) documentsFoundLabel.textContent = `${total} documents found`;
        if (docMetricTotal) docMetricTotal.textContent = String(total);
        if (docMetricForReview) docMetricForReview.textContent = String(forReview);
        if (docMetricProcessing) docMetricProcessing.textContent = String(processing);
        if (docMetricOpenIssues) docMetricOpenIssues.textContent = String(openIssues);
    };

    const refreshBillingCounters = () => {
        if (!billingTableBody) return;

        const rows = getTableDataRows(billingTableBody, "pa-empty-billing");
        const statuses = rows.map((row) => normalizeStatus(row.children[7]?.textContent));
        const total = rows.length;
        const forReview = statuses.filter((status) => status === "for_review").length;
        const processing = statuses.filter((status) => status === "processing").length;
        const approved = statuses.filter((status) => status === "approved").length;

        if (billingCountLabel) billingCountLabel.textContent = `${total} record${total === 1 ? "" : "s"}`;
        if (billingMetricTotal) billingMetricTotal.textContent = String(total);
        if (billingMetricForReview) billingMetricForReview.textContent = String(forReview);
        if (billingMetricProcessing) billingMetricProcessing.textContent = String(processing);
        if (billingMetricApproved) billingMetricApproved.textContent = String(approved);
    };

    const addDocumentRow = (values) => {
        if (!documentsTableBody) return;

        const emptyRow = documentsTableBody.querySelector(".pa-empty-documents");
        if (emptyRow) emptyRow.remove();

        const row = document.createElement("tr");
        const createdDate = values.date_received || values.date_started || new Date().toISOString().slice(0, 10);
        const fields = [
            values.slip_no || "-",
            values.document_name || "-",
            values.location || "-",
            values.doc_type || "-",
            values.contractor || "-",
            values.division || "-",
            statusLabel(values.status),
            formatDate(createdDate),
        ];

        fields.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");
        setRowActionsCell(actionsCell);
        row.appendChild(actionsCell);

        documentsTableBody.prepend(row);
        refreshDocumentCounters();
    };

    const addBillingRow = (values) => {
        if (!billingTableBody) return;

        const emptyRow = billingTableBody.querySelector(".pa-empty-billing");
        if (emptyRow) emptyRow.remove();

        const row = document.createElement("tr");
        const amount = values.revised_contract_amount || values.contract_amount || "-";
        const fields = [
            values.slip_no || "-",
            values.document_name || "-",
            values.contractor || "-",
            values.billing_type || "-",
            values.percentage || "-",
            amount,
            formatDate(values.date_received),
            statusLabel(values.status),
        ];

        fields.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");
        setRowActionsCell(actionsCell);
        row.appendChild(actionsCell);

        billingTableBody.prepend(row);
        refreshBillingCounters();
    };

    const createRecordsFromForm = (form) => {
        if (!form) return false;
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());

        values.status = values.status || "Draft";
        values.division = values.division || "Admin";
        values.doc_type = values.doc_type || "Other";

        addDocumentRow(values);
        addBillingRow(values);
        form.reset();
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
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(15, 25, 36, 0.4)";
        overlay.style.display = "none";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";
        overlay.style.padding = "16px";

        overlay.innerHTML = `
            <div style="width:min(560px, 100%); max-height:94vh; overflow:auto; background:#f3f6fa; border:1px solid #d0d9e4; border-radius:10px; box-shadow:0 16px 38px rgba(12, 24, 39, 0.2); color:#1f3653; font-family:'Public Sans','Segoe UI',sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:14px 14px 8px;">
                    <div>
                        <h3 style="margin:0; font-size:18px; font-weight:700;">Create New Document</h3>
                        <p style="margin:3px 0 0; font-size:12px; color:#5a6f89;">Add a new document to the register</p>
                    </div>
                    <button type="button" data-close-modal style="border:0; background:transparent; color:#647993; font-size:18px; cursor:pointer; line-height:1;">&times;</button>
                </div>
                <form id="admin-new-document-form" style="padding:0 14px 14px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Slip No. *</label>
                    <input name="slip_no" required placeholder="E.g., SLP-0001" style="width:100%; height:34px; border:1px solid #11355d; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">

                    <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Document Name *</label>
                    <input name="document_name" required placeholder="E.g., Site Instruction No. 03" style="width:100%; height:34px; border:1px solid #11355d; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Location</label>
                            <input name="location" placeholder="E.g., City Hall Annex" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Contractor</label>
                            <input name="contractor" placeholder="E.g., ABC Builders" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Type *</label>
                            <select name="doc_type" required style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                                <option value="Site Instruction" selected>Site Instruction</option>
                                <option>NCR</option>
                                <option>DED Package</option>
                                <option>Billing Packet</option>
                                <option>Work Order</option>
                                <option>Report</option>
                                <option>Contract</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Division *</label>
                            <select name="division" required style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                                <option value="Admin" selected>Admin</option>
                                <option>Planning Division</option>
                                <option>Construction</option>
                                <option>Quality</option>
                                <option>Maintenance</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; margin:8px 0 6px;">Status *</label>
                            <select name="status" required style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                                <option>Draft</option>
                                <option>For Review</option>
                                <option>Processing</option>
                                <option>Approved</option>
                            </select>
                        </div>
                    </div>

                    <label style="display:block; font-size:12px; font-weight:600; margin:10px 0 6px;">Description</label>
                    <textarea name="description" rows="2" placeholder="Optional description" style="width:100%; border:1px solid #c9d3df; border-radius:7px; padding:8px 10px; font-size:12px; resize:vertical; background:#fff;"></textarea>

                    <p style="margin:12px 0 8px; font-size:12px; font-weight:700; color:#2a4260;">Document Routing</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Received by PEO</label>
                            <input type="date" name="date_received" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Released to Admin</label>
                            <input type="date" name="date_released_admin" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Received from Admin</label>
                            <input type="date" name="date_received_admin" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Released to Accounting</label>
                            <input type="date" name="date_released_accounting" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                    </div>

                    <p style="margin:12px 0 8px; font-size:12px; font-weight:700; color:#2a4260;">Billing Information</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Type of Billing</label>
                            <input name="billing_type" placeholder="e.g., Progress Billing #2" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Percentage</label>
                            <input name="percentage" placeholder="e.g., 30%" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Contract Amount</label>
                            <input name="contract_amount" placeholder="e.g., PHP 5,000,000" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Revised Contract Amount</label>
                            <input name="revised_contract_amount" placeholder="e.g., PHP 5,500,000" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Period Covered</label>
                            <input name="period_covered" placeholder="e.g., Jan-Mar 2026" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Started</label>
                            <input type="date" name="date_started" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Completion Date</label>
                            <input type="date" name="completion_date" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:14px;">
                        <button type="button" data-close-modal style="height:32px; border:1px solid #cbd5e1; border-radius:8px; padding:0 14px; background:#eef2f7; color:#273c57; cursor:pointer;">Cancel</button>
                        <button type="submit" style="height:32px; border:0; border-radius:8px; padding:0 14px; background:#143a63; color:#fff; font-weight:600; cursor:pointer;">Create</button>
                    </div>
                </form>
            </div>
        `;

        const closeModal = () => {
            overlay.style.display = "none";
            document.body.style.overflow = "";
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
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const created = createRecordsFromForm(form);
            if (created) {
                closeModal();
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

    refreshDocumentCounters();
    refreshBillingCounters();
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
    const roadUploadInput = document.getElementById("road-upload-input");
    const roadSearchInput = document.querySelector(".js-road-search-input");
    const roadMunicipalityList = document.querySelector(".js-road-municipality-list");
    const roadRecordMeta = document.querySelector(".js-road-record-meta");
    const topRoadCount = document.querySelector(".js-top-road-count");
    const topRoadLength = document.querySelector(".js-top-road-length");
    const roadConditionGood = document.querySelector(".js-road-condition-good");
    const roadConditionFair = document.querySelector(".js-road-condition-fair");
    const roadConditionPoor = document.querySelector(".js-road-condition-poor");
    const roadConditionBad = document.querySelector(".js-road-condition-bad");

    const roadRecords = [];
    let xlsxLibraryPromise = null;
    let refreshRoadRegister = null;

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

    const normalizeKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizeStatus = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
    const toTitleCase = (value) =>
        String(value || "")
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

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
            municipality,
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
                municipality: toTitleCase(municipality),
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
            const municipalityKey = record.municipality || "Unknown";
            if (!groupedByMunicipality.has(municipalityKey)) {
                groupedByMunicipality.set(municipalityKey, []);
            }
            groupedByMunicipality.get(municipalityKey).push(record);
        });

        const municipalityBlocks = [...groupedByMunicipality.entries()]
            .sort(([municipalityA], [municipalityB]) => municipalityA.localeCompare(municipalityB))
            .map(([municipalityName, municipalityRows]) => {
                const rowsHtml = municipalityRows
                    .map((record) => {
                        const conditionText = toTitleCase(record.condition || "Unknown");
                        const conditionClass = getRoadConditionClass(record.condition || "unknown");

                        return `
                            <tr>
                                <td>${escapeHtml(record.roadId || "-")}</td>
                                <td>${escapeHtml(record.roadName || "-")}</td>
                                <td>${escapeHtml(formatLengthValue(record.lengthKm))}</td>
                                <td><span class="road-condition-pill ${conditionClass}">${escapeHtml(conditionText)}</span></td>
                                <td>${escapeHtml(record.surfaceType || "-")}</td>
                            </tr>
                        `;
                    })
                    .join("");

                return `
                    <article class="road-municipality-card">
                        <div class="road-municipality-head">
                            <div class="road-municipality-name">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"></path>
                                    <circle cx="12" cy="10" r="2.5"></circle>
                                </svg>
                                <span>${escapeHtml(municipalityName)}</span>
                            </div>
                            <span class="road-municipality-count">${municipalityRows.length} road${municipalityRows.length === 1 ? "" : "s"}</span>
                        </div>
                        <table class="road-table road-municipality-table">
                            <thead>
                                <tr>
                                    <th>Road ID</th>
                                    <th>Road Name</th>
                                    <th>Length (km)</th>
                                    <th>Condition</th>
                                    <th>Surface Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
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
                const locationMatched = (record.location || "").toLowerCase() === locationFilter.toLowerCase();
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
    };

    if (roadUploadInput) {
        roadUploadInput.addEventListener("change", async (event) => {
            const selectedFiles = Array.from(event.target.files || []);
            if (!selectedFiles.length) {
                return;
            }

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

            if (parsedRows.length) {
                roadRecords.push(...parsedRows);
                if (typeof refreshRoadRegister === "function") {
                    refreshRoadRegister();
                }
            }

            if (skippedFiles.length) {
                window.alert(`Some files could not be read: ${skippedFiles.join(", ")}`);
            }

            roadUploadInput.value = "";
        });
    }

    if (roadSearchInput) {
        roadSearchInput.addEventListener("input", () => {
            if (typeof refreshRoadRegister === "function") {
                refreshRoadRegister();
            }
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

                    if (typeof refreshRoadRegister === "function") {
                        refreshRoadRegister();
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

