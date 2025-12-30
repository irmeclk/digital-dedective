export const CASES = [
    {
      id: "midterm-leak-01",
      title: "Ara Sınav Soruları Sızdırıldı",
      setting: {
        place: "Kampüs / Bilgisayar Labı",
        date: "Pazartesi",
        examTime: "Salı 10:00",
      },
      suspect: {
        name: "Efe",
        role: "Sınıf temsilcisi",

        profile: {
          calm: 0.35,         
          manipulative: 0.6, 
          honesty: 0.25       
        }
      },
  
      truth: {
        
        timeline: [
          { t: "Pazartesi 18:10", event: "Efe, labda tek başına kaldı." },
          { t: "Pazartesi 18:17", event: "Hoca bilgisayarından PDF dosyası USB'ye kopyalandı." },
          { t: "Pazartesi 18:42", event: "Efe, fotokopi merkezine gitti." },
          { t: "Pazartesi 19:05", event: "Soru PDF'i bazı öğrencilere WhatsApp'tan düştü." },
        ],
        motives: ["Kredi not baskısı", "Arkadaş baskısı", "Temsilcilik sorumluluğu"],
        keyFacts: {
          whereabouts: "Pazartesi akşamı 18:00-19:00 arası labdaydı.",
          access: "Labda hocanın bilgisayarı açıktı, USB portu aktifti.",
          dissemination: "PDF önce fotokopi merkezinde çıktı alındı, sonra WhatsApp."
        }
      },
  
      lies: [
        {
          id: "lie_alibi_library",
          claim: "Pazartesi akşamı kütüphanedeydim.",
          conflictsWith: ["evidence_cam", "truth.whereabouts"]
        },
        {
          id: "lie_no_usb",
          claim: "USB hiç takmadım, bilgisayara da yaklaşmadım.",
          conflictsWith: ["evidence_usb", "truth.access"]
        },
        {
          id: "lie_photokopi_for_notes",
          claim: "Fotokopiye not çıkarmaya gittim, soru falan yoktu.",
          conflictsWith: ["evidence_print", "truth.dissemination"]
        }
      ],
  
      evidence: [
        {
          id: "evidence_cam",
          title: "Kamera Kaydı (Koridor)",
          desc: "Pazartesi 18:12 — Efe lab kapısından içeri giriyor. 18:55 — labdan çıkıyor.",
          reveals: ["Efe labdaydı (18:12-18:55)."]
        },
        {
          id: "evidence_usb",
          title: "USB Log Kaydı",
          desc: "Hoca PC'sinde 18:17 — 'KINGSTON_USB' takıldı ve 'midterm_questions.pdf' kopyalandı.",
          reveals: ["PDF kopyalama olayı 18:17'de gerçekleşti."]
        },
        {
          id: "evidence_print",
          title: "Fotokopi Fişi",
          desc: "Pazartesi 18:46 — 12 sayfa siyah-beyaz çıktı (dosya adı yazmıyor).",
          reveals: ["Efe 18:46 civarı fotokopi merkezindeydi."]
        }
      ],
  
      questionIntents: [
        { id: "ASK_WHERE", label: "Pazartesi akşamı neredeydin?" },
        { id: "ASK_TIME", label: "18:00-19:00 arası ne yaptın?" },
        { id: "ASK_ACCESS", label: "Hoca bilgisayarına yaklaştın mı?" },
        { id: "ASK_USB", label: "USB taktın mı?" },
        { id: "ASK_PRINT", label: "Fotokopiye neden gittin?" },
        { id: "SHOW_EVIDENCE", label: "Kanıtım var." },
        { id: "CALL_OUT", label: "Çelişiyorsun." },
        { id: "ASK_MOTIVE", label: "Neden bunu yaptın?" },
        { id: "ASK_RECAP", label: "Baştan anlat." }
      ]
    }
  ];
  