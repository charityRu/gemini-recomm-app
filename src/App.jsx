import React, { useReducer, useCallback } from "react";
import SelectField from "./components/Select";
import genres from "./store/genre.json";
import moods from "./store/mood.json";

/* ---------- STATE ---------- */

const initialState = {
  genre: "",
  mood: "",
  level: "",
  recommendations: [],
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
      return {
        ...state,
        loading: false,
        recommendations: [action.payload],
      };
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

  /* ---------- RECOMMENDATIONS (SIMULATED – NO API) ---------- */

  const fetchRecommendations = useCallback(() => {
    if (!state.genre || !state.mood || !state.level) {
      alert("Please select Genre, Mood and Level");
      return;
    }

    dispatch({ type: "FETCH_START" });

    setTimeout(() => {
      const result = `
Recommended Books:

1. The Alchemist – inspirational and beginner friendly
2. Atomic Habits – motivating and practical
3. Harry Potter – light, happy fiction
4. The Little Prince – emotional and simple
5. Tuesdays with Morrie – reflective and warm
6. The Midnight Library – hopeful and engaging
      `;

      dispatch({
        type: "FETCH_SUCCESS",
        payload: result,
      });
    }, 1000);
  }, [state.genre, state.mood, state.level]);

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Gemini AI Book Recommender</h2>

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
          marginTop: "15px",
          padding: "10px",
          width: "100%",
          cursor: "pointer",
        }}
      >
        {state.loading ? "Loading..." : "Get Recommendations"}
      </button>

      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      {state.recommendations.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Recommendations:</h3>
          <div
            style={{
              padding: "10px",
              background: "#f0f0f0",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
            }}
          >
            {state.recommendations[0]}
          </div>
        </div>
      )}
    </div>
  );
}
