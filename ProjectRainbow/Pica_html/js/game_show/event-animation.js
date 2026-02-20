// 事件触发字动画模块
// 在公路区域上叠加显示触发字和场景描述

// 显示场景描述文字动画
function showSceneText(event) {
  const sceneText = event && event.triggerConfig && event.triggerConfig.sceneText;
  if (!sceneText) return Promise.resolve();

  hideSceneText();

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "scene-text-overlay";
    overlay.style.cssText = `
			position: absolute; inset: 0;
			display: flex; align-items: center; justify-content: center;
			pointer-events: none; z-index: 19;
			opacity: 0;
		`;

    const textEl = document.createElement("div");
    textEl.style.cssText = `
			font-size: clamp(1.2rem, 4vw, 2rem);
			font-weight: bold;
			color: #ffffff;
			text-shadow: 0 0 10px rgba(196, 30, 58, 0.8), 0 0 20px rgba(196, 30, 58, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.8);
			text-align: center;
			padding: 1rem 2rem;
			background: rgba(0, 0, 0, 0.6);
			border-radius: 12px;
			border: 2px solid rgba(196, 30, 58, 0.5);
			backdrop-filter: blur(4px);
			transform: translateX(100%);
			transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-in;
		`;
    textEl.textContent = sceneText;

    overlay.appendChild(textEl);

    const roadEl = document.getElementById("road");
    if (roadEl && roadEl.parentElement) {
      roadEl.parentElement.appendChild(overlay);
      
      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        textEl.style.transform = "translateX(0)";
      });

      // 停留后淡出
      setTimeout(() => {
        textEl.style.transition = "transform 0.5s ease-out, opacity 0.4s ease-out";
        textEl.style.transform = "translateX(-100%)";
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 500);
      }, 1500);
    } else {
      resolve();
    }
  });
}

// 隐藏场景描述文字
function hideSceneText() {
  const overlay = document.getElementById("scene-text-overlay");
  if (overlay) overlay.remove();
}

// 显示触发字
function showTriggerChar(event) {
  let config = null;
  if (event && event.triggerConfig) {
    config = event.triggerConfig;
  } else if (
    typeof EVENT_TRIGGER_CHARS !== "undefined" &&
    EVENT_TRIGGER_CHARS[event]
  ) {
    config = EVENT_TRIGGER_CHARS[event];
  }

  if (!config) return;

  hideTriggerChar();

  const overlay = document.createElement("div");
  overlay.id = "trigger-char-overlay";
  overlay.style.cssText = `
		position: absolute; inset: 0;
		display: flex; align-items: center; justify-content: center;
		pointer-events: none; z-index: 20;
		opacity: 0; transition: opacity 0.5s ease-in;
	`;
  overlay.innerHTML = `
		<span style="
			font-size: 4rem; font-weight: bold;
			color: ${config.color};
			text-shadow: 0 0 20px ${config.color}, 0 0 40px ${config.color};
		">${config.char}</span>
	`;

  // 插入到公路容器的父元素中
  const roadEl = document.getElementById("road");
  if (roadEl && roadEl.parentElement) {
    roadEl.parentElement.appendChild(overlay);
    // 触发重排后淡入
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });
  }
}

// 隐藏触发字（淡出后移除DOM）
function hideTriggerChar() {
  const overlay = document.getElementById("trigger-char-overlay");
  if (!overlay) return;
  overlay.style.transition = "opacity 0.3s ease-out";
  overlay.style.opacity = "0";
  setTimeout(() => overlay.remove(), 300);
}
