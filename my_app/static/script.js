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
    const billingMetricReceived = document.querySelector('[data-billing-metric="received"]');
    const billingMetricOnProcess = document.querySelector('[data-billing-metric="on_process"]');
    const billingMetricPending = document.querySelector('[data-billing-metric="pending"]');
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

    const buildBillingHistoryEntry = (record, changedAt) => {
        const snapshot = {
            billing_type: String(record.billing_type || "").trim(),
            billing_type_other: String(record.billing_type_other || "").trim(),
            percentage: String(record.percentage || "").trim(),
            date_received: String(record.date_received || "").trim(),
            received_by: String(record.received_by || "").trim(),
            status: normalizeStatus(record.billing_status || record.status || "on_process"),
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
                const pct = entry.percentage || "-";
                const receivedDate = entry.date_received ? formatDate(entry.date_received) : "-";
                const receivedBy = entry.received_by || "-";
                details.textContent = `${typeDisplay} | ${pct} | ${receivedDate} | ${receivedBy}`;

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
        normalized.billing_status = normalized.billing_status || "on_process";
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
            <button type="button" class="pa-action-btn pa-action-edit" data-admin-action="edit" data-record-id="${recordId}">Edit</button>
            <button type="button" class="pa-action-btn pa-action-delete" data-admin-action="delete" data-record-id="${recordId}">Delete</button>
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
        const received = statuses.filter((status) => status === "received").length;
        const onProcess = statuses.filter((status) => status === "on_process").length;
        const pending = statuses.filter((status) => status !== "received" && status !== "on_process").length;

        if (billingCountLabel) billingCountLabel.textContent = `${total} record${total === 1 ? "" : "s"}`;
        if (billingMetricTotal) billingMetricTotal.textContent = String(total);
        if (billingMetricReceived) billingMetricReceived.textContent = String(received);
        if (billingMetricOnProcess) billingMetricOnProcess.textContent = String(onProcess);
        if (billingMetricPending) billingMetricPending.textContent = String(pending);
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
                <option value="on_process">On Process</option>
                <option value="received">Received</option>
            `;
            return;
        }

        statusSelect.innerHTML = `
            <option value="Draft">Draft</option>
            <option value="For Review">For Review</option>
            <option value="Processing">Processing</option>
            <option value="Approved">Approved</option>
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
        const title = modal.querySelector("#admin-new-document-title");
        const subtitle = modal.querySelector("#admin-new-document-subtitle");
        const submitButton = modal.querySelector("#admin-new-document-submit");
        if (!form) return;

        editingRecordId = recordId;
        editingTableType = tableType;
        form.reset();
        setFormStatusOptionsByMode(form, tableType);
        const recordForForm = {
            ...record,
            status: tableType === "billing"
                ? (record.billing_status || record.status)
                : (record.doc_status || record.status),
        };
        Object.keys(recordForForm).forEach((key) => {
            const input = form.elements.namedItem(key);
            if (input && input.type !== "file") {
                input.value = recordForForm[key] || "";
            }
        });

        if (title) title.textContent = "Edit Document";
        if (subtitle) subtitle.textContent = "Update document details";
        if (submitButton) submitButton.textContent = "Save Changes";
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

        fields.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
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

        fields.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
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
            || (normalizedInputStatus === "received" || normalizedInputStatus === "on_process"
                ? normalizedInputStatus
                : "on_process");
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
                window.alert("Unable to read the scanned file. Please try again.");
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
                if (normalizeStatus(values.status) !== "received") {
                    updatedRecord.date_received = "";
                    updatedRecord.received_by = "";
                }
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
                        <h3 id="admin-new-document-title" style="margin:0; font-size:18px; font-weight:700;">Create New Document</h3>
                        <p id="admin-new-document-subtitle" style="margin:3px 0 0; font-size:12px; color:#5a6f89;">Add a new document to the register</p>
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
                            <select data-admin-status-select name="status" required style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                                <option>Draft</option>
                                <option>For Review</option>
                                <option>Processing</option>
                                <option>Approved</option>
                            </select>
                        </div>
                    </div>

                    <label style="display:block; font-size:12px; font-weight:600; margin:10px 0 6px;">Description</label>
                    <textarea name="description" rows="2" placeholder="Optional description" style="width:100%; border:1px solid #c9d3df; border-radius:7px; padding:8px 10px; font-size:12px; resize:vertical; background:#fff;"></textarea>

                    <div class="pa-scan-upload-field">
                        <label style="display:block; font-size:12px; font-weight:600; margin:10px 0 6px;">Scanned File</label>
                        <input
                            class="pa-scan-upload-input"
                            type="file"
                            name="scanned_file"
                            accept=".pdf,image/*"
                        >
                        <small class="pa-scan-upload-help">Accepted file types: PDF or image scans.</small>
                        <small class="pa-scan-upload-current" data-admin-file-current>No scanned file uploaded.</small>
                    </div>

                    <p style="margin:12px 0 8px; font-size:12px; font-weight:700; color:#2a4260;">Document Routing</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Received by PEO</label>
                            <input type="date" name="date_received_peo" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
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
                            <select data-admin-billing-type-select name="billing_type" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
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
                        </div>
                        <div class="pa-form-hidden-field" data-admin-billing-type-other-wrap>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Specify Other Billing Type</label>
                            <textarea name="billing_type_other" rows="2" placeholder="Enter billing type" style="width:100%; border:1px solid #c9d3df; border-radius:7px; padding:8px 10px; font-size:12px; resize:vertical; background:#fff;"></textarea>
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
                        <div class="pa-form-hidden-field" data-admin-received-date-wrap>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Date Received</label>
                            <input type="date" name="date_received" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 8px; font-size:12px; background:#fff;">
                        </div>
                        <div class="pa-form-hidden-field" data-admin-received-by-wrap>
                            <label style="display:block; font-size:11px; font-weight:600; margin:0 0 5px;">Received By</label>
                            <input name="received_by" placeholder="Name of receiver" style="width:100%; height:34px; border:1px solid #c9d3df; border-radius:7px; padding:0 10px; font-size:12px; background:#fff;">
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:14px;">
                        <button type="button" data-close-modal style="height:32px; border:1px solid #cbd5e1; border-radius:8px; padding:0 14px; background:#eef2f7; color:#273c57; cursor:pointer;">Cancel</button>
                        <button id="admin-new-document-submit" type="submit" style="height:32px; border:0; border-radius:8px; padding:0 14px; background:#143a63; color:#fff; font-weight:600; cursor:pointer;">Create</button>
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
            const created = await createRecordsFromForm(form, {
                recordId: editingRecordId,
                tableType: editingTableType,
            });
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
            const form = modal.querySelector("#admin-new-document-form");
            const title = modal.querySelector("#admin-new-document-title");
            const subtitle = modal.querySelector("#admin-new-document-subtitle");
            const submitButton = modal.querySelector("#admin-new-document-submit");
            editingRecordId = null;
            editingTableType = null;
            if (form) form.reset();
            if (form) {
                setFormStatusOptionsByMode(form, "documents");
                toggleBillingTypeOtherField(form);
                toggleBillingReceivedFields(form);
                setExistingScannedFileName(form, "");
            }
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
        documentBulkDeleteButton.addEventListener("click", () => {
            const selected = getSelectedRecordIds(documentsTableBody, "pa-empty-documents");
            if (!selected.length) return;
            if (!window.confirm(`Delete ${selected.length} selected document record(s)?`)) return;
            deleteRecordsByIds(selected);
        });
    }
    if (billingBulkDeleteButton) {
        billingBulkDeleteButton.addEventListener("click", () => {
            const selected = getSelectedRecordIds(billingTableBody, "pa-empty-billing");
            if (!selected.length) return;
            if (!window.confirm(`Delete ${selected.length} selected billing record(s)?`)) return;
            deleteRecordsByIds(selected);
        });
    }
    if (documentsTableBody) {
        documentsTableBody.addEventListener("change", (event) => {
            const target = event.target;
            if (target && target.classList.contains("js-admin-row-select")) {
                syncSelectionControls();
            }
        });
        documentsTableBody.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-admin-action]");
            if (!actionButton) return;
            const action = actionButton.dataset.adminAction;
            const recordId = actionButton.dataset.recordId;
            if (!recordId) return;

            if (action === "view-file") {
                const record = readAdminDivisionRecords().find((item) => item.__record_id === recordId);
                if (!record?.scanned_file_data) {
                    window.alert("No scanned file is available for this record.");
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
                if (!window.confirm("Delete this record?")) return;
                deleteRecordsByIds([recordId]);
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
        billingTableBody.addEventListener("click", (event) => {
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
                if (!window.confirm("Delete this record?")) return;
                deleteRecordsByIds([recordId]);
            }
        });
    }

    refreshDocumentCounters();
    refreshBillingCounters();
    applyDocumentFilters();
    applyBillingFilters();
    restoreAdminDivisionRecords();
    syncSelectionControls();
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
                            <button type="button" class="construction-action-btn construction-action-btn--edit js-construction-edit-row" data-record-id="${escapeHtml(record.__id)}">Edit</button>
                            <button type="button" class="construction-action-btn js-construction-delete-row" data-record-id="${escapeHtml(record.__id)}">Delete</button>
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
                window.alert("No valid construction rows were found in the selected file(s).");
                uploadInput.value = "";
                return;
            }

            records = [...uploaded, ...records];
            currentPage = 1;
            writeStoredRecords(records);
            renderTable();
            uploadInput.value = "";
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
        constructionTableBody.addEventListener("click", (event) => {
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

            if (!window.confirm("Delete this construction record?")) return;
            records = records.filter((record) => record.__id !== recordId);
            clampCurrentPage();
            writeStoredRecords(records);
            renderTable();
        });

        constructionTableBody.addEventListener("change", (event) => {
            const target = event.target;
            if (target && target.classList.contains("js-construction-row-select")) {
                updateSelectionControls();
            }
        });
    }

    if (deleteSelectedButton) {
        deleteSelectedButton.addEventListener("click", () => {
            const selectedIds = getVisibleRowCheckboxes()
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => checkbox.dataset.recordId);
            if (!selectedIds.length) return;

            if (!window.confirm(`Delete ${selectedIds.length} selected construction record(s)?`)) return;

            const removeSet = new Set(selectedIds);
            records = records.filter((record) => !removeSet.has(record.__id));
            clampCurrentPage();
            writeStoredRecords(records);
            renderTable();
        });
    }

    if (deleteAllButton) {
        deleteAllButton.addEventListener("click", () => {
            if (!records.length) return;
            if (!window.confirm("Delete all construction records? This action cannot be undone.")) return;

            records = [];
            currentPage = 1;
            writeStoredRecords(records);
            renderTable();
        });
    }

    renderTable();
});
/* CONSTRUCTION_DIVISION_SCRIPT_END */

