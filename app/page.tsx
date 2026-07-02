"use client";
import { useAuth } from "./components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/signin");
  }

  return (
    <div>
      <h1>Home</h1>
      {user ? <p>Signed in as {user.email}</p> : <p>Not signed in.</p>}
      <button onClick={handleSignOut} className="cursor-pointer">
        Sign out
      </button>
    </div>
  );
}
