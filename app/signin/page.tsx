"use client"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image";
import { useState } from "react";
export default function SignInPage(){
  
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsLoading(false);
  }
  return (
    <div>
      <h1>Signin to Chobi</h1>
      <button onClick={signInWithGoogle} disabled={isLoading} className="cursor-pointer">
        {isLoading ? (
          "Signing in..."
        ) : (
          <>
            <Image src="/google.svg" alt="Google" width={18} height={18} />
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
  
}