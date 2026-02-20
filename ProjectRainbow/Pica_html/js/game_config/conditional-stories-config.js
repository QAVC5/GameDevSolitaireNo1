// 条件剧情配置
// 特定条件触发特定剧情，获得特定道具

const CONDITIONAL_STORIES_CONFIG = [
  {
    id: "harmony_badge",
    condition: () => {
      const passengers = truckState.passengers || [];
      if (!passengers.includes("鹿") || !passengers.includes("猎人")) return false;
      const deerFavor = typeof getPassengerFavor === "function" ? getPassengerFavor("鹿") : 50;
      const hunterFavor = typeof getPassengerFavor === "function" ? getPassengerFavor("猎人") : 50;
      return deerFavor >= 70 && hunterFavor >= 70;
    },
    message: "鹿和猎人在旅途中达成了某种默契。猎人从背包里摸出一枚陈旧的徽章，鹿用角轻轻碰了碰它。他们一起将【和平徽章】交给了你。",
    rewards: { addItems: [{ id: "和平徽章", quantity: 1 }] },
  },
  {
    id: "deer_gift",
    condition: () => {
      const passengers = truckState.passengers || [];
      if (!passengers.includes("鹿")) return false;
      const favor = typeof getPassengerFavor === "function" ? getPassengerFavor("鹿") : 50;
      return favor >= 90 && (gameState.mileage || 0) >= 50;
    },
    message: "鹿似乎对你格外信任。它用鹿角轻轻蹭了蹭你的手背，然后小心翼翼地放下了一枚【鹿角护符】。",
    rewards: { addItems: [{ id: "鹿角护符", quantity: 1 }] },
  },
  {
    id: "hunter_gift",
    condition: () => {
      const passengers = truckState.passengers || [];
      if (!passengers.includes("猎人")) return false;
      const favor = typeof getPassengerFavor === "function" ? getPassengerFavor("猎人") : 50;
      return favor >= 90 && truckState.durability <= 40;
    },
    message: "猎人注意到皮卡的状态不太妙。他从口袋里掏出一枚勋章递给你：「拿着，紧急维修时用得上。」你获得了【猎人徽章】。",
    rewards: { addItems: [{ id: "猎人徽章", quantity: 1 }] },
  },
  {
    id: "performers_song",
    condition: () => {
      const passengers = truckState.passengers || [];
      if (!passengers.includes("流浪艺人")) return false;
      const favor = typeof getPassengerFavor === "function" ? getPassengerFavor("流浪艺人") : 50;
      return favor >= 80 && (gameState.mileage || 0) >= 100;
    },
    message: "流浪艺人在漫长的旅途中灵感迸发。他为你演奏了一曲，并将一只精美的【八音盒】留作纪念：「这段路，值得被记住。」",
    rewards: { addItems: [{ id: "八音盒", quantity: 1 }] },
  },
  {
    id: "cat_familiar",
    condition: () => {
      const passengers = truckState.passengers || [];
      if (!passengers.includes("猫")) return false;
      const favor = typeof getPassengerFavor === "function" ? getPassengerFavor("猫") : 50;
      return favor >= 85;
    },
    message: "猫跳上了你的膝盖，用脑袋蹭了蹭你。然后它从不知哪里叼来一枚【幸运符】，放在了你手心。",
    rewards: { addItems: [{ id: "幸运符", quantity: 1 }] },
  },
  {
    id: "saofurry_party",
    condition: () => {
      const passengers = truckState.passengers || [];
      if (!passengers.includes("骚福瑞")) return false;
      const allFavorHigh =
        passengers.length >= 2 &&
        passengers.every((p) => {
          const f = typeof getPassengerFavor === "function" ? getPassengerFavor(p) : 50;
          return f >= 70;
        });
      return allFavorHigh;
    },
    message: "骚福瑞提议来个车内小派对！大家都很开心。派对结束后，有人塞给你一个【骚福瑞手办】：「纪念这次旅途！」",
    rewards: { addItems: [{ id: "骚福瑞手办", quantity: 1 }] },
  },
];
