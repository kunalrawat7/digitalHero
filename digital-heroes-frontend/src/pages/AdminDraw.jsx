import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { countMatches, calculatePrizePerWinner } from "../utils/drawEngine";

const AdminDraw = () => {
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [prizePool, setPrizePool] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [draws, setDraws] = useState([]);

  const loadDraws = async () => {
    const { data } = await supabase.from("draws").select("*").order("draw_date", { ascending: false }).limit(12);
    setDraws(data || []);
  };
  useEffect(() => { loadDraws(); }, []);

  const simulateDraw = async () => {
    setLoading(true); setMessage("");
    const { data, error } = await supabase.rpc("generate_draw_numbers");
    setLoading(false);
    if (error) return setMessage(error.message);
    setWinningNumbers(data || []);
  };

  const publishDraw = async () => {
    if (winningNumbers.length !== 5 || prizePool <= 0) return;
    setLoading(true); setMessage("");
    try {
      const drawDate = new Date().toISOString().slice(0, 10);
      const { data: draw, error: drawError } = await supabase.from("draws").insert({ draw_date: drawDate, draw_type: "random", winning_numbers: winningNumbers, prize_pool: prizePool, status: "published", published_at: new Date().toISOString() }).select().single();
      if (drawError) throw drawError;

      const { data: subs, error: subError } = await supabase.from("subscriptions").select("user_id").in("status", ["active", "trialing"]);
      if (subError) throw subError;
      const results = [];
      for (const sub of subs || []) {
        const { data: scores } = await supabase.from("scores").select("score").eq("user_id", sub.user_id).order("score_date", { ascending: false }).limit(5);
        const numbers = (scores || []).map((s) => s.score);
        if (numbers.length === 5) results.push({ userId: sub.user_id, numbers, matches: countMatches(numbers, winningNumbers) });
      }
      if (results.length) {
        const { error } = await supabase.from("draw_entries").insert(results.map((r) => ({ draw_id: draw.id, user_id: r.userId, numbers: r.numbers })));
        if (error) throw error;
      }
      for (const tier of [5, 4, 3]) {
        const tierWinners = results.filter((r) => r.matches === tier);
        if (!tierWinners.length) continue;
        const prize = calculatePrizePerWinner(prizePool, tier, tierWinners.length);
        const { error } = await supabase.from("winners").insert(tierWinners.map((r) => ({ draw_id: draw.id, user_id: r.userId, match_count: tier, prize_amount: prize, verification_status: "pending", payment_status: "pending" })));
        if (error) throw error;
      }
      const fiveWinners = results.filter((r) => r.matches === 5).length;
      if (!fiveWinners) await supabase.from("draws").update({ jackpot_rollover: prizePool * 0.4 }).eq("id", draw.id);
      setMessage(`Draw published for ${results.length} eligible participant${results.length === 1 ? "" : "s"}.`);
      setWinningNumbers([]); loadDraws();
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-slate-50 p-6 md:p-10"><div className="max-w-5xl mx-auto"><h1 className="text-3xl font-black">Draw Management</h1><p className="text-slate-500 mt-2 mb-8">Simulate the monthly draw before publishing it.</p><div className="bg-white rounded-3xl border p-6 md:p-8"><label className="font-semibold">Prize Pool (£)</label><input type="number" min="1" value={prizePool} onChange={(e)=>setPrizePool(Number(e.target.value))} className="block border rounded-xl px-4 py-3 mt-2 mb-5 w-full"/><div className="flex gap-3"><button onClick={simulateDraw} disabled={loading} className="bg-slate-950 text-white px-5 py-3 rounded-xl">{loading ? "Working..." : "Simulate Draw"}</button>{winningNumbers.length===5 && <button onClick={publishDraw} disabled={loading} className="bg-emerald-700 text-white px-5 py-3 rounded-xl">Publish Draw</button>}</div>{message && <p className="mt-4 text-sm">{message}</p>}{winningNumbers.length>0 && <><div className="flex flex-wrap gap-3 mt-8">{winningNumbers.map(n=><div key={n} className="w-12 h-12 rounded-full bg-slate-950 text-white grid place-items-center font-bold">{n}</div>)}</div><div className="grid md:grid-cols-3 gap-4 mt-8">{[["5 Match",.4],["4 Match",.35],["3 Match",.25]].map(([label,p])=><div key={label} className="border rounded-2xl p-4"><p className="text-slate-500">{label} Pool</p><b className="text-xl">£{(prizePool*p).toFixed(2)}</b></div>)}</div></>}</div><div className="bg-white rounded-3xl border p-6 mt-6"><h2 className="font-bold text-xl mb-4">Published draws</h2>{draws.length===0?<p className="text-slate-500">No draws published yet.</p>:draws.map(d=><div key={d.id} className="border-t py-4 flex justify-between gap-4"><span>{d.draw_date}</span><span className="font-semibold">{(d.winning_numbers||[]).join(" • ")}</span><span>£{Number(d.prize_pool).toFixed(2)}</span></div>)}</div></div></div>;
};
export default AdminDraw;
