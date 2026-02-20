// 事件触发和处理模块
// 管理游戏中事件的检查、触发和选择处理逻辑

// 获取所有事件的合并字典
function getAllEvents() {
  const all = {};
  if (typeof GAME_EVENTS !== "undefined") {
    Object.assign(all, GAME_EVENTS);
  }
  if (typeof INVENTORY_EVENTS !== "undefined") {
    Object.assign(all, INVENTORY_EVENTS);
  }
  return all;
}

// 默认可触发事件ID列表（不需要解锁）
const DEFAULT_AVAILABLE_EVENTS = [
  // ── 遭遇类 ──
  "deer",
  "rain",
  "saofurry",
  "roadblock",
  "fog",
  "lost_child",
  "vagrant",
  "exotic_traveler",
  "elderly_woman",
  // ── 停留/探索类 ──
  "rest",
  "craft",
  "gas_station",
  "abandoned_warehouse",
  "abandoned_mine",
  "abandoned_farm",
  "abandoned_gas_station",
  // ── 商人类 ──
  "merchant",
  "rare_merchant",
  "scavenger",
  // ── 特殊/随机类 ──
  "mystery_box",
  "lost_traveler",
  "stray_cat",
  "radio_tower",
  "sandstorm",
  "abandoned_village",
  "firefly_night",
  "muddy_downpour",
  "wandering_performer",
  "meteor_crater",
  "deer_nostalgia",
  "hunter_and_deer",
  "saofurry_chaos",
  // 猫猫的贴心小备注：需解锁事件（用 unlockEvents 效果激活）
  // "hunter"           邀请鹿上车后解锁
  // "ancient_monument" 探索废弃村庄后解锁
  // "tech_merchant"    进入废弃工坊后解锁
  // "supply_merchant"  搜刮废弃农场后解锁
];

// 每行文本推进时增加的里程（随机），两行合计约 3–8 km
const KM_PER_TICK_MIN = 1;
const KM_PER_TICK_MAX = 4;
// 保底昼夜休息间隔
const OVERNIGHT_REST_INTERVAL = 25;
// 最近事件去重窗口大小
const RECENT_EVENT_WINDOW = 4;
// 休息类事件ID列表
const REST_EVENT_IDS = ["rest", "craft", "gas_station"];

// 文本框滚动到底部，带 0.5s 缓动（供文本更新后统一调用）
function scrollTextAreaToBottom(textArea, durationMs) {
  if (!textArea) textArea = document.getElementById("textArea");
  if (!textArea) return;
  const target = textArea.scrollHeight - textArea.clientHeight;
  const start = textArea.scrollTop;
  if (target <= 0 || Math.abs(target - start) < 2) return;
  const dur = durationMs ?? 500;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 2);
    textArea.scrollTop = start + (target - start) * eased;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// 检查是否有乘客到达目的地并让其下车
function checkPassengerGetOffAtDestination() {
  const getOff = gameState.passengerGetOffMileage;
  if (!getOff || typeof getOff !== "object") return;
  const textArea = document.getElementById("textArea");
  const toRemove = [];
  for (const name in getOff) {
    if (gameState.mileage >= getOff[name] && truckState.passengers.includes(name)) {
      toRemove.push(name);
    }
  }
  toRemove.forEach((name) => {
    // 旅行者特殊处理：第三次到达目的地时永久上车
    if (name === "旅行者") {
      if (typeof gameState.travelerDropOffCount !== "number") gameState.travelerDropOffCount = 0;
      gameState.travelerDropOffCount++;
      
      if (gameState.travelerDropOffCount >= 3) {
        // 第三次：永久上车
        if (!Array.isArray(gameState.permanentPassengers)) gameState.permanentPassengers = [];
        if (!gameState.permanentPassengers.includes("旅行者")) {
          gameState.permanentPassengers.push("旅行者");
        }
        delete getOff[name]; // 删除下车里程，不再下车
        if (textArea) {
          textArea.innerHTML += `<p class="text-[#c41e3a]">【事件】旅行者到达了镇口，但这次他没有下车。他笑着说："我已经习惯和你一起旅行了，让我继续跟着你吧！"</p>`;
          scrollTextAreaToBottom(textArea);
        }
        if (typeof updateTruckDisplay === "function") updateTruckDisplay();
        if (typeof updatePassengerListDisplay === "function") updatePassengerListDisplay();
        return; // 不执行下车逻辑
      } else {
        // 前两次：正常下车
        const idx = truckState.passengers.indexOf(name);
        if (idx > -1) truckState.passengers.splice(idx, 1);
        delete getOff[name];
        if (textArea) {
          textArea.innerHTML += `<p class="text-[#c41e3a]">【事件】旅行者到达了镇口，道谢后下车，并留下一个小装饰物作为纪念。</p>`;
          scrollTextAreaToBottom(textArea);
        }
        if (typeof updateTruckDisplay === "function") updateTruckDisplay();
        if (typeof updatePassengerListDisplay === "function") updatePassengerListDisplay();
        return;
      }
    }
    
    // 其他乘客正常下车
    const idx = truckState.passengers.indexOf(name);
    if (idx > -1) truckState.passengers.splice(idx, 1);
    delete getOff[name];
    if (name === "年迈妇人" && typeof addGold === "function") {
      addGold(30);
    }
    if (textArea) {
      let msg =
        name === "年迈妇人"
          ? "年迈妇人到达了镇子，感激地与你道别后下车，并留下了感谢费。"
          : `${name}到达了目的地，下车了。`;
      textArea.innerHTML += `<p class="text-[#c41e3a]">【事件】${msg}</p>`;
      if (name === "年迈妇人")
        textArea.innerHTML += `<p style="color:#facc15;">获得 30 金币</p>`;
      scrollTextAreaToBottom(textArea);
    }
    if (typeof updateTruckDisplay === "function") updateTruckDisplay();
    if (typeof updatePassengerListDisplay === "function") updatePassengerListDisplay();
  });
}

