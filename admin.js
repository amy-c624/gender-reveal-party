/* ==========================================================
   後台設定邏輯
   ========================================================== */

// 請把這串改成你自己的通關密語，再上傳到 GitHub
const ADMIN_PASSCODE = "amy840624";

// 預設值，跟 script.js 保持一致
const DEFAULT_COMBO_OPTIONS = [
  { value: "BB", emoji: "👦🏻👦🏻", name: "熱鬧男團" },
  { value: "GG", emoji: "👧🏻👧🏻", name: "前世情人" },
  { value: "BG", emoji: "👦🏻👧🏻", name: "龍鳳組合" }
];

const DEFAULT_UI_TEXT = {
  coverEyebrow: "一本正在發生的日記",
  coverTitle: "雙Q大冒險日記",
  coverBtn: "翻開第一頁 ▶",
  nameEyebrow: "在開始之前",
  nameTitle: "怎麼稱呼你？",
  namePlaceholder: "輸入你的暱稱",
  nameBtn: "進入日記 ▶",
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
  resultsTitle: "日記最後一頁：大家都這樣猜",
  restartBtn: "重新開始 ▶"
};

const UI_TEXT_LABELS = {
  coverEyebrow: "封面 - 小標籤",
  coverTitle: "封面 - 主標題",
  coverBtn: "封面 - 開始按鈕",
  nameEyebrow: "填暱稱 - 小標籤",
  nameTitle: "填暱稱 - 標題",
  namePlaceholder: "填暱稱 - 輸入框提示文字",
  nameBtn: "填暱稱 - 下一步按鈕",
  storyIntroTemplate: "劇情頁 - 開場對話框文字（用 {name} 代表玩家暱稱）",
  storyIntroHint: "劇情頁 - 開場對話框提示小字",
  storyQuestionText: "劇情頁 - 第四段結束後的對話框文字",
  storyQuestionHint: "劇情頁 - 第四段結束後對話框提示小字",
  strollerEyebrow: "嬰兒車頁 - 小標籤",
  strollerTitle: "嬰兒車頁 - 標題",
  strollerHint: "嬰兒車頁 - 操作提示文字",
  chipCap: "嬰兒車頁 - 棒球帽配件名稱",
  chipBow: "嬰兒車頁 - 蝴蝶結配件名稱",
  confirmEyebrow: "確認對話框 - 小標籤",
  confirmTemplate: "確認對話框 - 標題句型（用 {name} 代表組合名稱）",
  blessingLabel: "確認對話框 - 祝福欄位標籤",
  confirmBtn: "確認對話框 - 送出按鈕",
  confirmCancel: "確認對話框 - 取消文字連結",
  suspenseCaption: "倒數頁 - 文字",
  revealNameTemplate: "公布頁 - 答案句型（用 {name} 代表答案名稱）",
  revealNoteHit: "公布頁 - 猜中時的句子（用 {guess} 代表玩家猜的名稱）",
  revealNoteMiss: "公布頁 - 沒猜中時的句子（用 {guess} 代表玩家猜的名稱）",
  revealBtn: "公布頁 - 按鈕文字",
  revealPendingNote: "公布頁（答案未設定時）- 說明文字",
  revealPendingBtn: "公布頁（答案未設定時）- 按鈕文字",
  thanksLine1: "感謝頁 - 第一句（打字機效果）",
  thanksLine2: "感謝頁 - 第二句（打字機效果）",
  polaroidCaption: "感謝頁 - 拍立得下方手寫文字",
  viewResultsBtn: "感謝頁 - 查看結果按鈕",
  resultsEyebrow: "結果頁 - 小標籤",
  resultsTitle: "結果頁 - 標題",
  restartBtn: "結果頁 - 重新開始按鈕（回到待機畫面）"
};

const DEFAULT_VISUAL_ASSETS = { polaroidUrl: "", bgmUrl: "assets/bgm.mp3" };
const DEFAULT_LAYOUT_POSITIONS = {
  coverBtnOffset: 0,
  coverTitleOffsetX: 0, coverTitleOffsetY: 0,
  seatLeftTop: 57, seatLeftLeft: 40,
  seatRightTop: 57, seatRightLeft: 66,
  transitionSeconds: 0.4
};

let currentComboOptions = JSON.parse(JSON.stringify(DEFAULT_COMBO_OPTIONS));
let currentUiText = { ...DEFAULT_UI_TEXT };
let currentVisualAssets = { ...DEFAULT_VISUAL_ASSETS };
let currentLayoutPositions = { ...DEFAULT_LAYOUT_POSITIONS };

/* ---------- Firebase ---------- */
let db = null;
let firebaseReady = false;
try {
  if (typeof firebaseConfig !== "undefined" && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("在這裡")) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
  }
} catch (err) {
  console.error("Firebase 初始化失敗：", err);
}

/* ---------- 通關密語 ---------- */
const GATE_KEY = "twinDiaryAdminOK";
if (sessionStorage.getItem(GATE_KEY) === "1") enterAdmin();

