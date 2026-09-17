import { useState } from "react";
import { supabase } from "../lib/supabase";

const ScoreForm = ({ onScoreAdded }) => {
  const [score, setScore] = useState("");
  const [scoreDate, setScoreDate] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("You must be logged in to add a score.");
    return;
  }

  const { data, error } = await supabase
    .from("scores")
    .insert({
      user_id: user.id,
      score: Number(score),
      score_date: scoreDate,
    })
    .select();

  if (error) {
    console.error("Error adding score:", error.message);
    return;
  }

  console.log("Score added:", data);

setScore("");
setScoreDate("");

if (onScoreAdded) {
  onScoreAdded();
}
};

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-5">
        Add Score
      </h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">

        <input
          type="number"
          min="1"
          max="45"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Stableford score (1-45)"
          required
          className="border rounded-lg px-4 py-3"
        />

        <input
          type="date"
          value={scoreDate}
          onChange={(e) => setScoreDate(e.target.value)}
          required
          className="border rounded-lg px-4 py-3"
        />

        <button
          type="submit"
          className="bg-black text-white rounded-lg px-5 py-3 font-medium"
        >
          Add Score
        </button>

      </form>
    </div>
  );
};

export default ScoreForm;