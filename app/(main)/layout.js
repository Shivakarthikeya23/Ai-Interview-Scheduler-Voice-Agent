import React from "react";
import DashboardProvider from "./provider";
import { redirect } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

function DashBoardLayout({ children }) {
  return (
    <div className="bg-secondary">
      <DashboardProvider>
        <div className="p-10">{children}</div>
      </DashboardProvider>
    </div>
  );
}

export default DashBoardLayout;