// ====== Config ======
const FIXED_NI = 0.07;      // ביטוח לאומי
const FIXED_HEALTH = 0.05;  // ביטוח בריאות
const ALLOWANCE_AUTO_PCT = 0.71; // 71%

let allowanceAuto = true; 
let submitted = false;

const PHONE_VALUES = {
  galaxy_a37_5g_128: 55.51,
  galaxy_a57_5g_256: 63.27,
  galaxy_s25_fe_256: 70.20,
  galaxy_s25_256: 75.37,
  galaxy_s25_edge_256: 75.91,
  galaxy_s25_edge_512: 76.46,
  galaxy_s25_ultra_256: 89.53,
  galaxy_s25_ultra_512: 97.84,
  galaxy_s25_ultra_1024: 123.83,
  galaxy_z_flip_7_256: 91.89,
  galaxy_z_flip_7_512: 99.01,
  galaxy_z_flip_8_256: 98.31,
  galaxy_z_flip_8_512: 110.35,
  galaxy_z_fold_7_256: 142.02,
  galaxy_z_fold_7_512 :146.39,
  galaxy_z_fold_8_256: 131.99,
  galaxy_z_fold_8_512: 144.45,
  galaxy_z_fold_ultra_8_256: 145.06,
  galaxy_z_fold_ultra_8_512: 156.49,
  galaxy_s26_256: 78.92,
  galaxy_s26_512: 86.45,
  galaxy_s26_plus_256:87.41,
  galaxy_s26_plus_512:98.19,
  galaxy_s26_ultra_256: 97.16,
  galaxy_s26_ultra_512:106.76,
  galaxy_s26_ultra_1024:121.98,

  iphone_16_pro_max_256: 91.03,
  iphone_16_pro_max_512: 91.03,
  iphone_17e_256: 60.89,
  iphone_17e_512: 67.81,
  iphone_17_256:79.56,
  iphone_17_512:82.91,
  iphone_17_air_256:65.48,
  iphone_17_pro_256: 80.45,
  iphone_17_pro_512:89.63,
  iphone_17_pro_1024:98.44,
  iphone_17_pro_max_256: 84.76,
  iphone_17_pro_max_512:93.97,
  iphone_17_pro_max_1024:102.49
};

const RANK_ALLOWANCE = {
  "basic": 88.5,
  "senior": 118,
  "chief": 177,
  "nitsav": 236
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
const phoneBillFormula = document.getElementById("phoneBillFormula");
const taxableFormula = document.getElementById("taxableFormula");
const taxFormula = document.getElementById("taxFormula");
const nationalFormula = document.getElementById("nationalFormula");
const sumBenefitFormula = document.getElementById("sumBenefitFormula");

const rankType = document.getElementById("rankType");
const phoneType = document.getElementById("phoneType");
const taxPct = document.getElementById("taxRate");
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

  const nationalAndHealth = niB + healthB;

if (phoneBillFormula) phoneBillFormula.textContent = money(phoneBillCharge);
if (taxableFormula) taxableFormula.textContent = money(B);

if (taxFormula) taxFormula.textContent = money(taxB);
if (nationalFormula) nationalFormula.textContent = money(nationalAndHealth);
if (sumBenefitFormula) sumBenefitFormula.textContent = money(cost1);
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
  document.querySelectorAll(".info-tooltip-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();

    document.querySelectorAll(".info-tooltip-btn.open").forEach((openBtn) => {
      if (openBtn !== btn) openBtn.classList.remove("open");
    });

    btn.classList.toggle("open");
  });
});

document.addEventListener("click", function () {
  document.querySelectorAll(".info-tooltip-btn.open").forEach((btn) => {
    btn.classList.remove("open");
  });
});
document.querySelectorAll(".tooltip-box").forEach((box) => {
  box.addEventListener("click", function (e) {
    e.stopPropagation();
  });
});
}

// Run init on load
init();