// ====== Config ======
const FIXED_NI = 0.07;      // ביטוח לאומי
const FIXED_HEALTH = 0.05;  // ביטוח בריאות
const ALLOWANCE_AUTO_PCT = 0.71; // 71%

let allowanceAuto = true; 
let submitted = false;

const PHONE_VALUES = {
  galaxy_a26_5g_128: 48.94,
  galaxy_a36_5g_128: 51.83,
  galaxy_a56_5g_256: 60.08,
  galaxy_s25_fe_256: 74.00,
  galaxy_s25_256: 82.34,
  galaxy_s25_edge_256: 79.60,
  galaxy_s26_256: 86.01,

  iphone_17e_256: 62.98,
  iphone_17e_512: 72.66,
  iphone_17_256: 73.54,
  iphone_17_air_256: 74.78,
  iphone_17_pro_256: 88.32,

  galaxy_s25_edge_512: 90.70,
  galaxy_s25_ultra_256: 101.73,
  galaxy_s25_ultra_512: 106.51,
  galaxy_s25_ultra_1024: 123.83,
  galaxy_z_flip_7_256: 95.61,
  galaxy_z_flip_7_512: 107.10,
  galaxy_z_fold_7_256: 150.30,
  galaxy_z_fold_7_512: 159.32,
  galaxy_s26_premium_256: 97.74,
  galaxy_s26_plus_256: 96.02,
  galaxy_s26_plus_512: 107.82,
  galaxy_s26_ultra_256: 108.27,
  galaxy_s26_ultra_512: 119.25,
  galaxy_s26_ultra_1024: 135.58,

  iphone_17_pro_512: 98.25,
  iphone_17_pro_1024: 107.45,
  iphone_17_pro_max_256: 93.06,
  iphone_17_pro_max_512: 103.31,
  iphone_17_pro_max_1024: 113.06
};

const RANK_ALLOWANCE = {
  "רשט": 88.5,
  "סמש": 88.5,
  "סמר": 88.5,
  "רסל": 88.5,
  "רסר": 88.5,
  "רסמ": 88.5,
  "סגמ": 88.5,
  "רסב": 88.5,
  "רנג": 118,
  "ממש": 88.5,
  "מפקח": 88.5,
  "פקד": 88.5,
  "רפק": 118,
  "סנצ": 118,
  "נצמ": 177,
  "תנצ": 177,
  "ניצב": 236
};

