import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false });

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) setState({ loading: false, user: null, isAdmin: false });
        return;
      }

      let isAdmin = false;
      if (adminOnly) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        isAdmin = data?.role === "admin";
      }

      if (active) setState({ loading: false, user: session.user, isAdmin });
    };

    checkAccess();
    return () => { active = false; };
  }, [adminOnly]);

  if (state.loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  if (!state.user) return <Navigate to="/login" replace />;
  if (adminOnly && !state.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
