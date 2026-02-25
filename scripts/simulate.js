import { getState, setState } from "./state.js"; // import：ES Module 模組匯入（具名匯入 named import）

//  Normal Distribution 
// function：函式宣告，用 Box–Muller Transform 抽樣常態分佈（Normal）亂數
function sampleNormal(mu, sigma) { // mu：平均值，sigma：標準差（控制分散程度）
  let u1 = Math.random(); // Math.random：均勻分布 U(0,1) 亂數
  let u2 = Math.random();
  let z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); // 把均勻→常態
  let v = mu + z * sigma; // 線性轉換：把標準常態 Z 轉成 N(mu, sigma^2)
  return v < 0 ? 0 : v; // 避免負值
}
// 這段程式使用 Box–Muller Transform，random通常只給平均所以轉換成常態分布，用來模擬人類反應時間，並透過平均值與標準差控制反應速度與穩定度，同時確保結果不出現不合理的負值。


function msBetweenShots(rps) { // rps：每秒射擊次數
  return 1000 / rps; // 1000ms / rps = 兩發之間的時間間隔 把「每秒幾發」換成「每發間隔幾毫秒」。
}


// 從 WEAPONS 陣列中用 .find() 找出指定名稱武器
function getWeaponByName(name) { // name：武器名稱字串
  return WEAPONS.find((w) => w.name === name); // .find：找到第一個符合條件的元素
}

//  Damage by distance band 
// function：函式宣告，依距離與命中部位回傳該武器傷害
function getDamage(weapon, distance, part) {
  if (!weapon || !weapon.damageBands) return 0; // ||防呆，武器或傷害表不存在就回 0

  for (const band of weapon.damageBands) { // for...of：遍歷傷害距離分段
    if (distance <= band.max) { // if：判斷距離落在哪個 band
      if (part === "head") return band.head; // ===：嚴格相等
      if (part === "body") return band.body;
      if (part === "legs") return band.leg_and_arm; // 注意：你的 part 用 "legs"，對應表是 leg_and_arm
    }
  }
  return 0; // 超出所有 band 的保底
}

//  Accuracy preset table 
// const：常數宣告，準度預設表（head/body/leg 機率）
const PRESET_TABLE = {
  Iron:    { head: 0.131, body: 0.350, leg: 0.10 },
  Gold:    { head: 0.213, body: 0.42,  leg: 0.12 },
  Radiant: { head: 0.298, body: 0.46,  leg: 0.13 },
};

//  Normalize 3 values 
// function：函式宣告，把三個數字正規化成總和=1 的機率分布
function normalize3(h, b, l) {
  const sum = h + b + l; // const：區域常數
  if (sum <= 0) return { h: 0, b: 0, l: 1 }; // return：保底，避免除以 0（這裡等同全落在 l）
  return { h: h / sum, b: b / sum, l: l / sum }; // 除以總和 → normalized
}

//  Build accuracy for player 
// function：函式宣告，依玩家 A/B 的 state 設定建出命中機率結構
function buildAccuracy(s, key) {
  const preset = s[`accPreset${key}`]; // []：動態屬性存取（computed property name），用字串組 key

  let h, b, l; // let：可變變數（後面會依 preset 分支賦值）

  if (preset === "Custom") { // if：判斷是否自訂命中率
    h = (s[`customHead${key}`] || 0) / 100; // ||：若空值則 0，/100：百分比→機率
    b = (s[`customBody${key}`] || 0) / 100;
    l = (s[`customLeg${key}`]  || 0) / 100; // 注意：這裡 key 名稱要和你的 state 一致
  } else {
    const p = PRESET_TABLE[preset] || PRESET_TABLE.Iron; // ||：preset 不存在就 fallback Iron
    h = p.head;
    b = p.body;
    l = p.leg;
  }

  const n = normalize3(h, b, l); // 呼叫 normalize3：轉成合計 = 1 的分布

  return {
    p_head: n.h,
    p_body: n.b,
    p_legs: n.l,
    p_miss: Math.max(0, 1 - (n.h + n.b + n.l)), // Math.max：避免負數（理論上會是 0）
  };
}

