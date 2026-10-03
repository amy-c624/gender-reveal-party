/* ==========================================================
   雙Q大冒險日記 — 遊戲邏輯
   ========================================================== */

/* ---------- 0. 所有可變狀態先宣告在最上方，避免函式提前引用到尚未初始化的變數 ---------- */
let playerName = "";
let selectedAccessory = null;              // 目前被選取、準備裝上去的配件："cap" | "bow" | null
const seatAssignments = { left: null, right: null }; // 每個座位目前裝的配件
let comboResult = null;                    // 玩家自己選出的組合："BB" | "GG" | "BG"
let revealedAnswer = null;                 // 後台公布的正確答案
let storyIndex = 0;

/* ---------- 1. 基本設定（可在 admin.html 後台修改）---------- */
let COMBO_OPTIONS = [
  { value: "BB", emoji: "👦🏻👦🏻", name: "熱鬧男團", color: "var(--boy)" },
  { value: "GG", emoji: "👧🏻👧🏻", name: "前世情人", color: "var(--girl)" },
  { value: "BG", emoji: "👦🏻👧🏻", name: "龍鳳組合", color: "var(--gold)" }
];

let UI_TEXT = {
  coverEyebrow: "一本正在發生的日記",
  coverTitle: "雙Q大冒險日記",
  coverBtn: "翻開第一頁 ▶",
  nameEyebrow: "在開始之前",
  nameTitle: "怎麼稱呼你？",
  namePlaceholder: "輸入你的暱稱",
  nameBtn: "進入日記 ▶",
  skipStoryBtn: "略過所有影片 ▶",
  storyIntroTemplate: "嗨，{name}！歡迎一起參加雙Q的性別趴，在實際開始之前，先一起來回顧一下自從知道懷孕之後的種種過程吧",
  storyIntroHint: "（點一下開始播放）",
  storyQuestionText: "……所以，到底是男生還是女生？",
  storyQuestionHint: "（點一下繼續）",
  strollerEyebrow: "線索蒐集中",
  strollerTitle: "幫寶寶們穿戴裝備",
  strollerHint: "先點選下方配件，再點座位裝上去；點一下已裝好的座位可以卸下重選。",
  chipCap: "藍色棒球帽",
  chipBow: "粉色蝴蝶結",
  confirmEyebrow: "最終確認",
  confirmTemplate: "你猜這是「{name}」？",
  blessingLabel: "想留一句祝福嗎？（選填）",
  confirmBtn: "送出預測 ▶",
  confirmCancel: "再想一下",
  suspenseCaption: "日記正在寫下最後一頁...",
  revealNameTemplate: "答案是「{name}」！",
  revealNoteHit: "你猜的是「{guess}」，猜中了，太神啦！",
  revealNoteMiss: "你猜的是「{guess}」，雖然沒猜中，但這份心意最珍貴！",
  revealBtn: "收到祝福 ▶",
  revealPendingNote: "後台還沒有設定答案喔，請到 admin.html 輸入正確結果。",
  revealPendingBtn: "先看看祝福 ▶",
  thanksLine1: "感謝翻開這本日記，陪我們一起猜猜看！",
  thanksLine2: "希望你的祝福，能讓雙Q平安順利誕生 💕",
  polaroidCaption: "未來一家五口，敬請期待",
  viewResultsBtn: "查看大家的預測結果 ▶",
  resultsEyebrow: "大家的猜測",
  resultsTitle: "日記最後一頁：大家都這樣猜"
};

let VISUAL_ASSETS = { polaroidUrl: "", bgmUrl: "assets/bgm.mp3" };

// 版面位置微調，可在後台調整，避免按鈕/座位擋住影片主要畫面
// coverBtnOffset：封面按鈕垂直位移（px，正值往下移）
// seatLeftTop/seatLeftLeft/seatRightTop/seatRightLeft：兩個座位在嬰兒車影片上的位置（% ，對齊影片中的座位）
// transitionSeconds：場景切換時，黑畫面淡出/淡入各自的秒數
let LAYOUT_POSITIONS = {
  coverBtnOffset: 0,
  seatLeftTop: 57, seatLeftLeft: 40,
  seatRightTop: 57, seatRightLeft: 66,
  transitionSeconds: 0.4
};

