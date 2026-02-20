// 停留类事件 - 休息、制作、商人等可反复触发的停车事件

const EVENTS_STOP = {
  // 休息事件
  rest: {
    id: "rest",
    title: "路边休息站",
    image: "休！",
    triggerConfig: { char: "休", color: "#4ade80", fontSize: "22px" },
    description:
      "前方有一处适合停车休息的空地。皮卡发出疲惫的引擎声，也许是时候检查一下状态了。",
    oneTime: false,
    triggerWeight: 20,
    condition: null,
    choices: [
      {
        id: "rest_use",
        text: "停车休整",
        description: "打开后备箱，使用物品恢复状态",
        result: {
          message: [
            "你把皮卡停到路边，大家一起下车活动活动筋骨，随便聊了聊天。气氛不错。",
            "停车休整，乘客们纷纷帮忙检查轮胎、擦车窗，还顺便举行了一场小型野餐。",
            "短暂停靠，你检查了一下机油，乘客们站在路边伸懒腰。短暂的休息让大家精神了不少。",
          ],
          effects: {
            openRestModal: true,
            fuel: -6,
          },
        },
      },
      {
        id: "rest_nap",
        text: "小憩片刻",
        description: "在车上打个盹",
        result: {
          message: [
            "你在驾驶座上闭目养神了一会儿，发动机怠速运转消耗了些燃油，但感觉好了不少。",
            "你把帽子盖在脸上，靠着车窗眯了一会儿。醒来时天色稍晚，人却清醒多了。",
            "你调低座椅靠背打了个短盹，梦里还在开车。醒来后揉了揉眼睛，继续上路。",
          ],
          effects: {
            comfort: 6,
            fuel: -8,
          },
        },
      },
      {
        id: "rest_skip",
        text: "继续赶路",
        description: "时间紧迫，不做停留",
        result: {
          message: [
            "你踩下油门，继续前行。乘客们叹了口气，看来大家都想休息。",
            "没时间停，继续走。后座传来几声抱怨，你装作没听见。",
            "赶路要紧，歇息的事以后再说。乘客们蔫蔫地靠在座位上，气氛有些沉闷。",
          ],
          effects: {
            comfortPerPassenger: -2,
            fuel: -2,
            favorAll: -3,
          },
        },
      },
    ],
  },

  // 制作事件
  craft: {
    id: "craft",
    title: "发现废弃工坊",
    image: "制！",
    triggerConfig: { char: "制", color: "#facc15", fontSize: "22px" },
    description:
      "路边有一间废弃的维修工坊，里面的工具似乎还能使用。也许可以利用手头的材料制作些有用的东西。",
    oneTime: false,
    triggerWeight: 15,
    condition: null,
    choices: [
      {
        id: "craft_open",
        text: "进入工坊",
        description: "使用工坊的工具制作物品",
        result: {
          message: [
            "你走进工坊，开始翻找可用的工具...",
            "工坊里满是灰尘，但工具架上还挂着几件完好的工具。你挽起袖子开始干活。",
            "工坊的大门吱呀一声推开，里面散落着零件和工具。看起来上一个主人走得很仓促。",
          ],
          effects: {
            openCraftingModal: true,
            fuel: -4,
            // 首次进入工坊，解锁技术商人事件
            unlockEvents: ["tech_merchant"],
          },
        },
      },
      {
        id: "craft_scavenge",
        text: "搜刮材料",
        description: "在废墟中翻找材料",
        result: {
          message: [
            "你在工坊废墟中翻找了一番，皮卡被碎石刮蹭了几下...",
            "废墟里东西不少，你搬搬抬抬，从角落里挖出了些有用的东西，代价是皮卡蹭了几下。",
            "拆废弃设备的时候，有块金属飞出来砸到了车门。但搜刮的收获还不错。",
          ],
          effects: {
            randomLoot: true,
            durability: -5,
          },
        },
      },
      {
        id: "craft_skip",
        text: "不感兴趣",
        description: "继续上路",
        result: {
          message: [
            "你看了一眼破旧的工坊，决定继续赶路。",
            "没时间捣鼓这些，你扫了一眼就继续走了。",
            "工坊看起来太破了，也许里面什么都没有。你踩下油门离开。",
          ],
          effects: {},
        },
      },
    ],
  },

  // 加油站遗址事件
  gas_station: {
    id: "gas_station",
    title: "废弃加油桩",
    image: "油！",
    triggerConfig: { char: "油", color: "#ef4444", fontSize: "22px" },
    description:
      "路边一座废弃加油桩，油泵锈迹小招牌还竖着。附近有些散落的杂物和一个上锁的储藏室。",
    oneTime: false,
    triggerWeight: 10,
    condition: null,
    choices: [
      {
        id: "check_pumps",
        text: "检查油泵",
        description: "也许还有残余燃油",
        result: {
          message: [
            "老旧的油泵居然还能出油！虽然油质不太好，但总归是燃油。搬油罐的时候碰破了个角，看看还有多少吧",
          ],
          effects: {
            type: "weighted",
            options: [
              {
                weight: 60,
                message:
                  "油泵还就行，油质一般但足够用。给车加满油，带走了一点耐久损耗。",
                effects: { fuel: 15, durability: -5, comfort: 3 },
              },
              {
                weight: 30,
                message:
                  "这台油泵居然还运转良好！你善加利用，注入了大量燃油，且损耗较小。",
                effects: { fuel: 25, durability: -4, comfort: 5 },
              },
              {
                weight: 10,
                message: "油泵里游了快一年了，搞了半天才倒出来一点。白忙活。",
                effects: { fuel: 5, durability: -3, comfort: -5 },
              },
            ],
          },
        },
      },
      {
        id: "search_storage",
        text: "撬开储藏室",
        description: "看看里面有什么",
        result: {
          message: [
            "铁门被你撬开，里面积满了灰尘，但货架上还有些遗留物资。",
            "储藏室里有人住过的痕迹——角落有个睡袋，旁边整整齐齐摆着几样东西。",
            "撬锁费了些功夫，进去后发现满地都是旧杂志，但墙角有个箱子，里面装着不少有用的东西。",
          ],
          effects: { randomLoot: true, durability: -3, comfort: 6 },
        },
      },
      {
        id: "pass_by",
        text: "继续前行",
        description: "只是路过",
        result: {
          message: [
            "废弃加油站在后视镜里渐渐变小，你没有停留。",
            "你扫了一眼，没什么特别的。踩下油门继续走。",
            "荒废的加油站像一个被遗忘的句号，你路过，然后离开。",
          ],
          effects: {},
        },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // 昼夜休息事件（每40km强制触发一次）
  // ──────────────────────────────────────────────────────────────────────
  overnight_rest: {
    id: "overnight_rest",
    title: "夜幕降临，必须扎营",
    image: "夜！",
    triggerConfig: { char: "夜", color: "#8b41e7ff", fontSize: "22px" },
    description:
      "太阳沉入地平线，夜色迅速笼罩公路。继续行驶太危险了——你找了一处空地，决定在这里度过今晚。",
    oneTime: false,
    triggerWeight: 0,
    condition: null,
    choices: [
      {
        id: "overnight_camp",
        text: "生火扎营",
        description: "捡些柴火，安心休息",
        result: {
          message: [
            "你捡来枯枝生了堆篝火，大家围坐在一起。火光映在每个人脸上，今晚很安心。",
            "篝火噼啪作响，夜空中星光密布。很久没有这么踏实地休息过了。",
            "生火的时候，乘客们各自找了个舒服的位置。有人讲了个故事，有人已经睡着了。",
          ],
          effects: {
            comfort: 15,
            fuel: -10,
          },
        },
      },
      {
        id: "overnight_watch",
        text: "轮流守夜",
        description: "分配守夜任务，确保安全",
        result: {
          message: [
            "大家商量了守夜的顺序，每人轮值两小时。天亮后，虽然有些困倦，但都安全无事。",
            "守夜的人听着远处的虫鸣和风声。到了换班时分，月亮已经高挂。还算太平的一夜。",
            "你盯着黑暗中偶尔闪过的光芒，手搭在方向盘上打了个盹。幸好什么都没发生。",
          ],
          effects: {
            comfort: 8,
            fuel: -10,
          },
        },
      },
      {
        id: "overnight_stargazing",
        text: "仰望星空",
        description: "难得的晴夜，好好欣赏",
        result: {
          message: [
            "你关掉引擎，躺在皮卡车顶上看星星。银河横贯天际，这条路上最美的时刻，就是现在。",
            "夜风轻柔，星空清澈。你数了数星星，数到一半就睡着了。醒来时露水已经打湿了衣襟。",
            "有一颗流星划过，每个人都默默许了愿，但没有人说出口。第二天，大家的心情都好了不少。",
          ],
          effects: {
            comfort: 9,
            fuel: -8,
          },
        },
      },
      {
        id: "overnight_nightmare",
        text: "深夜奇遇",
        description: "夜里有什么动静......",
        result: {
          message: [
            "半夜被奇怪的声音惊醒，出去看看吧...",
            "凌晨三点，远处有动静——小心点。",
            "夜里下起了小雨，夜色很安静。",
            "深夜里，有人从窗边探出一张脸。",
          ],
          effects: {
            type: "weighted",
            options: [
              {
                weight: 40,
                message: [
                  "半夜被奇怪的声音惊醒，你打开手电筒，发现有只老鼠在翻你的零食篮。双方都愣了一秒，它叫了几声，还留下了些东西。",
                  "凌晨三点，远处有灯光逼近——是一辆同样走夜路的老式车。对方按了声喇叭，你也回应。很快车停到旁边，对方递来一些物资，默默开走了。",
                ],
                effects: { randomLoot: "默认", comfort: 5, gold: 3 },
              },
              {
                weight: 30,
                message: [
                  "深夜灯光微弱，你在周围搜寻了一圈。附近有一个被小心收藏的补给箱，里面的东西比想象的好多了！",
                  "深夜中一阵风吹过，吸引你走到路边一块防水布下面。拿开查看，居然是有人小心藏起来的物资！",
                ],
                effects: { randomLoot: "稀有", comfort: 5 },
              },
              {
                weight: 20,
                message: [
                  "夜里下起了小雨。雨声打在车顶，反而格外安静，所有人都睡得出奇地好。第二天起来，空气清新了很多。",
                  "一队流浪者从远处经过，唱了一首简单但温暖的歌。一夜无事。",
                ],
                effects: { comfort: 10 },
              },
              {
                weight: 10,
                message: [
                  "夜里传来恶心的刮擦声，你打开车门出去查看——居然是凹陷！车底被有东西刮到了。皮卡的损伤立刻显现。",
                  "凌晨感觉有动静，你赶紧下车查看，车身被不明物体刮到了几下。天亮后检查，全是石头留下的伤痕。",
                ],
                effects: { comfort: -8, durability: -5 },
              },
            ],
          },
        },
      },
    ],
  },

  // 废弃仓库搜刮
  abandoned_warehouse: {
    id: "abandoned_warehouse",
    title: "废弃仓库",
    image: "仓！",
    triggerConfig: { char: "仓", color: "#7c3aed", fontSize: "22px" },
    description:
      "前方有一座巨大的废弃仓库，铁皮屋顶已经生锈，木门敞开着。你可以看到里面堆积着各种物资。",
    oneTime: false,
    triggerWeight: 8,
    condition: null,
    choices: [
      {
        id: "loot_warehouse",
        text: "进去搜刮",
        description: "充分利用这个机会",
        result: {
          message: "你走进了昏暗的仓库——",
          effects: {
            type: "weighted",
            options: [
              {
                weight: 40,
                message: [
                  "仓库里有大量生锈的工具和旧机械。虽然不是崭新的，但还能用。你装满了整个后车厢。",
                  "仓库里堆放着各种材料和工具。你花了不少时间整理和打包，最后收获颇丰。",
                ],
                effects: { randomLoot: "废料", durability: -5, fuel: -6 },
              },
              {
                weight: 30,
                message: [
                  "仓库深处有一个保险柜！虽然被腐蚀了，但你还是撬开了。里面装着一些保存完好的贵重物品。",
                  "在仓库角落里发现了一个被遗忘的箱子。里面装着看起来很珍贵的东西。",
                ],
                effects: { randomLoot: "稀有", durability: -8, fuel: -8 },
              },
              {
                weight: 30,
                message: [
                  "你正在搜刮时，老鼠窝坍塌了！大量尘埃涌起，你咳得眼泪都流出来了。虽然安全无虞，但消耗了很多精力。",
                  "仓库的二楼突然传来响声！吓得你逃出仓库。什么都没捞到，心情也坏透了。",
                ],
                effects: { randomLoot: true, comfort: -20, fuel: -5 },
              },
            ],
          },
        },
      },
      {
        id: "quick_search",
        text: "快速搜索门口区域",
        description: "只搜索显而易见的东西",
        result: {
          message: [
            "你在仓库门口找到了一些较轻便的物品。虽然没有进深处，但也有收获。",
            "门口堆放着一些相对完好的东西。你快速地收集了一些，然后离开了。",
          ],
          effects: { randomLoot: true, fuel: -4 },
        },
      },
      {
        id: "skip_warehouse",
        text: "不做停留",
        description: "继续赶路",
        result: {
          message: [
            "你看了一眼仓库，决定不浪费时间。继续前行。",
            "一个人搜刮太危险了。你加速驶过仓库。",
          ],
          effects: { fuel: -2 },
        },
      },
    ],
  },

  // 矿场废墟搜刮
  abandoned_mine: {
    id: "abandoned_mine",
    title: "废弃矿场",
    image: "矿！",
    triggerConfig: { char: "矿", color: "#1e40af", fontSize: "22px" },
    description:
      "路边有一个废弃的采矿场遗迹。被挖空的地面、生锈的机械和随处散落的矿石碎片显示这里曾经很繁忙。",
    oneTime: false,
    triggerWeight: 7,
    condition: null,
    choices: [
      {
        id: "mine_deep",
        text: "深入矿场",
        description: "冒险进入矿洞",
        result: {
          message: "你驾车进入了被遗弃的矿场——",
          effects: {
            type: "weighted",
            options: [
              {
                weight: 35,
                message: [
                  "矿洞里有大量高品质的矿石还未被开采！你装了满满一车。虽然车有点颠簸，但收获很大。",
                  "矿场深处还有不少没被完全开采的矿脉。你成功地采集了一些高品质的矿物。",
                ],
                effects: { randomLoot: "燃油", durability: -12, fuel: -10 },
              },
              {
                weight: 40,
                message: [
                  "矿洞的一堵墙突然坍塌了！你险些被埋住。狼狈地逃出来后，只收集到一些普通的矿石。",
                  "矿洞里传来奇异的声音，吓得你匆匆逃离。虽然没什么收获，但至少没出事。",
                ],
                effects: {
                  randomLoot: true,
                  durability: -20,
                  comfort: -15,
                  fuel: -12,
                },
              },
              {
                weight: 25,
                message: [
                  "矿场内还留有一些工人的物品。虽然年久失修，但其中有几件看起来还是很有价值的。",
                  "在矿场办公室里发现了一些保存完好的物品。这些可能是矿工们留下的遗物。",
                ],
                effects: { randomLoot: "稀有", durability: -10, fuel: -8 },
              },
            ],
          },
        },
      },
      {
        id: "mine_surface",
        text: "在地表搜刮",
        description: "只收集地面上的物品",
        result: {
          message: [
            "地面上散落着许多矿石碎片和工具。虽然都不大值钱，但积少成多。",
            "你在矿场外围捡了一些遗留的物品。看起来都被长期风吹雨打了，但还是有用的。",
          ],
          effects: { randomLoot: "默认", fuel: -3 },
        },
      },
      {
        id: "avoid_mine",
        text: "绕开矿场",
        description: "这太危险了",
        result: {
          message: [
            "矿场看起来太不安全了。你决定绕路。",
            "你不想冒生命危险，选择了更安全的路线。",
          ],
          effects: { fuel: -8 },
        },
      },
    ],
  },

  // 农场搜刮
  abandoned_farm: {
    id: "abandoned_farm",
    title: "废弃农场",
    image: "田！",
    triggerConfig: { char: "田", color: "#84cc16", fontSize: "22px" },
    description:
      "一座被放弃的农场出现在视野里。破旧的谷仓、废弃的田地和倒塌的农具显示这里已经很久没人管理了。",
    oneTime: false,
    triggerWeight: 8,
    condition: null,
    choices: [
      {
        id: "raid_farm",
        text: "搜刮农场",
        description: "查看农场里有什么有用的",
        result: {
          message: "你停下皮卡，走进了这座被遗弃的农场——",
          effects: [
            // 搜刮废弃农场后解锁物资贩子事件（在农场附近见过他的招牌）
            { unlockEvents: ["supply_merchant"] },
            {
              type: "weighted",
              options: [
                {
                  weight: 45,
                  message: [
                    "谷仓里还有一些储备的粮食。虽然有点陈旧，但吃起来没问题。你装了一些零食和物资。",
                    "农场的工具房里有各种工具。你找到了一些还能使用的东西。",
                  ],
                  effects: { randomLoot: "食物", fuel: -4 },
                },
                {
                  weight: 35,
                  message: [
                    "农场的地下室里有一些保存的物品。虽然有点脏，但看起来还是值钱的。",
                    "你在农场的某个角落发现了一个被遗忘的箱子。里面装着一些看起来很有价值的东西。",
                  ],
                  effects: { randomLoot: "稀有", fuel: -5 },
                },
                {
                  weight: 20,
                  message: [
                    "农场里有一些野生动物。它们对你的到来并不欢迎，追得你狼狈不堪。虽然安全逃脱了，但什么都没捞到。",
                    "农场的一个老蜂窝被你无意中惹恼了。蜜蜂的追击让你仓皇逃离，皮卡还被蛰了几个包。",
                  ],
                  effects: { durability: -8, comfort: -15, fuel: -6 },
                },
              ],
            },
          ],
        },
      },
      {
        id: "harvest_crops",
        text: "采集农作物",
        description: "收集地里还有的农作物",
        result: {
          message: [
            "农田里还有一些没有完全枯死的植物。你采集了一些可食用的部分。",
            "虽然田地已经很久没人打理了，但你还是找到了一些有用的植物。",
          ],
          effects: { randomLoot: "食物", fuel: -4 },
        },
      },
      {
        id: "avoid_farm",
        text: "不进去",
        description: "直接通过",
        result: {
          message: [
            "你没有停留，直接驶过了这座废弃农场。",
            "继续赶路，不浪费时间。",
          ],
          effects: { fuel: -2 },
        },
      },
    ],
  },

  // 废弃加油站搜刮
  abandoned_gas_station: {
    id: "abandoned_gas_station",
    title: "废弃加油站",
    image: "站！",
    triggerConfig: { char: "站", color: "#dc2626", fontSize: "22px" },
    description:
      "一座破旧的加油站出现在荒凉的路边。虽然泵已经不工作了，但站里可能还有一些遗留的物品。",
    oneTime: false,
    triggerWeight: 9,
    condition: null,
    choices: [
      {
        id: "search_station",
        text: "彻底搜索",
        description: "仔细查看加油站的每个角落",
        result: {
          message: "你停下皮卡，走进了静寂的加油站——",
          effects: {
            type: "weighted",
            options: [
              {
                weight: 40,
                message: [
                  "加油站的办公室里还有一些储备物资！虽然有点尘埃，但都还能用。",
                  "地下的存储室里有一些遗留的物品。你清理干净后装进了皮卡。",
                ],
                effects: { randomLoot: "燃油", fuel: -3 },
              },
              {
                weight: 30,
                message: [
                  "你在加油站找到了一个尘封的钱箱。虽然里面没有现金，但有一些有价值的工具。",
                  "加油站的修车间里有一些遗留的零件。虽然不是最新的，但对你的皮卡有帮助。",
                ],
                effects: { randomLoot: "稀有", fuel: -4, durability: 10 },
              },
              {
                weight: 30,
                message: [
                  "地下油箱有渗漏！有毒的气体让你头晕目眩。你赶快逃出加油站，什么都没捞到。",
                  "加油站的结构看起来很不安全。你正在搜索时，一根铁管掉下来，差点砸中你。",
                ],
                effects: { comfort: -15, fuel: -5 },
              },
            ],
          },
        },
      },
      {
        id: "search_quick",
        text: "快速搜索",
        description: "只查看显而易见的地方",
        result: {
          message: [
            "加油站外的货架上还有一些物品。虽然不多，但还是值得收集。",
            "柜台后面有一些遗留的商品。你装了一些进去。",
          ],
          effects: { randomLoot: "默认", fuel: -2 },
        },
      },
      {
        id: "check_pumps",
        text: "检查油泵",
        description: "看看能不能从油泵里获得燃油",
        result: {
          message: [
            "油泵虽然不工作了，但下面的管道里还有一些残留的燃油。你费了不少力气才把它们抽出来。",
            "你成功地从旧泵的储液器中获得了一些燃油。收获意外的大！",
          ],
          effects: { fuel: 15, durability: -5, fuel: -3 },
        },
      },
    ],
  },
};
