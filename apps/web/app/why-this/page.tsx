"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Dumbbell,
  Heart,
  Star,
  Sparkles,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";

export default function WhyThisPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 mb-12 text-muted-foreground hover:text-primary transition-colors font-bold group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Gym
        </button>

        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-primary leading-tight tracking-tight">
              Why I Built This.
            </h1>
            <p className="text-xl md:text-2xl font-bold text-foreground/80 leading-relaxed italic">
              "Train yourself to be godly. Physical training is good, but
              training for godliness is much better, promising benefits in this
              life and the life to come." — 1 Timothy 4:7-8
            </p>
          </header>

          <section className="space-y-6 text-lg md:text-xl leading-relaxed font-medium">
            <p>
              Yo! I&apos;m the one behind Word Mastery. I built this because I
              realized something convicting: I was spending more time tracking
              my bench press and my daily steps than I was tracking my spiritual
              growth. This{" "}
              <a
                href="https://dev.to/devteam/happening-now-dev-weekend-challenge-submissions-due-march-2-at-759am-utc-5fg8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                Dev.to hackathon
              </a>{" "}
              was a great opportunity to build a tool that would help me track
              my spiritual growth.
            </p>
            <p>
              I love the gym. I love the progress, the discipline, and the
              feeling of getting stronger. But I noticed my &quot;spiritual
              muscles&quot; were getting weak. I could recite movie quotes all
              day, but I struggled to recall a single verse when a friend needed
              encouragement or when I was facing a hard day.
            </p>
            <p>
              Word Mastery is my way of taking that same high-intensity,
              structured approach to the Word of God. It&apos;s not just about
              reading; it&apos;s about <strong>training</strong>.
            </p>
          </section>

          <section className="space-y-8 bg-card border-4 border-foreground p-8 rounded-3xl shadow-[8px_8px_0px_0px_var(--primary)]">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-primary" />
              How I Train
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1">
                    Active Memory (Memorization Drill)
                  </h3>
                  <p className="text-muted-foreground">
                    I use the clozed-deletion method (filling in the blanks). It
                    forces my brain to actually <em>retrieve</em> the word, not
                    just recognize it. That's where the real strengthening
                    happens.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-500 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1">
                    Contextual Roots (Context Challenge)
                  </h3>
                  <p className="text-muted-foreground">
                    I don&apos;t just want to memorize &quot;safe&quot;
                    sentences. I want to know who wrote them, who they were
                    talking to, and <em>why</em>. Understanding context is like
                    proper form in the gym—it prevents you from getting hurt (or
                    misinterpreting God&apos;s Word).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1">
                    Rapid Recall (Verse Match)
                  </h3>
                  <p className="text-muted-foreground">
                    This is my &quot;HIIT&quot; training. Matching references to
                    text at speed builds that quick-twitch recall so I can find
                    the right Word for the right moment instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-500 flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1">
                    Progressive Overload (Mastery Levels)
                  </h3>
                  <p className="text-muted-foreground">
                    Just like adding weight to the bar, I push my verses through
                    5 levels of difficulty. By the time a verse is
                    &quot;Mastered,&quot; it is etched into my heart forever.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 text-lg md:text-xl leading-relaxed font-medium pb-20">
            <p>
              My hope is that this app helps you stop being a &quot;spiritual
              spectator&quot; and starts your journey as a &quot;spiritual
              athlete.&quot; The Word is alive, it is powerful, and it is the
              best pre-workout for your soul.
            </p>
            <div className="pt-8 flex flex-col items-center text-center">
              <Heart className="w-12 h-12 text-primary fill-primary mb-4 animate-pulse" />
              <p className="font-black text-2xl">
                Keep Training. Grow in Grace.
              </p>
              <p className="text-muted-foreground font-bold mt-2">— Obed</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
