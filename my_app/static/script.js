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
    const adminDivisionButton = document.querySelector(".js-admin-division-button");

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

    if (adminDivisionButton) {
        adminDivisionButton.addEventListener("click", (event) => {
            event.preventDefault();
            const targetUrl = adminDivisionButton.dataset.adminDivisionUrl;
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
    }

    refreshDocumentCounters();
    refreshBillingCounters();
});
