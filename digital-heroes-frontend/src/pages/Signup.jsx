import { useState } from "react";
import { supabase } from "../lib/supabase";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
        data: {
            full_name: formData.fullName,
        },
        },
    });

    if (error) {
        console.error("Signup error:", error.message);
        return;
    }

    console.log("Signup successful:", data);
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Create account</h1>

        <p className="text-gray-500 mb-8">
          Join Digital Heroes and make every score count.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-medium">Full name</label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;