// 每行文本推进时增加里程、扣燃油、更新显示并检查乘客下车（行驶中实时更新）
function advanceMileageForTick() {
  const kmThisTick =
    KM_PER_TICK_MIN +
    Math.floor(Math.random() * (KM_PER_TICK_MAX - KM_PER_TICK_MIN + 1));
  gameState.mileage += kmThisTick;
  const fuelCost = Math.round(
    GAME_CONFIG.fuelConsumptionPer5km * (kmThisTick / 5),
  );
  truckState.fuel = clamp(truckState.fuel - fuelCost);
  updateTruckStatusDisplay();
  if (typeof updatePassengerListDisplay === "function")
    updatePassengerListDisplay();
  checkPassengerGetOffAtDestination();
  
  // 更新成就相关状态
  if (typeof updatePerfectRunStatus === "function") {
    updatePerfectRunStatus();
  }
  if (typeof updateSurvivedLowStats === "function") {
    updateSurvivedLowStats();
  }
  // 检查成就（里程类等）
  if (typeof checkAndUnlockAchievements === "function") {
    checkAndUnlockAchievements();
  }
}

// 检查事件触发（仅负责每 2 行是否触发节点/昼夜）
function checkEventTrigger() {
  if (
    gameState.textCount % GAME_CONFIG.triggerInterval === 0 &&
    gameState.textCount > 0
  ) {
    // 每N km强制触发一次昼夜休息
    const kmSinceLast = gameState.mileage - gameState.lastOvernightMileage;
    if (kmSinceLast >= OVERNIGHT_REST_INTERVAL) {
      gameState.lastOvernightMileage = gameState.mileage;
      gameState.restCountSinceOvernight = 0;
      const overnightEvent = getAllEvents()["overnight_rest"];
      if (overnightEvent) {
        triggerEvent(overnightEvent);
        return;
      }
    }

    // 查找可触发的事件
    const availableEvent = findAvailableEvent();
    if (availableEvent) {
      triggerEvent(availableEvent);
    }
  }
}

// 查找可用事件
function findAvailableEvent() {
  const allEvents = getAllEvents();
  const candidates = [];

  for (const eventId in allEvents) {
    const event = allEvents[eventId];

    // 检查是否已触发（一次性事件）
    if (event.oneTime && gameState.triggeredEvents.includes(eventId)) {
      continue;
    }
    // 保底事件（triggerWeight===0）不参与常规抽取
    if ((event.triggerWeight || 0) === 0) {
      continue;
    }
    // 最近N次内不重复
    if (
      Array.isArray(gameState.recentEvents) &&
      gameState.recentEvents.includes(eventId)
    ) {
      continue;
    }
    // 当前昼夜间隔内休息类事件已达上限
    if (
      REST_EVENT_IDS.includes(eventId) &&
      gameState.restCountSinceOvernight >= GAME_CONFIG.maxRestPerCycle
    ) {
      continue;
    }

    // 检查条件
    if (event.condition) {
      if (event.condition.requiresPassenger) {
        if (
          !truckState.passengers.includes(event.condition.requiresPassenger)
        ) {
          continue;
        }
      }
      if (event.condition.requiresItem) {
        const itemReq = event.condition.requiresItem;
        const reqId = typeof itemReq === "string" ? itemReq : itemReq.id;
        const reqQty = typeof itemReq === "string" ? 1 : itemReq.quantity || 1;

        if (!hasItem(reqId, reqQty)) {
          continue;
        }
      }
      if (event.condition.minGold) {
        if (inventoryState.gold < event.condition.minGold) {
          continue;
        }
      }
      // 若指定乘客已在车上则不触发（如流浪艺人已上车不再触发流浪艺人事件）
      if (event.condition.notPassenger) {
        const notPass = event.condition.notPassenger;
        const list = Array.isArray(notPass) ? notPass : [notPass];
        if (list.some((p) => truckState.passengers.includes(p))) continue;
      }
    }

    // 检查是否已解锁或默认可用
    if (
      !gameState.unlockedEvents.includes(eventId) &&
      !DEFAULT_AVAILABLE_EVENTS.includes(eventId)
    ) {
      continue;
    }

    candidates.push(event);
  }

  if (candidates.length === 0) return null;

  // 按权重随机选取
  const totalWeight = candidates.reduce(
    (sum, evt) => sum + (evt.triggerWeight || 10),
    0,
  );
  let roll = Math.random() * totalWeight;

  for (const event of candidates) {
    roll -= event.triggerWeight || 10;
    if (roll <= 0) {
      return event;
    }
  }

  return candidates[candidates.length - 1];
}

