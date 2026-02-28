"use client";

import { useRouter } from "next/navigation";
import {
  Flame,
  Target,
  Users,
  ChevronRight,
  Dumbbell,
  BookOpen,
  Zap,
  Star,
  Trophy,
  Heart,
  Sparkles,
} from "lucide-react";

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="text-foreground w-full">
      {/* ===================== HERO ===================== */}
      <header className="bg-background py-20 md:py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--primary)] leading-[1.05] tracking-tight mb-6 ">
            Train Your Spirit.
          </h1>
          <p className="text-lg md:text-xl text-foreground font-medium max-w-2xl mx-auto mb-10">
            Structured daily workouts to build <strong>Bible knowledge</strong>,
            deepen understanding, and grow your faith — one drill at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push("/auth")}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-lg border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
            >
              Start Training
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-card text-foreground font-bold text-lg border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
            >
              See How It Works
            </button>
          </div>

          {/* Floating drill preview cards */}
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {[
              {
                icon: BookOpen,
                text: "Fill in the missing words...",
                label: "Memorization",
                color: "#3B82F6",
              },
              {
                icon: Target,
                text: "Who wrote this passage?",
                label: "Context Challenge",
                color: "#F59E0B",
              },
              {
                icon: Zap,
                text: "Match verse to reference",
                label: "Verse Match",
                color: "#10B981",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-card rounded-2xl border-2 border-foreground p-5 w-56 text-left hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 cursor-default"
                style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-foreground flex items-center justify-center mb-3"
                  style={{ backgroundColor: card.color }}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">
                  {card.label}
                </div>
                <p className="text-sm text-muted-foreground ">
                  &ldquo;{card.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ===================== FEATURES (Dark section) ===================== */}
      <section className="bg-foreground py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 ">
              Your Daily Spiritual Workout
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three focused drills designed to strengthen different aspects of
              your Scripture knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Memorization Drill",
                desc: "Fill in missing words from key Bible passages. Build muscle memory for Scripture.",
                color: "#3B82F6",
              },
              {
                icon: Target,
                title: "Context Challenge",
                desc: "Answer questions about passage context, authorship, and historical background.",
                color: "#F59E0B",
              },
              {
                icon: Zap,
                title: "Verse Match",
                desc: "Match Bible references with their correct verse text. Test your recall.",
                color: "#10B981",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border-2 border-white/20 bg-card/5 p-8 hover:bg-card/10 hover:translate-y-[-4px] transition-all duration-300"
                style={{ boxShadow: "4px 4px 0px 0px rgba(233, 77, 118, 0.5)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl border-2 border-white/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SOCIAL PROOF (Pink section) ===================== */}
      <section className="bg-primary py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 text-center ">
            Used And Loved By
          </h2>
          <p className="text-white/80 text-lg text-center mb-12 max-w-xl mx-auto">
            Bible Gym is trusted by believers everywhere to build consistent
            Scripture study habits.
          </p>

          <div className="flex overflow-x-auto gap-5 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {[
              {
                text: "This app makes Scripture study feel like a workout — in the best way!",
                name: "Sarah K.",
              },
              {
                text: "My Bible knowledge has dramatically improved since starting.",
                name: "Marcus J.",
              },
              {
                text: "Love the gamified approach. Keeps me coming back daily!",
                name: "Rachel T.",
              },
              {
                text: "Our small group uses this together. Friendly competition helps!",
                name: "David M.",
              },
              {
                text: "The verse match drill is addictive. I've memorized so many verses.",
                name: "Emily W.",
              },
              {
                text: "Simple, beautiful, and effective. 10/10 from me!",
                name: "Joshua L.",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="shrink-0 w-72 snap-start bg-card rounded-2xl border-2 border-foreground p-6 hover:translate-y-[-4px] transition-all duration-200"
                style={{ boxShadow: "4px 4px 0px 0px var(--primary)" }}
              >
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-5 h-5 fill-[var(--foreground)] text-foreground"
                    />
                  ))}
                </div>
                <p className="text-foreground font-medium text-sm mb-4 leading-relaxed">
                  {testimonial.text}
                </p>
                <p className="text-muted-foreground text-sm font-bold">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="bg-foreground py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Flame, value: "300", label: "Max Daily Points" },
              { icon: Target, value: "3", label: "Drills Per Day" },
              { icon: Trophy, value: "∞", label: "Streak Potential" },
              { icon: Users, value: "Groups", label: "Team Training" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border-2 border-foreground p-6 text-center hover:translate-y-[-4px] transition-all duration-200"
                style={{ boxShadow: "4px 4px 0px 0px var(--primary)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center mx-auto mb-3"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== OCCASIONS / DRILL TYPES ===================== */}
      <section className="bg-background py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 text-center ">
            Works For Every Believer
          </h2>
          <p className="text-muted-foreground text-lg text-center mb-12 max-w-xl mx-auto">
            Whether you&apos;re a new believer or a seasoned student, Bible Gym
            adapts to your level.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {[
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
            ].map((category) => (
              <div
                key={category}
                className="px-5 py-2.5 rounded-full bg-card border-2 border-foreground text-sm font-bold text-foreground hover:bg-primary hover:text-white hover:translate-y-[-2px] transition-all duration-200 cursor-default"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="bg-primary py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 ">
            Ready To Start Your Training?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join Bible Gym and build a consistent Scripture study habit. Your
            daily workout is waiting.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-card text-foreground font-bold text-lg border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            Begin Training
            <Dumbbell className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
