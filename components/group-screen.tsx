"use client";

import { useState } from "react";
import {
  useAppState,
  useAppDispatch,
  useGroups,
  useWorkout,
} from "@/lib/store";
import { generateThemedWorkout } from "@/app/actions/generate-drills";
import {
  Users,
  Trophy,
  Flame,
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Crown,
  Medal,
  Sparkles,
  Play,
  Loader2,
} from "lucide-react";

export function GroupScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { groupMembers, userGroup, createGroup, joinGroup, setGroupChallenge } =
    useGroups();
  const [tab, setTab] = useState<"leaderboard" | "join" | "create">(
    userGroup ? "leaderboard" : "join",
  );
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [theme, setTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { startGroupChallenge } = useWorkout();

  const user = state.user;
  if (!user) return null;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      createGroup(groupName);
      setTab("leaderboard");
    }
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    if (inviteCode.trim()) {
      const success = joinGroup(inviteCode.trim().toUpperCase());
      if (success) {
        setTab("leaderboard");
      } else {
        setJoinError("Invalid invite code. Please try again.");
      }
    }
  };

  const handleCopyCode = () => {
    if (userGroup) {
      navigator.clipboard.writeText(userGroup.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const challenge = await generateThemedWorkout(theme.trim());
      setGroupChallenge(challenge);
      setTheme("");
    } catch (error) {
      console.error("Failed to generate challenge:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-bold text-gray-500 w-5 text-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                dispatch({ type: "SET_VIEW", payload: "dashboard" })
              }
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <h1 className="text-lg font-bold text-white">Training Groups</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/5">
          {userGroup && (
            <button
              onClick={() => setTab("leaderboard")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === "leaderboard"
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Leaderboard
            </button>
          )}
          <button
            onClick={() => setTab("join")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === "join"
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Join Group
          </button>
          <button
            onClick={() => setTab("create")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              tab === "create"
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Create Group
          </button>
        </div>

        {/* Tab Content */}
        {tab === "leaderboard" && userGroup && (
          <div className="space-y-6">
            {/* Group Info */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-transparent border border-violet-500/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {userGroup.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {userGroup.members.length + 5} members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">
                    {userGroup.inviteCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Group Challenge Section */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border border-blue-500/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">
                      AI Group Challenge
                    </h3>
                    <p className="text-sm text-gray-400">
                      Collaborative themed workout
                    </p>
                  </div>
                </div>
              </div>

              {userGroup.groupChallenge ? (
                <div className="bg-black/20 rounded-xl border border-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        Theme:{" "}
                        <span className="text-blue-400">
                          "{userGroup.groupChallenge.theme}"
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500">
                        Active challenge for all members
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        startGroupChallenge(userGroup.groupChallenge!)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateChallenge} className="flex gap-2">
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Enter a theme (e.g., Faith, Forgiveness)"
                    disabled={isGenerating}
                    className="flex-1 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!theme.trim() || isGenerating}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Weekly Ranking
              </h3>
              {groupMembers.map((member, index) => {
                const isCurrentUser = member.userId === user.id;

                return (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      isCurrentUser
                        ? "border-orange-500/20 bg-orange-500/5"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center text-sm font-bold text-orange-300">
                      {member.avatarInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {member.streak}d
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">
                          {member.weeklyScore.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "join" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Join a Training Group
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter an invite code from your group leader to join their
                training team.
              </p>

              <form onSubmit={handleJoinGroup} className="space-y-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="INVITE CODE"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all uppercase"
                />
                {joinError && (
                  <p className="text-red-400 text-sm">{joinError}</p>
                )}
                <button
                  type="submit"
                  disabled={inviteCode.length < 4}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                    inviteCode.length < 4
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01]"
                  }`}
                >
                  Join Group
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === "create" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Create a Training Group
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Start a group for your church, fellowship, or study circle.
                Invite members with your unique code.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name (e.g., Faith Warriors)"
                  className="w-full px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-base"
                />
                <button
                  type="submit"
                  disabled={!groupName.trim()}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                    !groupName.trim()
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01]"
                  }`}
                >
                  Create Group
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
