"use client";

import { useParams, useRouter } from "next/navigation";
import { MASTERY_PACKS } from "@/lib/mastery-data";
import { MasteryFlow } from "@/components/mastery/mastery-flow";
import { useMastery } from "@/lib/store";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { BiblePassage } from "@/lib/types";

export default function MasteryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { verseMastery } = useMastery();
  const [passage, setPassage] = useState<BiblePassage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const decodedId = decodeURIComponent(id as string);

    // 1. Check if it's already in our mastery store
    const existing = verseMastery[decodedId];
    if (existing) {
      setPassage(existing.passage);
      setLoading(false);
      return;
    }

    // 2. Look in preloaded packs
    for (const pack of MASTERY_PACKS) {
      const found = pack.verses.find((v) => v.reference === decodedId);
      if (found) {
        setPassage(found);
        setLoading(false);
        return;
      }
    }

    // 3. If not found, we might need to fetch it (not implemented for MVP/custom yet)
    // or just redirect back
    setLoading(false);
  }, [id, verseMastery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest">
          Initializing Session
        </p>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <h2 className="text-3xl font-black text-foreground">
          Passage Not Found
        </h2>
        <p className="text-muted-foreground font-medium">
          We couldn't find the verse you're looking for in our mastery library.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-8 py-3 rounded-xl bg-primary text-white font-bold border-2 border-foreground"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <MasteryFlow
        passage={passage}
        initialLevel={verseMastery[passage.reference]?.currentLevel || 1}
      />
    </div>
  );
}
