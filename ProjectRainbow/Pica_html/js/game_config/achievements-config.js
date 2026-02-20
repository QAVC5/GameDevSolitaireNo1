// 成就系统配置
// 定义所有可解锁的成就及其解锁条件

const ACHIEVEMENTS_CONFIG = {
  // 里程类成就
  mileage_50: {
    id: "mileage_50",
    title: "初出茅庐",
    description: "行驶里程达到 50 km",
    icon: "🚗",
    check: () => gameState.mileage >= 50,
  },
  mileage_100: {
    id: "mileage_100",
    title: "公路行者",
    description: "行驶里程达到 100 km",
    icon: "🛣️",
    check: () => gameState.mileage >= 100,
  },
  mileage_200: {
    id: "mileage_200",
    title: "长途司机",
    description: "行驶里程达到 200 km",
    icon: "🌄",
    check: () => gameState.mileage >= 200,
  },
  mileage_500: {
    id: "mileage_500",
    title: "公路之王",
    description: "行驶里程达到 500 km",
    icon: "👑",
    check: () => gameState.mileage >= 500,
  },

  // 乘客类成就
  passenger_deer: {
    id: "passenger_deer",
    title: "森林之友",
    description: "让鹿上车",
    icon: "🦌",
    check: () => truckState.passengers.includes("鹿"),
  },
  passenger_hunter: {
    id: "passenger_hunter",
    title: "猎人同行",
    description: "让猎人上车",
    icon: "🎯",
    check: () => truckState.passengers.includes("猎人"),
  },
  passenger_saofurry: {
    id: "passenger_saofurry",
    title: "骚福瑞",
    description: "让骚福瑞上车",
    icon: "🐺",
    check: () => truckState.passengers.includes("骚福瑞"),
  },
  passenger_traveler: {
    id: "passenger_traveler",
    title: "旅行伙伴",
    description: "让旅行者上车",
    icon: "🧳",
    check: () => truckState.passengers.includes("旅行者"),
  },
  passenger_elderly: {
    id: "passenger_elderly",
    title: "助人为乐",
    description: "让年迈妇人上车",
    icon: "👵",
    check: () => truckState.passengers.includes("年迈妇人"),
  },
  passenger_cat: {
    id: "passenger_cat",
    title: "猫奴",
    description: "让流浪猫上车",
    icon: "🐱",
    check: () => truckState.passengers.includes("猫"),
  },
  passenger_performer: {
    id: "passenger_performer",
    title: "流浪艺人",
    description: "让流浪艺人上车",
    icon: "🎭",
    check: () => truckState.passengers.includes("流浪艺人"),
  },
  passenger_all: {
    id: "passenger_all",
    title: "满载而归",
    description: "让所有类型的乘客都上过车",
    icon: "🚌",
    check: () => {
      const allPassengers = ["鹿", "猎人", "骚福瑞", "旅行者", "年迈妇人", "猫", "流浪艺人"];
      return allPassengers.every(name => 
        typeof gameState.passengersEverOnBoard !== "undefined" && 
        Array.isArray(gameState.passengersEverOnBoard) &&
        gameState.passengersEverOnBoard.includes(name)
      );
    },
  },

  // 好感度类成就
  favor_high: {
    id: "favor_high",
    title: "人见人爱",
    description: "有乘客好感度达到 80 以上",
    icon: "💖",
    check: () => {
      if (!gameState.passengerFavor || typeof gameState.passengerFavor !== "object") return false;
      return Object.values(gameState.passengerFavor).some(favor => favor >= 80);
    },
  },
  favor_all_high: {
    id: "favor_all_high",
    title: "完美司机",
    description: "所有乘客好感度都在 70 以上",
    icon: "⭐",
    check: () => {
      if (!gameState.passengerFavor || typeof gameState.passengerFavor !== "object") return false;
      const favors = Object.values(gameState.passengerFavor);
      return favors.length > 0 && favors.every(favor => favor >= 70);
    },
  },

  // 物品类成就
  item_craft: {
    id: "item_craft",
    title: "手工达人",
    description: "合成过物品",
    icon: "🔨",
    check: () => typeof gameState.itemsCrafted !== "undefined" && gameState.itemsCrafted > 0,
  },
  item_use: {
    id: "item_use",
    title: "实用主义",
    description: "使用过消耗品",
    icon: "💊",
    check: () => typeof gameState.itemsUsed !== "undefined" && gameState.itemsUsed > 0,
  },

  // 事件类成就
  event_many: {
    id: "event_many",
    title: "见多识广",
    description: "触发过 20 个不同事件",
    icon: "📖",
    check: () => {
      const triggered = gameState.triggeredEvents || [];
      return triggered.length >= 20;
    },
  },
  merchant_trade: {
    id: "merchant_trade",
    title: "商人朋友",
    description: "与商人交易过",
    icon: "💰",
    check: () => typeof gameState.hasTradedWithMerchant !== "undefined" && gameState.hasTradedWithMerchant,
  },

  // 特殊成就
  survive_long: {
    id: "survive_long",
    title: "生存专家",
    description: "在燃油、耐久、舒适都低于 20% 的情况下继续行驶 10 km",
    icon: "💀",
    check: () => typeof gameState.survivedLowStats !== "undefined" && gameState.survivedLowStats,
  },
  perfect_run: {
    id: "perfect_run",
    title: "完美旅程",
    description: "单次游戏行驶超过 300 km 且所有属性都保持在 50% 以上",
    icon: "🌟",
    check: () => {
      if (gameState.mileage < 300) return false;
      return typeof gameState.perfectRun !== "undefined" && gameState.perfectRun;
    },
  },

  // ========== 结局类成就（隐藏） ==========

  // 失败结局成就
  ending_fuel_empty: {
    id: "ending_fuel_empty",
    title: "燃油耗尽",
    description: "达成「燃油耗尽」结局",
    icon: "⛽",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("fuel_empty");
    },
  },
  ending_durability_zero: {
    id: "ending_durability_zero",
    title: "车辆报废",
    description: "达成「车辆报废」结局",
    icon: "💥",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("durability_zero");
    },
  },
  ending_comfort_zero: {
    id: "ending_comfort_zero",
    title: "众叛亲离",
    description: "达成「众叛亲离」结局",
    icon: "😢",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("comfort_zero");
    },
  },
  ending_game_over_event: {
    id: "ending_game_over_event",
    title: "被骚福瑞打爆",
    description: "达成「被骚福瑞打爆」结局",
    icon: "💀",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("game_over_event");
    },
  },

  // 特殊结局成就
  ending_perfect_journey: {
    id: "ending_perfect_journey",
    title: "完美旅程",
    description: "达成「完美旅程」结局",
    icon: "✨",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("perfect_journey");
    },
  },
  ending_eternal_friendship: {
    id: "ending_eternal_friendship",
    title: "友谊永恒",
    description: "达成「友谊永恒」结局",
    icon: "💜",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("eternal_friendship");
    },
  },
  ending_collector: {
    id: "ending_collector",
    title: "收集者",
    description: "达成「收集者」结局",
    icon: "📦",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("collector");
    },
  },
  ending_legendary_driver: {
    id: "ending_legendary_driver",
    title: "传奇司机",
    description: "达成「传奇司机」结局",
    icon: "👑",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("legendary_driver");
    },
  },
  ending_lonely_wanderer: {
    id: "ending_lonely_wanderer",
    title: "孤独行者",
    description: "达成「孤独行者」结局",
    icon: "🌙",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("lonely_wanderer");
    },
  },
  ending_harmony: {
    id: "ending_harmony",
    title: "和谐共存",
    description: "达成「和谐共存」结局",
    icon: "🕊️",
    hidden: true,
    check: () => {
      return Array.isArray(gameState.achievedEndings) && gameState.achievedEndings.includes("harmony");
    },
  },
};
