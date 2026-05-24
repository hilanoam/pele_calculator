// ====== Config ======
const FIXED_NI = 0.07;      // ביטוח לאומי
const FIXED_HEALTH = 0.05;  // ביטוח בריאות
const ALLOWANCE_AUTO_PCT = 0.71; // 71%

let allowanceAuto = true; 

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

const phoneMonthlyCost = document.getElementById("phoneMonthlyCost");
const employerShareEl = document.getElementById("employerShare");
const phoneBillChargeEl = document.getElementById("phoneBillCharge");
const halfCostEl = document.getElementById("halfCost");
const employeeShareEl = document.getElementById("employeeShare");
const taxableBenefitEl = document.getElementById("taxableBenefit");
const dynamicCards = document.getElementById("dynamicCards");
const datesCard = document.getElementById("datesCard");

const field2Card = document.getElementById("field2Card");

const carType = document.getElementById("carType");
const benefitManual = document.getElementById("benefitManual");
const taxPct = document.getElementById("taxPct");
const allowance = document.getElementById("allowance");

// Breakdown field 1
const taxOnBenefit = document.getElementById("taxOnBenefit");
const nOnBenefit = document.getElementById("nOnBenefit");
const hOnBenefit = document.getElementById("hOnBenefit");
const sumBenefit = document.getElementById("sumBenefit");

// Breakdown field 2
const taxPct2 = document.getElementById("taxPct2");
const taxOnAllowance = document.getElementById("taxOnAllowance");
const nOnAllowance = document.getElementById("nOnAllowance");
const hOnAllowance = document.getElementById("hOnAllowance");
const netAllowance = document.getElementById("netAllowance");

// Final
const finalValue = document.getElementById("finalValue");

// Calc button
const btnCalc = document.getElementById("btnCalc");
const footerBanner = document.getElementById("footerBanner");

// ====== State ======
let hasStandard = null; // null עד שלא בוחרים
let submitted = false;



// ====== Calculation helpers ======
function renderPhoneExplanation(phoneCost, employerShare, phoneBillCharge, halfCost, taxableBenefit) {
  if (phoneMonthlyCost) phoneMonthlyCost.textContent = money(phoneCost);
  if (employerShareEl) employerShareEl.textContent = money(employerShare);
  if (phoneBillChargeEl) phoneBillChargeEl.textContent = money(phoneBillCharge);
  if (halfCostEl) halfCostEl.textContent = money(halfCost);
  if (employeeShareEl) employeeShareEl.textContent = money(phoneBillCharge);
  if (taxableBenefitEl) taxableBenefitEl.textContent = money(taxableBenefit);
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
  if (hasStandard !== true) return;
  if (!allowance) return;
  if (!allowanceAuto) return;

  const B = getBenefitValue();
  allowance.value = B > 0 ? money(B * ALLOWANCE_AUTO_PCT) : "";
}

// ====== Validation (אדום רק אחרי "חשב") ======
function mark(el, ok) {
  if (!el) return;
  if (!submitted) {
    el.classList.remove("input-error");
    return;
  }
  el.classList.toggle("input-error", !ok);
}

function clearAllMarks() {
  [carType, benefitManual, taxPct].forEach((el) => {
    if (el) el.classList.remove("input-error");
  });
}

function stopWithError(msg) {
  if (finalValue) finalValue.textContent = "—";
  return { ok: false };
}

function validateRequired() {
  let ok = true;

  if (!rankType?.value) {
    rankType?.classList.add("input-error");
    ok = false;
  } else {
    rankType?.classList.remove("input-error");
  }

  if (!phoneType?.value) {
    phoneType?.classList.add("input-error");
    ok = false;
  } else {
    phoneType?.classList.remove("input-error");
  }

  if (!taxPct?.value) {
    taxPct?.classList.add("input-error");
    ok = false;
  } else {
    taxPct?.classList.remove("input-error");
  }

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

  // field1 cost (עלות ניכוי על זקיפת הטבה לרכב)
  const taxB = B * T;
  const niB = B * FIXED_NI;
  const healthB = B * FIXED_HEALTH;
  const cost1 = taxB + niB + healthB;
  const final = cost1;
  

  // ====== Render breakdowns ======
  if (taxOnBenefit) taxOnBenefit.textContent = money(taxB);
  if (nOnBenefit) nOnBenefit.textContent = money(niB);
  if (hOnBenefit) hOnBenefit.textContent = money(healthB);
  if (sumBenefit) sumBenefit.textContent = money(cost1);
  if (finalValue) finalValue.textContent = `₪ ${money(final)}`;
  
}


// ====== Listeners ======
function maybeRecalc() {
  if (submitted) recalc();
}


rankType?.addEventListener("change", maybeRecalc);
phoneType?.addEventListener("change", maybeRecalc);
taxPct?.addEventListener("change", maybeRecalc);

taxPct?.addEventListener("change", maybeRecalc);

// allowance: אם מתחילים להקליד -> מפסיקים אוטומטי
allowance?.addEventListener("input", () => {
  allowanceAuto = allowance.value.trim() === "";
  if (allowanceAuto) autoFillAllowanceIfNeeded();
  maybeRecalc();
});


// כפתור חשב
btnCalc?.addEventListener("click", () => {
  submitted = true;
  recalc();
});

// ====== Init ======
function init() {
  if (carType) carType.value = "";
  if (benefitManual) benefitManual.value = "";
  if (taxPct) taxPct.value = "";

  submitted = false;

  // מציגים ישר את המחשבון
  dynamicCards?.classList.remove("hidden");

  // מסתירים לחלוטין כרטיסים שלא רלוונטיים
  datesCard?.classList.add("hidden");
  field2Card?.classList.add("hidden");

  clearAllMarks();

  if (finalValue) finalValue.textContent = "0.00";
}
init();
