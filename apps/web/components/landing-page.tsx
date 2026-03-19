"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  Target,
  Users,
  ChevronRight,
  BookOpen,
  Zap,
  Star,
  Trophy,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Timer,
  GripVertical,
} from "lucide-react";
import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";

const drills = [
  {
    icon: BookOpen,
    title: "Fill the Blank",
    desc: "Memorize key verses with rapid-fire blanks.",
    accent: "var(--color-memorization)",
  },
  {
    icon: Target,
    title: "Context Check",
    desc: "Author, audience, era—answer in seconds.",
    accent: "var(--color-context)",
  },
  {
    icon: Zap,
    title: "Reference Match",
    desc: "Pair references with the right text fast.",
    accent: "var(--color-verse-match)",
  },
];

const stats = [
  { icon: Flame, value: "300", label: "Max Daily Points" },
  { icon: Target, value: "3", label: "Drills Per Day" },
  { icon: Trophy, value: "∞", label: "Streak Potential" },
  { icon: Sparkles, value: "Auto-Sync", label: "Cloud Sync Active" },
];

const categories = [
  "New Believers",
  "Small Groups",
  "Youth Ministry",
  "Personal Study",
  "Bible Scholars",
  "Sunday School",
  "Family Devotions",
  "Church Leaders",
  "Seminary Students",
  "Prayer Warriors",
];

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="text-foreground w-full bg-background pattern-ink-dots">
      {/* ===================== HERO ===================== */}
      <header className="relative py-20 md:py-32 overflow-hidden border-b-2 border-foreground bg-card">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-foreground bg-secondary text-[11px] font-black uppercase tracking-widest mb-8"
            style={{ boxShadow: "var(--shadow-brutal-press)" }}
          >
            <GripVertical className="w-4 h-4 text-primary" />
            Scripture Forge · Athletics For The Soul
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-8 animate-stamp">
            Study that feels playful, <br />
            <span className="text-primary italic">sticks</span> fast.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-12 leading-relaxed animate-in stagger-2">
            Word Mastery keeps the Neo‑Brutalist vibe—bold strokes, rounded
            cards, zero gradients—so the drills feel tangible and focused.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-in stagger-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-primary text-primary-foreground font-black text-xl border-2 border-foreground btn-brutal uppercase tracking-wider">
                  Start Training
                  <ArrowRight className="w-6 h-6" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-card text-foreground font-bold text-xl border-2 border-foreground btn-brutal">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center gap-3 px-12 py-5 rounded-xl bg-primary text-primary-foreground font-black text-xl border-2 border-foreground btn-brutal uppercase tracking-wider"
              >
                Enter Arena
                <Flame className="w-6 h-6" />
              </button>
            </Show>
          </div>

          {/* Floating drill preview cards */}
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto animate-slide-up stagger-4">
            {drills.map((drill) => (
              <div
                key={drill.title}
                className="rounded-2xl border-2 border-foreground p-6 w-full sm:w-64 text-left bg-card card-brutal transition-transform"
                style={{
                  borderBottomWidth: "6px",
                  borderBottomColor: drill.accent,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: drill.accent }}
                >
                  <drill.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {drill.title}
                </div>
                <p className="text-sm text-foreground font-bold leading-snug">
                  &ldquo;{drill.desc}&rdquo;
                </p>
              </div>
            ))}

            <div className="w-full mt-10 flex items-center justify-center gap-3 text-muted-foreground font-black uppercase tracking-widest text-[11px] bg-secondary/50 py-4 px-8 rounded-xl border-2 border-dashed border-foreground/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Sync Active — Your progress is saved as you train.</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== FEATURES (Dark section) ===================== */}
      <section className="bg-foreground py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              YOUR DAILY <br />
              <span className="text-primary italic">SPIRITUAL WORKOUT</span>
            </h2>
            <p className="text-primary-foreground/40 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Three focused drills designed to strengthen different aspects of
              your Scripture knowledge. Built for recall, not just reading.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {drills.map((drill) => (
              <div
                key={drill.title}
                className="group relative rounded-2xl border-2 border-white/20 bg-white/5 p-8 transition-all hover:bg-white/10"
                style={{ boxShadow: `4px 4px 0px 0px ${drill.accent}80` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl border-2 border-white/30 flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: drill.accent }}
                >
                  <drill.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                  {drill.title}
                </h3>
                <p className="text-primary-foreground/60 leading-relaxed font-medium">
                  {drill.desc} Repetitive training builds long-term spiritual
                  muscle memory.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="bg-background py-24 border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border-2 border-foreground p-8 text-center card-brutal"
              >
                <div
                  className="w-12 h-12 rounded-xl bg-secondary border-2 border-foreground flex items-center justify-center mx-auto mb-4"
                  style={{ boxShadow: "var(--shadow-brutal-press)" }}
                >
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-4xl font-black text-foreground mb-1 score-display tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== OCCASIONS ===================== */}
      <section className="bg-card py-24 md:py-32 border-b-2 border-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-8 tracking-tighter">
            WORKS FOR EVERY <br />
            <span className="text-primary italic">BELIEVER</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium mb-16 max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re a new believer or a seasoned student, Word
            Mastery adapts to your level through structured repetition.
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {categories.map((category) => (
              <div
                key={category}
                className="px-6 py-3 rounded-xl bg-background border-2 border-foreground text-sm font-black text-foreground hover:bg-primary hover:text-white transition-all cursor-default"
                style={{ boxShadow: "var(--shadow-brutal-sm)" }}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="bg-primary py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pattern-ink-dots opacity-10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-foreground flex items-center justify-center rotate-3 shadow-xl">
              <Heart className="w-12 h-12 text-primary fill-primary" />
            </div>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
            READY TO START <br />
            <span className="italic">YOUR TRAINING?</span>
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-12 max-w-xl mx-auto font-medium">
            Join Word Mastery today and build a consistent Scripture study
            habit. Your first workout is waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="inline-flex items-center gap-3 px-12 py-5 rounded-xl bg-foreground text-primary-foreground font-black text-2xl border-2 border-primary-foreground btn-brutal uppercase tracking-wider">
                  Begin Training
                  <ArrowRight className="w-7 h-7" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-3 px-12 py-5 rounded-xl bg-foreground text-primary-foreground font-black text-2xl border-2 border-primary-foreground btn-brutal uppercase tracking-wider"
              >
                Enter Arena
                <ArrowRight className="w-7 h-7" />
              </button>
            </Show>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="py-16 border-t-2 border-foreground bg-card">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              Word Mastery
            </span>
          </div>
          <div className="flex gap-10 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            <Link
              href="/about"
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            © 2026 Word Mastery. Training souls.
          </p>
        </div>
      </footer>
    </div>
  );
}
