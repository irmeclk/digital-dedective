import { CASES } from "./cases.js";
import { createGame } from "./engine.js";

const caseData = CASES[0];
const game = createGame(caseData);

const $chat = document.getElementById("chatLog");
const $actions = document.getElementById("actions");
const $evidence = document.getElementById("evidenceList");

const $sus = document.getElementById("suspicion");
const $stress = document.getElementById("stress");
const $contr = document.getElementById("contradictions");

const $accuse = document.getElementById("accuseBtn");
const $verdict = document.getElementById("verdict");

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

function pushMessage(type, who, text, meta=""){
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerHTML = `
    <div class="badge">${who}</div>
    <div>
      <div class="text">${esc(text)}</div>
      ${meta ? `<div class="meta">${esc(meta)}</div>` : ""}
    </div>
  `;
  $chat.appendChild(div);
  $chat.scrollTop = $chat.scrollHeight;
}

function renderStats(){
  const s = game.snapshot();
  $sus.textContent = s.suspicionScore;
  $stress.textContent = s.botStress;
  $contr.textContent = s.contradictionsFound;
}

function addEvidenceCard(e){
  const card = document.createElement("div");
  card.className = "evidence";
  card.innerHTML = `
    <div class="title">${esc(e.title)}</div>
    <div class="desc">${esc(e.desc)}</div>
  `;
  $evidence.appendChild(card);
}

function disableActions(disabled){
  [...$actions.querySelectorAll("button")].forEach(b => b.disabled = disabled);
  $accuse.disabled = disabled;
}

function onIntent(intent, label){
  if (game.snapshot().finished) return;

  pushMessage("player", "D", label, "Dedektif sorusu");
  disableActions(true);

  const res = game.applyPlayerIntent(intent);

  if (res.evidence){
    pushMessage("system", "!", `Kanıt açıldı: ${res.evidence.title}`, "Kanıt paneline eklendi");
    addEvidenceCard(res.evidence);
  }

  const botMeta = res.bot.contradictions.length
    ? `⚠ Çelişki yakalandı: ${res.bot.contradictions[0]}`
    : `Yanıt tipi: ${res.bot.claimTag}`;

  pushMessage("bot", "Ş", res.bot.text, botMeta);

  if (res.bot.contradictions.length){
    res.bot.contradictions.slice(0,2).forEach(c => {
      pushMessage("system", "!", c, "Tutarlılık alarmı");
    });
  }

  renderStats();
  disableActions(false);

  if (game.snapshot().turn < 2) $accuse.disabled = true;
  else $accuse.disabled = false;
}

function renderActions(){
  $actions.innerHTML = "";
  for (const q of caseData.questionIntents){
    const btn = document.createElement("button");
    btn.textContent = q.label;
    btn.addEventListener("click", () => onIntent(q.id, q.label));
    $actions.appendChild(btn);
  }
}

function start(){
  pushMessage("system", "!", `Vaka başlatıldı: ${caseData.title}`, `${caseData.setting.place} • ${caseData.setting.date} • Sınav: ${caseData.setting.examTime}`);
  pushMessage("bot", "Ş", "Ben bir şey yapmadım. Bana niye geldin?", `Şüpheli: ${caseData.suspect.name} (${caseData.suspect.role})`);

  renderActions();
  renderStats();

  $evidence.innerHTML = `<div class="muted">Henüz kanıt açmadın. “Kanıtım var.” ile sırayla kanıt açılır.</div>`;

  $accuse.addEventListener("click", () => {
    if (game.snapshot().finished) return;
    disableActions(true);

    const v = game.accuse();
    $verdict.hidden = false;
    $verdict.innerHTML = `
      <div><strong>Karar:</strong> ${esc(v.verdict.label)}</div>
      <div class="muted">Skor: ${esc(v.verdict.score)}</div>
      <div style="margin-top:8px;">${esc(v.verdict.explanation)}</div>
    `;

    pushMessage("system", "!", `İtham edildi → ${v.verdict.label}`, `Skor: ${v.verdict.score}`);
    renderStats();
  });

  $accuse.disabled = true;
}

start();
