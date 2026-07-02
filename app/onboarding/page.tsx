"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("");
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [links, setLinks] = useState([{ platform: "Link", url: "" }]);

  const [submitting, setSubmitting] = useState(false);

  async function handleNext() {
    if (username.length <= 3) {
      setUsernameError("Username must be more than 3 characters.");
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (data) {
      setUsernameError("Username is taken.");
      return;
    }
    setUsernameError("");
    setStep(2);
  }

  async function handleComplete() {
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let pictureUrl = "";
    if (pictureFile) {
      const path = `${user.id}/${Date.now()}-${pictureFile.name}`;
      await supabase.storage.from("avatars").upload(path, pictureFile);
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      pictureUrl = data.publicUrl;
    }

    await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName,
        about,
        display_picture_url: pictureUrl,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    const validLinks = links.filter((l) => l.url);
    if (validLinks.length > 0) {
      await supabase.from("social_links").insert(
        validLinks.map((l) => ({
          profile_id: user.id,
          platform: l.platform,
          url: l.url,
        }))
      );
    }

    router.push("/dashboard");
  }

  if (step === 1) {
    return (
      <div>
        <h1>Choose a username</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        {usernameError && <p>{usernameError}</p>}
        <button onClick={handleNext}>Next</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Set up your profile</h1>
      <input
        placeholder="Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <textarea
        placeholder="About"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setPictureFile(e.target.files?.[0] ?? null)}
      />

      {links.map((link, i) => (
        <div key={i}>
          <select
            value={link.platform}
            onChange={(e) => {
              const copy = [...links];
              copy[i].platform = e.target.value;
              setLinks(copy);
            }}
          >
            <option>Social Link</option>
            <option>Instagram</option>
            <option>X</option>
            <option>TikTok</option>
            <option>YouTube</option>
          </select>
          <input
            placeholder="URL"
            value={link.url}
            onChange={(e) => {
              const copy = [...links];
              copy[i].url = e.target.value;
              setLinks(copy);
            }}
          />
        </div>
      ))}
      <button
        onClick={() => setLinks([...links, { platform: "Link", url: "" }])}
      >
        + Add link
      </button>

      <button onClick={handleComplete} disabled={submitting}>
        {submitting ? "Saving..." : "Complete Profile"}
      </button>
    </div>
  );
}
