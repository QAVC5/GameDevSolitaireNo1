// 库存显示模块
// 管理库存面板和状态栏的UI更新

// 耐久变动时触发屏幕抖动（游戏画面 #game-canvas）
function triggerScreenShake() {
  const el = document.getElementById("game-canvas");
  if (!el) return;
  el.classList.remove("screen-shake");
  void el.offsetWidth;
  el.classList.add("screen-shake");
  setTimeout(() => el.classList.remove("screen-shake"), 450);
}

// 更新皮卡状态栏（燃油、耐久、舒适）
function updateTruckStatusDisplay() {
  // 燃油
  const fuelBar = document.getElementById("fuel-bar");
  const fuelText = document.getElementById("fuel-text");
  if (fuelBar && fuelText) {
    fuelBar.style.width = truckState.fuel + "%";
    fuelText.textContent = Math.round(truckState.fuel) + "%";
    // 低于30%变红
    if (truckState.fuel <= 30) {
      fuelBar.className =
        fuelBar.className.replace(/bg-yellow-500|bg-red-500/g, "") +
        " bg-red-500";
      fuelText.className =
        fuelText.className.replace(/text-yellow-500|text-red-500/g, "") +
        " text-red-500";
    } else {
      fuelBar.className =
        fuelBar.className.replace(/bg-yellow-500|bg-red-500/g, "") +
        " bg-yellow-500";
      fuelText.className =
        fuelText.className.replace(/text-yellow-500|text-red-500/g, "") +
        " text-yellow-500";
    }
  }

  // 耐久
  const durBar = document.getElementById("durability-bar");
  const durText = document.getElementById("durability-text");
  if (durBar && durText) {
    durBar.style.width = truckState.durability + "%";
    durText.textContent = Math.round(truckState.durability) + "%";
    if (truckState.durability <= 30) {
      durBar.className =
        durBar.className.replace(/bg-green-500|bg-red-500/g, "") +
        " bg-red-500";
      durText.className =
        durText.className.replace(/text-green-500|text-red-500/g, "") +
        " text-red-500";
    } else {
      durBar.className =
        durBar.className.replace(/bg-green-500|bg-red-500/g, "") +
        " bg-green-500";
      durText.className =
        durText.className.replace(/text-green-500|text-red-500/g, "") +
        " text-green-500";
    }
  }

  // 舒适度
  const comBar = document.getElementById("comfort-bar");
  const comText = document.getElementById("comfort-text");
  if (comBar && comText) {
    comBar.style.width = truckState.comfort + "%";
    comText.textContent = Math.round(truckState.comfort) + "%";
    if (truckState.comfort <= 30) {
      comBar.className =
        comBar.className.replace(/bg-blue-400|bg-red-500/g, "") + " bg-red-500";
      comText.className =
        comText.className.replace(/text-blue-400|text-red-500/g, "") +
        " text-red-500";
    } else {
      comBar.className =
        comBar.className.replace(/bg-blue-400|bg-red-500/g, "") +
        " bg-blue-400";
      comText.className =
        comText.className.replace(/text-blue-400|text-red-500/g, "") +
        " text-blue-400";
    }
  }

  // 行驶里程记录表
  const mileageCurrentEl = document.getElementById("mileage-current");
  const mileageBestEl = document.getElementById("mileage-best");
  if (mileageCurrentEl && typeof gameState !== "undefined") {
    mileageCurrentEl.textContent = Math.floor(gameState.mileage || 0);
  }
  if (mileageBestEl && typeof getBestMileage === "function") {
    mileageBestEl.textContent = getBestMileage();
  }

  // 燃油≤5：背景暗红闪烁；耐久≤50：故障特效
  const gameCanvas = document.getElementById("game-canvas");
  if (gameCanvas) {
    if (truckState.fuel <= 20) {
      gameCanvas.classList.add("fuel-low-flash");
    } else {
      gameCanvas.classList.remove("fuel-low-flash");
    }
    if (truckState.durability <= 50) {
      gameCanvas.classList.add("durability-glitch");
    } else {
      gameCanvas.classList.remove("durability-glitch");
    }
  }
}

