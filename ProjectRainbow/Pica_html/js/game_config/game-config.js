// 游戏全局配置文件
// 集中管理游戏的各种配置参数

const GAME_CONFIG = {
  // 事件触发配置
  triggerInterval: 2, // 每2行文本触发一次事件
  textSpeed: 1500, // 文本生成间隔（毫秒）

  // 事件调度配置
  overnightRestInterval: 25, // 每隔多少km强制触发一次昼夜休息
  recentEventWindow: 4, // 最近N次事件内不重复同一事件
  maxRestPerCycle: 3, // 每个昼夜间隔内最多触发多少次休息类事件

  // 燃油消耗配置
  fuelConsumptionPer5km: 1.2, // 每5km消耗多少燃油
  // 初始游戏状态配置
  initialGold: 6, // 初始金币数量
  // Cookie配置
  cookieExpiryDays: 3650, // 10年
  cookieName: "chinese_truck_adventure_save",

  // 动画时长配置（毫秒）
  animation: {
    roadDeceleration: 300,
    charSlideIn: 400, // 字滑入 0.4秒
    charStay: 1000,
  },

  // 公路配置
  road: {
    charsPool: ["马", "鹿"], // 公路字符池
    maxLength: 80, // 屏幕显示的字符数量
    updateSpeed: 300,
  },
};
