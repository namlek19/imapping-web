"use client";

import { useState, useEffect } from "react";
import GuestHero from "@/components/guest-hero";
import type { MatchedLocation } from "@/components/member-view";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [matches, setMatches] = useState<MatchedLocation[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!token);

    if (token && userId) {
      setLoadingMatches(true);
      fetch(`/api/v1/locations/match/${userId}`)
        .then((r) => r.json())
        .then((body) => {
          if (body.status === 200 && Array.isArray(body.data)) {
            setMatches(body.data);
            localStorage.setItem("aiMatchCache", JSON.stringify(body.data));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingMatches(false));
    }
  }, []);

  return <GuestHero isLoggedIn={isLoggedIn} matches={matches} loadingMatches={loadingMatches} />;
}