// 更新车上成员列表显示
function updatePassengerListDisplay() {
  const container = document.getElementById("passenger-list");
  if (!container) return;

  const passengers =
    typeof truckState !== "undefined" && Array.isArray(truckState.passengers)
      ? truckState.passengers
      : [];

  container.innerHTML = "";

  if (passengers.length === 0) {
    container.innerHTML = '<span class="text-gray-600 text-sm">暂无乘客</span>';
    return;
  }

  const getFavor =
    typeof getPassengerFavor === "function"
      ? getPassengerFavor
      : () => 50;
  const getOffMileage =
    typeof gameState !== "undefined" && gameState.passengerGetOffMileage
      ? gameState.passengerGetOffMileage
      : {};
  const mileage = typeof gameState !== "undefined" && typeof gameState.mileage === "number"
    ? gameState.mileage
    : 0;
  const permanentPassengers = typeof gameState !== "undefined" && Array.isArray(gameState.permanentPassengers)
    ? gameState.permanentPassengers
    : [];

  const newNames = (typeof gameState !== "undefined" && gameState._newPassengerNames) ? gameState._newPassengerNames : [];
  passengers.forEach((name) => {
    const cfg =
      typeof PASSENGER_CONFIG !== "undefined" && PASSENGER_CONFIG[name];
    const color = cfg && cfg.color ? cfg.color : "#94a3b8";
    const favor = getFavor(name);
    const favorColor =
      favor >= 70 ? "#22c55e" : favor >= 40 ? "#eab308" : "#ef4444";
    // 如果乘客已永久上车，不显示距离
    const isPermanent = permanentPassengers.includes(name);
    const targetMileage = isPermanent ? null : getOffMileage[name];
    const remainingKm =
      typeof targetMileage === "number" && !isNaN(targetMileage)
        ? Math.max(0, Math.ceil(targetMileage - mileage))
        : null;
    const item = document.createElement("div");
    const enterClass = newNames.indexOf(name) !== -1 ? " passenger-item-enter" : "";
    item.className =
      "flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 flex-shrink-0" + enterClass;
    const namePart = `<span class="flex items-center gap-1.5 min-w-0"><span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${color}"></span><span style="color:${color}" class="font-medium whitespace-nowrap">${name}</span>${remainingKm !== null ? `<span class="text-gray-500 text-xs flex-shrink-0" title="到达目的地剩余里程">${remainingKm}km</span>` : ""}</span>`;
    const favorPart = `<span class="flex items-center gap-0.5 flex-shrink-0 text-xs" style="color:${favorColor}" title="好感度">♥${favor}</span>`;
    item.innerHTML = namePart + favorPart;
    container.appendChild(item);
  });
  if (typeof gameState !== "undefined" && gameState._newPassengerNames && gameState._newPassengerNames.length)
    setTimeout(function () { gameState._newPassengerNames = []; }, 50);
}

// 更新金币显示
function updateGoldDisplay() {
  const goldText = document.getElementById("gold-text");
  if (goldText) {
    goldText.textContent = inventoryState.gold;
  }
}