// 触发事件
function triggerEvent(event) {
  gameState.eventTriggered = true;
  pauseTextGeneration();

  // 记录已触发（一次性事件去重）
  if (!Array.isArray(gameState.triggeredEvents)) gameState.triggeredEvents = [];
  if (!gameState.triggeredEvents.includes(event.id)) {
    gameState.triggeredEvents.push(event.id);
    // 检查成就（事件类）
    if (typeof checkAndUnlockAchievements === "function") {
      checkAndUnlockAchievements();
    }
  }

  // 维护最近事件队列
  if (event.id !== "overnight_rest") {
    if (!Array.isArray(gameState.recentEvents)) gameState.recentEvents = [];
    gameState.recentEvents.push(event.id);
    if (gameState.recentEvents.length > RECENT_EVENT_WINDOW) {
      gameState.recentEvents.shift();
    }
    // 统计休息类事件
    if (REST_EVENT_IDS.includes(event.id)) {
      gameState.restCountSinceOvernight++;
    }
  }

  // 道路减速停止，显示场景描述和触发字，弹出事件弹窗
  gradualStopRoad(GAME_CONFIG.animation.roadDeceleration)
    .then(() => {
      // 先显示场景描述文字
      if (typeof showSceneText === "function") {
        showSceneText(event).then(() => {
          // 场景描述动画结束后显示触发字
          showTriggerChar(event);
          // 停留后弹出事件选择
          setTimeout(() => {
            hideTriggerChar();
            displayEventModal(event);
          }, GAME_CONFIG.animation.charStay);
        });
      } else {
        // 如果没有场景描述功能，直接显示触发字
        showTriggerChar(event);
        setTimeout(() => {
          hideTriggerChar();
          displayEventModal(event);
        }, GAME_CONFIG.animation.charStay);
      }
    })
    .catch(() => {
      pauseRoad();
      displayEventModal(event);
    });
}

// 检查选项是否满足物品需求
function isChoiceAvailable(choice) {
  const fx = choice.result && choice.result.effects;
  if (!fx) return true;

  // 检查物品移除需求
  if (
    fx.removeItems &&
    !fx.removeItems.every((item) => hasItem(item.id, item.quantity))
  ) {
    return false;
  }

  // 检查金币花费需求
  if (fx.gold && fx.gold < 0 && inventoryState.gold < Math.abs(fx.gold)) {
    return false;
  }

  return true;
}

// 显示事件弹窗（仅覆盖游戏画面 #game-canvas，其他区域保持可交互）
function displayEventModal(event) {
  const gameCanvas = document.getElementById("game-canvas");
  if (!gameCanvas) return;
  const modal = document.createElement("div");
  modal.id = "event-modal";
  modal.className =
    "event-modal text-area-scroll absolute inset-0 bg-black/80 flex items-center justify-center z-50";

  let choicesHtml = "";
  event.choices.forEach((choice) => {
    const available = isChoiceAvailable(choice);
    if (available) {
      choicesHtml += `
			<button onclick="handleEventChoice('${event.id}', '${choice.id}')" 
				class="event-modal-choice w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-left transition-all duration-300 border border-gray-600 hover:border-red-400">
				<div class="choice-title font-bold mb-0.5">${choice.text}</div>
				<div class="choice-desc text-gray-400">${choice.description}</div>
			</button>`;
    } else {
      // 选项不可用时灰显并标注缺少什么
      const fx = choice.result && choice.result.effects;
      const missing = [];

      // 检查缺少的物品
      if (fx && fx.removeItems) {
        fx.removeItems.forEach((item) => {
          if (!hasItem(item.id, item.quantity)) {
            const cfg = ITEMS_CONFIG[item.id];
            missing.push((cfg ? cfg.name : item.id) + "×" + item.quantity);
          }
        });
      }

      // 检查缺少的金币
      if (
        fx &&
        fx.gold &&
        fx.gold < 0 &&
        inventoryState.gold < Math.abs(fx.gold)
      ) {
        missing.push("金币×" + Math.abs(fx.gold));
      }

      const missingStr = missing.join("、");
      choicesHtml += `
			<button disabled
				class="event-modal-choice w-full bg-gray-900 text-gray-600 rounded-lg text-left border border-gray-800 cursor-not-allowed opacity-60">
				<div class="choice-title font-bold mb-0.5">${choice.text}</div>
				<div class="choice-desc text-gray-600">${choice.description}</div>
				<div class="text-red-400 mt-0.5" style="font-size: clamp(0.65rem, 1.8cqw, 0.75rem);">缺少：${missingStr}</div>
			</button>`;
    }
  });

  modal.innerHTML = `
		<div class="event-modal-inner text-area-scroll bg-[#1a1a2e] border-2 border-[#c41e3a] shadow-[0_0_50px_rgba(196,30,58,0.5)]">
			<div class="text-center">
				<div class="event-modal-emoji">${event.image}</div>
				<h2 class="event-modal-title font-bold text-[#c41e3a]">${event.title}</h2>
				<p class="event-modal-desc text-gray-300 leading-relaxed">${event.description}</p>
			</div>
			<div class="space-y-1">
				${choicesHtml}
			</div>
		</div>
	`;

  gameCanvas.appendChild(modal);
}

