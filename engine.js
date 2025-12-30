import { botRespond } from "./bot.js";

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

export function createGame(caseData){
  const state = {
    caseId: caseData.id,
    turn: 0,

    suspicionScore: 0,
    contradictionsFound: 0,
    botStress: 10,

    openedEvidence: [],     
    botClaims: [],          
    finished: false
  };

  function openNextEvidence(){
    const all = caseData.evidence.map(e => e.id);
    const unopened = all.filter(id => !state.openedEvidence.includes(id));
    if (unopened.length === 0) return null;
    const nextId = unopened[0];
    state.openedEvidence.push(nextId);
    return caseData.evidence.find(e => e.id === nextId) || null;
  }

  function applyPlayerIntent(intent){
    if (state.finished) return { type:"noop" };

    state.turn += 1;

    if (intent === "SHOW_EVIDENCE") state.suspicionScore += 6;
    if (intent === "CALL_OUT") state.suspicionScore += 4;
    state.suspicionScore = clamp(state.suspicionScore, 0, 100);

    let newlyOpenedEvidence = null;
    if (intent === "SHOW_EVIDENCE"){
      newlyOpenedEvidence = openNextEvidence();
      state.botStress = clamp(state.botStress + 8, 0, 100);
    }

    const resp = botRespond(caseData, state, intent);

    if (resp.claimTag) state.botClaims.push(resp.claimTag);

    if (resp.contradictions.length > 0){
      state.contradictionsFound += resp.contradictions.length;
      state.suspicionScore = clamp(state.suspicionScore + 10, 0, 100);
    }

    state.botStress = clamp(state.botStress + resp.stressDelta, 0, 100);

    return {
      type: "turn",
      player: { intent },
      evidence: newlyOpenedEvidence,
      bot: resp,
      state: snapshot()
    };
  }

  function accuse(){
    if (state.finished) return { type:"noop" };
    state.finished = true;

    const score = (state.contradictionsFound * 18) + (state.suspicionScore * 0.7) + (state.botStress * 0.4);

    let result = "YETERSİZ";
    let details = "";

    if (score >= 110){
      result = "SUÇLULUK OLASI";
      details = "Çelişki sayısı yüksek ve bot baskı altında tutarsızlaştı. İtham güçlü.";
    } else if (score >= 80){
      result = "ŞÜPHELİ";
      details = "Bazı çelişkiler var ama savunma hâlâ mümkün. Bir kanıt daha açmak daha iyi olurdu.";
    } else {
      result = "YETERSİZ";
      details = "Bu haliyle itham zayıf. Daha fazla kanıt/çelişki yakalamadan bitirmek riskli.";
    }

    return {
      type: "verdict",
      verdict: {
        label: result,
        score: Math.round(score),
        explanation: details
      },
      state: snapshot()
    };
  }

  function snapshot(){
    return {
      suspicionScore: state.suspicionScore,
      contradictionsFound: state.contradictionsFound,
      botStress: state.botStress,
      openedEvidence: [...state.openedEvidence],
      turn: state.turn,
      finished: state.finished
    };
  }

  return { state, applyPlayerIntent, accuse, snapshot };
}
