// 库存系统模块
// 管理物品的添加、删除、使用和查询

// 获取当前库存总重量
function getInventoryWeight() {
  let totalWeight = 0;
  for (const slot of inventoryState.items) {
    const config = ITEMS_CONFIG[slot.id];
    if (config) {
      totalWeight += config.weight * slot.quantity;
    }
  }
  return totalWeight;
}

// 检查是否可以添加物品（重量检查）
function canAddItem(itemId, quantity = 1) {
  const config = ITEMS_CONFIG[itemId];
  if (!config) return false;
  const additionalWeight = config.weight * quantity;
  return getInventoryWeight() + additionalWeight <= inventoryState.maxWeight;
}

// 添加物品到库存
function addItem(itemId, quantity = 1) {
  if (!canAddItem(itemId, quantity)) return false;

  const existing = inventoryState.items.find((slot) => slot.id === itemId);
  const config = ITEMS_CONFIG[itemId];

  if (existing && config.stackable) {
    existing.quantity += quantity;
  } else if (existing && !config.stackable) {
    return false; // 不可堆叠且已存在
  } else {
    inventoryState.items.push({ id: itemId, quantity: quantity });
  }

  updateInventoryDisplay();
  return true;
}

// 移除物品
function removeItem(itemId, quantity = 1) {
  const index = inventoryState.items.findIndex((slot) => slot.id === itemId);
  if (index === -1) return false;

  const slot = inventoryState.items[index];
  if (slot.quantity < quantity) return false;

  slot.quantity -= quantity;
  if (slot.quantity <= 0) {
    inventoryState.items.splice(index, 1);
  }

  updateInventoryDisplay();
  return true;
}

// 检查是否拥有物品
function hasItem(itemId, quantity = 1) {
  const slot = inventoryState.items.find((s) => s.id === itemId);
  return slot ? slot.quantity >= quantity : false;
}

// 获取物品数量
function getItemQuantity(itemId) {
  const slot = inventoryState.items.find((s) => s.id === itemId);
  return slot ? slot.quantity : 0;
}

// 使用物品（消耗品效果）
function useItem(itemId) {
  const config = ITEMS_CONFIG[itemId];
  if (!config || config.category !== "consumable") return false;
  if (!hasItem(itemId)) return false;

  // 应用效果
  if (config.useEffect) {
    let fuelDelta = config.useEffect.fuel || 0;
    let durabilityDelta = config.useEffect.durability || 0;
    let comfortDelta = config.useEffect.comfort || 0;
    // 流浪艺人特性：使用物品时表演助兴，舒适恢复 +3
    if (comfortDelta > 0 && truckState.passengers && truckState.passengers.includes("流浪艺人")) {
      comfortDelta += 3;
    }
    if (fuelDelta) {
      truckState.fuel = Math.min(100, truckState.fuel + fuelDelta);
    }
    if (durabilityDelta) {
      truckState.durability = Math.min(
        100,
        truckState.durability + durabilityDelta,
      );
    }
    if (comfortDelta) {
      truckState.comfort = Math.min(
        100,
        truckState.comfort + comfortDelta,
      );
    }
  }

  removeItem(itemId, 1);
  updateTruckStatusDisplay();
  // 记录物品使用（用于成就检查）
  if (typeof recordItemUsed === "function") {
    recordItemUsed();
  }
  if (typeof checkAndUnlockAchievements === "function") {
    checkAndUnlockAchievements();
  }
  return true;
}

// 添加金币
function addGold(amount) {
  inventoryState.gold += amount;
  updateGoldDisplay();
}

// 消耗金币
function spendGold(amount) {
  if (inventoryState.gold < amount) return false;
  inventoryState.gold -= amount;
  updateGoldDisplay();
  return true;
}

// 检查合成配方是否可用
function canCraft(recipeId) {
  const recipe = CRAFTING_RECIPES[recipeId];
  if (!recipe) return false;

  // 检查材料
  for (const mat of recipe.materials) {
    if (!hasItem(mat.itemId, mat.quantity)) return false;
  }

  // 检查结果是否能放进库存
  return canAddItem(recipe.result.itemId, recipe.result.quantity);
}

// 获取合成不可用的原因（用于 tooltip）
function getCraftUnavailableReason(recipeId) {
  const recipe = CRAFTING_RECIPES[recipeId];
  if (!recipe) return "";
  for (const mat of recipe.materials) {
    if (!hasItem(mat.itemId, mat.quantity)) return "材料不足";
  }
  if (!canAddItem(recipe.result.itemId, recipe.result.quantity)) return "后备箱容量不足";
  return "";
}

// 执行合成
function craftItem(recipeId) {
  if (!canCraft(recipeId)) return false;

  const recipe = CRAFTING_RECIPES[recipeId];

  // 消耗材料
  for (const mat of recipe.materials) {
    removeItem(mat.itemId, mat.quantity);
  }

  // 获得成品
  addItem(recipe.result.itemId, recipe.result.quantity);
  // 记录物品合成（用于成就检查）
  if (typeof recordItemCrafted === "function") {
    recordItemCrafted();
  }
  if (typeof checkAndUnlockAchievements === "function") {
    checkAndUnlockAchievements();
  }
  return true;
}

// 乘客特性：年迈妇人在车时商人给优惠（购买 -15%，出售 +15%）
function getEffectiveBuyPrice(merchantId, itemId) {
  const merchant = MERCHANT_CONFIG[merchantId];
  if (!merchant) return 0;
  const listing = merchant.items.find((i) => i.itemId === itemId);
  if (!listing) return 0;
  const base = listing.buyPrice;
  if (typeof truckState !== "undefined" && truckState.passengers && truckState.passengers.includes("年迈妇人")) {
    return Math.max(1, Math.floor(base * 0.85));
  }
  return base;
}

function getEffectiveSellPrice(merchantId, itemId) {
  const merchant = MERCHANT_CONFIG[merchantId];
  if (!merchant) return 0;
  const listing = merchant.items.find((i) => i.itemId === itemId);
  if (!listing) return 0;
  const base = listing.sellPrice;
  if (typeof truckState !== "undefined" && truckState.passengers && truckState.passengers.includes("年迈妇人")) {
    return Math.floor(base * 1.15);
  }
  return base;
}

// 购买物品
function buyItem(merchantId, itemId) {
  const merchant = MERCHANT_CONFIG[merchantId];
  if (!merchant) return false;

  const listing = merchant.items.find((i) => i.itemId === itemId);
  if (!listing) return false;

  const price = getEffectiveBuyPrice(merchantId, itemId);
  if (inventoryState.gold < price) return false;
  if (!canAddItem(itemId)) return false;

  spendGold(price);
  addItem(itemId, 1);
  // 记录商人交易（用于成就检查）
  if (typeof recordMerchantTrade === "function") {
    recordMerchantTrade();
  }
  if (typeof checkAndUnlockAchievements === "function") {
    checkAndUnlockAchievements();
  }
  return true;
}

// 出售物品
function sellItem(merchantId, itemId) {
  const merchant = MERCHANT_CONFIG[merchantId];
  if (!merchant) return false;

  const listing = merchant.items.find((i) => i.itemId === itemId);
  if (!listing) return false;

  if (!hasItem(itemId)) return false;

  const sellPrice = getEffectiveSellPrice(merchantId, itemId);
  removeItem(itemId, 1);
  addGold(sellPrice);
  // 记录商人交易（用于成就检查）
  if (typeof recordMerchantTrade === "function") {
    recordMerchantTrade();
  }
  if (typeof checkAndUnlockAchievements === "function") {
    checkAndUnlockAchievements();
  }
  return true;
}
