"use client"
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import AppSideBar, { AppSidebar } from "./_components/AppSideBar";
import WelcomeContainer from "./dashboard/_components/WelcomeContainer";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

function DashboardProvider({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // INITIAL_SESSION fires on every mount, including while a PKCE code
        // exchange from an OAuth redirect is still resolving - treating its
        // (temporarily null) session as a sign-out bounced people straight
        // back to /auth right after a successful Google login.
        if (event === 'INITIAL_SESSION') return;
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <WelcomeContainer />
        {children}
      </div>
    </SidebarProvider>
  );
}

export default DashboardProvider;