const STORY_CLIPS = ["assets/story-1.mp4", "assets/story-2.mp4", "assets/story-3.mp4", "assets/story-4.mp4"];

/* ---------- 2. Firebase 初始化 ---------- */
let db = null;
let firebaseReady = false;
try {
  if (typeof firebaseConfig !== "undefined" && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("在這裡")) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
  } else {
    console.warn("尚未設定 Firebase，資料僅會暫存在本機，重新整理會消失。請參考 README.md。");
  }
} catch (err) {
  console.error("Firebase 初始化失敗：", err);
}

const localScores = { BB: 0, GG: 0, BG: 0 };
const localGuesses = [];

/* ---------- 3. 讀取後台設定 ---------- */
async function loadRemoteConfig() {
  if (!firebaseReady) { applyUiText(); return; }

  try {
    const cDoc = await db.collection("config").doc("comboOptions").get();
    if (cDoc.exists && Array.isArray(cDoc.data().list) && cDoc.data().list.length === 3) {
      COMBO_OPTIONS = COMBO_OPTIONS.map((defaultOpt) => {
        const override = cDoc.data().list.find((o) => o.value === defaultOpt.value);
        return override ? { ...defaultOpt, name: override.name } : defaultOpt;
      });
    }
  } catch (err) { console.error("讀取組合名稱設定失敗：", err); }

  try {
    const uDoc = await db.collection("config").doc("uiText").get();
    if (uDoc.exists) UI_TEXT = { ...UI_TEXT, ...uDoc.data() };
  } catch (err) { console.error("讀取文字設定失敗：", err); }

  try {
    const vDoc = await db.collection("config").doc("visualAssets").get();
    if (vDoc.exists) VISUAL_ASSETS = { ...VISUAL_ASSETS, ...vDoc.data() };
  } catch (err) { console.error("讀取視覺素材設定失敗：", err); }

  try {
    const lDoc = await db.collection("config").doc("layoutPositions").get();
    if (lDoc.exists) LAYOUT_POSITIONS = { ...LAYOUT_POSITIONS, ...lDoc.data() };
  } catch (err) { console.error("讀取版面位置設定失敗：", err); }

  applyUiText();
  applyVisualAssets();
  applyLayoutPositions();
}
loadRemoteConfig().catch((err) => console.error("loadRemoteConfig 發生未預期錯誤：", err));

/* ---------- 3b. 套用文字設定到畫面上 ---------- */
function setText(id, text) { const el = document.getElementById(id); if (el && text != null) el.textContent = text; }

function applyUiText() {
  setText("text-cover-eyebrow", UI_TEXT.coverEyebrow);
  setText("text-cover-title", UI_TEXT.coverTitle);
  setText("text-cover-btn", UI_TEXT.coverBtn);
  setText("text-name-eyebrow", UI_TEXT.nameEyebrow);
  setText("text-name-title", UI_TEXT.nameTitle);
  const nameInput = document.getElementById("player-name");
  if (nameInput) nameInput.placeholder = UI_TEXT.namePlaceholder;
  setText("text-name-btn", UI_TEXT.nameBtn);
  setText("text-skip-story-btn", UI_TEXT.skipStoryBtn);
  setText("text-story-intro-hint", UI_TEXT.storyIntroHint);
  setText("text-story-question-dialog", UI_TEXT.storyQuestionText);
  setText("text-story-question-hint", UI_TEXT.storyQuestionHint);
  setText("text-stroller-eyebrow", UI_TEXT.strollerEyebrow);
  setText("text-stroller-title", UI_TEXT.strollerTitle);
  setText("text-stroller-hint", UI_TEXT.strollerHint);
  setText("text-chip-cap", UI_TEXT.chipCap);
  setText("text-chip-bow", UI_TEXT.chipBow);
  setText("text-confirm-eyebrow", UI_TEXT.confirmEyebrow);
  setText("text-blessing-label", UI_TEXT.blessingLabel);
  setText("text-confirm-btn", UI_TEXT.confirmBtn);
  setText("btn-confirm-cancel", UI_TEXT.confirmCancel);
  setText("text-suspense-caption", UI_TEXT.suspenseCaption);
  setText("text-view-results-btn", UI_TEXT.viewResultsBtn);
  setText("text-results-eyebrow", UI_TEXT.resultsEyebrow);
  setText("text-results-title", UI_TEXT.resultsTitle);
  setText("text-polaroid-caption", UI_TEXT.polaroidCaption);
}

