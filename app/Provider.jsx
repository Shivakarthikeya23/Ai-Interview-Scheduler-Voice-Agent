"use client";
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "@/services/supabaseClient";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    CreateNewUser();
  }, []);

  const CreateNewUser = async () => {
    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session?.user) {
        console.log("No authenticated user or error:", authError?.message);
        return;
      }

      const authUser = session.user;

      const { data: existingUsers, error: selectError } = await supabase
        .from("Users")
        .select("*")
        .eq("email", authUser.email);

      if (selectError) {
        console.error("Error checking for existing user:", selectError.message);
        return;
      }

      if (!existingUsers || existingUsers.length === 0) {
        const { data: newUser, error: insertError } = await supabase
          .from("Users")
          .insert([
            {
              email: authUser.email,
              name: authUser.user_metadata?.name,
              picture: authUser.user_metadata?.picture,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (insertError) {
          console.error("Error creating user:", insertError.message);
          return;
        }

        console.log("User created:", newUser?.[0]);
        setUser(newUser?.[0]);
      } else {
        setUser(existingUsers[0]);
      }
    } catch (error) {
      console.error("Error in CreateNewUser:", error);
    }
  };

  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUser = () => {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error("useUser must be used within a Provider");
  }
  return context;
};