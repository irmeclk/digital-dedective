function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function chance(prob01){
  return Math.random() < clamp(prob01, 0, 1);
}
function detectContradiction(caseData, state, nextClaimTag){
  
  const opened = new Set(state.openedEvidence);

  const contradictions = [];

  const claimTags = new Set([...state.botClaims, nextClaimTag].filter(Boolean));

  if (claimTags.has("ALIBI_LIBRARY") && opened.has("evidence_cam")){
    contradictions.push("Kütüphane dedin ama kamera labda olduğunu gösteriyor.");
  }
  if (claimTags.has("NO_USB") && opened.has("evidence_usb")){
    contradictions.push("USB takmadım dedin ama log kaydı 18:17'de USB takıldığını söylüyor.");
  }
  if (claimTags.has("PRINT_NOTES") && opened.has("evidence_print")){
    contradictions.push("Not çıkardım dedin ama bu fiş sınav sorularının çıktısı olabilir.");
  }

  return contradictions;
}

function pickEvasiveLine(profile){
  const evasive = [
    "Şu an detaylara girmek istemiyorum.",
    "Bunu niye soruyorsun? Asıl mesele bu değil.",
    "Bence yanlış kişiye odaklanıyorsun.",
    "Hatırlamıyorum, o gün çok yoğundu."
  ];

  if (profile.manipulative > 0.55){
    evasive.push("Bu bir cadı avı gibi. Herkesin stresini bana yıkmayın.");
    evasive.push("Sen de olsan aynı baskıyı hissederdin.");
  }
  return evasive[Math.floor(Math.random() * evasive.length)];
}

function pickConfessionLine(){
  const lines = [
    "Tamam… bir noktada kontrol benden çıktı.",
    "Evet… dosyayı gördüm. Merak ettim.",
    "Bir hata yaptım. Ama tek başıma değildim.",
    "Baskı altındaydım. Çok pişmanım."
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function summarizeWithSpin(state, caseData){

  const hasCam = state.openedEvidence.includes("evidence_cam");
  const hasUsb = state.openedEvidence.includes("evidence_usb");
  const hasPrint = state.openedEvidence.includes("evidence_print");

  let s = "Pazartesi akşamı kısa bir iş için uğradım. ";
  if (!hasCam) s += "Labda çok kalmadım. ";
  else s += "Evet, labda görünüyorum ama bu suç değil. ";

  if (!hasUsb) s += "Bilgisayara yaklaşmadım bile. ";
  else s += "USB meselesi… onu ben yapmadım. Başkası da girmiş olabilir. ";

  if (!hasPrint) s += "Fotokopiye not için uğradım. ";
  else s += "Fotokopi fişi var diye soru çıktısı demek değil. ";

  s += "Bence olay büyütülüyor.";
  return s;
}

export function botRespond(caseData, state, intent){
  const p = caseData.suspect.profile;

  const baseLie = 1 - p.honesty;                 
  const stressFactor = clamp(state.botStress / 100, 0, 1); 
  const panicFactor = clamp((1 - p.calm) * 0.6 + stressFactor * 0.6, 0, 1);

  const confessProb = clamp((state.botStress - 75) / 50, 0, 0.45);

  const evasiveProb = clamp(0.20 + p.manipulative * 0.25 + stressFactor * 0.15, 0, 0.75);

  let mode = "TRUTH";
  if (chance(confessProb)) mode = "CONFESS";
  else if (chance(evasiveProb)) mode = "EVASIVE";
  else if (chance(baseLie)) mode = "LIE";

  let text = "";
  let claimTag = null; 

  if (mode === "CONFESS"){
    text = pickConfessionLine();
    claimTag = "CONFESS";
  } else if (mode === "EVASIVE"){
    text = pickEvasiveLine(p);
    claimTag = "EVASIVE";
  } else if (mode === "TRUTH"){
    switch(intent){
      case "ASK_WHERE":
        text = "Labdaydım. Temsilcilik işleri için kısa süre uğradım.";
        claimTag = "TRUTH_LAB";
        break;
      case "ASK_TIME":
        text = "18:00-19:00 arası labda birkaç şey toparladım, sonra dışarı çıktım.";
        claimTag = "TRUTH_TIME";
        break;
      case "ASK_ACCESS":
        text = "Bilgisayarın yanına geldim ama sadece kapatıp çıktım.";
        claimTag = "TRUTH_ACCESS";
        break;
      case "ASK_USB":
        text = "USB konusu… hatırlamıyorum. Belki bir şeyler taktım ama dosya kopyaladığımı sanmıyorum.";
        claimTag = "TRUTH_BLUR_USB";
        break;
      case "ASK_PRINT":
        text = "Fotokopiye ders notu için uğradım, başka bir şey yok.";
        claimTag = "PRINT_NOTES";
        break;
      case "ASK_MOTIVE":
        text = "Herkes gibi stres altındaydım. Ama bunu 'kasıtlı' yaptığım söylenemez.";
        claimTag = "TRUTH_MOTIVE";
        break;
      case "ASK_RECAP":
        text = summarizeWithSpin(state, caseData);
        claimTag = "RECAP";
        break;
      case "SHOW_EVIDENCE":
        text = "Kanıtın varsa göster. Ben saklayacak bir şey yapmadım.";
        claimTag = "EVIDENCE_RESPONSE";
        break;
      case "CALL_OUT":
        text = "Çelişki falan yok. Sen yanlış yorumluyorsun.";
        claimTag = "DENY";
        break;
      default:
        text = "Bilmiyorum.";
        claimTag = "GENERIC";
    }
  } else {
    
    switch(intent){
      case "ASK_WHERE":
        text = "Kütüphanedeydim. Sınava çalışıyordum.";
        claimTag = "ALIBI_LIBRARY";
        break;
      case "ASK_TIME":
        text = "18:00-19:00 arası kütüphanede ders çalıştım, sonra çıktım.";
        claimTag = "ALIBI_LIBRARY";
        break;
      case "ASK_ACCESS":
        text = "Hayır. Hoca bilgisayarına yaklaşmadım.";
        claimTag = "NO_ACCESS";
        break;
      case "ASK_USB":
        text = "USB hiç takmadım. Bilgisayara da dokunmadım.";
        claimTag = "NO_USB";
        break;
      case "ASK_PRINT":
        text = "Fotokopiye not çıkarmaya gittim. Soru falan yoktu.";
        claimTag = "PRINT_NOTES";
        break;
      case "ASK_MOTIVE":
        text = "Benim motivasyonum yok. Bu işi yapan başkası.";
        claimTag = "SHIFT_BLAME";
        break;
      case "ASK_RECAP":
        text = "Kütüphanede çalıştım. Labla alakam yok. Konu kapanmalı.";
        claimTag = "ALIBI_LIBRARY";
        break;
      case "SHOW_EVIDENCE":
        text = "Göster bakalım… ama eminim yanlış kişidesin.";
        claimTag = "EVIDENCE_RESPONSE";
        break;
      case "CALL_OUT":
        text = "Sen beni sıkıştırmaya çalışıyorsun. Bu adil değil.";
        claimTag = "EVASIVE";
        break;
      default:
        text = "Hayır.";
        claimTag = "GENERIC";
    }
  }

  const contradictions = detectContradiction(caseData, state, claimTag);

  const stressDelta =
    (intent === "SHOW_EVIDENCE" ? 12 : 0) +
    (intent === "CALL_OUT" ? 10 : 0) +
    (contradictions.length > 0 ? 18 : 0);

  return {
    text,
    claimTag,
    contradictions,
    stressDelta
  };
}
