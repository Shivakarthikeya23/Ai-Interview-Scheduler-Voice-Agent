import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://muqeuejofkmoukdeegie.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cWV1ZWpvZmttb3VrZGVlZ2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzIyMjIsImV4cCI6MjA2MDM0ODIyMn0.pJ1bX00OEwxvQ4MLeLcBlZDAM4lBgal0Zw5HqnOlyQk";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