// 更新载重条显示
function updateWeightDisplay() {
  const weightBar = document.getElementById("weight-bar");
  const weightText = document.getElementById("weight-text");
  if (weightBar && weightText) {
    const currentWeight = getInventoryWeight();
    const pct = Math.min(100, (currentWeight / inventoryState.maxWeight) * 100);
    weightBar.style.width = pct + "%";
    weightText.textContent = currentWeight + "/" + inventoryState.maxWeight;

    // 超过80%变黄，满载变红
    if (pct >= 100) {
      weightBar.className =
        weightBar.className.replace(
          /bg-\[#c41e3a\]|bg-yellow-500|bg-red-500/g,
          "",
        ) + " bg-red-500";
    } else if (pct >= 80) {
      weightBar.className =
        weightBar.className.replace(
          /bg-\[#c41e3a\]|bg-yellow-500|bg-red-500/g,
          "",
        ) + " bg-yellow-500";
    } else {
      weightBar.className =
        weightBar.className.replace(
          /bg-\[#c41e3a\]|bg-yellow-500|bg-red-500/g,
          "",
        ) + " bg-[#c41e3a]";
    }
  }
}

// 根据物品配置生成悬停 tooltip 文案（使用后的作用）
function getItemTooltip(config) {
  if (!config) return "";
  const parts = [];
  if (config.useEffect && typeof config.useEffect === "object") {
    const u = config.useEffect;
    if (typeof u.fuel === "number") parts.push("燃油+" + u.fuel);
    if (typeof u.durability === "number") parts.push("耐久+" + u.durability);
    if (typeof u.comfort === "number") parts.push("舒适+" + u.comfort);
    if (parts.length > 0)
      return "使用后：" + parts.join("，");
  }
  return config.description || "材料/特殊物品，无直接使用效果";
}

// 确保全局自定义 tooltip 节点存在（与当前画面风格一致）
function ensureInventoryTooltipElement() {
  let el = document.getElementById("inventory-tooltip");
  if (el) return el;
  el = document.createElement("div");
  el.id = "inventory-tooltip";
  el.setAttribute("role", "tooltip");
  el.style.cssText =
    "position:fixed;z-index:9999;max-width:260px;padding:8px 12px;border-radius:8px;border:2px solid #c41e3a;background:#0d0d0d;color:#e5e5e5;font-size:13px;line-height:1.4;box-shadow:0 0 20px rgba(196,30,58,0.35);pointer-events:none;opacity:0;transition:opacity 0.15s ease;visibility:hidden;";
  document.body.appendChild(el);
  return el;
}

// 显示与画面风格一致的自定义 tooltip
function showInventoryTooltip(el) {
  const text = el && el.getAttribute("data-tooltip");
  if (!text) return;
  const tip = ensureInventoryTooltipElement();
  tip.textContent = text;
  tip.style.visibility = "visible";
  tip.style.opacity = "0";
  tip.style.left = "-9999px";
  tip.style.top = "0";
  tip.offsetHeight; // 强制 reflow 以得到正确宽高
  const rect = el.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const gap = 8;
  let left = rect.left + rect.width / 2 - tipRect.width / 2;
  let top = rect.top - tipRect.height - gap;
  if (top < 12) top = rect.bottom + gap;
  if (left < 12) left = 12;
  if (left + tipRect.width > window.innerWidth - 12)
    left = window.innerWidth - tipRect.width - 12;
  tip.style.left = left + "px";
  tip.style.top = top + "px";
  tip.style.opacity = "1";
}

// 隐藏自定义 tooltip
function hideInventoryTooltip() {
  const tip = document.getElementById("inventory-tooltip");
  if (tip) {
    tip.style.opacity = "0";
    tip.style.visibility = "hidden";
  }
}

// 后备箱拖拽：插入位占位与缓动让位用
let inventoryDragSourceIndex = -1;
function ensureInventoryPlaceholder() {
  let el = document.getElementById("inventory-drop-placeholder");
  if (el) return el;
  el = document.createElement("div");
  el.id = "inventory-drop-placeholder";
  el.className = "inventory-drop-placeholder";
  el.setAttribute("data-placeholder", "1");
  return el;
}

// 后备箱拖拽：开始（插入占位条，其他项缓动让位）
function inventoryDragStart(e) {
  const idx = parseInt(e.currentTarget.getAttribute("data-slot-index"), 10);
  inventoryDragSourceIndex = idx;
  e.dataTransfer.setData("text/plain", String(idx));
  e.dataTransfer.effectAllowed = "move";
  e.currentTarget.classList.add("inventory-item-dragging");

  const listEl = document.getElementById("inventory-list");
  if (!listEl) return;
  const rows = listEl.querySelectorAll(".inventory-item-row");
  if (rows.length === 0) return;
  const placeholder = ensureInventoryPlaceholder();
  
  // 使用 setTimeout 延迟插入占位条，防止浏览器由于 DOM 变更而立即中断拖拽
  setTimeout(() => {
    if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    const insertIndex = Math.min(idx, rows.length);
    if (insertIndex >= rows.length) listEl.appendChild(placeholder);
    else listEl.insertBefore(placeholder, rows[insertIndex]);
    placeholder.classList.add("active");
  }, 0);
}

// 后备箱拖拽：结束（移除占位条）
function inventoryDragEnd(e) {
  e.currentTarget.classList.remove("inventory-item-dragging");
  const placeholder = document.getElementById("inventory-drop-placeholder");
  if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
  inventoryDragSourceIndex = -1;
}

// 后备箱拖拽：经过（更新插入位，占位条移动时其他项缓动让位）
function inventoryDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = "move";
  const listEl = document.getElementById("inventory-list");
  const placeholder = document.getElementById("inventory-drop-placeholder");
  if (!listEl || !placeholder || !placeholder.parentNode) return;
  
  let targetEl = e.target;
  if (targetEl && targetEl.nodeType === 3) targetEl = targetEl.parentNode;
  const row = targetEl && targetEl.closest ? targetEl.closest(".inventory-item-row") : null;
  if (!row) return; // 在占位条或空白处仅保持 allow drop，不移动占位条
  
  const rows = listEl.querySelectorAll(".inventory-item-row");
  let insertIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] === row) {
      const rect = row.getBoundingClientRect();
      insertIndex = e.clientY < rect.top + rect.height / 2 ? i : i + 1;
      break;
    }
  }
  if (insertIndex < 0) return;
  insertIndex = Math.min(insertIndex, rows.length);
  const currentChildren = Array.from(listEl.children).filter((c) => c.id !== "inventory-drop-placeholder");
  if (insertIndex >= currentChildren.length) {
    listEl.appendChild(placeholder);
  } else {
    listEl.insertBefore(placeholder, currentChildren[insertIndex]);
  }
}

