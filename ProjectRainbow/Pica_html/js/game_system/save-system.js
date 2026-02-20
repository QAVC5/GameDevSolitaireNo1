// Cookie 管理和存档系统
// 处理游戏数据的保存和加载

// 里程记录使用 localStorage，与存档独立，便于跨档保留历史最高
const MILEAGE_RECORD_KEY = "chinese_truck_adventure_mileage_best";

// 获取历史最高里程（km）
function getBestMileage() {
  try {
    const v = localStorage.getItem(MILEAGE_RECORD_KEY);
    const n = v != null ? parseInt(v, 10) : 0;
    return isNaN(n) || n < 0 ? 0 : n;
  } catch (e) {
    return 0;
  }
}

// 若当前里程高于历史最高则更新并保存
function updateBestMileageIfNeeded(currentMileage) {
  if (typeof currentMileage !== "number" || isNaN(currentMileage)) return;
  const best = getBestMileage();
  if (currentMileage > best) {
    try {
      localStorage.setItem(MILEAGE_RECORD_KEY, String(Math.floor(currentMileage)));
    } catch (e) {}
  }
}

function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie =
    name +
    "=" +
    encodeURIComponent(JSON.stringify(value)) +
    ";expires=" +
    expires.toUTCString() +
    ";path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return JSON.parse(
        decodeURIComponent(c.substring(nameEQ.length, c.length)),
      );
    }
  }
  return null;
}

function saveGame() {
  // 保存游戏状态、皮卡状态和库存状态
  const savData = {
    gameState: gameState,
    truckState: truckState,
    inventoryState: inventoryState,
  };
  setCookie(GAME_CONFIG.cookieName, savData, GAME_CONFIG.cookieExpiryDays);
  // 同步更新历史最高里程记录
  if (typeof gameState !== "undefined" && typeof gameState.mileage === "number") {
    updateBestMileageIfNeeded(gameState.mileage);
  }
}

function loadGame() {
  const saved = getCookie(GAME_CONFIG.cookieName);
  if (saved) {
    // 恢复游戏状态、皮卡状态和库存状态
    if (saved.gameState) {
      if (!Array.isArray(saved.gameState.recentEvents))
        saved.gameState.recentEvents = [];
      if (!Array.isArray(saved.gameState.triggeredEvents))
        saved.gameState.triggeredEvents = [];
      if (!Array.isArray(saved.gameState.unlockedEvents))
        saved.gameState.unlockedEvents = [];
      if (typeof saved.gameState.passengerFavor !== "object")
        saved.gameState.passengerFavor = {};
      if (typeof saved.gameState.passengerGetOffMileage !== "object")
        saved.gameState.passengerGetOffMileage = {};
      Object.assign(gameState, saved.gameState);
    }
    if (saved.truckState) {
      Object.assign(truckState, saved.truckState);
    }
    if (saved.inventoryState) {
      Object.assign(inventoryState, saved.inventoryState);
    }

    if (typeof gameState.mileage !== "number" || isNaN(gameState.mileage))
      gameState.mileage = 0;
    if (
      typeof gameState.lastOvernightMileage !== "number" ||
      isNaN(gameState.lastOvernightMileage)
    )
      gameState.lastOvernightMileage = 0;
    if (typeof gameState.textCount !== "number" || isNaN(gameState.textCount))
      gameState.textCount = 0;
    if (!Array.isArray(gameState.recentEvents)) gameState.recentEvents = [];
    if (
      typeof gameState.restCountSinceOvernight !== "number" ||
      isNaN(gameState.restCountSinceOvernight)
    )
      gameState.restCountSinceOvernight = 0;
    if (!gameState.passengerFavor || typeof gameState.passengerFavor !== "object")
      gameState.passengerFavor = {};
    if (!gameState.passengerGetOffMileage || typeof gameState.passengerGetOffMileage !== "object")
      gameState.passengerGetOffMileage = {};
    if (typeof gameState.strayCatFeedCount !== "number" || isNaN(gameState.strayCatFeedCount))
      gameState.strayCatFeedCount = 0;
    if (typeof gameState.travelerDropOffCount !== "number" || isNaN(gameState.travelerDropOffCount))
      gameState.travelerDropOffCount = 0;
    if (!Array.isArray(gameState.permanentPassengers))
      gameState.permanentPassengers = [];
    // 成就系统初始化
    if (!Array.isArray(gameState.unlockedAchievements))
      gameState.unlockedAchievements = [];
    if (!Array.isArray(gameState.sessionAchievements))
      gameState.sessionAchievements = [];
    if (!Array.isArray(gameState.passengersEverOnBoard))
      gameState.passengersEverOnBoard = [];
    if (typeof gameState.itemsCrafted !== "number" || isNaN(gameState.itemsCrafted))
      gameState.itemsCrafted = 0;
    if (typeof gameState.itemsUsed !== "number" || isNaN(gameState.itemsUsed))
      gameState.itemsUsed = 0;
    if (typeof gameState.hasTradedWithMerchant !== "boolean")
      gameState.hasTradedWithMerchant = false;
    if (typeof gameState.survivedLowStats !== "boolean")
      gameState.survivedLowStats = false;
    if (typeof gameState.perfectRun !== "boolean")
      gameState.perfectRun = false;
    if (typeof gameState.lowStatsMileage !== "number" || isNaN(gameState.lowStatsMileage))
      gameState.lowStatsMileage = 0;
    if (typeof gameState.minFuelDuringRun !== "number" || isNaN(gameState.minFuelDuringRun))
      gameState.minFuelDuringRun = 100;
    if (typeof gameState.minDurabilityDuringRun !== "number" || isNaN(gameState.minDurabilityDuringRun))
      gameState.minDurabilityDuringRun = 100;
    if (typeof gameState.minComfortDuringRun !== "number" || isNaN(gameState.minComfortDuringRun))
      gameState.minComfortDuringRun = 100;
    if (!Array.isArray(gameState.achievedEndings))
      gameState.achievedEndings = [];
    if (!Array.isArray(gameState.triggeredConditionalStories))
      gameState.triggeredConditionalStories = [];
    if (typeof truckState.fuel !== "number" || isNaN(truckState.fuel))
      truckState.fuel = 100;
    if (
      typeof truckState.durability !== "number" ||
      isNaN(truckState.durability)
    )
      truckState.durability = 100;
    if (typeof truckState.comfort !== "number" || isNaN(truckState.comfort))
      truckState.comfort = 100;
    if (typeof inventoryState.gold !== "number" || isNaN(inventoryState.gold))
      inventoryState.gold = 0;
    return true;
  }
  return false;
}