//  Sample hit part 
// function：函式宣告，依命中機率抽樣命中部位（或 miss）
function sampleHit(acc) {
  const r = Math.random(); // 隨機抽樣 0~1, 後面會用r落在哪個區間決定命中部位
  if (r < acc.p_head) return "head"; //判斷落在哪個區間，區間越大命中機率越高
  if (r < acc.p_head + acc.p_body) return "body";
  if (r < acc.p_head + acc.p_body + acc.p_legs) return "legs";
  return "miss"; // 落在剩餘區間 → miss, r不在前三個區間內
}

//  Simulate one duel 
// function：函式宣告，模擬單場 1v1 對槍，回傳勝者與 TTK
function simulateOneDuel(
  tA0, tB0,         // 初始開槍時間（反應時間+ping+peek）
  weaponA, weaponB, // 武器物件
  accA, accB,       // 命中機率結構
  hpA0, hpB0,       // 初始有效血量（HP+armor）
  distance          // 距離
) {
  let nextA = tA0; // let：下一次 A 開槍時間（會更新）
  let nextB = tB0;

  const stepA = msBetweenShots(weaponA.fireRate);  // 算出每發間隔時間
  const stepB = msBetweenShots(weaponB.fireRate);

  let hpA = hpA0; // 先設定初始化，用let是因為血量會變動
  let hpB = hpB0;

  let ttkA = null; // null：尚未擊殺（A 殺死 B 的時間）
  let ttkB = null; // B 殺死 A 的時間
  let time = 0;

  const MAX_STEPS = 600; // const：上限迴圈，避免無限迴圈
  const EPS = 10; // const：同時開槍容許誤差（ms）

  for (let i = 0; i < MAX_STEPS && hpA > 0 && hpB > 0; i++) {         // for是的意思迴圈, , 兩個and符號代表and表示兩個條件都要成立 其他不成立就是直接結束
    const diff = nextA - nextB;

    if (Math.abs(diff) <= EPS) { // Math.abs：取絕對值；<=：小於等於
      //  同一時刻一起開槍 
      time = nextA;

      const partA = sampleHit(accA); // 呼叫 sampleHit：抽部位
      if (partA !== "miss") { // !==：嚴格不等
        const dmgA = getDamage(weaponA, distance, partA); // 呼叫 getDamage：算傷害
        hpB -= dmgA; // 扣血
        if (hpB <= 0 && ttkA === null) ttkA = time; // 我最後沒做ttk我不知道為什麼跑不出來
      }

      const partB = sampleHit(accB);
      if (partB !== "miss") {
        const dmgB = getDamage(weaponB, distance, partB);
        hpA -= dmgB;
        if (hpA <= 0 && ttkB === null) ttkB = time;
      }

      nextA += stepA; // +=：更新下一發時間
      nextB += stepB;

    } else if (diff < 0) {
      //  A 比 B 早開槍 
      time = nextA;

      const partA = sampleHit(accA);
      if (partA !== "miss") {
        const dmgA = getDamage(weaponA, distance, partA);
        hpB -= dmgA;
        if (hpB <= 0 && ttkA === null) ttkA = time;
      }

      nextA += stepA;

    } else {
      //  B 比 A 早開槍 
      time = nextB;

      const partB = sampleHit(accB);
      if (partB !== "miss") {
        const dmgB = getDamage(weaponB, distance, partB);
        hpA -= dmgB;
        if (hpA <= 0 && ttkB === null) ttkB = time;
      }

      nextB += stepB;
    }

  
    if (hpA <= 0 && hpB <= 0) { 
      const ttk = time;
      if (ttkA === null) ttkA = ttk;
      if (ttkB === null) ttkB = ttk;
      return { //回傳結果物件
        winner: "trade",
        ttk,
        ttkA,
        ttkB,
      };
    }
    if (hpB <= 0) {
      const ttk = ttkA !== null ? ttkA : time; // ?:：三元運算子，若 ttkA 有值用它，否則用 time
      return {
        winner: "A",
        ttk,
        ttkA: ttk,
        ttkB: null,
      };
    }
    if (hpA <= 0) {
      const ttk = ttkB !== null ? ttkB : time;
      return {
        winner: "B",
        ttk,
        ttkA: null,
        ttkB: ttk,
      };
    }
  }

  //  安全保底：超過 MAX_STEPS 還沒結束 
  if (hpA > hpB) {
    const ttk = ttkA !== null ? ttkA : time;
    return { winner: "A", ttk, ttkA: ttk, ttkB: null };
  }
  if (hpB > hpA) {
    const ttk = ttkB !== null ? ttkB : time;
    return { winner: "B", ttk, ttkA: null, ttkB: ttk };
  }
  const ttk = time;
  return { winner: "trade", ttk, ttkA: ttk, ttkB: ttk };
}