// 选择后显示乘客随机台词
function showPassengerDialogues(textArea) {
  if (!textArea || typeof PASSENGER_DIALOGUE_CONFIG === "undefined") return;
  const passengers = truckState.passengers || [];
  if (passengers.length === 0) return;

  const shuffled = [...passengers].sort(() => Math.random() - 0.5);
  let shown = 0;
  const maxShow = Math.min(3, Math.floor(passengers.length * 0.6) + 1);

  for (const name of shuffled) {
    if (shown >= maxShow) break;
    if (Math.random() > 0.5) continue;

    const cfg = PASSENGER_DIALOGUE_CONFIG[name];
    const lines = (cfg && cfg.afterChoice) || PASSENGER_DIALOGUE_CONFIG._default;
    const line = Array.isArray(lines) ? lines[Math.floor(Math.random() * lines.length)] : lines;
    if (line) {
      const color = (typeof PASSENGER_CONFIG !== "undefined" && PASSENGER_CONFIG[name] && PASSENGER_CONFIG[name].color) || "#94a3b8";
      textArea.innerHTML += `<p class="text-gray-400" style="color:${color}">「${name}」${line}</p>`;
      scrollTextAreaToBottom(textArea);
      shown++;
    }
  }
}

// 检查并触发条件剧情
function checkConditionalStories(textArea) {
  if (!textArea || typeof CONDITIONAL_STORIES_CONFIG === "undefined") return;
  const triggered = gameState.triggeredConditionalStories || [];

  for (const story of CONDITIONAL_STORIES_CONFIG) {
    if (triggered.includes(story.id)) continue;
    try {
      if (!story.condition || !story.condition()) continue;

      gameState.triggeredConditionalStories.push(story.id);
      textArea.innerHTML += `<p class="text-[#c41e3a]">【剧情】${story.message}</p>`;
      scrollTextAreaToBottom(textArea);

      if (story.rewards && story.rewards.addItems && typeof addItem === "function") {
        story.rewards.addItems.forEach((item) => {
          if (addItem(item.id, item.quantity)) {
            const cfg = typeof ITEMS_CONFIG !== "undefined" && ITEMS_CONFIG[item.id];
            textArea.innerHTML += cfg
              ? `<p style="color:#4ade80">获得 <span style="color:${cfg.color}">${cfg.name}</span> ×${item.quantity}</p>`
              : `<p style="color:#4ade80">获得 ${item.id} ×${item.quantity}</p>`;
            scrollTextAreaToBottom(textArea);
          }
        });
        if (typeof updateInventoryDisplay === "function") updateInventoryDisplay();
      }
    } catch (e) {
      console.warn("条件剧情检查失败:", story.id, e);
    }
  }
}

// 处理事件选择
function handleEventChoice(eventId, choiceId) {
  const allEvents = getAllEvents();
  const event = allEvents[eventId];
  const choice = event.choices.find((c) => c.id === choiceId);
  const textArea = document.getElementById("textArea");

  if (choice.result) {
    // 随机消息
    const rawMsg = choice.result.message;
    const msg = Array.isArray(rawMsg)
      ? rawMsg[Math.floor(Math.random() * rawMsg.length)]
      : rawMsg;

    // 显示结果消息
    textArea.innerHTML += `<p class="text-[#c41e3a]">【事件】${msg}</p>`;
    scrollTextAreaToBottom(textArea);

    // 处理效果
    if (choice.result.effects) {
      processEffects(choice.result.effects, textArea);
    }

    // 选择后：乘客随机台词 + 条件剧情检查（若打开了二级选择则等子选择完成后再显示）
    if (!document.getElementById("sub-choice-modal")) {
      showPassengerDialogues(textArea);
      checkConditionalStories(textArea);
    }

    // 检查游戏结束条件
    if (
      typeof checkGameOverConditions === "function" &&
      checkGameOverConditions()
    )
      return;

    // 保存
    saveGame();
  }

  // 关闭弹窗
  const modal = document.getElementById("event-modal");
  if (modal) modal.remove();

  // 检查是否有子模态框（制作台/商人/休息/二级选择）仍然打开
  // 如有，游戏继续暂停，等待子模态框关闭后由其自身调用 resumeGame()
  const hasOpenSubModal =
    document.getElementById("rest-modal") ||
    document.getElementById("crafting-modal") ||
    document.getElementById("merchant-modal") ||
    document.getElementById("sub-choice-modal");

  if (!hasOpenSubModal) {
    resumeRoad();
    resumeTextGeneration();
    gameState.eventTriggered = false;
  }
}

