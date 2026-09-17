import { useState } from "react";
import { supabase } from "../lib/supabase";

const Subscribe = () => {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const checkout = async (plan) => {
    setLoading(plan); setError("");
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error: fnError } = await supabase.functions.invoke("create-checkout", { body: { plan }, headers: { Authorization: `Bearer ${session.access_token}` } });
    if (fnError || !data?.url) { setError(fnError?.message || "Checkout could not be started."); setLoading(""); return; }
    window.location.href = data.url;
  };
  return <main className="min-h-screen bg-slate-50 p-6 grid place-items-center"><div className="max-w-4xl w-full"><h1 className="text-4xl font-black text-center">Choose your membership</h1><p className="text-slate-500 text-center mt-3">Every plan includes monthly draw access and a minimum 10% charity contribution.</p><div className="grid md:grid-cols-2 gap-6 mt-10">{[["monthly","Monthly","£9.99","Flexible monthly membership"],["yearly","Yearly","£99","Two months equivalent saved"]].map(([id,title,price,copy])=><div key={id} className="bg-white border rounded-3xl p-8"><h2 className="text-2xl font-bold">{title}</h2><p className="text-4xl font-black mt-5">{price}</p><p className="text-slate-500 mt-2">{copy}</p><button onClick={()=>checkout(id)} disabled={!!loading} className="w-full bg-emerald-700 text-white rounded-xl py-3 mt-8 font-semibold">{loading===id?"Opening checkout...":"Subscribe"}</button></div>)}</div>{error&&<p className="text-red-600 text-center mt-5">{error}</p>}</div></main>;
};
export default Subscribe;
