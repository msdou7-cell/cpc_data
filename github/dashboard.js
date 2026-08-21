"use strict";

/*=============================================================
    APPLICATION INFORMATION
=============================================================*/
const APP = {
    name: "Church Member's Contribution Dashboard",
    version: "CPC",
    developer: "Moshildou Dangsha",
    buildDate: "August 2026"
};

/*=============================================================
    APPLICATION STATE
=============================================================*/
const App = {
    data: null,
    currentView: "dashboard",
    currentData: [],
    selectedLeikai: "",
    searchText: ""
};

/*=============================================================
    DOM CACHE
=============================================================*/
const Cache = {};
const DOM = {
    appContainer: "appContainer",
    kpiSection: "kpiSection",
    summaryPanel: "summaryPanel",
    toolbarPanel: "toolbarPanel",
    detailTable: "detailTable",
    statusBar: "statusBar",
    dashboardTitle: "dashboardTitle",
    dashboardVersion: "dashboardVersion"
};

function cacheControls() {
    Object.keys(DOM).forEach(key => {
        Cache[key] = document.getElementById(DOM[key]);
    });
}

/*=============================================================
    INITIALISE APPLICATION
=============================================================*/
document.addEventListener("DOMContentLoaded", initialiseApplication);

function initialiseApplication() {
    cacheControls();
    registerGlobalEvents();
    showApplicationInformation();

    // Load detailed records from data.json
    fetch("data.json")
        .then(res => res.json())
        .then(records => {
            // If your JSON is a single object, wrap it in an array
            if (!Array.isArray(records)) {
                records = [records];
            }

            // Build totals
            const totals = {
                grandTotal: 0,
                totalFamilies: records.length,
                totalMembers: records.length, // adjust if you track members separately
                freeWill: 0,
                faithPromise: 0,
                employeeSubscription: 0,
                nonEmployeeSubscription: 0,
                windows: 0,
                cpc: 0,
                pillars: 0,
                tiles: 0,
                savingBox: 0,
                executiveMembers: 0,
                societyshares: 0
            };

            // Aggregate values from each record
            records.forEach(r => {
                totals.freeWill += Number(r["FreeWill"]) || 0;
                totals.faithPromise += Number(r["FaithPromise"]) || 0;

                totals.employeeSubscription +=
                    (Number(r["Phase 1"]) || 0) +
                    (Number(r["Phase 2"]) || 0) +
                    (Number(r["Phase 3 (50%)"]) || 0) +
                    (Number(r["Phase 4 (50%)"]) || 0) +
                    (Number(r["Phase 5 (40%)"]) || 0);

                totals.nonEmployeeSubscription +=
                    (Number(r["Phase A"]) || 0) +
                    (Number(r["Phase B"]) || 0) +
                    (Number(r["Phase C (50%)"]) || 0) +
                    (Number(r["Phase D (50%)"]) || 0) +
                    (Number(r["Phase E (Cate. A/B)"]) || 0);

                totals.windows += Number(r["Windows"]) || 0;
                totals.cpc += Number(r["CPC Subscription"]) || 0;
                totals.pillars += Number(r["Pillars"]) || 0;
                totals.tiles += Number(r["Tiles"]) || 0;
                totals.savingBox += Number(r["Saving Box"]) || 0;
            });

            // Calculate grand total
            totals.grandTotal =
                totals.freeWill +
                totals.faithPromise +
                totals.employeeSubscription +
                totals.nonEmployeeSubscription +
                totals.windows +
                totals.cpc +
                totals.pillars +
                totals.tiles +
                totals.savingBox;

            // Save aggregated data
            App.data = totals;

            // Build KPI dashboard
            buildDashboard();
        })
        .catch(err => console.error("Data load error:", err));
}


/*=============================================================
    GLOBAL EVENTS
=============================================================*/
function registerGlobalEvents() {
    window.addEventListener("resize", () => {
        console.log("Window resized.");
    });
}

/*=============================================================
    APPLICATION HEADER
=============================================================*/
function showApplicationInformation() {
    if (Cache.dashboardTitle) {
        Cache.dashboardTitle.textContent = APP.name;
    }
}

/*=============================================================
    FORMAT HELPERS
=============================================================*/
function formatNumber(value) {
    value = Number(value) || 0;
    return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function formatCurrency(value) {
    return "₹ " + formatNumber(value);
}
function safeText(value) {
    return value == null ? "" : String(value).trim();
}
function safeNumber(value) {
    value = Number(value);
    return isNaN(value) ? 0 : value;
}

/*=============================================================
    KPI CONFIGURATION
=============================================================*/
const KPI = [
    { id: "grandTotal", title: "Grand Total", icon: "💰", value: "grandTotal" },
    { id: "totalFamilies", title: "Families", icon: "🏠", value: "totalFamilies" },
    { id: "totalMembers", title: "Members", icon: "👨‍👩‍👧‍👦", value: "totalMembers" },
    { id: "freeWill", title: "Free Will", icon: "🙏", value: "freeWill" },
    { id: "faithPromise", title: "Faith Promise", icon: "❤️", value: "faithPromise" },
    { id: "employeeSubscription", title: "Employee Subscription", icon: "👨‍💼", value: "employeeSubscription" },
    { id: "nonEmployeeSubscription", title: "Non Employee Subscription", icon: "👥", value: "nonEmployeeSubscription" },
    { id: "windows", title: "Windows", icon: "🪟", value: "windows" },
    { id: "cpc", title: "CPC", icon: "📘", value: "cpc" },
    { id: "pillars", title: "Pillars", icon: "🏛", value: "pillars" },
    { id: "tiles", title: "Tiles", icon: "🧱", value: "tiles" },
    { id: "savingBox", title: "Saving Box", icon: "💵", value: "savingBox" },
    { id: "executiveMembers", title: "Executive Members", icon: "👔", value: "executiveMembers" },
    { id: "societyshares", title: "Society Shares", icon: "⛪", value: "societyshares" }
];

/*=============================================================
    BUILD KPI DASHBOARD
=============================================================*/
function buildDashboard() {
    if (!App.data) {
        console.error("No data available to build dashboard.");
        return;
    }

    let html = "";
    KPI.forEach(item => {
        let value = safeNumber(App.data[item.value]);
        html += `
        <article class="kpi-card" data-view="${item.id}">
            <div class="kpi-icon">${item.icon}</div>
            <div class="kpi-title">${item.title}</div>
            <div class="kpi-value">${formatNumber(value)}</div>
        </article>`;
    });

    if (Cache.kpiSection) {
        Cache.kpiSection.innerHTML = html;
        registerKPICards();
    }
}

/*=============================================================
    KPI CLICK EVENTS
=============================================================*/
function registerKPICards() {
    document.querySelectorAll(".kpi-card").forEach(card => {
        card.addEventListener("click", function () {
            Dashboard.open(this.dataset.view);
        });
    });
}

/*=============================================================
    DASHBOARD NAVIGATION ENGINE
=============================================================*/
const Dashboard = {
    open(view) {
        console.log("Opening View:", view);
        // Add your view-specific functions here
    }
};