function applyVisualAssets() {
  if (VISUAL_ASSETS.polaroidUrl) {
    const photoEl = document.getElementById("corner-polaroid__photo");
    if (photoEl) {
      photoEl.style.backgroundImage = `url(${VISUAL_ASSETS.polaroidUrl})`;
      photoEl.style.backgroundSize = "cover";
      photoEl.style.backgroundPosition = "center";
    }
  }
  if (VISUAL_ASSETS.bgmUrl && bgmAudio.getAttribute("data-src") !== VISUAL_ASSETS.bgmUrl) {
    bgmAudio.setAttribute("data-src", VISUAL_ASSETS.bgmUrl);
    bgmAudio.src = VISUAL_ASSETS.bgmUrl;
    if (bgmStarted) bgmAudio.play().catch(() => {});
  }
}

function applyLayoutPositions() {
  const root = document.documentElement.style;
  root.setProperty("--offset-cover-btn", `${LAYOUT_POSITIONS.coverBtnOffset || 0}px`);
  root.setProperty("--seat-left-top", `${LAYOUT_POSITIONS.seatLeftTop}%`);
  root.setProperty("--seat-left-left", `${LAYOUT_POSITIONS.seatLeftLeft}%`);
  root.setProperty("--seat-right-top", `${LAYOUT_POSITIONS.seatRightTop}%`);
  root.setProperty("--seat-right-left", `${LAYOUT_POSITIONS.seatRightLeft}%`);
  root.setProperty("--transition-seconds", `${LAYOUT_POSITIONS.transitionSeconds ?? 0.4}s`);
}
applyLayoutPositions();

/* ---------- 3c. 背景音樂：從第一次互動開始播放，貫穿所有場景，只有玩家手動靜音才會停 ---------- */
const bgmAudio = document.getElementById("bgm-audio");
const bgmToggleBtn = document.getElementById("btn-bgm-toggle");
let bgmMuted = false;
let bgmStarted = false;

bgmAudio.src = VISUAL_ASSETS.bgmUrl;
bgmAudio.volume = 0.55;

function startBgm() {
  if (bgmStarted) return;
  bgmStarted = true;
  bgmAudio.muted = bgmMuted;
  bgmAudio.play().catch(() => {
    // 瀏覽器可能擋下自動播放，等玩家點擊靜音鍵時會再嘗試一次
    bgmStarted = false;
  });
}

bgmToggleBtn.addEventListener("click", () => {
  bgmMuted = !bgmMuted;
  bgmAudio.muted = bgmMuted;
  bgmToggleBtn.textContent = bgmMuted ? "🔇" : "🔈";
  bgmToggleBtn.classList.toggle("is-muted", bgmMuted);
  if (!bgmMuted) {
    // 玩家主動取消靜音時，若音樂還沒真的播放起來（例如自動播放曾被擋下），在這個使用者手勢裡重新嘗試
    bgmStarted = true;
    bgmAudio.play().catch(() => {});
  }
});

/* ---------- 4. 場景切換（淡入淡出）---------- */
const transitionVeil = document.getElementById("transition-veil");

function switchScene(id) {
  const next = document.getElementById(id);
  const transitionMs = Math.round((LAYOUT_POSITIONS.transitionSeconds ?? 0.4) * 1000);

  // 先淡出到全黑
  transitionVeil.classList.add("active");
  setTimeout(() => {
    document.querySelectorAll(".scene").forEach((s) => { s.classList.add("hidden"); });
    next.classList.remove("hidden");
    window.scrollTo(0, 0);
    // 換好場景後，再從全黑淡入
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { transitionVeil.classList.remove("active"); });
    });
  }, transitionMs);
}

/* ---------- 5. 場景 1：待機迎賓 → 暱稱對話框 ---------- */
const coverVideo = document.getElementById("cover-video");
const nameModal = document.getElementById("name-modal");