// 后备箱拖拽：离开（不移除占位条，保持当前插入位）
function inventoryDragLeave(e) {
  // 占位条保留，不做处理
}

// 后备箱拖拽：放下并调整顺序（按占位条位置插入，其他元素已让位）
function inventoryDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const listEl = document.getElementById("inventory-list");
  const placeholder = document.getElementById("inventory-drop-placeholder");
  if (!listEl || !placeholder || !placeholder.parentNode) {
    inventoryDragSourceIndex = -1;
    return;
  }
  const dropIndex = Array.from(listEl.children).indexOf(placeholder);
  const sourceIndex = inventoryDragSourceIndex;
  placeholder.parentNode.removeChild(placeholder);
  inventoryDragSourceIndex = -1;

  if (sourceIndex === dropIndex || isNaN(sourceIndex) || dropIndex < 0) return;
  const items = inventoryState.items;
  if (sourceIndex < 0 || sourceIndex >= items.length) return;
  const toIndex = dropIndex > sourceIndex ? dropIndex - 1 : dropIndex;
  if (toIndex < 0 || toIndex > items.length) return;
  const [moved] = items.splice(sourceIndex, 1);
  items.splice(toIndex, 0, moved);
  updateInventoryDisplay();
  if (typeof saveGame === "function") saveGame();
}

// 更新库存物品列表
function updateInventoryDisplay() {
  const listEl = document.getElementById("inventory-list");
  if (!listEl) return;

  updateWeightDisplay();
  ensureInventoryTooltipElement();

  const newIds = (typeof gameState !== "undefined" && gameState._newItemIds) ? gameState._newItemIds : [];

  if (inventoryState.items.length === 0) {
    listEl.innerHTML =
      '<div class="text-center text-gray-600 text-sm py-8">后备箱空空如也...</div>';
    return;
  }

  let html = "";
  const items = inventoryState.items;
  for (let i = 0; i < items.length; i++) {
    const slot = items[i];
    const config = ITEMS_CONFIG[slot.id];
    if (!config) continue;

    const isUsable = config.category === "consumable";
    const categoryColors = {
      consumable: "border-green-800 bg-green-900/20",
      material: "border-gray-700 bg-gray-800/30",
      special: "border-yellow-700 bg-yellow-900/20",
    };
    const borderClass = categoryColors[config.category] || "border-gray-700";
    const tooltipText = getItemTooltip(config);
    const tooltipAttr = tooltipText.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const enterClass = newIds.indexOf(slot.id) !== -1 ? " inventory-item-enter" : "";

    html += `
			<div class="inventory-item-row flex items-center gap-2 p-2 rounded-lg border ${borderClass} hover:bg-white/5 transition-colors group${enterClass}" data-slot-index="${i}" data-tooltip="${tooltipAttr}" draggable="true" onmouseenter="showInventoryTooltip(this)" onmouseleave="hideInventoryTooltip()" ondragstart="inventoryDragStart(event)" ondragend="inventoryDragEnd(event)" ondragover="inventoryDragOver(event)" ondragleave="inventoryDragLeave(event)" ondrop="inventoryDrop(event)">
				<span class="text-sm font-bold flex-shrink-0 w-5 h-5 rounded flex items-center justify-center" style="color:${config.color}; border: 1px solid ${config.color}40;">${config.name.charAt(0)}</span>
				<div class="flex-1 min-w-0">
					<div class="text-sm truncate" style="color:${config.color}">${config.name}</div>
					<div class="text-xs text-gray-600">${config.weight}kg × ${slot.quantity}</div>
				</div>
				<span class="text-xs text-gray-500 flex-shrink-0 w-10 text-right tabular-nums">×${slot.quantity}</span>
				<div class="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
				<button onclick="discardItemFromInventory('${slot.id}')" class="px-2 py-0.5 text-xs bg-red-900/60 text-red-300 rounded border border-red-700/50 hover:bg-red-700 transition-all">丢弃</button>
				${isUsable ? `<button onclick="useItemFromInventory('${slot.id}')" class="px-2 py-0.5 text-xs bg-green-800/60 text-green-300 rounded border border-green-700/50 hover:bg-green-700 transition-all">使用</button>` : ""}
				</div>
			</div>`;
  }

  listEl.innerHTML = html;
  // 延迟清空，使同一批添加的多个物品都能播渐显
  if (typeof gameState !== "undefined" && gameState._newItemIds && gameState._newItemIds.length)
    setTimeout(function () { gameState._newItemIds = []; }, 50);
}

