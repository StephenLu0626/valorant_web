// scripts/step2.js

//ES Module：模組匯入（named import）
import { getState, setState } from "./state.js";   // 從 state.js 匯入狀態讀寫函式
import { runSimulation } from "./simulate.js";    // 匯入模擬主函式

// 函式宣告：百分比輸入欄位驗證 
function clampPercentInput(id) { // 透過id取得html輸入參數
  const el = document.getElementById(id); //  使用document是因為是因爲JS要存取HTML元素
  if (!el) return; // if + !：防呆，元素不存在就直接結束

  const fix = () => { // arrow function：箭頭函式（回呼函式）
    const raw = parseFloat(el.value); // parseFloat將el.value的字串轉換為浮點數

    // Number.isNaN：判斷是否不是數字
    if (Number.isNaN(raw)) {  //判斷非數字或是不合邏輯的運算
      el.value = "0";
      return;
    }

    if (raw < 0) {
      alert("Percentage cannot be negative (must be 0 ~ 100).");
      el.value = "0";
      el.focus(); // focus：游標回到該欄位
      return;
    }

    if (raw > 100) {
      alert("Percentage cannot exceed 100 (must be 0 ~ 100).");
      el.value = "100";
      el.focus();
      return;
    }
  };

  // addEventListener：事件監聽
  el.addEventListener("input", fix); // 每次都觸發
  el.addEventListener("blur", fix);  // 離開才觸發
}

//  函式宣告：三個 Custom 命中率總和 ≤ 100 
function setupCustomSumGuard(headId, bodyId, legId) {
  const head = document.getElementById(headId);
  const body = document.getElementById(bodyId);
  const leg  = document.getElementById(legId);
  if (!head || !body || !leg) return; // 驚嘆號是反轉值

  const guard = (changedEl) => { // 監控哪一格被改來提前回傳錯誤 changedEl是指正在被改變的
    const h = Math.max(0, parseFloat(head.value) || 0); // Math.max：避免負數 後面兩條線一個零是避免NaN
    const b = Math.max(0, parseFloat(body.value) || 0); 
    const l = Math.max(0, parseFloat(leg.value)  || 0);
    const sum = h + b + l; // 加總三個部位命中率

    if (sum <= 100) return; // 總和沒超過 100%，直接結束  

    const changedVal = Math.max(0, parseFloat(changedEl.value) || 0);
    const otherSum = sum - changedVal;
    const maxAllowed = Math.max(0, 100 - otherSum);

    alert("Head + Body + Leg/Arm cannot exceed 100%.");
    changedEl.value = String(maxAllowed); // String轉成字串
    changedEl.focus();
  };

  // forEach：陣列迭代
  [head, body, leg].forEach((el) => {
    el.addEventListener("input", () => guard(el)); // 兩個event都在檢查
    el.addEventListener("blur",  () => guard(el));
  });
}

// ===== 函式宣告：數值不能小於 1 =====
function MinOneInput(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const fix = () => {
    const raw = parseFloat(el.value);

    if (Number.isNaN(raw)) {
      alert("Value must be a number ≥ 1.");
      el.value = "1";
      el.focus();
      return;
    }

    if (raw < 1) {
      alert("Value must be at least 1.");
      el.value = "1";
      el.focus();
      return;
    }
  };

  el.addEventListener("input", fix);
  el.addEventListener("blur", fix);
}

// 函式宣告：控制 Custom 面板顯示/隱藏 
function setupCustomPanels() {
  const selectA = document.getElementById("accPresetA");
  const selectB = document.getElementById("accPresetB");
  const panelA  = document.getElementById("customAccA");
  const panelB  = document.getElementById("customAccB");

  if (!selectA || !selectB || !panelA || !panelB) return; //兩個直線代表如果有一個為True就回傳, 但!代表反轉, 所以如果有一個不存在就終止

  const updateA = () => {
    panelA.style.display = (selectA.value === "Custom") ? "block" : "none";
    // 三個等於代表值完全一樣， 問號加冒號是條件運算子，如果是就回傳block(顯示）否則回傳none
  };

  const updateB = () => {
    panelB.style.display = (selectB.value === "Custom") ? "block" : "none";
  };

  updateA(); // 初始狀態同步
  updateB();

  selectA.addEventListener("change", updateA); // change：選項改變
  selectB.addEventListener("change", updateB);
}

