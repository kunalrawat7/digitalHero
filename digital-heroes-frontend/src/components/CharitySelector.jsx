import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CharitySelector = () => {
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [percentage, setPercentage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get available charities
      const { data: charityData, error: charityError } =
        await supabase.from("charities").select("*");

      if (charityError) {
        console.error("Error loading charities:", charityError.message);
        return;
      }

      setCharities(charityData);

      // Get user's existing selection
      const { data: selection } = await supabase
        .from("user_charities")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (selection) {
        setSelectedCharity(selection.charity_id);
        setPercentage(selection.contribution_percentage);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !selectedCharity) return;

    const { error } = await supabase
      .from("user_charities")
      .upsert(
        {
          user_id: user.id,
          charity_id: selectedCharity,
          contribution_percentage: Number(percentage),
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      console.error("Error saving charity:", error.message);
      return;
    }

    console.log("Charity saved successfully");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-2">Support a Charity</h2>

      <p className="text-gray-500 mb-5">
        Choose a charity and your contribution percentage.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <select
          value={selectedCharity}
          onChange={(e) => setSelectedCharity(e.target.value)}
          className="border rounded-lg px-4 py-3"
          required
        >
          <option value="">Select a charity</option>

          {charities.map((charity) => (
            <option key={charity.id} value={charity.id}>
              {charity.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="10"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          className="border rounded-lg px-4 py-3"
        />

        <button
          onClick={handleSave}
          className="bg-black text-white rounded-lg px-5 py-3 font-medium"
        >
          Save Charity
        </button>
      </div>
    </div>
  );
};

export default CharitySelector;