// 从库存面板使用物品
function useItemFromInventory(itemId) {
  const config = ITEMS_CONFIG[itemId];
  if (!config) return;

  if (useItem(itemId)) {
    if (config.useEffect && config.useEffect.durability && typeof triggerScreenShake === "function")
      triggerScreenShake();
    // 添加使用反馈到文本区
    const textArea = document.getElementById("textArea");
    if (textArea) {
      const effectParts = [];
      if (config.useEffect.fuel)
        effectParts.push(
          `<span style="color: #eab308;">燃</span>+${config.useEffect.fuel}`,
        );
      if (config.useEffect.durability)
        effectParts.push(
          `<span style="color: #22c55e;">耐</span>+${config.useEffect.durability}`,
        );
      if (config.useEffect.comfort)
        effectParts.push(
          `<span style="color: #60a5fa;">适</span>+${config.useEffect.comfort}`,
        );

      const p = document.createElement("p");
      p.innerHTML = `<span style="color: #4ade80;">✦ 使用了<span style="color:${config.color}">${config.name}</span>（${effectParts.join("，")}）</span>`;
      textArea.appendChild(p);
      scrollTextAreaToBottom(textArea);
    }
    if (document.getElementById("crafting-modal")) showCraftingModal();
  }
}

// 从库存面板丢弃物品
function discardItemFromInventory(itemId) {
  const config = ITEMS_CONFIG[itemId];
  if (!config) return;
  if (!hasItem(itemId)) return;
  removeItem(itemId, 1);
  if (typeof saveGame === "function") saveGame();
  const textArea = document.getElementById("textArea");
  if (textArea) {
    const p = document.createElement("p");
    p.innerHTML = `<span style="color: #94a3b8;">✦ 丢弃了 <span style="color:${config.color}">${config.name}</span> ×1</span>`;
    textArea.appendChild(p);
    scrollTextAreaToBottom(textArea);
  }
  if (document.getElementById("crafting-modal")) showCraftingModal();
}

