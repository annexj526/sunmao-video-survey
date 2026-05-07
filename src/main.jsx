import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./style.css";

const VIDEO_URL = "https://www.bilibili.com/video/BV1duWyztE8q/";
const EMBED_URL = "https://player.bilibili.com/player.html?bvid=BV1duWyztE8q&autoplay=0";
const REQUIRED_WATCH_SECONDS = 180;

const supabase = createClient(
  "https://qklneumqyrouovzjjoqw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbG5ldW1xeXJvdW92empqb3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzM1ODYsImV4cCI6MjA5MzcwOTU4Nn0.l2SZwCt1Zn77KGJdwatf6Rlgo98N-AfmQzbJkYOaqGE"
);

const ageOptions = [
  "Under 18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55 or above",
];

const genderOptions = [
  "Male",
  "Female",
  "Prefer not to say",
];

const likertItems = [
  [1, "This video seems appropriate for people from different countries, regions, and cultural backgrounds."],
  [2, "This video seems to have the potential to reach a wide audience across different channels."],
  [3, "This video seems suitable for audiences from diverse social backgrounds."],
  [4, "This video made me feel more positive about Chinese culture."],
  [5, "I felt emotionally moved by the video."],
  [6, "The emotions evoked by this video stayed with me after watching it."],
  [7, "I felt emotionally connected to the cultural content in this video."],
  [8, "This video made me feel emotionally drawn to Chinese culture."],
  [9, "I feel that I understood the cultural meaning of this video well."],
  [10, "I did not feel that I missed any important information in the video."],
  [11, "I feel that I understood all parts of this video correctly."],
  [12, "I feel that my understanding of this video did not lead to any negative impressions."],
  [13, "This video expanded my knowledge of Chinese culture."],
  [14, "This video changed my attitude toward Chinese culture."],
  [15, "This video helped me see Chinese culture in a new way."],
  [16, "This video broadened my perspective on Chinese culture."],
  [17, "This video helped me rethink my previous understanding of Chinese culture."],
  [18, "I am willing to learn more about Chinese culture."],
  [19, "I am willing to explore more content like this in the future."],
  [20, "I am willing to take part in activities related to Chinese culture."],
  [21, "I am willing to share this video with others."],
  [22, "I am willing to recommend this video to others."],
  [23, "I can relate the cultural values in this video to my own life."],
  [24, "This video made me reflect on how this culture relates to my beliefs."],
  [25, "I feel that the cultural values presented in this video are meaningful today."],
];