document.getElementById("btn-enter").addEventListener("click", () => {
  const val = document.getElementById("passcode").value;
  if (val === ADMIN_PASSCODE) {
    sessionStorage.setItem(GATE_KEY, "1");
    enterAdmin();
  } else {
    document.getElementById("gate-msg").textContent = "密語不對喔，再試一次。";
  }
});

function enterAdmin() {
  document.getElementById("gate").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
  if (!firebaseReady) {
    alert("尚未設定 Firebase，後台的變更不會同步給訪客，請先參考 README.md 設定。");
  }
  loadExistingConfig();
}

/* ---------- 讀取現有設定 ---------- */
async function loadExistingConfig() {
  if (firebaseReady) {
    try {
      const cDoc = await db.collection("config").doc("comboOptions").get();
      if (cDoc.exists && Array.isArray(cDoc.data().list) && cDoc.data().list.length === 3) {
        currentComboOptions = cDoc.data().list;
      }
    } catch (err) { console.error(err); }

    try {
      const aDoc = await db.collection("reveal").doc("answer").get();
      const el = document.getElementById("current-answer");
      if (aDoc.exists && aDoc.data().result) {
        const opt = currentComboOptions.find((o) => o.value === aDoc.data().result);
        el.textContent = opt ? `${opt.emoji} ${opt.name}` : aDoc.data().result;
      } else {
        el.textContent = "尚未公布";
      }
    } catch (err) { console.error(err); }

    try {
      const uDoc = await db.collection("config").doc("uiText").get();
      if (uDoc.exists) currentUiText = { ...currentUiText, ...uDoc.data() };
    } catch (err) { console.error(err); }

    try {
      const vDoc = await db.collection("config").doc("visualAssets").get();
      if (vDoc.exists) currentVisualAssets = { ...currentVisualAssets, ...vDoc.data() };
    } catch (err) { console.error(err); }

    try {
      const lDoc = await db.collection("config").doc("layoutPositions").get();
      if (lDoc.exists) currentLayoutPositions = { ...currentLayoutPositions, ...lDoc.data() };
    } catch (err) { console.error(err); }
  } else {
    document.getElementById("current-answer").textContent = "（未連接 Firebase）";
  }

  renderComboEditor();
  renderAnswerSelect();
  renderVisualAssetsEditor();
  renderLayoutPositionsEditor();
  renderUiTextEditor();
}

