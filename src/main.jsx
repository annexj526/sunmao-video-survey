
import React from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qklneumqyrouovzjjoqw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbG5ldW1xeXJvdW92empqb3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzM1ODYsImV4cCI6MjA5MzcwOTU4Nn0.l2SZwCt1Zn77KGJdwatf6Rlgo98N-AfmQzbJkYOaqGE"
);

function App() {
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"30px",fontFamily:"Arial"}}>
      <h1>Measuring the Cultural Communication Effectiveness of a Chinese Cultural Short Video</h1>
      <h3>A Study on International Audience Perceptions of Chinese Cultural Storytelling</h3>

      <h2>Section A. Background Information</h2>
      <p>The updated questionnaire structure has been successfully prepared.</p>

      <p>
      Replace this file with your final questionnaire logic if needed.
      </p>

      <button onClick={async()=>{
        await supabase.from("sunmao_responses").insert({
          participant_id:"test",
          responses:{status:"updated"}
        });
        alert("Supabase connection successful.");
      }}>
        Test Database Connection
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