const knowledgeItems = [
  {
    id: 26,
    text: "Which statement about the Chinese Sunmao structure is correct?",
    options: [
      "Sunmao is a modern metal fastener invented for industrial use.",
      "Sunmao is a traditional wood-joining technique without nails or glue, widely used in ancient Chinese architecture and furniture.",
      "Sunmao originated in ancient Greece and was brought to China along the Silk Road.",
    ],
  },
  {
    id: 27,
    text: "What is the core idea behind the Sunmao wisdom as presented in the video?",
    options: [
      "To encourage people to escape modern society and live like hermits.",
      "To demonstrate that Chinese traditional crafts are superior to other cultures’ techniques.",
      "To show how flexibility, stability, and resilience can bring harmony to society and global relations.",
    ],
  },
  {
    id: 28,
    text: "According to the video, how do we interpret the practice of making or understanding Sunmao handicrafts?",
    options: [
      "It is strictly an official skill reserved for royal palaces and high-end art collections.",
      "It is a hands-on way to connect with nature and traditional wisdom for balanced living.",
      "It is just a way to preserve ancient building methods for historical records.",
    ],
  },
  {
    id: 29,
    text: "Does your country have traditional wood joining techniques without nails similar to the Chinese Sunmao shown in the video?",
    options: [
      "Yes, the methods and cultural meanings are almost the same.",
      "I have seen similar practices, but their uses and meanings are different.",
      "There are no such local wood-joining techniques in our country at all.",
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
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (step !== "video") return;

    if (!videoStartedAt) {
      setVideoStartedAt(new Date().toISOString());
    }

    const timer = setInterval(() => {
      setWatchSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, videoStartedAt]);

  const requiredKeys = [
    "age_group",
    "gender",
    "country_background",
    "chinese_culture_familiarity",
    "sunmao_attitude",
    ...likertItems.map(([id]) => `q${id}`),
    ...knowledgeItems.map((item) => `q${item.id}`),
  ];

  const completedCount = requiredKeys.filter((key) => form[key]).length;
  const complete = requiredKeys.every((key) => form[key]);
  const videoUnlocked = watchSeconds >= REQUIRED_WATCH_SECONDS;

  function setAnswer(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

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
      setSubmitError("Submission failed. Please try again.");
      setSubmitted(false);
      return;
    }

    setStep("done");
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="kicker">
            A Study on International Audience Perceptions of Chinese Cultural Storytelling
          </p>
          <h1>
            Measuring the Cultural Communication Effectiveness of a Chinese Cultural Short Video
          </h1>
        </div>
        <div className="id-badge">ID: {participantId}</div>
      </header>

      {step === "welcome" && (
        <section className="card">
          <h2>Participant Information and Consent</h2>
          <p>
            You are invited to take part in an academic research study about
            international audience perceptions of Chinese cultural storytelling.
            You will first watch a short video about Chinese Sunmao culture and
            then complete a questionnaire about your perceptions and responses.
          </p>
          <p>
            Participation is voluntary. Your responses will be anonymous and used
            for academic research purposes only. You may stop participating at
            any time before submitting your responses.
          </p>

          <label className="consent">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>
              I have read and understood the information above and agree to
              participate voluntarily.
            </span>
          </label>

          <button className="btn" disabled={!agreed} onClick={() => setStep("video")}>
            Start watching video
          </button>
        </section>
      )}

      {step === "video" && (
        <>
          <section className="card">
            <div className="video-head">
              <h2>Watch the video</h2>
              <div className="time-pill">
                {watchSeconds}s / {REQUIRED_WATCH_SECONDS}s
              </div>
            </div>

            <div className="video-frame">
              <iframe
                title="Sunmao video"
                src={EMBED_URL}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p>
              The questionnaire button will be unlocked after the required
              viewing time.
            </p>
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
            <div className="section-intro">
              <h2>Section A. Background Information</h2>
              <p>
                Please answer the following questions based on your personal
                background and prior familiarity.
              </p>
            </div>

            <QuestionBlock id="A1" text="What is your age group?">
              <RadioGroup
                name="age_group"
                options={ageOptions}
                value={form.age_group}
                onChange={(value) => setAnswer("age_group", value)}
              />
            </QuestionBlock>

            <QuestionBlock id="A2" text="What is your gender?">
              <RadioGroup
                name="gender"
                options={genderOptions}
                value={form.gender}
                onChange={(value) => setAnswer("gender", value)}
              />
            </QuestionBlock>

            <QuestionBlock
              id="A3"
              text="What is your country or cultural background?"
            >
              <input
                className="text-input"
                value={form.country_background || ""}
                onChange={(event) =>
                  setAnswer("country_background", event.target.value)
                }
                placeholder="Open-ended response"
              />
            </QuestionBlock>
            
<QuestionBlock
  id="A4"
  text="What is your highest level of education completed?"
>
  <RadioGroup
    name="education_level"
    options={[
      "Secondary education or below",
      "High school diploma or equivalent",
      "Bachelor’s degree",
      "Master’s degree",
      "Doctoral degree",
      "Other",
      "Prefer not to say",
    ]}
    value={form.education_level}
    onChange={(value) => setAnswer("education_level", value)}
  />
</QuestionBlock>
            <LikertQuestion
              id="A5"
              text="Before watching this video, how familiar were you with Chinese culture?"
              value={form.chinese_culture_familiarity}
              onChange={(value) => setAnswer("chinese_culture_familiarity", value)}
              scaleLabels={["Not familiar at all", "Very familiar"]}
            />

            <LikertQuestion
              id="A6"
              text="Before watching this video, what was your attitude toward Sunmao?"
              value={form.sunmao_attitude}
              onChange={(value) => setAnswer("sunmao_attitude", value)}
              scaleLabels={["Very negative", "Very positive"]}
            />

            <div className="section-intro">
              <h2>Section B. Cultural Communication Effectiveness</h2>
              <p>
                Please indicate the extent to which you agree with the following
                statements.
              </p>
              <p>1 = Strongly disagree &nbsp;&nbsp; 5 = Strongly agree</p>
            </div>

            {likertItems.map(([id, text]) => (
              <LikertQuestion
                key={id}
                id={id}
                text={text}
                value={form[`q${id}`]}
                onChange={(value) => setAnswer(`q${id}`, value)}
              />
            ))}

            <div className="section-intro">
              <h2>Section C. Knowledge Check</h2>
            </div>

            {knowledgeItems.map((item) => (
              <QuestionBlock key={item.id} id={item.id} text={item.text}>
                <RadioGroup
                  name={`q${item.id}`}
                  options={item.options}
                  value={form[`q${item.id}`]}
                  onChange={(value) => setAnswer(`q${item.id}`, value)}
                />
              </QuestionBlock>
            ))}
          </section>

          <div className="sticky-submit">
            <div>
              <p>
                All questions are required. Completed: {completedCount}/
                {requiredKeys.length}
              </p>
              {submitError && <p className="error">{submitError}</p>}
            </div>

            <button
              className="btn"
              disabled={!complete || submitted}
              onClick={submitSurvey}
            >
              Submit
            </button>
          </div>
        </>
      )}

      {step === "done" && (
        <section className="card success">
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
      <h3>
        <span className="qnum">{id}.</span>
        {text} <span className="req">*</span>
      </h3>
      {children}
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="options">
      {options.map((option, index) => (
        <label
          key={index}
          className={`option ${value === option ? "selected" : ""}`}
        >
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function LikertQuestion({
  id,
  text,
  value,
  onChange,
  scaleLabels = ["Strongly disagree", "Strongly agree"],
}) {
  return (
    <QuestionBlock id={id} text={text}>
      <div className="likert">
        <div className="likert-label left">{scaleLabels[0]}</div>

        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(String(number))}
            className={value === String(number) ? "active" : ""}
          >
            {number}
          </button>
        ))}

        <div className="likert-label">{scaleLabels[1]}</div>
      </div>
    </QuestionBlock>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