/* ---------- 裝備組合名稱編輯 ---------- */
function renderComboEditor() {
  const wrap = document.getElementById("combo-editor");
  wrap.innerHTML = "";
  currentComboOptions.forEach((opt) => {
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <p class="value-badge">組合：${opt.value}（不可更改）</p>
      <input type="text" data-combo="${opt.value}" value="${escapeAttr(opt.name)}" />
    `;
    wrap.appendChild(row);
  });
  wrap.addEventListener("input", (e) => {
    const input = e.target.closest("input[data-combo]");
    if (!input) return;
    const opt = currentComboOptions.find((o) => o.value === input.dataset.combo);
    if (opt) opt.name = input.value;
    renderAnswerSelect();
  });
}

document.getElementById("btn-save-combo").addEventListener("click", async () => {
  const status = document.getElementById("combo-status");
  if (!firebaseReady) { status.textContent = "尚未設定 Firebase，無法儲存。"; return; }
  status.textContent = "儲存中...";
  try {
    await db.collection("config").doc("comboOptions").set({ list: currentComboOptions });
    status.textContent = "已儲存！訪客重新整理後就會看到新名稱。";
  } catch (err) {
    console.error(err);
    status.textContent = "儲存失敗，請檢查網路。";
  }
});

/* ---------- 公布答案 ---------- */
function renderAnswerSelect() {
  const select = document.getElementById("answer-select");
  const prevValue = select.value;
  select.innerHTML = "";
  currentComboOptions.forEach((opt) => {
    const el = document.createElement("option");
    el.value = opt.value;
    el.textContent = `${opt.emoji} ${opt.name}`;
    select.appendChild(el);
  });
  if (prevValue) select.value = prevValue;
}

document.getElementById("btn-save-answer").addEventListener("click", async () => {
  const status = document.getElementById("answer-status");
  const select = document.getElementById("answer-select");
  if (!firebaseReady) { status.textContent = "尚未設定 Firebase，無法公布。"; return; }
  if (!confirm(`確定要公布「${select.options[select.selectedIndex].textContent}」嗎？公布後訪客馬上就能看到。`)) return;
  status.textContent = "公布中...";
  try {
    await db.collection("reveal").doc("answer").set({ result: select.value });
    status.textContent = "已公布！";
    document.getElementById("current-answer").textContent = select.options[select.selectedIndex].textContent;
  } catch (err) {
    console.error(err);
    status.textContent = "公布失敗，請檢查網路。";
  }
});

/* ---------- 視覺素材編輯 ---------- */
function renderVisualAssetsEditor() {
  const input = document.getElementById("asset-polaroid");
  const preview = document.getElementById("preview-polaroid");
  input.value = currentVisualAssets.polaroidUrl || "";
  updateAssetPreview(input.value, preview);
  input.addEventListener("input", () => {
    currentVisualAssets.polaroidUrl = input.value.trim();
    updateAssetPreview(currentVisualAssets.polaroidUrl, preview);
  });

  const bgmInput = document.getElementById("asset-bgm");
  const bgmPreview = document.getElementById("preview-bgm");
  bgmInput.value = currentVisualAssets.bgmUrl || "";
  updateAssetPreview(bgmInput.value, bgmPreview);
  bgmInput.addEventListener("input", () => {
    currentVisualAssets.bgmUrl = bgmInput.value.trim();
    updateAssetPreview(currentVisualAssets.bgmUrl, bgmPreview);
  });
}

function updateAssetPreview(url, mediaEl) {
  if (url) {
    mediaEl.src = url;
    mediaEl.classList.add("show");
  } else {
    mediaEl.removeAttribute("src");
    mediaEl.classList.remove("show");
  }
}

document.getElementById("btn-save-assets").addEventListener("click", async () => {
  const status = document.getElementById("assets-status");
  if (!firebaseReady) { status.textContent = "尚未設定 Firebase，無法儲存。"; return; }
  status.textContent = "儲存中...";
  try {
    await db.collection("config").doc("visualAssets").set(currentVisualAssets);
    status.textContent = "已儲存！訪客重新整理後就會看到新照片。";
  } catch (err) {
    console.error(err);
    status.textContent = "儲存失敗，請檢查網路。";
  }
});

/* ---------- 版面位置微調 ---------- */
function renderLayoutPositionsEditor() {
  document.getElementById("layout-cover-btn").value = currentLayoutPositions.coverBtnOffset || 0;
  document.getElementById("layout-title-offset-x").value = currentLayoutPositions.coverTitleOffsetX || 0;
  document.getElementById("layout-title-offset-y").value = currentLayoutPositions.coverTitleOffsetY || 0;
  document.getElementById("layout-seat-left-top").value = currentLayoutPositions.seatLeftTop;
  document.getElementById("layout-seat-left-left").value = currentLayoutPositions.seatLeftLeft;
  document.getElementById("layout-seat-right-top").value = currentLayoutPositions.seatRightTop;
  document.getElementById("layout-seat-right-left").value = currentLayoutPositions.seatRightLeft;
  document.getElementById("layout-transition-seconds").value = currentLayoutPositions.transitionSeconds ?? 0.4;
}

document.getElementById("btn-save-layout").addEventListener("click", async () => {
  const status = document.getElementById("layout-status");
  currentLayoutPositions = {
    coverBtnOffset: Number(document.getElementById("layout-cover-btn").value) || 0,
    coverTitleOffsetX: Number(document.getElementById("layout-title-offset-x").value) || 0,
    coverTitleOffsetY: Number(document.getElementById("layout-title-offset-y").value) || 0,
    seatLeftTop: Number(document.getElementById("layout-seat-left-top").value),
    seatLeftLeft: Number(document.getElementById("layout-seat-left-left").value),
    seatRightTop: Number(document.getElementById("layout-seat-right-top").value),
    seatRightLeft: Number(document.getElementById("layout-seat-right-left").value),
    transitionSeconds: Number(document.getElementById("layout-transition-seconds").value)
  };
  if (!firebaseReady) { status.textContent = "尚未設定 Firebase，無法儲存。"; return; }
  status.textContent = "儲存中...";
  try {
    await db.collection("config").doc("layoutPositions").set(currentLayoutPositions);
    status.textContent = "已儲存！訪客重新整理後就會套用新位置。";
  } catch (err) {
    console.error(err);
    status.textContent = "儲存失敗，請檢查網路。";
  }
});

/* ---------- 文字內容編輯 ---------- */
function renderUiTextEditor() {
  const wrap = document.getElementById("uitext-editor");
  wrap.innerHTML = "";
  Object.keys(DEFAULT_UI_TEXT).forEach((key) => {
    const isLong = (currentUiText[key] || "").length > 24;
    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <label>${UI_TEXT_LABELS[key] || key}</label>
      ${isLong
        ? `<textarea data-uitext-key="${key}">${escapeHtml(currentUiText[key])}</textarea>`
        : `<input type="text" data-uitext-key="${key}" value="${escapeAttr(currentUiText[key])}" />`}
    `;
    wrap.appendChild(row);
  });
  wrap.addEventListener("input", (e) => {
    const field = e.target.closest("[data-uitext-key]");
    if (!field) return;
    currentUiText[field.dataset.uitextKey] = field.value;
  });
}

document.getElementById("btn-save-uitext").addEventListener("click", async () => {
  const status = document.getElementById("uitext-status");
  if (!firebaseReady) { status.textContent = "尚未設定 Firebase，無法儲存。"; return; }
  status.textContent = "儲存中...";
  try {
    await db.collection("config").doc("uiText").set(currentUiText);
    status.textContent = "已儲存！訪客重新整理後就會看到新文字。";
  } catch (err) {
    console.error(err);
    status.textContent = "儲存失敗，請檢查網路。";
  }
});

function escapeAttr(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML.replace(/"/g, "&quot;");
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
