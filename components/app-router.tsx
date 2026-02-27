"use client";

import { useAppState } from "@/lib/store";
import { LandingPage } from "@/components/landing-page";
import { AuthScreen } from "@/components/auth-screen";
import { Dashboard } from "@/components/dashboard";
import { WorkoutFlow } from "@/components/workout-flow";
import { WorkoutComplete } from "@/components/workout-complete";
import { GroupScreen } from "@/components/group-screen";
import { PracticeFlow } from "@/components/practice-flow";
import { Dumbbell } from "lucide-react";

export function AppRouter() {
  const { currentView, isLoading } = useAppState();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25 animate-pulse">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="text-sm text-gray-500 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case "landing":
      return <LandingPage />;
    case "auth":
      return <AuthScreen />;
    case "dashboard":
      return <Dashboard />;
    case "workout":
      return <WorkoutFlow />;
    case "workout-complete":
      return <WorkoutComplete />;
    case "group":
      return <GroupScreen />;
    case "practice":
      return <PracticeFlow />;
    default:
      return <LandingPage />;
  }
}