document.getElementById("btn-cover-start").addEventListener("click", () => {
  coverVideo.pause();
  nameModal.classList.remove("hidden");
  startBgm();
});

document.getElementById("btn-name-next").addEventListener("click", () => {
  const input = document.getElementById("player-name");
  const val = input.value.trim();
  if (!val) { input.focus(); return; }
  playerName = val;
  nameModal.classList.add("hidden");
  switchScene("scene-story");
  showStoryIntroDialog();
});

/* ---------- 6. 場景 2：劇情影片鏈式播放 ---------- */
const storyVideoEl = document.getElementById("story-video");
const storyIntroDialog = document.getElementById("story-intro-dialog");
const storyQuestionDialog = document.getElementById("story-question-dialog");

// 進入劇情頁後，先定格在像素風對話框：跟玩家打招呼，點一下才開始播放 2-1～2-4
function showStoryIntroDialog() {
  const introText = document.getElementById("text-story-intro-dialog");
  introText.textContent = UI_TEXT.storyIntroTemplate.replace("{name}", playerName);
  storyIntroDialog.classList.remove("hidden");
}

storyIntroDialog.addEventListener("click", () => {
  storyIntroDialog.classList.add("hidden");
  playStoryClip(0);
});

// 第四段劇情（最後一段）播完後，不直接跳場景，而是定格在影片最後一格畫面，
// 疊上「……所以，到底是男生還是女生？」的像素風對話框，點一下才接續到嬰兒車環節
storyQuestionDialog.addEventListener("click", () => {
  storyQuestionDialog.classList.add("hidden");
  switchScene("scene-stroller");
});

function playStoryClip(i) {
  if (i >= STORY_CLIPS.length) {
    switchScene("scene-stroller");
    return;
  }
  storyIndex = i;
  storyVideoEl.src = STORY_CLIPS[i];
  // 字幕改用影片本身內嵌的文字，這裡不再疊加網站自己的字幕層
  storyVideoEl.play().catch(() => {
    // 若自動播放被瀏覽器擋下，等一小段時間後直接跳下一段，避免卡住
    setTimeout(() => advanceStory(i + 1), 4000);
  });
}

// 播完或影片出錯時的下一步：最後一段（story-4）要先停在問號對話框，其餘直接接下一段
function advanceStory(nextIndex) {
  if (nextIndex >= STORY_CLIPS.length) {
    storyQuestionDialog.classList.remove("hidden");
    return;
  }
  playStoryClip(nextIndex);
}

storyVideoEl.addEventListener("ended", () => advanceStory(storyIndex + 1));
storyVideoEl.addEventListener("error", () => advanceStory(storyIndex + 1));

document.getElementById("btn-skip-story").addEventListener("click", () => {
  storyVideoEl.pause();
  storyIntroDialog.classList.add("hidden");
  storyQuestionDialog.classList.add("hidden");
  switchScene("scene-stroller");
});

/* ---------- 7. 場景 3：嬰兒車裝備互動 ---------- */
const seatLeft = document.getElementById("seat-left");
const seatRight = document.getElementById("seat-right");
const chipCap = document.getElementById("chip-cap");
const chipBow = document.getElementById("chip-bow");
const comboBanner = document.getElementById("combo-banner");
const comboBannerText = document.getElementById("combo-banner__text");
const confirmModal = document.getElementById("confirm-modal");

const ACCESSORY_ICON = { cap: "🧢", bow: "🎀" };

function updateSeatHighlights() {
  const hasSelection = !!selectedAccessory;
  [seatLeft, seatRight].forEach((seat) => {
    const seatKey = seat.dataset.seat;
    const isEmpty = !seatAssignments[seatKey];
    seat.classList.toggle("selectable-target", hasSelection && isEmpty);
  });
}

function renderSeat(seatEl) {
  const seatKey = seatEl.dataset.seat;
  const value = seatAssignments[seatKey];
  seatEl.classList.toggle("filled", !!value);
  seatEl.innerHTML = value
    ? `<span class="seat-icon">${ACCESSORY_ICON[value]}</span>`
    : `<span class="seat-placeholder">＋</span>`;
}

