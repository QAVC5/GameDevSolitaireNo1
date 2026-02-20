// 游戏结束模块
// 处理游戏结束逻辑和显示

const JOURNEY_HISTORY_KEY = "chinese_truck_adventure_journey_history";
const JOURNEY_HISTORY_MAX = 30;

function showGameOver(endingType) {
  // 保存本次旅途到历史历程
  try {
    const cfg =
      typeof ENDINGS_CONFIG !== "undefined" && ENDINGS_CONFIG[endingType]
        ? ENDINGS_CONFIG[endingType]
        : ENDINGS_CONFIG["game_over_event"];
    const entry = {
      endingType,
      endingTitle: cfg ? cfg.title : endingType,
      mileage: Math.floor((gameState && gameState.mileage) || 0),
      passengers: [...(gameState && gameState.passengersEverOnBoard) || []],
      sessionAchievements: [...(gameState && gameState.sessionAchievements) || []],
      timestamp: Date.now(),
    };
    let history = [];
    const saved = localStorage.getItem(JOURNEY_HISTORY_KEY);
    if (saved) {
      try {
        history = JSON.parse(saved);
      } catch (e) {}
    }
    history.unshift(entry);
    if (history.length > JOURNEY_HISTORY_MAX) history.length = JOURNEY_HISTORY_MAX;
    localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {}

  // 记录达成的结局
  if (typeof gameState !== "undefined") {
    if (!Array.isArray(gameState.achievedEndings)) {
      gameState.achievedEndings = [];
    }
    if (!gameState.achievedEndings.includes(endingType)) {
      gameState.achievedEndings.push(endingType);
    }
    // 保存结局数据到 localStorage（跨档保留）
    try {
      localStorage.setItem("chinese_truck_adventure_endings", JSON.stringify(gameState.achievedEndings));
    } catch (e) {}
  }

  // 更新行驶里程记录表（本次里程若破纪录则写入历史最高）
  if (typeof updateBestMileageIfNeeded === "function" && typeof gameState !== "undefined") {
    updateBestMileageIfNeeded(gameState.mileage);
  }

  // 最后检查一次成就
  if (typeof checkAndUnlockAchievements === "function") {
    checkAndUnlockAchievements();
  }

  // 关闭事件弹窗
  const modal = document.getElementById("event-modal");
  if (modal) modal.remove();

  // 停止游戏
  pauseTextGeneration();
  pauseRoad();

  // 获取结局配置
  const cfg =
    typeof ENDINGS_CONFIG !== "undefined" && ENDINGS_CONFIG[endingType]
      ? ENDINGS_CONFIG[endingType]
      : ENDINGS_CONFIG["game_over_event"];

  const b = [];
  b.push(
    '<div class="text-area-scroll rounded-2xl p-8 max-w-2xl w-full mx-4 text-center animate-fade-in overflow-y-auto max-h-[90vh]"',
  );
  b.push(
    ' style="background:' +
      cfg.bgColor +
      ";border:2px solid " +
      cfg.borderColor +
      ';">',
  );
  b.push(
    '<h2 class="text-3xl font-bold mb-3" style="color:' +
      cfg.borderColor +
      ';">' +
      cfg.title +
      "</h2>",
  );
  b.push('<p class="text-gray-200 text-lg mb-3">' + cfg.message + "</p>");
  b.push(
    '<p class="text-gray-400 text-sm mb-4 whitespace-pre-line">' +
      cfg.flavor +
      "</p>",
  );
  b.push(
    '<p class="text-gray-500 text-xs mb-6">行驶里程：' +
      gameState.mileage +
      " km</p>",
  );

  // 根据结局类型显示个性化信息
  const passengers = truckState.passengers || [];
  const passengerFavor = gameState.passengerFavor || {};

  // 友谊永恒结局：显示乘客告别话语
  if (endingType === "eternal_friendship" && passengers.length > 0) {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#a78bfa] mb-3">乘客的告别</h3>');
    b.push('<div class="space-y-2 text-left">');
    passengers.forEach((name) => {
      const favor = passengerFavor[name] || 50;
      const cfg = typeof PASSENGER_CONFIG !== "undefined" && PASSENGER_CONFIG[name];
      const color = cfg && cfg.color ? cfg.color : "#94a3b8";
      let farewell = "";
      if (favor >= 90) {
        farewell = `"这段旅程是我人生中最美好的回忆之一。谢谢你，我的朋友！"`;
      } else if (favor >= 80) {
        farewell = `"和你一起的这段路，让我收获了很多。保重！"`;
      } else {
        farewell = `"感谢你的帮助，祝你好运！"`;
      }
      b.push(`<div class="p-2 bg-gray-800/50 rounded border border-gray-700">`);
      b.push(`<span class="font-bold" style="color:${color};">${name}</span>`);
      b.push(`<span class="text-gray-300 text-sm ml-2">${farewell}</span>`);
      b.push(`</div>`);
    });
    b.push('</div></div>');
  }

  // 完美旅程结局：显示属性统计
  if (endingType === "perfect_journey") {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#fbbf24] mb-3">完美平衡</h3>');
    b.push('<div class="grid grid-cols-3 gap-2 text-center">');
    b.push(`<div class="p-2 bg-gray-800/50 rounded border border-gray-700">`);
    b.push(`<div class="text-xs text-gray-400 mb-1">燃油</div>`);
    b.push(`<div class="text-lg font-bold text-[#f59e0b]">${Math.round(truckState.fuel)}%</div>`);
    b.push(`</div>`);
    b.push(`<div class="p-2 bg-gray-800/50 rounded border border-gray-700">`);
    b.push(`<div class="text-xs text-gray-400 mb-1">耐久</div>`);
    b.push(`<div class="text-lg font-bold text-[#6b7280]">${Math.round(truckState.durability)}%</div>`);
    b.push(`</div>`);
    b.push(`<div class="p-2 bg-gray-800/50 rounded border border-gray-700">`);
    b.push(`<div class="text-xs text-gray-400 mb-1">舒适</div>`);
    b.push(`<div class="text-lg font-bold text-[#ec4899]">${Math.round(truckState.comfort)}%</div>`);
    b.push(`</div>`);
    b.push('</div></div>');
  }

  // 传奇司机结局：显示挑战统计
  if (endingType === "legendary_driver") {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#ef4444] mb-3">传奇之路</h3>');
    b.push('<div class="text-sm text-gray-300 space-y-1">');
    b.push(`<div>总里程：<span class="font-bold text-white">${mileage} km</span></div>`);
    if (passengers.length > 0) {
      b.push(`<div>同行乘客：<span class="font-bold text-white">${passengers.length} 位</span></div>`);
    }
    b.push(`<div>当前属性：燃油 ${Math.round(truckState.fuel)}% | 耐久 ${Math.round(truckState.durability)}% | 舒适 ${Math.round(truckState.comfort)}%</div>`);
    b.push('</div></div>');
  }

  // 和谐共存结局：显示鹿和猎人的特殊信息
  if (endingType === "harmony") {
    const deerFavor = passengerFavor["鹿"] || 0;
    const hunterFavor = passengerFavor["猎人"] || 0;
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#10b981] mb-3">和解的见证</h3>');
    b.push('<div class="text-sm text-gray-300 space-y-2">');
    b.push(`<div>鹿的好感度：<span class="font-bold text-[#d4a574]">${Math.round(deerFavor)}</span></div>`);
    b.push(`<div>猎人的好感度：<span class="font-bold text-[#8b7355]">${Math.round(hunterFavor)}</span></div>`);
    b.push(`<div class="text-xs text-gray-400 mt-2">他们在这段旅程中学会了理解与包容。</div>`);
    b.push('</div></div>');
  }

  // 收集者结局：显示收集到的乘客类型
  if (endingType === "collector" && passengersEverOnBoard.length > 0) {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#34d399] mb-3">收集的回忆</h3>');
    b.push('<div class="text-sm text-gray-300">');
    b.push(`<div>你遇见了 <span class="font-bold text-white">${passengersEverOnBoard.length}</span> 位不同的乘客：</div>`);
    b.push('</div></div>');
  }

  // 孤独行者结局：显示独自前行的统计
  if (endingType === "lonely_wanderer") {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#64748b] mb-3">独自前行</h3>');
    b.push('<div class="text-sm text-gray-300 space-y-1">');
    b.push(`<div>独自行驶里程：<span class="font-bold text-white">${mileage} km</span></div>`);
    b.push(`<div>当前属性：燃油 ${Math.round(truckState.fuel)}% | 耐久 ${Math.round(truckState.durability)}% | 舒适 ${Math.round(truckState.comfort)}%</div>`);
    b.push(`<div class="text-xs text-gray-400 mt-2">在这段孤独的旅程中，你找到了真正的自己。</div>`);
    b.push('</div></div>');
  }
  
  // 显示本轮达成的成就
  const sessionAchievements = gameState.sessionAchievements || [];
  if (sessionAchievements.length > 0 && typeof ACHIEVEMENTS_CONFIG !== "undefined") {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#c41e3a] mb-3">本轮达成的成就</h3>');
    b.push('<div class="grid grid-cols-2 gap-2 text-left">');
    sessionAchievements.forEach((achId) => {
      const ach = ACHIEVEMENTS_CONFIG[achId];
      if (ach) {
        b.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded border border-gray-700">`);
        b.push(`<span class="text-2xl">${ach.icon}</span>`);
        b.push(`<div class="flex-1 min-w-0">`);
        b.push(`<div class="text-sm font-bold text-white">${ach.title}</div>`);
        b.push(`<div class="text-xs text-gray-400">${ach.description}</div>`);
        b.push(`</div></div>`);
      }
    });
    b.push('</div></div>');
  }
  
  // 显示上过车的乘客
  const passengersEverOnBoard = gameState.passengersEverOnBoard || [];
  if (passengersEverOnBoard.length > 0) {
    b.push('<div class="border-t border-gray-700 pt-4 mt-4 mb-4">');
    b.push('<h3 class="text-lg font-bold text-[#c41e3a] mb-3">上过车的乘客</h3>');
    b.push('<div class="flex flex-wrap gap-2 justify-center">');
    passengersEverOnBoard.forEach((name) => {
      const cfg = typeof PASSENGER_CONFIG !== "undefined" && PASSENGER_CONFIG[name];
      const color = cfg && cfg.color ? cfg.color : "#94a3b8";
      b.push(`<span class="px-3 py-1 rounded-lg bg-gray-800/50 border border-gray-700 text-sm" style="color:${color};">${name}</span>`);
    });
    b.push('</div></div>');
  }
  
  if (endingType === "perfect_journey") {
    b.push('<div class="flex flex-col sm:flex-row gap-3 justify-center">');
    b.push('<button onclick="continueFromPerfectJourney()" class="px-8 py-3 bg-[#fbbf24] text-gray-900 rounded-full hover:bg-[#fcd34d] transition-all font-bold">继续无尽模式</button>');
    b.push('<button onclick="location.reload()" class="px-8 py-3 bg-[#c41e3a] text-white rounded-full hover:bg-[#e63950] transition-all">重新开始</button>');
    b.push('</div>');
  } else {
    b.push(
      '<button onclick="location.reload()" class="px-8 py-3 bg-[#c41e3a] text-white rounded-full hover:bg-[#e63950] transition-all">重新开始</button>',
    );
  }
  b.push("</div>");

  const gameOverModal = document.createElement("div");
  gameOverModal.id = "game-over-modal";
  gameOverModal.className =
    "fixed inset-0 bg-black/90 flex items-center justify-center z-50 text-area-scroll";
  gameOverModal.innerHTML = b.join("");
  document.body.appendChild(gameOverModal);
}

// 完美旅程后继续无尽模式
function continueFromPerfectJourney() {
  gameState.perfectJourneyEndlessMode = true;
  const modal = document.getElementById("game-over-modal");
  if (modal) modal.remove();
  resumeGame();
  if (typeof saveGame === "function") saveGame();
  const textArea = document.getElementById("textArea");
  if (textArea) {
    const p = document.createElement("p");
    p.innerHTML = '<span style="color: #fbbf24;">✦ 你选择了继续前行，开启无尽模式！道路没有尽头，旅途永不止息。</span>';
    textArea.appendChild(p);
    if (typeof scrollTextAreaToBottom === "function") scrollTextAreaToBottom(textArea);
  }
}

// 检查特殊结局条件（在常规失败检查之前调用）
// 按优先级顺序检查，返回满足条件的结局类型，否则返回 null
function checkSpecialEndings() {
  // 特殊结局不应该在属性归零时触发（那是失败结局）
  if (truckState.fuel <= 0 || truckState.durability <= 0 || truckState.comfort <= 0) {
    return null;
  }

  const mileage = gameState.mileage || 0;
  const passengers = truckState.passengers || [];
  const passengerFavor = gameState.passengerFavor || {};
  const passengersEverOnBoard = gameState.passengersEverOnBoard || [];

  // 1. 完美旅程结局（优先级最高）
  // 里程 ≥ 300 km，所有属性 ≥ 50%，至少有一个乘客
  // 若已选择继续无尽模式则不再触发
  if (!gameState.perfectJourneyEndlessMode &&
    mileage >= 300 &&
    truckState.fuel >= 50 &&
    truckState.durability >= 50 &&
    truckState.comfort >= 50 &&
    passengers.length > 0
  ) {
    return "perfect_journey";
  }

  // 2. 传奇司机结局
  // 里程 ≥ 500 km，所有属性 ≥ 30%
  if (
    mileage >= 500 &&
    truckState.fuel >= 30 &&
    truckState.durability >= 30 &&
    truckState.comfort >= 30
  ) {
    return "legendary_driver";
  }

  // 3. 友谊永恒结局
  // 车上至少有3个乘客，所有乘客好感度 ≥ 80，里程 ≥ 100 km
  if (passengers.length >= 3 && mileage >= 100) {
    const allFavorHigh = passengers.every((name) => {
      const favor = passengerFavor[name];
      return typeof favor === "number" && favor >= 80;
    });
    if (allFavorHigh) {
      return "eternal_friendship";
    }
  }

  // 4. 收集者结局
  // 曾经上过车的乘客包含所有7种类型，里程 ≥ 150 km
  const allPassengerTypes = ["鹿", "猎人", "骚福瑞", "旅行者", "年迈妇人", "猫", "流浪艺人"];
  if (mileage >= 150) {
    const hasAllTypes = allPassengerTypes.every((name) =>
      passengersEverOnBoard.includes(name)
    );
    if (hasAllTypes) {
      return "collector";
    }
  }

  // 5. 和谐共存结局
  // 鹿和猎人同时在车上，两者好感度都 ≥ 70，里程 ≥ 80 km
  if (
    passengers.includes("鹿") &&
    passengers.includes("猎人") &&
    mileage >= 80
  ) {
    const deerFavor = passengerFavor["鹿"];
    const hunterFavor = passengerFavor["猎人"];
    if (
      typeof deerFavor === "number" &&
      deerFavor >= 70 &&
      typeof hunterFavor === "number" &&
      hunterFavor >= 70
    ) {
      return "harmony";
    }
  }

  // 6. 孤独行者结局（优先级最低）
  // 里程 ≥ 200 km，车上没有任何乘客，所有属性 ≥ 40%
  if (
    mileage >= 200 &&
    passengers.length === 0 &&
    truckState.fuel >= 40 &&
    truckState.durability >= 40 &&
    truckState.comfort >= 40
  ) {
    return "lonely_wanderer";
  }

  return null;
}

// 检查游戏结束条件（在任何皮卡属性更新后调用）
function checkGameOverConditions() {
  // 先检查特殊结局（在属性归零之前）
  const specialEnding = checkSpecialEndings();
  if (specialEnding) {
    showGameOver(specialEnding);
    return true;
  }

  // 然后检查常规失败条件
  if (truckState.fuel <= 0) {
    showGameOver("fuel_empty");
    return true;
  }
  if (truckState.durability <= 0) {
    showGameOver("durability_zero");
    return true;
  }
  if (truckState.comfort <= 0) {
    showGameOver("comfort_zero");
    return true;
  }
  return false;
}
