
import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, Clock, PlayCircle, Send, ShieldCheck } from "lucide-react";
import "./style.css";

const VIDEO_URL = "https://www.bilibili.com/video/BV1duWyztE8q/";
const EMBED_URL = "https://player.bilibili.com/player.html?bvid=BV1duWyztE8q&autoplay=0";
const REQUIRED_WATCH_SECONDS = 180;

const SUPABASE_URL = "https://qklneumqyrouovzjjoqw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbG5ldW1xeXJvdW92empqb3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzM1ODYsImV4cCI6MjA5MzcwOTU4Nn0.l2SZwCt1Zn77KGJdwatf6Rlgo98N-AfmQzbJkYOaqGE";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const attitudeOptions = [
  "Never heard of it.",
  "Heard of it but think it’s outdated or impractical compared to modern methods.",
  "Heard of it but don’t know much about it, with no particular like or dislike.",
  "Know something about it and find it ingenious or aesthetically pleasing.",
  "Fairly familiar and truly appreciate its wisdom and cultural value.",
];

const likertItems = [
  [2, "This video seems appropriate for people from different countries, regions, and cultural backgrounds."],
  [3, "This video seems to have the potential to reach a wide audience across different channels."],
  [4, "This video seems suitable for audiences from diverse social backgrounds."],
  [5, "This video made me feel more positive about Chinese culture."],
  [6, "This video made me emotionally moved."],
  [7, "The feelings from this video still stay with me."],
  [8, "I felt emotionally connected to the cultural content in this video."],
  [9, "This material made me feel emotionally drawn to Chinese culture."],
  [10, "I feel that I understood the cultural meaning of this video correctly."],
  [11, "I feel that I did not miss any important information."],
  [12, "I understood all parts of this video correctly."],
  [13, "I feel that my understanding of this video did not lead to any negative impressions."],
  [14, "This video expanded my knowledge of Sunmao."],
  [15, "This video changed my attitude toward Sunmao."],
  [16, "This video helped me see Sunmao in a new way."],
  [17, "This video broadened my perspective on Sunmao."],
  [18, "This video helped me rethink my previous understanding of Sunmao."],
  [19, "I am willing to learn more about Chinese culture."],
  [20, "I am willing to explore more content like this in the future."],
  [21, "I am willing to take part in activities related to Chinese culture."],
  [22, "I am willing to share this video with others."],
  [23, "I am willing to recommend this video to others."],
  [24, "I can relate the cultural values in this video to my own life."],
  [25, "This video made me reflect on how this culture connects with my beliefs."],
  [26, "I feel that the cultural values presented in this video are meaningful today."],
  [27, "I could follow what was going on in this video without difficulty."],
  [28, "I felt completely absorbed in the story of this video."],
];

const singleChoiceItems = [
  {
    id: 29,
    text: "Which statement about the Chinese Sunmao structure is correct?",
    options: [
      "Sunmao is a modern metal fastener invented for industrial use.",
      "Sunmao is a traditional wood-joining technique without nails or glue, widely used in ancient Chinese architecture and furniture.",
      "Sunmao originated in ancient Greece and was brought to China along the Silk Road.",
    ],
  },
  {
    id: 30,
    text: "What is the core idea behind the Sunmao wisdom as presented in the video?",
    options: [
      "To encourage people to escape modern society and live like hermits.",
      "To demonstrate that Chinese traditional crafts are superior to other cultures’ techniques.",
      "To show how flexibility, stability, and resilience can bring harmony to society and global relations.",
    ],
  },
  {
    id: 31,
    text: "According to the video, how do we interpret the practice of making or understanding Sunmao handicrafts?",
    options: [
      "It is strictly an official skill reserved for royal palaces and high-end art collections.",
      "It is a hands-on way to connect with nature and traditional wisdom for balanced living.",
      "It is just a way to preserve ancient building methods for historical records.",
    ],
  },
  {
    id: 32,
    text: "Does your country have traditional wood joining techniques without nails similar to the Chinese Sunmao shown in the video?",
    options: [
      "Yes, the methods and cultural meanings are almost the same.",
      "I have seen similar practices, but their uses and meanings are different.",
      "There are no such local wood-joining techniques in our country at all.",
    ],
  },
  {
    id: 33,
    text: "After watching this short video about Chinese culture, which of the following best describes your overall view of Chinese culture?",
    options: [
      "Still have a negative view and find it uninteresting, disagree with it, or see no value.",
      "Learned something, but has no particular feelings, neither likes nor dislikes it.",
      "Learned something new and started to find it somewhat interesting or valuable.",
      "Gained a fair amount of new understanding and quite appreciate or like Chinese culture.",
      "My impression has completely changed, and I truly appreciate its unique charm and even feel a strong desire to learn more.",
    ],
  },
];