function handleChipClick(type) {
  selectedAccessory = selectedAccessory === type ? null : type;
  [chipCap, chipBow].forEach((chip) => chip.classList.remove("selected"));
  if (selectedAccessory === "cap") chipCap.classList.add("selected");
  if (selectedAccessory === "bow") chipBow.classList.add("selected");
  updateSeatHighlights();
}

function handleSeatClick(seatEl) {
  const seatKey = seatEl.dataset.seat;
  if (seatAssignments[seatKey]) {
    // 已裝好：點一下卸下
    seatAssignments[seatKey] = null;
    renderSeat(seatEl);
    comboBanner.classList.add("hidden");
    updateSeatHighlights();
    return;
  }
  if (!selectedAccessory) return; // 還沒選配件，點座位沒作用
  seatAssignments[seatKey] = selectedAccessory;
  renderSeat(seatEl);
  selectedAccessory = null;
  [chipCap, chipBow].forEach((chip) => chip.classList.remove("selected"));
  updateSeatHighlights();
  checkComboComplete();
}

chipCap.addEventListener("click", () => handleChipClick("cap"));
chipBow.addEventListener("click", () => handleChipClick("bow"));
seatLeft.addEventListener("click", () => handleSeatClick(seatLeft));
seatRight.addEventListener("click", () => handleSeatClick(seatRight));

function checkComboComplete() {
  if (!seatAssignments.left || !seatAssignments.right) return;
  const bothCap = seatAssignments.left === "cap" && seatAssignments.right === "cap";
  const bothBow = seatAssignments.left === "bow" && seatAssignments.right === "bow";
  comboResult = bothCap ? "BB" : bothBow ? "GG" : "BG";

  const opt = COMBO_OPTIONS.find((o) => o.value === comboResult);
  comboBannerText.textContent = `${opt.emoji} ${opt.name}`;
  comboBanner.classList.remove("hidden");

  setTimeout(() => openConfirmModal(), 500);
}

function openConfirmModal() {
  const opt = COMBO_OPTIONS.find((o) => o.value === comboResult);
  document.getElementById("confirm-combo-title").textContent = UI_TEXT.confirmTemplate.replace("{name}", `${opt.emoji} ${opt.name}`);
  confirmModal.classList.remove("hidden");
}

document.getElementById("btn-confirm-cancel").addEventListener("click", () => {
  confirmModal.classList.add("hidden");
  // 「再想一下」：直接清空兩個座位跟已選配件，讓玩家重新挑選
  seatAssignments.left = null;
  seatAssignments.right = null;
  selectedAccessory = null;
  comboResult = null;
  renderSeat(seatLeft);
  renderSeat(seatRight);
  [chipCap, chipBow].forEach((chip) => chip.classList.remove("selected"));
  comboBanner.classList.add("hidden");
  updateSeatHighlights();
});