// 显示商人交易界面
function showMerchantModal(merchantId) {
  const merchant = MERCHANT_CONFIG[merchantId];
  if (!merchant) return;

  // 移除旧modal
  const oldModal = document.getElementById("merchant-modal");
  if (oldModal) oldModal.remove();

  const hasElderlyDiscount = typeof truckState !== "undefined" && truckState.passengers && truckState.passengers.includes("年迈妇人");
  let itemsHtml = "";
  for (const listing of merchant.items) {
    const config = ITEMS_CONFIG[listing.itemId];
    if (!config) continue;
    const owned = getItemQuantity(listing.itemId);
    const buyPrice = typeof getEffectiveBuyPrice === "function" ? getEffectiveBuyPrice(merchantId, listing.itemId) : listing.buyPrice;
    const sellPrice = typeof getEffectiveSellPrice === "function" ? getEffectiveSellPrice(merchantId, listing.itemId) : listing.sellPrice;

    // 检查购买条件：金币足够 + 装备空间足够
    const hasEnoughGold = inventoryState.gold >= buyPrice;
    const hasEnoughSpace =
      getInventoryWeight() + config.weight <= inventoryState.maxWeight;
    const canBuy = hasEnoughGold && hasEnoughSpace;

    // 生成购买按钮
    let buyButtonHtml = "";
    if (canBuy) {
      buyButtonHtml = `<button onclick="merchantBuy('${merchantId}','${listing.itemId}', this)" 
        class="px-2 py-0.5 text-xs bg-green-800/60 text-green-300 rounded border border-green-700/50 hover:bg-green-700 transition-all">
        买 <span style="color: #eab308;">币</span>${buyPrice}
      </button>`;
    } else {
      let reason = "";
      if (!hasEnoughGold) reason = "金币不足";
      else if (!hasEnoughSpace) reason = "后备箱容量不足";
      buyButtonHtml = `<button disabled 
        class="px-2 py-0.5 text-xs bg-gray-700 text-gray-500 rounded border border-gray-700 cursor-not-allowed opacity-50" 
        title="${reason}">
        买 <span style="color: #eab308;">币</span>${buyPrice}
      </button>`;
    }

    const buyUnavailableReason = !canBuy ? (hasEnoughGold ? "后备箱容量不足" : "金币不足") : "";
    const rowTitle = buyUnavailableReason ? ` title="${buyUnavailableReason}"` : "";
    itemsHtml += `
			<div class="flex items-center gap-2 p-2 border border-gray-700 rounded-lg bg-gray-800/30"${rowTitle}>
				<span class="text-sm font-bold flex-shrink-0 w-6 h-6 rounded flex items-center justify-center" style="color:${config.color}; border: 1px solid ${config.color}40;">${config.name.charAt(0)}</span>
				<div class="flex-1">
					<div class="text-sm" style="color:${config.color}">${config.name} <span class="text-xs text-gray-600">(${config.weight}kg)</span></div>
					<div class="text-xs text-gray-500">${config.description}</div>
				</div>
				<div class="flex flex-col gap-1 items-end flex-shrink-0">
					<span class="text-xs text-gray-500">持有: ${owned}</span>
					<div class="flex gap-1">
						${buyButtonHtml}
						<button onclick="merchantSell('${merchantId}','${listing.itemId}', this)"
							class="px-2 py-0.5 text-xs bg-red-800/60 text-red-300 rounded border border-red-700/50 hover:bg-red-700 transition-all"
							${owned === 0 ? 'disabled style="opacity:0.3"' : ""}>
						卖 <span style="color: #eab308;">币</span>${sellPrice}
						</button>
					</div>
				</div>
			</div>`;
  }

  const modal = document.createElement("div");
  modal.id = "merchant-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center";
  modal.innerHTML = `
		<div class="absolute inset-0 bg-black/70" onclick="closeMerchantModal()"></div>
		<div class="relative bg-[#1a1a2e] border-2 border-[#c41e3a] rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
			<h3 class="text-lg font-bold text-[#c41e3a] mb-1">${merchant.name}</h3>
			<p class="text-sm text-gray-400 mb-1 italic">"${merchant.greeting}"</p>
			${hasElderlyDiscount ? '<p class="text-xs text-green-400/90 mb-3">👵 年迈妇人同行，商人给了优惠价！</p>' : '<div class="mb-3"></div>'}
			<div class="flex items-center gap-2 mb-3 text-sm">
				<span class="text-yellow-400"><span style="color: #eab308;">币</span></span>
				<span id="merchant-gold" class="text-yellow-400 font-bold">${inventoryState.gold}</span>
				<span class="text-gray-500">金币</span>
				<span class="ml-auto text-gray-500">载重: ${getInventoryWeight()}/${inventoryState.maxWeight}kg</span>
			</div>
			<div class="text-area-scroll space-y-2 overflow-y-auto flex-1 pr-1">${itemsHtml}</div>
			<button onclick="closeMerchantModal()" 
				class="mt-4 w-full py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
				离开
			</button>
		</div>`;
  document.body.appendChild(modal);
}

