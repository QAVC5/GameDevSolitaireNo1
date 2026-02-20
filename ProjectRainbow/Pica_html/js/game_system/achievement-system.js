// 成就系统模块
// 处理成就的检查、解锁和显示

// 检查并解锁成就
function checkAndUnlockAchievements() {
  if (typeof ACHIEVEMENTS_CONFIG === "undefined") return;
  
  const allAchievements = Object.values(ACHIEVEMENTS_CONFIG);
  const newlyUnlocked = [];
  
  allAchievements.forEach((achievement) => {
    // 如果已解锁（跨档），跳过
    if (gameState.unlockedAchievements.includes(achievement.id)) return;
    
    // 检查是否满足解锁条件
    try {
      if (achievement.check && achievement.check()) {
        // 解锁成就
        if (!gameState.unlockedAchievements.includes(achievement.id)) {
          gameState.unlockedAchievements.push(achievement.id);
        }
        if (!gameState.sessionAchievements.includes(achievement.id)) {
          gameState.sessionAchievements.push(achievement.id);
          newlyUnlocked.push(achievement);
        }
      }
    } catch (e) {
      console.warn("成就检查失败:", achievement.id, e);
    }
  });
  
  // 显示新解锁的成就
  newlyUnlocked.forEach((achievement) => {
    showAchievementNotification(achievement);
  });
  
  // 保存成就状态（跨档保留）
  if (typeof saveGame === "function") {
    saveGame();
    // 同时保存到 localStorage（跨档保留）
    try {
      localStorage.setItem("chinese_truck_adventure_achievements", JSON.stringify(gameState.unlockedAchievements));
    } catch (e) {}
  }
}

// 从 localStorage 加载跨档成就
function loadAchievementsFromStorage() {
  try {
    const saved = localStorage.getItem("chinese_truck_adventure_achievements");
    if (saved) {
      const achievements = JSON.parse(saved);
      if (Array.isArray(achievements)) {
        gameState.unlockedAchievements = achievements;
      }
    }
  } catch (e) {}
  
  // 同时加载跨档结局数据
  try {
    const savedEndings = localStorage.getItem("chinese_truck_adventure_endings");
    if (savedEndings) {
      const endings = JSON.parse(savedEndings);
      if (Array.isArray(endings)) {
        if (!Array.isArray(gameState.achievedEndings)) {
          gameState.achievedEndings = [];
        }
        // 合并已保存的结局（避免重复）
        endings.forEach((ending) => {
          if (!gameState.achievedEndings.includes(ending)) {
            gameState.achievedEndings.push(ending);
          }
        });
      }
    }
  } catch (e) {}
}

// 显示成就解锁提示框
function showAchievementNotification(achievement) {
  const notification = document.createElement("div");
  notification.className = "achievement-notification fixed top-4 right-4 z-[100] bg-[#1a1a2e] border-2 border-[#c41e3a] rounded-xl p-4 shadow-[0_0_30px_rgba(196,30,58,0.6)] animate-fade-in max-w-sm";
  notification.style.animation = "achievementSlideIn 0.5s ease-out forwards";
  
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="text-4xl flex-shrink-0">${achievement.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="text-xs text-[#c41e3a] font-bold mb-1">成就解锁！</div>
        <div class="text-base font-bold text-white mb-0.5">${achievement.title}</div>
        <div class="text-xs text-gray-400">${achievement.description}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 3秒后自动消失
  setTimeout(() => {
    notification.style.animation = "achievementSlideOut 0.5s ease-in forwards";
    setTimeout(() => {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 500);
  }, 3000);
}

// 记录乘客上车（用于成就检查）
function recordPassengerBoarded(name) {
  if (!Array.isArray(gameState.passengersEverOnBoard)) {
    gameState.passengersEverOnBoard = [];
  }
  if (!gameState.passengersEverOnBoard.includes(name)) {
    gameState.passengersEverOnBoard.push(name);
  }
}

// 记录物品合成（用于成就检查）
function recordItemCrafted() {
  if (typeof gameState.itemsCrafted !== "number") gameState.itemsCrafted = 0;
  gameState.itemsCrafted++;
}

// 记录物品使用（用于成就检查）
function recordItemUsed() {
  if (typeof gameState.itemsUsed !== "number") gameState.itemsUsed = 0;
  gameState.itemsUsed++;
}

// 记录商人交易（用于成就检查）
function recordMerchantTrade() {
  gameState.hasTradedWithMerchant = true;
}

// 更新完美旅程状态（每行文本推进时检查）
function updatePerfectRunStatus() {
  if (gameState.mileage < 300) {
    gameState.perfectRun = false;
    return;
  }
  
  // 更新最低属性值
  if (truckState.fuel < gameState.minFuelDuringRun) {
    gameState.minFuelDuringRun = truckState.fuel;
  }
  if (truckState.durability < gameState.minDurabilityDuringRun) {
    gameState.minDurabilityDuringRun = truckState.durability;
  }
  if (truckState.comfort < gameState.minComfortDuringRun) {
    gameState.minComfortDuringRun = truckState.comfort;
  }
  
  // 检查是否所有属性都保持在 50% 以上
  if (gameState.minFuelDuringRun >= 50 && 
      gameState.minDurabilityDuringRun >= 50 && 
      gameState.minComfortDuringRun >= 50) {
    gameState.perfectRun = true;
  } else {
    gameState.perfectRun = false;
  }
}

// 更新低属性生存状态（每行文本推进时检查）
function updateSurvivedLowStats() {
  if (truckState.fuel <= 20 && truckState.durability <= 20 && truckState.comfort <= 20) {
    if (typeof gameState.lowStatsMileage !== "number") gameState.lowStatsMileage = 0;
    gameState.lowStatsMileage += (KM_PER_TICK_MIN + KM_PER_TICK_MAX) / 2; // 平均每行增加的里程
    
    if (gameState.lowStatsMileage >= 10) {
      gameState.survivedLowStats = true;
    }
  } else {
    // 如果属性恢复，重置计数
    gameState.lowStatsMileage = 0;
  }
}
