"use client";

import { useState, useEffect } from "react";
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
  Play,
  Sparkles,
  Loader2,
  Key,
} from "lucide-react";

export function GroupScreen() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const {
    groupMembers,
    userGroup,
    createGroup,
    joinGroup,
    setGroupChallenge,
    deleteGroupChallenge,
  } = useGroups();
  const [tab, setTab] = useState<"leaderboard" | "join" | "create">(
    userGroup || state.user?.groupId ? "leaderboard" : "join",
  );

  // Sync tab if userGroup or groupId becomes available after initial mount
  useEffect(() => {
    if ((userGroup || state.user?.groupId) && tab !== "leaderboard") {
      setTab("leaderboard");
    }
  }, [userGroup, state.user?.groupId, tab]);

  useEffect(() => {
    dispatch({ type: "SET_VIEW", payload: "group" });
  }, [dispatch]);

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [theme, setTheme] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      try {
        // Obfuscate by decoding from Base64
        setUserApiKey(atob(savedKey));
      } catch (e) {
        // Fallback for non-encoded legacy keys
        setUserApiKey(savedKey);
      }
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    // Securely store by encoding to Base64 (obfuscation)
    localStorage.setItem("gemini_api_key", btoa(key));
  };

  const { startGroupChallenge } = useWorkout();

  const user = state.user;
  if (!user) return null;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && !isCreating) {
      setIsCreating(true);
      const success = await createGroup(groupName);
      setIsCreating(false);
      if (success) {
        setTab("leaderboard");
      }
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    if (inviteCode.trim() && !isJoining) {
      setIsJoining(true);
      const success = await joinGroup(inviteCode.trim().toUpperCase());
      setIsJoining(false);
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

    if (!userApiKey.trim()) {
      alert("Please provide your Gemini API Key first.");
      return;
    }

    setIsGenerating(true);
    try {
      const challenge = await generateThemedWorkout(theme.trim(), userApiKey);
      await setGroupChallenge(challenge);
      setTheme("");
    } catch (error) {
      console.error("Failed to generate challenge:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate challenge",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-[#F59E0B]" />;
    if (index === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (index === 2) return <Medal className="w-5 h-5 text-[#B45309]" />;
    return (
      <span className="text-sm font-black text-muted-foreground w-5 text-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="w-full">
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Tabs */}
        <div
          className="flex gap-2 p-1.5 rounded-2xl bg-card border-2 border-foreground"
          style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
        >
          {userGroup ? (
            <div
              className="flex-1 py-3 bg-primary text-white border-2 border-foreground rounded-xl text-center text-sm font-bold"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              My Group Leaderboard
            </div>
          ) : (
            <>
              <button
                onClick={() => setTab("join")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  tab === "join"
                    ? "bg-primary text-white border-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
                style={
                  tab === "join"
                    ? { boxShadow: "2px 2px 0px 0px var(--foreground)" }
                    : {}
                }
              >
                Join Group
              </button>
              <button
                onClick={() => setTab("create")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  tab === "create"
                    ? "bg-primary text-white border-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
                style={
                  tab === "create"
                    ? { boxShadow: "2px 2px 0px 0px var(--foreground)" }
                    : {}
                }
              >
                Create Group
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        {tab === "leaderboard" && !userGroup && user.groupId && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-bold text-muted-foreground">
              Loading group data...
            </p>
          </div>
        )}

        {tab === "leaderboard" && userGroup && (
          <div className="space-y-6">
            {/* Group Info */}
            <div
              className="rounded-2xl bg-card border-2 border-foreground p-6"
              style={{ boxShadow: "4px 4px 0px 0px #8B5CF6" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-foreground ">
                    {userGroup.name}
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">
                    {userGroup.members.length + 5} members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground font-mono font-bold bg-background px-3 py-1.5 rounded-lg border-2 border-foreground">
                    {userGroup.inviteCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="w-8 h-8 rounded-lg bg-card border-2 border-foreground flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all"
                    style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {userGroup.groupChallenge && (
              <div
                className="rounded-2xl bg-card border-2 border-foreground p-6"
                style={{ boxShadow: "4px 4px 0px 0px #3B82F6" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-[#3B82F6] border-2 border-foreground flex items-center justify-center"
                      style={{
                        boxShadow: "2px 2px 0px 0px var(--foreground)",
                      }}
                    >
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground leading-tight">
                        Active Group Challenge
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Collaborative themed workout
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl bg-background border-2 border-foreground p-4"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground mb-1">
                        Theme:{" "}
                        <span className="text-[#3B82F6] ">
                          &ldquo;{userGroup.groupChallenge.theme}&rdquo;
                        </span>
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        {userGroup.challengeParticipants?.includes(user.id)
                          ? userGroup.challengeParticipants.length >=
                            userGroup.members.length
                            ? "Everyone finished! Available again."
                            : "You've completed this challenge."
                          : "Active challenge for all members"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.id === userGroup.createdBy && (
                        <button
                          onClick={deleteGroupChallenge}
                          className="px-3 py-2 text-xs font-bold text-white bg-red-500 rounded-lg transition-colors border-2 border-foreground hover:bg-red-600"
                          style={{
                            boxShadow: "2px 2px 0px 0px var(--foreground)",
                          }}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() =>
                          startGroupChallenge(userGroup.groupChallenge!)
                        }
                        disabled={
                          userGroup.challengeParticipants?.includes(user.id) &&
                          (userGroup.challengeParticipants?.length || 0) <
                            userGroup.members.length
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors border-2 border-foreground"
                        style={{
                          boxShadow: "2px 2px 0px 0px var(--foreground)",
                        }}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {userGroup.challengeParticipants?.includes(user.id) &&
                        (userGroup.challengeParticipants?.length || 0) <
                          userGroup.members.length + 5
                          ? "Done"
                          : "Start"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!userGroup.groupChallenge && user.id === userGroup.createdBy && (
              <div
                className="rounded-2xl bg-card border-2 border-foreground p-6"
                style={{ boxShadow: "4px 4px 0px 0px #3B82F6" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-[#3B82F6] border-2 border-foreground flex items-center justify-center"
                      style={{
                        boxShadow: "2px 2px 0px 0px var(--foreground)",
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground leading-tight">
                        Set Group Challenge
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generate an AI workout for the whole group
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="password"
                      value={userApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      placeholder="Your Gemini API Key"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-colors font-medium text-sm"
                    />
                  </div>

                  <form
                    onSubmit={handleGenerateChallenge}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Theme (e.g., Gratitude, Faith)"
                      disabled={isGenerating}
                      className="flex-1 px-4 py-3 rounded-xl bg-background border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-colors font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!theme.trim() || isGenerating}
                      className="px-6 py-3 bg-[#3B82F6] text-white font-bold rounded-xl border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        boxShadow:
                          !theme.trim() || isGenerating
                            ? "none"
                            : "4px 4px 0px 0px var(--foreground)",
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-[10px] text-muted-foreground text-center font-bold">
                    * Your API key is stored locally on this device and used
                    only for these requests.
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Weekly Ranking
              </h3>
              {groupMembers.map((member, index) => {
                const isCurrentUser = member.userId === user.id;

                return (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      isCurrentUser
                        ? "border-foreground bg-primary/10"
                        : "border-foreground bg-card"
                    }`}
                    style={{
                      boxShadow: isCurrentUser
                        ? "3px 3px 0px 0px var(--primary)"
                        : "3px 3px 0px 0px var(--foreground)",
                    }}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    <div
                      className="w-10 h-10 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center text-sm font-black text-white"
                      style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                    >
                      {member.avatarInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white border-2 border-foreground font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                          <Flame className="w-3 h-3 text-primary" />
                          {member.streak}d
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-[#F59E0B]" />
                        <span className="font-black text-foreground">
                          {member.weeklyScore.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-bold">
                        pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "join" && (
          <div className="space-y-6">
            <div
              className="rounded-2xl bg-card border-2 border-foreground p-8 text-center"
              style={{ boxShadow: "6px 6px 0px 0px var(--foreground)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl bg-[#3B82F6] border-2 border-foreground flex items-center justify-center mx-auto mb-4"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-2 ">
                Join a Training Group
              </h2>
              <p className="text-muted-foreground text-sm mb-6 font-medium">
                Enter an invite code from your group leader to join their
                training team.
              </p>

              <form onSubmit={handleJoinGroup} className="space-y-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Invite Code"
                  maxLength={6}
                  className="w-full px-4 placeholder:font-sans py-4 rounded-2xl bg-background border-2 border-foreground text-foreground text-center text-2xl font-mono tracking-[0.3em] placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all uppercase font-black"
                />
                {joinError && (
                  <p className="text-red-500 text-sm font-bold">{joinError}</p>
                )}
                <button
                  type="submit"
                  disabled={inviteCode.length < 4 || isJoining}
                  className={`w-full py-4 rounded-full font-bold text-base transition-all duration-200 border-2 border-foreground flex items-center justify-center gap-2 ${
                    inviteCode.length < 4 || isJoining
                      ? "bg-muted text-[#B0AAA2] cursor-not-allowed"
                      : "bg-[#3B82F6] text-white hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  }`}
                  style={{
                    boxShadow:
                      inviteCode.length < 4 || isJoining
                        ? "none"
                        : "4px 4px 0px 0px var(--foreground)",
                  }}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Group"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === "create" && (
          <div className="space-y-6">
            <div
              className="rounded-2xl bg-card border-2 border-foreground p-8 text-center"
              style={{ boxShadow: "6px 6px 0px 0px var(--foreground)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl bg-[#8B5CF6] border-2 border-foreground flex items-center justify-center mx-auto mb-4"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-2 ">
                Create a Training Group
              </h2>
              <p className="text-muted-foreground text-sm mb-6 font-medium">
                Start a group for your church, fellowship, or study circle.
                Invite members with your unique code.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name (e.g., Faith Warriors)"
                  className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all text-base font-medium"
                />
                <button
                  type="submit"
                  disabled={!groupName.trim() || isCreating}
                  className={`w-full py-4 rounded-full font-bold text-base transition-all duration-200 border-2 border-foreground flex items-center justify-center gap-2 ${
                    !groupName.trim() || isCreating
                      ? "bg-muted text-[#B0AAA2] cursor-not-allowed"
                      : "bg-[#8B5CF6] text-white hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  }`}
                  style={{
                    boxShadow:
                      !groupName.trim() || isCreating
                        ? "none"
                        : "4px 4px 0px 0px var(--foreground)",
                  }}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
