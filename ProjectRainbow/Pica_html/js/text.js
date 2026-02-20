// 主控制脚本 - 游戏初始化和启动
// 整合所有模块，负责游戏的初始化和启动

// 添加淡入动画样式
const style = document.createElement('style');
style.textContent = `
	@keyframes fadeIn {
		from { opacity: 0; transform: scale(0.9); }
		to { opacity: 1; transform: scale(1); }
	}
	.animate-fade-in {
		animation: fadeIn 0.3s ease-out;
	}
`;
document.head.appendChild(style);

// 游戏初始化函数
function initializeGame() {
	// 加载跨档成就
	if (typeof loadAchievementsFromStorage === "function") {
		loadAchievementsFromStorage();
	}
	
	// 加载存档
	const hasExistingSave = loadGame();
	
	// 新游戏：给予初始物品，并重置本轮成就
	if (!hasExistingSave) {
		addItem('油桶', 1);
		gameState.sessionAchievements = [];
		gameState.passengersEverOnBoard = [];
		gameState.itemsCrafted = 0;
		gameState.itemsUsed = 0;
		gameState.hasTradedWithMerchant = false;
		gameState.survivedLowStats = false;
		gameState.perfectRun = true; // 初始为 true，如果属性低于 50% 则设为 false
		gameState.lowStatsMileage = 0;
		gameState.minFuelDuringRun = 100;
		gameState.minDurabilityDuringRun = 100;
		gameState.minComfortDuringRun = 100;
	}
	
	// 初始化皮卡显示
	initializeTruck();
	
	// 初始化库存显示
	initInventoryDisplay();
	
	// 启动文本生成
	startTextGeneration();
	
	// 启动轮子动画
	startWheelAnimation();
}

// 首次用户交互时初始化音效（浏览器要求）
function initAudioOnFirstInteraction() {
	const init = () => {
		if (typeof initGameAudio === "function") initGameAudio();
		document.removeEventListener("click", init);
		document.removeEventListener("keydown", init);
		document.removeEventListener("touchstart", init);
	};
	document.addEventListener("click", init, { once: false });
	document.addEventListener("keydown", init, { once: false });
	document.addEventListener("touchstart", init, { once: false });
}

// 等待DOM和所有脚本加载完毕后启动游戏
document.addEventListener('DOMContentLoaded', () => {
	initializeGame();
	if (typeof initGameAudio === "function") initAudioOnFirstInteraction();
});