// 商人购买操作
function merchantBuy(merchantId, itemId, btn) {
  if (buyItem(merchantId, itemId)) {
    const modal = document.getElementById("merchant-modal");
    if (modal) modal.remove();
    showMerchantModal(merchantId);
  }
}

// 商人出售操作
function merchantSell(merchantId, itemId, btn) {
  if (sellItem(merchantId, itemId)) {
    const modal = document.getElementById("merchant-modal");
    if (modal) modal.remove();
    showMerchantModal(merchantId);
  }
}

// 主动关闭商人界面（用户点击"离开"按钮）
function closeMerchantModal() {
  const modal = document.getElementById("merchant-modal");
  if (modal) modal.remove();
  resumeGameAfterModal();
}

// 显示合成界面
function showCraftingModal() {
  const oldModal = document.getElementById("crafting-modal");
  if (oldModal) oldModal.remove();

  let recipesHtml = "";
  for (const [recipeId, recipe] of Object.entries(CRAFTING_RECIPES)) {
    const resultConfig = ITEMS_CONFIG[recipe.result.itemId];
    const available = canCraft(recipeId);
    const unavailableReason = !available && typeof getCraftUnavailableReason === "function" ? getCraftUnavailableReason(recipeId) : "";
    const titleAttr = unavailableReason ? ` title="${unavailableReason}"` : "";

    let materialsHtml = recipe.materials
      .map((mat) => {
        const matConfig = ITEMS_CONFIG[mat.itemId];
        const owned = getItemQuantity(mat.itemId);
        const enough = owned >= mat.quantity;
        return `<span class="${enough ? "text-green-400" : "text-red-400"}">${matConfig.name}×${mat.quantity}(${owned})</span>`;
      })
      .join(" + ");

    recipesHtml += `
			<div class="p-3 border ${available ? "border-green-700 bg-green-900/10" : "border-gray-700 bg-gray-800/20"} rounded-lg"${titleAttr}>
				<div class="flex items-center gap-2 mb-2">
					<span class="text-sm font-bold" style="color:${resultConfig.color}">${resultConfig.name}</span>
					<span class="text-xs text-gray-500">×${recipe.result.quantity}</span>
					<button onclick="doCraft('${recipeId}')"
						class="ml-auto px-3 py-1 text-xs rounded border transition-all ${
              available
                ? "bg-green-800/60 text-green-300 border-green-700/50 hover:bg-green-700 cursor-pointer"
                : "bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed"
            }"
						${available ? "" : "disabled"}${!available ? titleAttr : ""}>
						合成
					</button>
				</div>
				<div class="text-xs text-gray-500 flex flex-wrap gap-1">需要：${materialsHtml}</div>
			</div>`;
  }

  const gameCanvas = document.getElementById("game-canvas");
  if (!gameCanvas) return;
  const modal = document.createElement("div");
  modal.id = "crafting-modal";
  modal.className = "absolute inset-0 z-50 flex items-center justify-center";
  modal.innerHTML = `
		<div class="absolute inset-0 pointer-events-auto" onclick="closeCraftingModal()"></div>
		<div class="relative bg-[#1a1a2e] border-2 border-[#c41e3a] rounded-xl p-6 max-w-md w-full mx-4 max-h-[90%] flex flex-col">
			<h3 class="text-lg font-bold text-[#c41e3a] mb-3"><span style="color: #facc15;">制</span>作台</h3>
			<div class="text-area-scroll space-y-2 overflow-y-auto flex-1 pr-1">${recipesHtml}</div>
			<button onclick="closeCraftingModal()" 
				class="mt-4 w-full py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
				离开
			</button>
		</div>`;
  gameCanvas.appendChild(modal);
}

// 执行合成
function doCraft(recipeId) {
  if (craftItem(recipeId)) {
    const recipe = CRAFTING_RECIPES[recipeId];
    const config = ITEMS_CONFIG[recipe.result.itemId];

    // 文本反馈
    const textArea = document.getElementById("textArea");
    if (textArea) {
      const p = document.createElement("p");
      p.innerHTML = `<span style="color: #facc15;"><span style="color: #facc15;">制</span>作了<span style="color:${config.color}">${config.name}</span>×${recipe.result.quantity}！</span>`;
      textArea.appendChild(p);
      scrollTextAreaToBottom(textArea);
    }

    // 刷新界面
    const modal = document.getElementById("crafting-modal");
    if (modal) modal.remove();
    showCraftingModal();
  }
}

