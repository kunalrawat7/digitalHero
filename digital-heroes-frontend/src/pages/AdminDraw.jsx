import { useState } from "react";
import { supabase } from "../lib/supabase";

const AdminDraw = () => {
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [prizePool, setPrizePool] = useState(10000);
  const [loading, setLoading] = useState(false);

  const simulateDraw = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "generate_draw_numbers"
    );

    setLoading(false);

    if (error) {
      console.error("Draw error:", error.message);
      return;
    }

    setWinningNumbers(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Draw Management
        </h1>

        <p className="text-gray-500 mb-8">
          Simulate and manage the monthly prize draw.
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <label className="block font-medium mb-2">
            Prize Pool (£)
          </label>

          <input
            type="number"
            min="0"
            value={prizePool}
            onChange={(e) => setPrizePool(Number(e.target.value))}
            className="border rounded-lg px-4 py-3 mb-6 w-full"
          />

          <button
            onClick={simulateDraw}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            {loading ? "Generating..." : "Simulate Draw"}
          </button>

          {winningNumbers.length > 0 && (
            <div className="mt-8">

              <h2 className="text-lg font-semibold mb-4">
                Winning Numbers
              </h2>

              <div className="flex gap-3">
                {winningNumbers.map((number) => (
                  <div
                    key={number}
                    className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold"
                  >
                    {number}
                  </div>
                ))}
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">5 Match Pool</p>
                  <p className="text-xl font-bold">
                    £{(prizePool * 0.4).toFixed(2)}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">4 Match Pool</p>
                  <p className="text-xl font-bold">
                    £{(prizePool * 0.35).toFixed(2)}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <p className="text-gray-500">3 Match Pool</p>
                  <p className="text-xl font-bold">
                    £{(prizePool * 0.25).toFixed(2)}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDraw;