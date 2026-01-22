import React, { useReducer, useCallback } from "react";
import SelectField from "./components/Select";
import genres from "./store/genre.json";
import moods from "./store/mood.json";

/* ---------- STATE ---------- */
const initialState = {
  genre: "",
  mood: "",
  level: "",
  recommendations: "",
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };
    case "SET_MOOD":
      return { ...state, mood: action.payload };
    case "SET_LEVEL":
      return { ...state, level: action.payload };
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, recommendations: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

/* ---------- COMPONENT ---------- */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const availableMoods = moods[state.genre] || [];

  const fetchRecommendations = useCallback(async () => {
    if (!state.genre || !state.mood || !state.level) {
      alert("Please select Genre, Mood and Level");
      return;
    }

    dispatch({ type: "FETCH_START" });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${state.level} ${state.genre} reader feeling ${state.mood}. Explain briefly.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No recommendations returned.";

      dispatch({ type: "FETCH_SUCCESS", payload: text });
    } catch (error) {
      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to fetch recommendations",
      });
    }
  }, [state.genre, state.mood, state.level]);

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#121212",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#fff",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        background: "#1e1e1e",
        padding: 25,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        📚 Gemini AI Book Recommender
      </h2>

      <SelectField
        label="Genre"
        options={genres}
        value={state.genre}
        onSelect={(val) => dispatch({ type: "SET_GENRE", payload: val })}
      />

      <SelectField
        label="Mood"
        options={availableMoods}
        value={state.mood}
        onSelect={(val) => dispatch({ type: "SET_MOOD", payload: val })}
        disabled={!state.genre}
      />

      <SelectField
        label="Level"
        options={["Beginner", "Intermediate", "Advanced"]}
        value={state.level}
        onSelect={(val) => dispatch({ type: "SET_LEVEL", payload: val })}
      />

      <button
        onClick={fetchRecommendations}
        disabled={state.loading}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          borderRadius: 8,
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          background: "#6366f1",
          color: "#fff",
        }}
      >
        {state.loading ? "Thinking..." : "Get Recommendations"}
      </button>

      {state.error && (
        <p style={{ color: "salmon", marginTop: 15 }}>{state.error}</p>
      )}

      {state.recommendations && (
        <div
          style={{
            marginTop: 25,
            background: "#0f172a",
            padding: 20,
            borderRadius: 10,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            fontSize: 14,
          }}
        >
          {state.recommendations}
        </div>
      )}<footer
  style={{
    marginTop: 30,
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
  }}
>
  Built by <strong>Charity</strong> · CR Tech Solutions © {new Date().getFullYear()}
</footer>

    </div>
  </div>
);}
