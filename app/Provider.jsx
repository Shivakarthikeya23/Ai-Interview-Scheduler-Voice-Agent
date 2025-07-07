"use client";
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "@/services/supabaseClient";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    CreateNewUser();
  }, []);

  const CreateNewUser = async () => {
    setIsLoading(true);
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.log("No authenticated user or error:", authError?.message);
      setIsLoading(false);
      return;
    }

    const { data: existingUsers, error: selectError } = await supabase
      .from("Users")
      .select("*")
      .eq("email", authUser.email);

    console.log("Existing Users:", existingUsers);

    if (selectError) {
      console.error("Error checking for existing user:", selectError.message);
      setIsLoading(false);
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
        .select(); // important to return the inserted user

      if (insertError) {
        console.error("Error creating user:", insertError.message);
        setIsLoading(false);
        return;
      }

      console.log("User created:", newUser?.[0]);
      setUser(newUser?.[0]);
    } else {
      setUser(existingUsers[0]);
    }
    setIsLoading(false);
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (isLoading) {
    return (
      <UserDetailContext.Provider value={{ user: null, setUser }}>
        {children}
      </UserDetailContext.Provider>
    );
  }

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;

// ✅ Custom hook (fix: import useContext!)
export const useUser = () => {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error("useUser must be used within a Provider");
  }
  return context;
};