document.getElementById("btn-confirm-submit").addEventListener("click", async () => {
  const submitBtn = document.getElementById("btn-confirm-submit");
  submitBtn.disabled = true;
  const blessing = document.getElementById("blessing-input").value.trim().slice(0, 80);

  if (firebaseReady) {
    try {
      const ref = db.collection("stats").doc("comboGuesses");
      await ref.set({ [comboResult]: firebase.firestore.FieldValue.increment(1) }, { merge: true });
      await db.collection("guesses").add({
        name: playerName,
        combo: comboResult,
        blessing,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error("寫入失敗：", err);
    }
  } else {
    localScores[comboResult] += 1;
    localGuesses.unshift({ name: playerName, combo: comboResult, blessing });
  }

  confirmModal.classList.add("hidden");
  submitBtn.disabled = false;
  switchScene("scene-suspense");
  runSuspenseCountdown();
});

/* ---------- 8. 五秒揭曉倒數 ---------- */
function runSuspenseCountdown() {
  let n = 5;
  const numEl = document.getElementById("suspense-number");
  numEl.textContent = String(n);
  const timer = setInterval(() => {
    n -= 1;
    if (n <= 0) {
      clearInterval(timer);
      switchScene("scene-reveal");
      loadReveal();
      return;
    }
    numEl.textContent = String(n);
  }, 1000);
}

/* ---------- 9. 公布結果（彩帶顏色依實際答案）---------- */
const CONFETTI_COLORS = {
  BB: ["#7FA8C9", "#5885AA", "#BFE0F5"],
  GG: ["#E8A0AE", "#D67B8D", "#FBD6E0"],
  BG: ["#7FA8C9", "#E8A0AE", "#5885AA", "#D67B8D"]
};

async function loadReveal() {
  const content = document.getElementById("reveal-content");
  let result = null;

  if (firebaseReady) {
    try {
      const doc = await db.collection("reveal").doc("answer").get();
      if (doc.exists && doc.data().result) result = doc.data().result;
    } catch (err) {
      console.error("讀取公布結果失敗：", err);
    }
  }

  revealedAnswer = result;
  const opt = COMBO_OPTIONS.find((o) => o.value === result);
  const myOpt = COMBO_OPTIONS.find((o) => o.value === comboResult);

  if (opt) {
    const noteTemplate = comboResult === result ? UI_TEXT.revealNoteHit : UI_TEXT.revealNoteMiss;
    content.innerHTML = `
      <div class="reveal-emoji">${opt.emoji}</div>
      <p class="reveal-name">${UI_TEXT.revealNameTemplate.replace("{name}", opt.name)}</p>
      <p class="reveal-note">${noteTemplate.replace("{guess}", myOpt ? myOpt.name : "—")}</p>
      <button class="btn-primary" id="btn-to-thanks">${UI_TEXT.revealBtn}</button>
    `;
    fireConfetti(CONFETTI_COLORS[result] || CONFETTI_COLORS.BG);
  } else {
    content.innerHTML = `
      <p class="reveal-note">${UI_TEXT.revealPendingNote}</p>
      <button class="btn-primary" id="btn-to-thanks">${UI_TEXT.revealPendingBtn}</button>
    `;
  }

  document.getElementById("btn-to-thanks").addEventListener("click", () => {
    switchScene("scene-thanks");
    runThanks();
  });
}

function fireConfetti(colors) {
  if (typeof confetti !== "function") return;
  const canvasEl = document.getElementById("confetti-canvas");
  const myConfetti = confetti.create(canvasEl, { resize: true, useWorker: true });
  const duration = 2600;
  const end = Date.now() + duration;
  (function frame() {
    myConfetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0 }, colors });
    myConfetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  myConfetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors });
}

/* ---------- 10. 感謝畫面（打字機效果）---------- */
function typeLine(elId, text, speed) {
  return new Promise((resolve) => {
    const el = document.getElementById(elId);
    el.textContent = "";
    el.classList.remove("done");
    let i = 0;
    const timer = setInterval(() => {
      el.textContent += text[i];
      i += 1;
      if (i >= text.length) {
        clearInterval(timer);
        el.classList.add("done");
        resolve();
      }
    }, speed);
  });
}

async function runThanks() {
  document.getElementById("btn-view-results").classList.add("hidden");
  await typeLine("thanks-line-1", UI_TEXT.thanksLine1, 55);
  await typeLine("thanks-line-2", UI_TEXT.thanksLine2, 55);
  document.getElementById("btn-view-results").classList.remove("hidden");
}

document.getElementById("btn-view-results").addEventListener("click", () => {
  switchScene("scene-results");
  loadResults();
});

/* ---------- 11. 最終匿名比例結果 ---------- */
function renderProportionBars(scores) {
  const wrap = document.getElementById("proportion-bars");
  wrap.innerHTML = "";
  const total = Math.max(COMBO_OPTIONS.reduce((sum, o) => sum + (scores[o.value] || 0), 0), 1);

  COMBO_OPTIONS.forEach((opt) => {
    const value = scores[opt.value] || 0;
    const pct = Math.round((value / total) * 100);
    const row = document.createElement("div");
    row.innerHTML = `
      <div class="proportion-row__label">
        <span>${opt.emoji} ${opt.name}</span>
        <span>${pct}%</span>
      </div>
      <div class="proportion-row__track"><div class="proportion-row__fill" style="width:${pct}%; background:${opt.color}"></div></div>
    `;
    wrap.appendChild(row);
  });
}

function loadResults() {
  if (firebaseReady) {
    db.collection("stats").doc("comboGuesses").get().then((doc) => {
      renderProportionBars(doc.exists ? doc.data() : {});
    });
  } else {
    renderProportionBars(localScores);
  }
}
