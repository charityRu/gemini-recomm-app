import React, { useReducer, useCallback, useEffect } from "react";
import SelectField from "./components/Select";
import genres from "./store/genre.json";
import moods from "./store/mood.json";

/* ---------- STATE ---------- */

const initialState = {
  genre: "",
  mood: "",
  level: "",
  recommendations: [],
};

/* ---------- REDUCER ---------- */

function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };

    case "SET_MOOD":
      return { ...state, mood: action.payload };

    case "SET_LEVEL":
      return { ...state, level: action.payload };

    case "ADD_RECOMMENDATION":
      return {
        ...state,
        recommendations: [...state.recommendations, action.payload],
      };

    default:
      return state;
  }
}

/* ---------- COMPONENT ---------- */

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const availableMoods = moods[state.genre] || [];

  /* ---------- The GEMINI API CALL ---------- */
  const fetchRecommendations = useCallback(async () => {
    if (!state.genre || !state.mood || !state.level) return;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${state.level} ${state.genre} reader feeling ${state.mood}. Explain why.`,
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
        "No recommendation received.";

      dispatch({ type: "ADD_RECOMMENDATION", payload: text });
    } catch {
      dispatch({
        type: "ADD_RECOMMENDATION",
        payload: "Error fetching recommendation.",
      });
    }
  }, [state.genre, state.mood, state.level]);

  /* ---------- useEffect ---------- */
  useEffect(() => {
    if (state.recommendations.length > 0) {
      console.log("New recommendation added");
    }
  }, [state.recommendations]);

  return (
    <section>
      <h2>Book Recommendation App</h2>

      <SelectField
        id="genre"
        placeholder="Select a genre"
        options={genres}
        value={state.genre}
        onSelect={(value) =>
          dispatch({ type: "SET_GENRE", payload: value })
        }
      />

      <SelectField
        id="mood"
        placeholder="Select a mood"
        options={availableMoods}
        value={state.mood}
        onSelect={(value) =>
          dispatch({ type: "SET_MOOD", payload: value })
        }
      />

      <SelectField
        id="level"
        placeholder="Select reading level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={state.level}
        onSelect={(value) =>
          dispatch({ type: "SET_LEVEL", payload: value })
        }
      />

      <button onClick={fetchRecommendations}>
        Get Recommendation
      </button>

      <hr />

      {state.recommendations.map((rec, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{rec}</p>
        </details>
      ))}
    </section>
  );
}