// 递归处理事件效果
function processEffects(fx, textArea) {
  if (!fx) return;

  // 数组：按顺序执行
  if (Array.isArray(fx)) {
    fx.forEach((effect) => processEffects(effect, textArea));
    return;
  }

  // 权重随机: { type: 'weighted', options: [ {weight: 10, message: '...', effects: {...}}, ... ] }
  if (fx.type === "weighted" && Array.isArray(fx.options)) {
    const totalWeight = fx.options.reduce(
      (sum, opt) => sum + (opt.weight || 1),
      0,
    );
    let roll = Math.random() * totalWeight;
    for (const opt of fx.options) {
      roll -= opt.weight || 1;
      if (roll <= 0) {
        // 每个 option 可携带独立 message
        if (opt.message) {
          const msg = Array.isArray(opt.message)
            ? opt.message[Math.floor(Math.random() * opt.message.length)]
            : opt.message;
          textArea.innerHTML += `<p class="text-[#c41e3a]">【结果】${msg}</p>`;
          scrollTextAreaToBottom(textArea);
        }
        processEffects(opt.effects, textArea);
        return;
      }
    }
    // Fallback to last option if rounding errors
    if (fx.options.length > 0) {
      const last = fx.options[fx.options.length - 1];
      if (last.message) {
        const msg = Array.isArray(last.message)
          ? last.message[Math.floor(Math.random() * last.message.length)]
          : last.message;
        textArea.innerHTML += `<p class="text-[#c41e3a]">【结果】${msg}</p>`;
        scrollTextAreaToBottom(textArea);
      }
      processEffects(last.effects, textArea);
    }
    return;
  }

  // 概率执行: { type: 'chance', chance: 0.5, success: {...}, fail: {...} }
  if (fx.type === "chance") {
    if (Math.random() < (fx.chance || 0.5)) {
      if (fx.success) processEffects(fx.success, textArea);
    } else {
      if (fx.fail) processEffects(fx.fail, textArea);
    }
    return;
  }

  // 显式序列/所有执行 { type: 'sequence', list: [...] }
  if ((fx.type === "sequence" || fx.type === "all") && Array.isArray(fx.list)) {
    fx.list.forEach((effect) => processEffects(effect, textArea));
    return;
  }

  // 二级选择: { type: 'choice', prompt: '...', options: [{text, description, message, effects}, ...] }
  if (fx.type === "choice" && Array.isArray(fx.options)) {
    showSubChoiceModal(fx, textArea);
    return;
  }

  // 基础效果处理
  applyBasicEffect(fx, textArea);
}