// ====== Utils ======
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function money(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function pctToNum(pctStr) {
  return toNum(pctStr) / 100;
}

// ====== Elements ======
const rankType = document.getElementById("rankType");
const phoneType = document.getElementById("phoneType");
const taxPct = document.getElementById("taxPct");
const allowance = document.getElementById("allowance");

// Breakdown explanations
const phoneMonthlyCost = document.getElementById("phoneMonthlyCost");
const employerShareEl = document.getElementById("employerShare");
const phoneBillChargeEl = document.getElementById("phoneBillCharge");
const halfCostEl = document.getElementById("halfCost");
const employeeShareEl = document.getElementById("employeeShare");
const taxableBenefitEl = document.getElementById("taxableBenefit");

const phoneCostFormula = document.getElementById("phoneCostFormula");
const employerShareFormula = document.getElementById("employerShareFormula");
const halfCostFormula = document.getElementById("halfCostFormula");
const employeeShareFormula = document.getElementById("employeeShareFormula");

// Breakdown field (tax deduction)
const taxOnBenefit = document.getElementById("taxOnBenefit");
const nOnBenefit = document.getElementById("nOnBenefit");
const hOnBenefit = document.getElementById("hOnBenefit");
const sumBenefit = document.getElementById("sumBenefit");

// Final
const finalTaxCharge = document.getElementById("finalTaxCharge");
const finalPhoneCharge = document.getElementById("finalPhoneCharge");
const finalValue = document.getElementById("finalValue");

// Layout & Actions
const dynamicCards = document.getElementById("dynamicCards");
const footerBanner = document.getElementById("footerBanner");
const btnCalc = document.getElementById("btnCalc");

// ====== Calculation helpers ======
function renderPhoneExplanation(phoneCost, employerShare, phoneBillCharge, halfCost, taxableBenefit) {
  if (phoneMonthlyCost) phoneMonthlyCost.textContent = money(phoneCost);
  if (employerShareEl) employerShareEl.textContent = money(employerShare);
  if (phoneBillChargeEl) phoneBillChargeEl.textContent = money(phoneBillCharge);
  if (halfCostEl) halfCostEl.textContent = money(halfCost);
  if (employeeShareEl) employeeShareEl.textContent = money(phoneBillCharge);
  if (taxableBenefitEl) taxableBenefitEl.textContent = money(taxableBenefit);
  if (phoneCostFormula) phoneCostFormula.textContent = money(phoneCost);
  if (employerShareFormula) employerShareFormula.textContent = money(employerShare);
  if (halfCostFormula) halfCostFormula.textContent = money(halfCost);
  if (employeeShareFormula) employeeShareFormula.textContent = money(phoneBillCharge);
}

function getBenefitValue() {
  const phoneCost = PHONE_VALUES[phoneType?.value] ?? 0;
  const employerShare = RANK_ALLOWANCE[rankType?.value] ?? 0;

  const phoneBillCharge = Math.max(phoneCost - employerShare, 0);
  const halfCost = Math.min(phoneCost / 2, 115);
  const taxableBenefit = Math.max(halfCost - phoneBillCharge, 0);

  renderPhoneExplanation(phoneCost, employerShare, phoneBillCharge, halfCost, taxableBenefit);

  return taxableBenefit;
}

function autoFillAllowanceIfNeeded() {
  if (!allowance || !allowanceAuto) return;

  const B = getBenefitValue();
  allowance.value = B > 0 ? money(B * ALLOWANCE_AUTO_PCT) : "";
}

// ====== Validation ======
function validateRequired() {
  let ok = true;
  const requiredFields = [rankType, phoneType, taxPct];

  requiredFields.forEach((el) => {
    if (!el?.value) {
      el?.classList.add("input-error");
      ok = false;
    } else {
      el?.classList.remove("input-error");
    }
  });

  return ok;
}

// ====== Main calc ======
function recalc() {
  if (!submitted) {
    if (finalValue) finalValue.textContent = "—";
    return;
  }

  if (!validateRequired()) {
    return;
  }

  footerBanner?.classList.remove("hidden");

  const B = getBenefitValue();
  const T = pctToNum(taxPct?.value);

  // חישוב עלות ניכוי על זקיפת הטבה
  const taxB = B * T;
  const niB = B * FIXED_NI;
  const healthB = B * FIXED_HEALTH;
  const cost1 = taxB + niB + healthB;
  
  const phoneCost = PHONE_VALUES[phoneType?.value] ?? 0;
  const rankShare = RANK_ALLOWANCE[rankType?.value] ?? 0;
  const phoneBillCharge = Math.max(phoneCost - rankShare, 0);

  const final = cost1 + phoneBillCharge;
  
  // Render formulas
  if (finalTaxCharge) finalTaxCharge.textContent = money(cost1);
  if (finalPhoneCharge) finalPhoneCharge.textContent = money(phoneBillCharge);
  
  // Render breakdowns
  if (taxOnBenefit) taxOnBenefit.textContent = money(taxB);
  if (nOnBenefit) nOnBenefit.textContent = money(niB);
  if (hOnBenefit) hOnBenefit.textContent = money(healthB);
  if (sumBenefit) sumBenefit.textContent = money(cost1);
  
  // Render final result
  if (finalValue) finalValue.textContent = `₪ ${money(final)}`;
}

// ====== Listeners ======
function maybeRecalc() {
  if (rankType?.value && phoneType?.value) {
    getBenefitValue();
  }

  if (rankType?.value && phoneType?.value && taxPct?.value) {
    submitted = true;
    recalc();
  }
}

// ====== Init & Setup ======
function init() {
  // Reset state
  submitted = false;
  if (taxPct) taxPct.value = "";
  
  dynamicCards?.classList.remove("hidden");
  if (finalValue) finalValue.textContent = "0.00";
  
  // Clear error marks
  [rankType, phoneType, taxPct].forEach((el) => el?.classList.remove("input-error"));

  // Event Listeners for inputs
  rankType?.addEventListener("change", maybeRecalc);
  phoneType?.addEventListener("change", maybeRecalc);
  taxPct?.addEventListener("change", maybeRecalc);

  // Allowance typing override
  allowance?.addEventListener("input", () => {
    allowanceAuto = allowance.value.trim() === "";
    if (allowanceAuto) autoFillAllowanceIfNeeded();
    maybeRecalc();
  });

  // Calculate button
  btnCalc?.addEventListener("click", () => {
    submitted = true;
    recalc();
  });

  // Tooltip Logic integration
  document.addEventListener("click", function (event) {
    const clickedTooltipButton = event.target.closest(".info-tooltip-btn");
    const clickedTooltipBox = event.target.closest(".tooltip-box");

    document.querySelectorAll(".info-tooltip-btn.open").forEach(function (btn) {
      if (btn !== clickedTooltipButton && !clickedTooltipBox) {
        btn.classList.remove("open");
      }
    });

    if (clickedTooltipButton && !clickedTooltipBox) {
      clickedTooltipButton.classList.toggle("open");
    }
  });
}

// Run init on load
init();