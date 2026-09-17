import { Link } from "react-router-dom";
import { Heart, Trophy, Target, ArrowRight } from "lucide-react";

const Home = () => (
  <main className="min-h-screen bg-[#f6f7f2] text-slate-950">
    <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <Link to="/" className="text-xl font-black tracking-tight">DIGITAL HEROES</Link>
      <div className="flex gap-3"><Link to="/login" className="px-4 py-2">Log in</Link><Link to="/signup" className="bg-slate-950 text-white px-5 py-2 rounded-full">Join the draw</Link></div>
    </nav>
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
      <div><p className="uppercase tracking-[.25em] text-sm font-semibold text-emerald-700 mb-5">Play • Win • Give back</p><h1 className="text-5xl md:text-7xl font-black leading-[.95]">Your scores can do more.</h1><p className="text-lg text-slate-600 mt-7 max-w-xl">Record your latest Stableford scores, enter the monthly prize draw and direct part of your membership to a cause you care about.</p><div className="flex gap-3 mt-8"><Link to="/signup" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold">Become a hero <ArrowRight size={18}/></Link><Link to="/login" className="px-6 py-3 rounded-full border border-slate-300 font-semibold">Member login</Link></div></div>
      <div className="bg-slate-950 text-white rounded-[2rem] p-8 md:p-10 shadow-xl"><Heart className="text-emerald-400 mb-10" size={38}/><p className="text-slate-400">Monthly impact</p><p className="text-4xl font-bold mt-2">At least 10%</p><p className="text-slate-300 mt-3">of every member's subscription is directed to their chosen charity.</p><div className="grid grid-cols-2 gap-3 mt-10"><div className="bg-white/10 p-4 rounded-2xl"><Trophy className="mb-3"/><b>Monthly prizes</b></div><div className="bg-white/10 p-4 rounded-2xl"><Target className="mb-3"/><b>Your latest 5</b></div></div></div>
    </section>
  </main>
);
export default Home;