// 函式宣告：更新 Summary Bar 
function updateSummary() {
  const s = getState(); // 讀取全域 state

  document.getElementById("sumWeaponA").textContent =
    `A: ${s.weaponA || "Weapon – (not set)"}`; // 反斜線是模板字串, 錢錢花括號是變數插入 兩條直線是預設值，如果沒填就用右邊

  document.getElementById("sumWeaponB").textContent =
    `B: ${s.weaponB || "Weapon – (not set)"}`;

  document.getElementById("sumDistance").textContent =
    typeof s.distance_m === "number" //回傳型別字串（"number" / "string" / "undefined"…）
      ? `Distance: ${s.distance_m} m`
      : "Distance: (not set)";
  // typeof：型別判斷
}

// ===== 函式宣告：讀表單 → 存進 state =====
function saveFormToState() {
  const hpA    = parseInt(document.getElementById("hpA").value); // 把字串轉成整數（ＩＮＴ）如果是空字串會變成NaN
  const hpB    = parseInt(document.getElementById("hpB").value);
  const armorA = parseInt(document.getElementById("armorA").value);
  const armorB = parseInt(document.getElementById("armorB").value);

  const accPresetA = document.getElementById("accPresetA").value; //不轉數字是因為我要讀選項的字串
  const accPresetB = document.getElementById("accPresetB").value;

  const customHeadA = parseFloat(document.getElementById("customHeadA")?.value) || 0; 
  //轉有小數點的，轉不到就顯示0 ？.是optional chaining operator，避免找不到元素報錯
  const customBodyA = parseFloat(document.getElementById("customBodyA")?.value) || 0;
  const customLegA  = parseFloat(document.getElementById("customLeg_and_armA")?.value) || 0;

  const customHeadB = parseFloat(document.getElementById("customHeadB")?.value) || 0;
  const customBodyB = parseFloat(document.getElementById("customBodyB")?.value) || 0;
  const customLegB  = parseFloat(document.getElementById("customLeg_and_armB")?.value) || 0;

  const muA    = parseFloat(document.getElementById("muA").value);
  const sigmaA = parseFloat(document.getElementById("sigmaA").value);
  const pingA  = parseFloat(document.getElementById("pingA").value);

  const muB    = parseFloat(document.getElementById("muB").value);
  const sigmaB = parseFloat(document.getElementById("sigmaB").value);
  const pingB  = parseFloat(document.getElementById("pingB").value);

  const trials = parseInt(document.getElementById("trials").value);

  const peekerSide =
    document.querySelector("input[name='peekerSide']:checked").value; //因為 radio 不像單一 input 有固定 id，你要找「被 checked 的那個」。
  const prev = getState();

  const next = {
    ...prev, // 展開舊 state, 保留沒改的欄位, 將input的值覆蓋進去
    hpA, hpB,
    armorA, armorB,
    accPresetA, accPresetB,
    customHeadA, customBodyA, customLegA,
    customHeadB, customBodyB, customLegB,
    muA, sigmaA, pingA,
    muB, sigmaB, pingB,
    trials,
    peekerSide,
  };

  setState(next); // 寫回全域 state
}
//  函式宣告：按鈕事件處理 
function attachHandlers() {
  const btn = document.getElementById("runSim");
  if (!btn) return;

  btn.addEventListener("click", () => {
    saveFormToState();           // 1. 存參數
    const s = getState();        // 2. 讀 state
    const simResult = runSimulation(s); // 3. 跑模擬
    setState({ ...s, simResult }); // 4. 存結果
    window.location.href = "result.html"; // 頁面跳轉
  });
}
// DOMContentLoaded：頁面載入完成 
document.addEventListener("DOMContentLoaded", () => {
  updateSummary();
  attachHandlers();
  setupCustomPanels();

  clampPercentInput("customHeadA");
  clampPercentInput("customBodyA");
  clampPercentInput("customLeg_and_armA");
  clampPercentInput("customHeadB");
  clampPercentInput("customBodyB");
  clampPercentInput("customLeg_and_armB");
  MinOneInput("muA");
  MinOneInput("sigmaA");
  MinOneInput("pingA");
  MinOneInput("muB");
  MinOneInput("sigmaB");
  MinOneInput("pingB");
  MinOneInput("trials");

  setupCustomSumGuard("customHeadA", "customBodyA", "customLeg_and_armA");
  setupCustomSumGuard("customHeadB", "customBodyB", "customLeg_and_armB");
});