// 应用基础效果
function applyBasicEffect(fx, textArea) {
  // 乘客管理（上车时初始化该乘客好感度，并标记新上车以便仅此时播动效）
  if (fx.addPassenger && !truckState.passengers.includes(fx.addPassenger)) {
    truckState.passengers.push(fx.addPassenger);
    if (typeof gameState._newPassengerNames !== "object") gameState._newPassengerNames = [];
    gameState._newPassengerNames.push(fx.addPassenger);
    if (typeof gameState.passengerFavor !== "object")
      gameState.passengerFavor = {};
    if (
      gameState.passengerFavor[fx.addPassenger] === undefined ||
      gameState.passengerFavor[fx.addPassenger] === null
    ) {
      gameState.passengerFavor[fx.addPassenger] =
        typeof DEFAULT_FAVOR !== "undefined" ? DEFAULT_FAVOR : 50;
    }
    // 记录乘客上车（用于成就检查）
    if (typeof recordPassengerBoarded === "function") {
      recordPassengerBoarded(fx.addPassenger);
    }
    updateTruckDisplay();
    if (typeof updatePassengerListDisplay === "function")
      updatePassengerListDisplay();
    // 检查成就
    if (typeof checkAndUnlockAchievements === "function") {
      checkAndUnlockAchievements();
    }
  }
  if (fx.removePassenger) {
    const idx = truckState.passengers.indexOf(fx.removePassenger);
    if (idx > -1) {
      truckState.passengers.splice(idx, 1);
      if (typeof gameState.passengerGetOffMileage === "object")
        delete gameState.passengerGetOffMileage[fx.removePassenger];
      updateTruckDisplay();
      if (typeof updatePassengerListDisplay === "function")
        updatePassengerListDisplay();
    }
  }

  // 流浪猫喂食计数：第三次喂食时猫上车
  if (fx.strayCatFeedAndMaybeBoard) {
    if (typeof gameState.strayCatFeedCount !== "number") gameState.strayCatFeedCount = 0;
    gameState.strayCatFeedCount++;
    if (
      gameState.strayCatFeedCount >= 3 &&
      !truckState.passengers.includes("猫")
    ) {
      truckState.passengers.push("猫");
      if (typeof gameState._newPassengerNames !== "object") gameState._newPassengerNames = [];
      gameState._newPassengerNames.push("猫");
      if (typeof gameState.passengerFavor !== "object") gameState.passengerFavor = {};
      if (gameState.passengerFavor["猫"] === undefined) gameState.passengerFavor["猫"] = typeof DEFAULT_FAVOR !== "undefined" ? DEFAULT_FAVOR : 50;
      // 记录乘客上车（用于成就检查）
      if (typeof recordPassengerBoarded === "function") {
        recordPassengerBoarded("猫");
      }
      if (textArea) {
        textArea.innerHTML += `<p class="text-[#c41e3a]">【事件】小猫跟着跳上了车，在车厢里窝成一团不走了。</p>`;
        scrollTextAreaToBottom(textArea);
      }
      if (typeof updateTruckDisplay === "function") updateTruckDisplay();
      if (typeof updatePassengerListDisplay === "function") updatePassengerListDisplay();
    }
  }

  // 设置乘客“到达目的地下车”的里程（到达该里程时自动下车）
  // 值可为数字（固定 km）或 [min, max] 数组（随机区间 km）
  if (fx.setPassengerGetOffMileage && typeof fx.setPassengerGetOffMileage === "object") {
    if (typeof gameState.passengerGetOffMileage !== "object")
      gameState.passengerGetOffMileage = {};
    for (const name in fx.setPassengerGetOffMileage) {
      // 如果旅行者已经永久上车，不再设置下车里程
      if (name === "旅行者" && Array.isArray(gameState.permanentPassengers) && gameState.permanentPassengers.includes("旅行者")) {
        continue;
      }
      const raw = fx.setPassengerGetOffMileage[name];
      let kmFromNow = 0;
      if (Array.isArray(raw) && raw.length >= 2) {
        const min = Math.max(1, Math.floor(Number(raw[0])) || 5);
        const max = Math.max(min, Math.floor(Number(raw[1])) || 15);
        kmFromNow = min + Math.floor(Math.random() * (max - min + 1));
      } else {
        kmFromNow = Number(raw);
      }
      if (!isNaN(kmFromNow) && kmFromNow > 0)
        gameState.passengerGetOffMileage[name] = gameState.mileage + kmFromNow;
    }
    if (typeof updatePassengerListDisplay === "function")
      updatePassengerListDisplay();
  }

  // 解锁事件
  if (fx.unlockEvents) {
    fx.unlockEvents.forEach((evtId) => {
      if (!gameState.unlockedEvents.includes(evtId))
        gameState.unlockedEvents.push(evtId);
    });
  }

  // 皮卡属性
  if (fx.fuel) {
    let fuelDelta = fx.fuel;
    // 旅行者特性：认路，燃油消耗减少 2（休息/停车时省油）
    if (fuelDelta < 0 && truckState.passengers && truckState.passengers.includes("旅行者")) {
      fuelDelta = Math.min(0, fuelDelta + 2);
    }
    truckState.fuel = clamp(truckState.fuel + fuelDelta);
    updateTruckStatusDisplay();
  }
  if (fx.durability) {
    truckState.durability = clamp(truckState.durability + fx.durability);
    updateTruckStatusDisplay();
    if (typeof triggerScreenShake === "function") triggerScreenShake();
  }
  if (fx.comfort) {
    let comfortDelta = fx.comfort;
    // 鹿特性：森林之灵，休息时舒适恢复 +2
    if (comfortDelta > 0 && truckState.passengers && truckState.passengers.includes("鹿")) {
      comfortDelta += 2;
    }
    truckState.comfort = clamp(truckState.comfort + comfortDelta);
    updateTruckStatusDisplay();
  }

  // 每位乘客贡献固定值（正=舒适，负=不适）
  if (fx.comfortPerPassenger !== undefined) {
    const passengerCount = truckState.passengers
      ? truckState.passengers.length
      : 0;
    const delta = fx.comfortPerPassenger * passengerCount;
    truckState.comfort = clamp(truckState.comfort + delta);
    updateTruckStatusDisplay();
  }

  // 好感度：fx.favor 为 { "鹿": 10, "猎人": -5 }，仅对当前在车上的乘客生效
  if (fx.favor && typeof fx.favor === "object" && Array.isArray(truckState.passengers)) {
    const favorMin = typeof FAVOR_MIN !== "undefined" ? FAVOR_MIN : 0;
    const favorMax = typeof FAVOR_MAX !== "undefined" ? FAVOR_MAX : 100;
    const defaultFavor = typeof DEFAULT_FAVOR !== "undefined" ? DEFAULT_FAVOR : 50;
    if (typeof gameState.passengerFavor !== "object")
      gameState.passengerFavor = {};
    for (const name in fx.favor) {
      if (!truckState.passengers.includes(name)) continue;
      const delta = Number(fx.favor[name]);
      if (isNaN(delta)) continue;
      const cur = gameState.passengerFavor[name];
      const base = typeof cur === "number" && !isNaN(cur) ? cur : defaultFavor;
      gameState.passengerFavor[name] = Math.min(
        favorMax,
        Math.max(favorMin, base + delta),
      );
    }
    if (typeof updatePassengerListDisplay === "function")
      updatePassengerListDisplay();
    // 检查成就（好感度类）
    if (typeof checkAndUnlockAchievements === "function") {
      checkAndUnlockAchievements();
    }
  }

  // 好感度：fx.favorAll 对所有当前乘客增加/减少相同数值
  if (
    typeof fx.favorAll === "number" &&
    !isNaN(fx.favorAll) &&
    Array.isArray(truckState.passengers) &&
    truckState.passengers.length > 0
  ) {
    const favorMin = typeof FAVOR_MIN !== "undefined" ? FAVOR_MIN : 0;
    const favorMax = typeof FAVOR_MAX !== "undefined" ? FAVOR_MAX : 100;
    const defaultFavor = typeof DEFAULT_FAVOR !== "undefined" ? DEFAULT_FAVOR : 50;
    if (typeof gameState.passengerFavor !== "object")
      gameState.passengerFavor = {};
    truckState.passengers.forEach((name) => {
      const cur = gameState.passengerFavor[name];
      const base = typeof cur === "number" && !isNaN(cur) ? cur : defaultFavor;
      gameState.passengerFavor[name] = Math.min(
        favorMax,
        Math.max(favorMin, base + fx.favorAll),
      );
    });
    if (typeof updatePassengerListDisplay === "function")
      updatePassengerListDisplay();
    // 检查成就（好感度类）
    if (typeof checkAndUnlockAchievements === "function") {
      checkAndUnlockAchievements();
    }
  }

  // 金币
  if (fx.gold) {
    addGold(fx.gold);
    textArea.innerHTML += `<p style="color:#facc15;">获得 ${fx.gold} 金币</p>`;
  }

  // 打开UI模态框
  if (fx.openRestModal) showRestModal();
  if (fx.openCraftingModal) showCraftingModal();
  if (fx.openMerchantModal) showMerchantModal(fx.openMerchantModal);

  // 物品添加（标记新物品以便后备箱渐显动效）
  if (fx.addItems) {
    if (typeof gameState !== "undefined") gameState._newItemIds = fx.addItems.map((item) => item.id);
    fx.addItems.forEach((item) => {
      if (addItem(item.id, item.quantity)) {
        const cfg = ITEMS_CONFIG[item.id];
        if (cfg) {
          textArea.innerHTML += `<p style="color:#4ade80;">获得 <span style="color:${cfg.color}">${cfg.name}</span> ×${item.quantity}</p>`;
        }
      }
    });
  }

  // 物品移除
  if (fx.removeItems) {
    fx.removeItems.forEach((item) => {
      if (removeItem(item.id, item.quantity)) {
        const cfg = ITEMS_CONFIG[item.id];
        if (cfg) {
          textArea.innerHTML += `<p style="color:#ef4444;">消耗了 <span style="color:${cfg.color}">${cfg.name}</span> ×${item.quantity}</p>`;
          scrollTextAreaToBottom(textArea);
        }
      }
    });
  }

  // 随机拾取（标记新物品以便后备箱渐显动效）
  if (fx.randomLoot) {
    const tableId = typeof fx.randomLoot === "string" ? fx.randomLoot : "默认";
    if (typeof gameState !== "undefined") gameState._newItemIds = [];
    if (typeof getRandomLoot === "function") {
      for (const item of getRandomLoot(tableId)) {
        if (addItem(item.itemId, item.quantity)) {
          if (typeof gameState !== "undefined" && Array.isArray(gameState._newItemIds))
            gameState._newItemIds.push(item.itemId);
          const cfg = ITEMS_CONFIG[item.itemId];
          if (cfg) {
            textArea.innerHTML += `<p style="color:#4ade80;">找到了 <span style="color:${cfg.color}">${cfg.name}</span> ×${item.quantity}</p>`;
          }
        }
      }
      // 猎人特性：搜刮时额外找到物资
      if (truckState.passengers && truckState.passengers.includes("猎人") && typeof getRandomLoot === "function") {
        const hunterLoot = getRandomLoot(tableId);
        let hasHunterGain = false;
        for (const item of hunterLoot) {
          if (addItem(item.itemId, item.quantity)) {
            hasHunterGain = true;
            if (typeof gameState !== "undefined" && Array.isArray(gameState._newItemIds))
              gameState._newItemIds.push(item.itemId);
            const cfg = ITEMS_CONFIG[item.itemId];
            if (cfg && textArea) {
              textArea.innerHTML += `<p style="color:#94a3b8;">猎人帮你多找到了 <span style="color:${cfg.color}">${cfg.name}</span> ×${item.quantity}</p>`;
            }
          }
        }
        if (hasHunterGain && textArea) scrollTextAreaToBottom(textArea);
      }
    }
  }

  // 游戏结束直接标志
  if (fx.gameOver) {
    truckState.durability = 0;
    if (typeof triggerGameOver === "function") {
      triggerGameOver("game_over_event");
    } else {
      truckState.durability = -999;
      updateTruckStatusDisplay();
    }
  }
}