// 关闭合成界面并恢复游戏
function closeCraftingModal() {
  const modal = document.getElementById("crafting-modal");
  if (modal) modal.remove();
  resumeGameAfterModal();
}

// 显示休息/使用物品界面
function showRestModal() {
  const oldModal = document.getElementById("rest-modal");
  if (oldModal) oldModal.remove();

  // 只显示消耗品
  const consumables = inventoryState.items.filter((slot) => {
    const config = ITEMS_CONFIG[slot.id];
    return config && config.category === "consumable";
  });

  let itemsHtml = "";
  if (consumables.length === 0) {
    itemsHtml =
      '<div class="text-center text-gray-600 text-sm py-6">没有可以使用的物品...</div>';
  } else {
    for (const slot of consumables) {
      const config = ITEMS_CONFIG[slot.id];
      const effectParts = [];
      if (config.useEffect.fuel)
        effectParts.push(
          `<span style="color: #eab308;">燃</span>+${config.useEffect.fuel}`,
        );
      if (config.useEffect.durability)
        effectParts.push(
          `<span style="color: #22c55e;">耐</span>+${config.useEffect.durability}`,
        );
      if (config.useEffect.comfort)
        effectParts.push(
          `<span style="color: #60a5fa;">适</span>+${config.useEffect.comfort}`,
        );

      itemsHtml += `
				<div class="flex items-center gap-2 p-2 border border-gray-700 rounded-lg bg-gray-800/30 hover:bg-white/5 transition-colors">
					<span class="text-sm font-bold flex-shrink-0 w-6 h-6 rounded flex items-center justify-center" style="color:${config.color}; border: 1px solid ${config.color}40;">${config.name.charAt(0)}</span>
					<div class="flex-1">
						<div class="text-sm" style="color:${config.color}">${config.name} <span class="text-xs text-gray-500">×${slot.quantity}</span></div>
						<div class="text-xs text-green-400">${effectParts.join("  ")}</div>
					</div>
					<button onclick="restUseItem('${slot.id}')"
						class="px-3 py-1 text-xs bg-green-800/60 text-green-300 rounded border border-green-700/50 hover:bg-green-700 transition-all">
						使用
					</button>
				</div>`;
    }
  }

  const modal = document.createElement("div");
  modal.id = "rest-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center";
  modal.innerHTML = `
		<div class="absolute inset-0 bg-black/70" onclick="closeRestModal()"></div>
		<div class="relative bg-[#1a1a2e] border-2 border-[#c41e3a] rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
			<h3 class="text-lg font-bold text-[#c41e3a] mb-1">路边休息</h3>
			<p class="text-sm text-gray-400 mb-3">停下来休整一下，使用物品恢复状态。</p>
			<div class="flex gap-4 mb-3 text-xs">
				<span class="text-yellow-500"><span style="color: #eab308;">燃</span> ${Math.round(truckState.fuel)}%</span>
				<span class="text-green-500"><span style="color: #22c55e;">耐</span> ${Math.round(truckState.durability)}%</span>
				<span class="text-blue-400"><span style="color: #60a5fa;">适</span> ${Math.round(truckState.comfort)}%</span>
			</div>
			<div class="text-area-scroll space-y-2 overflow-y-auto flex-1 pr-1">${itemsHtml}</div>
			<button onclick="closeRestModal()" 
				class="mt-4 w-full py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
				继续上路
			</button>
		</div>`;
  document.body.appendChild(modal);
}

// 休息界面中使用物品
function restUseItem(itemId) {
  if (useItem(itemId)) {
    const modal = document.getElementById("rest-modal");
    if (modal) modal.remove();
    showRestModal();
  }
}

// 主动关闭休息界面
function closeRestModal() {
  const modal = document.getElementById("rest-modal");
  if (modal) modal.remove();
  resumeGameAfterModal();
}

// 初始化所有显示
function initInventoryDisplay() {
  updateTruckStatusDisplay();
  updateGoldDisplay();
  updatePassengerListDisplay();
  updateInventoryDisplay();
}

// 关闭框后恢复游戏运行（委托给event-handler中的resumeGame）
function resumeGameAfterModal() {
  resumeGame();
}
