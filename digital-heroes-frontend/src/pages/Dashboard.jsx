import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ScoreForm from "../components/ScoreForm";
import CharitySelector from "../components/CharitySelector";

const Dashboard = () => {
    const [scores, setScores] = useState([]);
const [editingScore, setEditingScore] = useState(null);

const fetchScores = async () => {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .order("score_date", { ascending: false });

  if (error) {
    console.error("Error fetching scores:", error.message);
    return;
  }

  setScores(data);
};

useEffect(() => {
  fetchScores();
}, []);

const handleDeleteScore = async (id) => {
  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting score:", error.message);
    return;
  }

  fetchScores();
};

const handleUpdateScore = async (e) => {
  e.preventDefault();

  const { error } = await supabase
    .from("scores")
    .update({
      score: Number(editingScore.score),
      score_date: editingScore.score_date,
    })
    .eq("id", editingScore.id);

  if (error) {
    console.error("Error updating score:", error.message);
    return;
  }

  setEditingScore(null);
  fetchScores();
};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Track your scores, draws and impact.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Subscription</p>
            <h2 className="text-xl font-semibold mt-2">
              Not Active
            </h2>
          </div>

          <CharitySelector />

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Scores Entered</p>
            <h2 className="text-xl font-semibold mt-2">
                {scores.length} / 5
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-gray-500">Total Winnings</p>
            <h2 className="text-xl font-semibold mt-2">
              £0
            </h2>
          </div>

        </div>

        <ScoreForm onScoreAdded={fetchScores} />

        {editingScore && (
  <div className="bg-white p-6 rounded-2xl shadow-sm mt-8">
    <h2 className="text-xl font-semibold mb-5">
      Edit Score
    </h2>

    <form
  onSubmit={handleUpdateScore}
  className="grid md:grid-cols-3 gap-4"
>
      <input
        type="number"
        min="1"
        max="45"
        value={editingScore.score}
        onChange={(e) =>
          setEditingScore({
            ...editingScore,
            score: e.target.value,
          })
        }
        className="border rounded-lg px-4 py-3"
      />

      <input
        type="date"
        value={editingScore.score_date}
        onChange={(e) =>
          setEditingScore({
            ...editingScore,
            score_date: e.target.value,
          })
        }
        className="border rounded-lg px-4 py-3"
      />

        <button
        type="submit"
        className="bg-black text-white rounded-lg px-5 py-3 font-medium"
        >
        Save Changes
        </button>
      <button
        type="button"
        onClick={() => setEditingScore(null)}
        className="border rounded-lg px-5 py-3 font-medium"
      >
        Cancel
      </button>
    </form>
  </div>
)}

        <div className="bg-white p-6 rounded-2xl shadow-sm mt-8">
  <h2 className="text-xl font-semibold mb-5">
    Your Recent Scores
  </h2>

  {scores.length === 0 ? (
    <p className="text-gray-500">
      No scores added yet.
    </p>
  ) : (
    <div className="space-y-3">
      {scores.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border rounded-lg p-4"
        >
          <div>
            <p className="font-semibold">
              Score: {item.score}
            </p>

            <p className="text-sm text-gray-500">
              {item.score_date}
            </p>
          </div>
         <div>
  <button
    onClick={() => setEditingScore(item)}
    className="text-blue-600 font-medium mr-4"
  >
    Edit
  </button>

  <button
    onClick={() => handleDeleteScore(item.id)}
    className="text-red-500 font-medium"
  >
    Delete
  </button>
</div>
        </div>
      ))}
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default Dashboard;