// 关闭事件弹窗
function removeEventModal() {
  const modal = document.getElementById("event-modal");
  if (modal) modal.remove();
}

// 恢复游戏运行
function resumeGame() {
  gameState.eventTriggered = false;
  resumeRoad();
  resumeTextGeneration();
  saveGame();
}

// 显示二级选择弹窗（仅覆盖游戏画面 #game-canvas，其他区域保持可交互）
function showSubChoiceModal(choiceData, textArea) {
  const oldModal = document.getElementById("sub-choice-modal");
  if (oldModal) oldModal.remove();

  const gameCanvas = document.getElementById("game-canvas");
  if (!gameCanvas) return;

  let optionsHtml = choiceData.options
    .map((opt, i) => {
      // 检查子选项是否可用
      const fx = opt.effects;
      const hasEnoughItems =
        !fx ||
        !fx.removeItems ||
        fx.removeItems.every((item) => hasItem(item.id, item.quantity));
      const hasEnoughGold =
        !fx ||
        !fx.gold ||
        fx.gold >= 0 ||
        inventoryState.gold >= Math.abs(fx.gold);
      const available = hasEnoughItems && hasEnoughGold;

      // 生成缺少资源提示
      let missingStr = "";
      if (!available) {
        const missing = [];
        if (fx && fx.removeItems) {
          fx.removeItems.forEach((item) => {
            if (!hasItem(item.id, item.quantity)) {
              const cfg = ITEMS_CONFIG[item.id];
              missing.push((cfg ? cfg.name : item.id) + "×" + item.quantity);
            }
          });
        }
        if (
          fx &&
          fx.gold &&
          fx.gold < 0 &&
          inventoryState.gold < Math.abs(fx.gold)
        ) {
          missing.push("金币×" + Math.abs(fx.gold));
        }
        missingStr = missing.join("、");
      }

      if (available) {
        return `
		<button onclick="handleSubChoice(${i})"
			class="sub-choice-option w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-800/80 hover:to-red-700/80 text-white rounded-lg text-left transition-all border border-gray-600 hover:border-red-500">
			<div class="font-bold mb-0.5">${opt.text}</div>
			${opt.description ? `<div class="text-gray-400">${opt.description}</div>` : ""}
		</button>`;
      } else {
        return `
		<button disabled
			class="sub-choice-option w-full bg-gray-900 text-gray-600 rounded-lg text-left border border-gray-800 cursor-not-allowed opacity-60">
			<div class="font-bold mb-0.5">${opt.text}</div>
			${opt.description ? `<div class="text-gray-600">${opt.description}</div>` : ""}
			<div class="text-red-400 mt-0.5">缺少：${missingStr}</div>
		</button>`;
      }
    })
    .join("");

  const modal = document.createElement("div");
  modal.id = "sub-choice-modal";
  modal.className =
    "sub-choice-modal text-area-scroll absolute inset-0 bg-black/60 flex items-center justify-center z-[60]";
  modal.innerHTML = `
		<div class="sub-choice-inner text-area-scroll bg-[#1a1a2e] border border-[#c41e3a]/60 shadow-lg w-full">
			<p class="sub-choice-prompt text-gray-300 leading-relaxed">${choiceData.prompt}</p>
			<div class="space-y-1">${optionsHtml}</div>
		</div>`;
  gameCanvas.appendChild(modal);

  // 挂载到 window 供 onclick 访问
  window._pendingSubChoiceOptions = choiceData.options;
  window._pendingSubChoiceTextArea = textArea;
}

// 处理二级选择结果
function handleSubChoice(index) {
  const modal = document.getElementById("sub-choice-modal");
  if (modal) modal.remove();

  const option = window._pendingSubChoiceOptions[index];
  const textArea = window._pendingSubChoiceTextArea;

  if (option.message) {
    const msg = Array.isArray(option.message)
      ? option.message[Math.floor(Math.random() * option.message.length)]
      : option.message;
    textArea.innerHTML += `<p class="text-[#c41e3a]">【结果】${msg}</p>`;
    scrollTextAreaToBottom(textArea);
  }

  if (option.effects) {
    processEffects(option.effects, textArea);
  }

  showPassengerDialogues(textArea);
  checkConditionalStories(textArea);

  if (
    typeof checkGameOverConditions === "function" &&
    checkGameOverConditions()
  )
    return;

  // 检查是否又打开了新的子模态框
  const hasOpenSubModal =
    document.getElementById("rest-modal") ||
    document.getElementById("crafting-modal") ||
    document.getElementById("merchant-modal") ||
    document.getElementById("sub-choice-modal");

  if (!hasOpenSubModal) {
    resumeGame();
  }
}

function clamp(val) {
  return Math.min(100, Math.max(0, val));
}