function makeParticipantId() {
  return `P-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function App() {
  const participantId = useMemo(makeParticipantId, []);
  const [step, setStep] = useState("welcome");
  const [agreed, setAgreed] = useState(false);
  const [videoStartedAt, setVideoStartedAt] = useState(null);
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [questionnaireStartedAt, setQuestionnaireStartedAt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({});

  useEffect(() => {
    if (step !== "video") return;
    if (!videoStartedAt) setVideoStartedAt(new Date().toISOString());
    const timer = setInterval(() => setWatchSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [step, videoStartedAt]);

  const videoUnlocked = watchSeconds >= REQUIRED_WATCH_SECONDS;
  const setAnswer = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const requiredKeys = [
    "q0",
    "q1_name",
    ...likertItems.map(([id]) => `q${id}`),
    ...singleChoiceItems.map((item) => `q${item.id}`),
  ];
  const complete = requiredKeys.every((key) => form[key]);

  function startSurvey() {
    setQuestionnaireStartedAt(new Date().toISOString());
    setStep("survey");
  }

  async function submitSurvey() {
    setSubmitError("");
    setSubmitted(true);

    const payload = {
      participant_id: participantId,
      video_url: VIDEO_URL,
      video_page_start_time: videoStartedAt,
      actual_time_on_video_page_seconds: watchSeconds,
      required_watch_seconds: REQUIRED_WATCH_SECONDS,
      questionnaire_start_time: questionnaireStartedAt,
      submission_time: new Date().toISOString(),
      responses: form,
    };

    const { error } = await supabase.from("sunmao_responses").insert(payload);

    if (error) {
      console.error(error);
      setSubmitError("Submission failed. Please check the database table settings and try again.");
      setSubmitted(false);
      return;
    }

    setStep("done");
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="kicker">Cultural Communication Effectiveness Study</p>
          <h1>木语生花：榫卯文化传播研究</h1>
        </div>
        <div className="id-badge">ID: {participantId}</div>
      </header>

      {step === "welcome" && (
        <section className="card">
          <div className="row">
            <ShieldCheck className="icon" />
            <div>
              <h2>Before you begin</h2>
              <p>
                You will first watch a short video about Chinese Sunmao culture, and then complete a questionnaire about your understanding, feelings, and attitudes. Your responses will be used for academic research only.
              </p>
            </div>
          </div>
          <label className="consent">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>I understand the purpose of this study and agree to participate voluntarily. I understand that I may stop at any time.</span>
          </label>
          <button className="btn" disabled={!agreed} onClick={() => setStep("video")}>Start watching video</button>
        </section>
      )}

      {step === "video" && (
        <>
          <section className="card">
            <div className="video-head">
              <div className="row"><PlayCircle className="icon" /><h2>Watch the video</h2></div>
              <div className="time-pill"><Clock size={16} /> {watchSeconds}s / {REQUIRED_WATCH_SECONDS}s</div>
            </div>
            <div className="video-frame">
              <iframe title="Sunmao video" src={EMBED_URL} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            </div>
            <p>The questionnaire button will be unlocked after the required viewing time.</p>
          </section>
          <div className="actions">
            <button className="btn" disabled={!videoUnlocked} onClick={startSurvey}>
              {videoUnlocked ? "Continue to questionnaire" : "Questionnaire locked"}
            </button>
          </div>
        </>
      )}

      {step === "survey" && (
        <>
          <section className="card">
            <QuestionBlock id="0" text="What is your current attitude toward Sunmao?">
              <RadioGroup name="q0" options={attitudeOptions} value={form.q0} onChange={(v) => setAnswer("q0", v)} />
            </QuestionBlock>
            <QuestionBlock id="1" text="Please state your full name">
              <input className="text-input" value={form.q1_name || ""} onChange={(e) => setAnswer("q1_name", e.target.value)} placeholder="Full name" />
            </QuestionBlock>
            {likertItems.map(([id, text]) => (
              <LikertQuestion key={id} id={id} text={text} value={form[`q${id}`]} onChange={(v) => setAnswer(`q${id}`, v)} />
            ))}
            {singleChoiceItems.map((item) => (
              <QuestionBlock key={item.id} id={item.id} text={item.text}>
                <RadioGroup name={`q${item.id}`} options={item.options} value={form[`q${item.id}`]} onChange={(v) => setAnswer(`q${item.id}`, v)} />
              </QuestionBlock>
            ))}
          </section>
          <div className="sticky-submit">
            <div>
              <p>All questions are required. Completed: {requiredKeys.filter((k) => form[k]).length}/{requiredKeys.length}</p>
              {submitError && <p className="error">{submitError}</p>}
            </div>
            <button className="btn" disabled={!complete || submitted} onClick={submitSurvey}>
              <Send size={16} /> Submit
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <section className="card success">
          <CheckCircle2 size={52} />
          <h2>Thank you for your participation.</h2>
          <p>Your response has been successfully submitted.</p>
        </section>
      )}
    </main>
  );
}

function QuestionBlock({ id, text, children }) {
  return (
    <div className="question">
      <h3><span className="qnum">{id}.</span>{text} <span className="req">*</span></h3>
      {children}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="options">
      {options.map((option, idx) => (
        <label key={idx} className={`option ${value === option ? "selected" : ""}`}>
          <input type="radio" name={name} checked={value === option} onChange={() => onChange(option)} />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function LikertQuestion({ id, text, value, onChange }) {
  return (
    <QuestionBlock id={id} text={text}>
      <div className="likert">
        <div className="likert-label left">Strongly disagree</div>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(String(n))} className={value === String(n) ? "active" : ""}>{n}</button>
        ))}
        <div className="likert-label">Strongly agree</div>
      </div>
    </QuestionBlock>
  );
}

createRoot(document.getElementById("root")).render(<App />);
