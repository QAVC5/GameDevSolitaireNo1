// 音效模块 - 按钮音效 + 公路环境白噪音
// 使用 Web Audio API 合成，无需外部音频文件

let audioCtx = null;
let ambientNode = null;
let ambientGain = null;
let ambientStarted = false;
let engineNodes = [];
let engineStarted = false;
let lastHoverTime = 0;
const HOVER_THROTTLE_MS = 80;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// 按钮点击音效
function playClick() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

// 按钮悬停音效（轻微滴答）
function playHover() {
  const now = Date.now();
  if (now - lastHoverTime < HOVER_THROTTLE_MS) return;
  lastHoverTime = now;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {}
}

// 启动公路白噪音（ brown noise 低吟）
function startAmbient() {
  if (ambientStarted) return;
  try {
    const ctx = getAudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.98 * last + 0.02 * white;
      data[i] = last * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.12;
    source.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    source.start(0);
    ambientNode = source;
    ambientStarted = true;
  } catch (e) {}
}

// 停止环境音
function stopAmbient() {
  if (!ambientNode) return;
  try {
    ambientNode.stop();
    ambientNode = null;
    ambientStarted = false;
  } catch (e) {}
}

// 汽车引擎声（低频嗡鸣，皮卡移动时循环播放）
function startEngineSound() {
  if (engineStarted) return;
  try {
    const ctx = getAudioContext();
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.08;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;
    filter.Q.value = 0.5;
    mainGain.connect(filter);
    filter.connect(ctx.destination);
    const freqs = [55, 62, 73];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.detune.setValueAtTime((i - 1) * 3, ctx.currentTime);
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.4;
      osc.connect(oscGain);
      oscGain.connect(mainGain);
      osc.start(ctx.currentTime);
      engineNodes.push({ osc });
    });
    engineStarted = true;
  } catch (e) {}
}

function stopEngineSound() {
  if (!engineStarted) return;
  try {
    engineNodes.forEach(({ osc }) => {
      try { osc.stop(); } catch (e) {}
    });
    engineNodes = [];
    engineStarted = false;
  } catch (e) {}
}

// 绑定按钮音效（事件委托，动态添加的按钮也会生效）
function setupButtonSounds() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn && !btn.disabled) playClick();
  });
  document.addEventListener("mouseover", (e) => {
    const btn = e.target.closest("button");
    if (btn && !btn.disabled && (!e.relatedTarget || !btn.contains(e.relatedTarget))) playHover();
  });
}

// 初始化（首次用户交互时调用）
function initGameAudio() {
  setupButtonSounds();
  startAmbient();
  startEngineSound();
}
