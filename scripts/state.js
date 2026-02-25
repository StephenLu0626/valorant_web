// scripts/state.js
// 全站共用的 state，用 localStorage 存起來，換頁不會消失

const STORAGE_KEY = "valorant_duel_state_v1";
// 讀取 localStorage 裡的資料
function loadState() { //讀取之前儲存的state
  try { // 嘗試執行以下程式碼 避免程式錯誤導致整個網站掛掉
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};  // 儲存的是字串 → 沒東西就回傳空物件
    const parsed = JSON.parse(raw); //JSON = JavaScript Object Notation  字串轉換為原生 JavaScript 物件或值
    if (typeof parsed === "object" && parsed !== null) return parsed;
    return {}; // 防呆：不是物件就回傳空物件 
  } catch (e) { // 捕捉錯誤
    console.warn("Failed to load state from localStorage:", e); // 印出警告訊息
    return {};
  }
}
// 寫回 localStorage
function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); // 將 state 物件轉成字串存起來 因為 localStorage 只能存字串 不能存物件
  } catch (e) { // 捕捉錯誤
    console.warn("Failed to save state to localStorage:", e);
  }
}
// 這個變數會被三個頁面共用（因為 module 只會載入一次） ES model 只會載入一次 而且會被三個頁面共用
let state = loadState();
// 讓別的檔案可以拿目前的 state
export function getState() { //只提供讀取不接受參數改變
  return state;
}
// 讓別的檔案可以更新 state（會自動 merge & 存到 localStorage）
export function setState(patch) {
  state = { ...state, ...patch }; // ...展開物件並合併（後面覆蓋前面） 更新我想要的物件
  saveState(state);
}

// 如果之後你要清空所有設定，可以叫這個
export function resetState() {
  state = {};
  saveState(state);
}
window.getState = getState;
window.setState = setState;