//  Monte Carlo main 
// export function匯出函式，讓其他檔案可呼叫 runSimulation
export function runSimulation(state) {
  const trials = Math.max(state.trials || 1000, 1000)

  const weaponA = getWeaponByName(state.weaponA); // UI存取的是字串，所以要透過武器名稱找出武器物件以及其的參數
  const weaponB = getWeaponByName(state.weaponB);

  const accA = buildAccuracy(state, "A"); // 建立 A 的命中分布
  const accB = buildAccuracy(state, "B"); // 建立 B 的命中分布

  const hpA0 = (state.hpA || 100) + (state.armorA || 0); // 有效血量 = HP + armor
  const hpB0 = (state.hpB || 100) + (state.armorB || 0);

  const muA  = state.muA;
  const muB  = state.muB;
  const sigA = state.sigmaA;
  const sigB = state.sigmaB;

  const pingA = state.pingA;
  const pingB = state.pingB;

  const distance = state.distance_m;
  const peek = state.peekerSide || "A";
  const PEEK_ADV = 35; // ms：peeker advantage

  let winsA = 0;
  let winsB = 0;
  let trades = 0;

  const ttkAll   = []; // array：陣列，收集每場 TTK
  const ttkAList = [];
  const ttkBList = [];

  for (let i = 0; i < trials; i++) { // for：重複 trials 次（Monte Carlo）
    const rtA = sampleNormal(muA, sigA); // 抽樣反應時間
    const rtB = sampleNormal(muB, sigB);

    let tA = rtA + pingA; // let：因為會加 peek 優勢再更新
    let tB = rtB + pingB;

    if (peek === "A") { // peeker 優勢：被 peek 的人更晚看到
      tB += PEEK_ADV;
    } else {
      tA += PEEK_ADV;
    }

    const result = simulateOneDuel( // 呼叫 simulateOneDuel：跑單局
      tA, tB,
      weaponA, weaponB,
      accA, accB,
      hpA0, hpB0,
      distance
    );

    if (!result) continue; // continue：跳過本次迴圈

    if (typeof result.ttk === "number") { // typeof：型別判斷
      ttkAll.push(result.ttk); // push：加入陣列尾端
    }
    if (typeof result.ttkA === "number") {
      ttkAList.push(result.ttkA);
    }
    if (typeof result.ttkB === "number") {
      ttkBList.push(result.ttkB);
    }

    if (result.winner === "A") {
      winsA++;
    } else if (result.winner === "B") {
      winsB++;
    } else if (result.winner === "trade") {
      trades++;
    }
  }
  const effectiveTrials = winsA + winsB + trades; // 實際有效的模擬次數（排除錯誤或中途跳出的）

  return {
    winRateA: winsA / effectiveTrials, //顯示比例不要顯示次數，這樣比較直觀
    winRateB: winsB / effectiveTrials,
    tradeRate: trades / effectiveTrials,
    trials: effectiveTrials,
  };
}

// 匯出函式，直接「跑模擬 + 存回 state」
export function runSimulationAndSave() {
  const s = getState(); // getState：讀目前全域狀態
  const simResult = runSimulation(s); // runSimulation：跑 Monte Carlo
  setState({ // setState：更新狀態（spread operator 合併）
    ...s,        // ...：展開舊 state
    simResult,   // 新增/更新模擬結果
  });
}
