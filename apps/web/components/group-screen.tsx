"use client";

import { useState, useEffect } from "react";
import {
  useAppState,
  useAppDispatch,
  useGroups,
  useWorkout,
} from "@/lib/store";
import { obfuscateApiKey, deobfuscateApiKey } from "@/lib/security";
import { generateThemedWorkout } from "@/app/actions/generate-drills";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trophy,
  Flame,
  Plus,
  Copy,
  Check,
  Crown,
  Medal,
  Play,
  Sparkles,
  Loader2,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  X,
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
    refreshGroupData,
    leaveGroup,
    deleteGroup,
  } = useGroups();
  const user = state.user;
  const [tab, setTab] = useState<"leaderboard" | "join" | "create">(
    userGroup || state.user?.groupId ? "leaderboard" : "join",
  );

  useEffect(() => {
    if ((userGroup || state.user?.groupId) && tab !== "leaderboard") {
      setTab("leaderboard");
    }
  }, [userGroup, state.user?.groupId, tab]);

  useEffect(() => {
    if (!userGroup && !state.user?.groupId && tab === "leaderboard") {
      setTab("join");
    }
  }, [userGroup, state.user?.groupId, tab]);

  useEffect(() => {
    dispatch({ type: "SET_VIEW", payload: "group" });
    if (user?.groupId) {
      refreshGroupData(user.groupId);
    }
  }, [dispatch, user?.groupId]);

  useEffect(() => {
    if (!user?.groupId) return;
    const interval = setInterval(() => {
      refreshGroupData(user.groupId!);
    }, 60000);
    return () => clearInterval(interval);
  }, [user?.groupId, refreshGroupData]);

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [theme, setTheme] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setUserApiKey(deobfuscateApiKey(savedKey));
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    localStorage.setItem("gemini_api_key", obfuscateApiKey(key));
  };

  const { startGroupChallenge } = useWorkout();

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
    if (index === 0) return <Crown className="w-4.5 h-4.5" style={{ color: "var(--color-context)" }} />;
    if (index === 1) return <Medal className="w-4.5 h-4.5 text-muted-foreground" />;
    if (index === 2) return <Medal className="w-4.5 h-4.5 text-amber-800" />;
    return (
      <span className="text-xs font-black text-muted-foreground w-5 text-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="w-full">
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {/* Tabs */}
        <div
          className="flex gap-1.5 p-1.5 rounded-xl bg-card border-2 border-foreground"
          style={{ boxShadow: "var(--shadow-brutal-sm)" }}
        >
          {userGroup ? (
            <div
              className="flex-1 py-2.5 bg-primary text-primary-foreground border-2 border-foreground rounded-lg text-center text-xs font-black uppercase tracking-widest"
              style={{ boxShadow: "var(--shadow-brutal-press)" }}
            >
              My Group Leaderboard
            </div>
          ) : (
            <>
              <button
                onClick={() => setTab("join")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  tab === "join"
                    ? "bg-primary text-primary-foreground border-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
                style={
                  tab === "join"
                    ? { boxShadow: "var(--shadow-brutal-press)" }
                    : {}
                }
              >
                Join Group
              </button>
              <button
                onClick={() => setTab("create")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  tab === "create"
                    ? "bg-primary text-primary-foreground border-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
                style={
                  tab === "create"
                    ? { boxShadow: "var(--shadow-brutal-press)" }
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
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="font-bold text-muted-foreground text-sm">
              Loading group data...
            </p>
          </div>
        )}

        {tab === "leaderboard" && userGroup && (
          <div className="space-y-5">
            {/* Group Info */}
            <div
              className="rounded-xl bg-card border-2 border-foreground p-5"
              style={{ boxShadow: "var(--shadow-brutal-purple)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-black text-foreground tracking-tight">
                    {userGroup.name}
                  </h2>
                  <p className="text-xs text-muted-foreground font-bold">
                    {userGroup.members.length}{" "}
                    {userGroup.members.length === 1 ? "member" : "members"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-foreground font-mono font-black bg-background px-2.5 py-1 rounded-md border-2 border-foreground tracking-wider">
                    {userGroup.inviteCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="w-8 h-8 rounded-lg bg-card border-2 border-foreground flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    style={{ boxShadow: "var(--shadow-brutal-press)" }}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" style={{ color: "var(--color-verse-match)" }} />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {user.id === userGroup.createdBy ? (
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-destructive border-2 border-red-200 text-[10px] font-black hover:bg-destructive hover:text-primary-foreground hover:border-foreground transition-all ml-1 uppercase tracking-wider"
                      style={{ boxShadow: "2px 2px 0px 0px #D93636" }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to leave this group?")
                        ) {
                          leaveGroup();
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-destructive border-2 border-red-200 text-[10px] font-black hover:bg-destructive hover:text-primary-foreground hover:border-foreground transition-all ml-1 uppercase tracking-wider"
                      style={{ boxShadow: "2px 2px 0px 0px #D93636" }}
                    >
                      <LogOut className="w-3 h-3" />
                      Leave
                    </button>
                  )}
                </div>
              </div>
            </div>

            {userGroup.groupChallenge && (
              <div
                className="rounded-xl bg-card border-2 border-foreground p-5"
                style={{ boxShadow: "var(--shadow-brutal-blue)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg border-2 border-foreground flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-memorization)", boxShadow: "var(--shadow-brutal-press)" }}
                    >
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-sm leading-tight tracking-tight">
                        Active Group Challenge
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold">
                        Collaborative themed workout
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-lg bg-background border-2 border-foreground p-3.5"
                  style={{ boxShadow: "var(--shadow-brutal-press)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-foreground text-sm mb-0.5">
                        Theme:{" "}
                        <span style={{ color: "var(--color-memorization)" }}>
                          &ldquo;{userGroup.groupChallenge.theme}&rdquo;
                        </span>
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold">
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
                          className="px-2.5 py-1.5 text-[10px] font-black text-primary-foreground bg-destructive rounded-lg transition-colors border-2 border-foreground hover:bg-red-600 uppercase tracking-wider"
                          style={{ boxShadow: "var(--shadow-brutal-press)" }}
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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-primary-foreground font-black rounded-lg transition-colors border-2 border-foreground disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                        style={{
                          backgroundColor: "var(--color-memorization)",
                          boxShadow: "var(--shadow-brutal-press)",
                        }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
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
                className="rounded-xl bg-card border-2 border-foreground p-5"
                style={{ boxShadow: "var(--shadow-brutal-blue)" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg border-2 border-foreground flex items-center justify-center"
                      style={{ backgroundColor: "var(--color-memorization)", boxShadow: "var(--shadow-brutal-press)" }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-sm leading-tight tracking-tight">
                        Set Group Challenge
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold">
                        Generate an AI workout for the whole group
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Key className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <input
                      type="password"
                      value={userApiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      placeholder="Your Gemini API Key"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border-2 border-foreground text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors font-medium text-sm"
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
                      className="flex-1 px-4 py-2.5 rounded-lg bg-background border-2 border-foreground text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors font-medium text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!theme.trim() || isGenerating}
                      className="px-5 py-2.5 text-primary-foreground font-black rounded-lg border-2 border-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm btn-brutal uppercase tracking-wider"
                      style={{
                        backgroundColor: "var(--color-memorization)",
                        boxShadow:
                          !theme.trim() || isGenerating
                            ? "none"
                            : "var(--shadow-brutal)",
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
                  <p className="text-[9px] text-muted-foreground text-center font-bold uppercase tracking-wider">
                    Your API key is stored locally and used only for these requests.
                  </p>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] pl-1">
                Weekly Ranking
              </h3>
              {groupMembers.map((member, index) => {
                const isCurrentUser = member.userId === user.id;

                return (
                  <div
                    key={member.userId}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      isCurrentUser
                        ? "border-foreground bg-primary/8"
                        : member.hasLeft
                          ? "border-muted-foreground/20 bg-muted/50 grayscale opacity-70"
                          : "border-foreground bg-card"
                    }`}
                    style={{
                      boxShadow: isCurrentUser
                        ? "var(--shadow-brutal-pink)"
                        : member.hasLeft
                          ? "none"
                          : "var(--shadow-brutal-sm)",
                    }}
                  >
                    <div className="w-7 flex items-center justify-center">
                      {getRankIcon(index)}
                    </div>

                    <div
                      className="w-9 h-9 rounded-lg bg-primary border-2 border-foreground flex items-center justify-center text-xs font-black text-primary-foreground"
                      style={{ boxShadow: "var(--shadow-brutal-press)" }}
                    >
                      {member.avatarInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground text-sm truncate">
                          {member.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground border-2 border-foreground font-black uppercase tracking-wider">
                            You
                          </span>
                        )}
                        {member.hasLeft && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-muted-foreground/30 font-black uppercase tracking-wider">
                            Left Group
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                          <Flame className="w-3 h-3 text-primary" />
                          {member.streak}d
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" style={{ color: "var(--color-context)" }} />
                        <span className="font-black text-foreground text-sm score-display">
                          {member.weeklyScore.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">
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
          <div className="space-y-5">
            <div
              className="rounded-xl bg-card border-2 border-foreground p-7 text-center"
              style={{ boxShadow: "var(--shadow-brutal-lg)" }}
            >
              <div
                className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--color-memorization)", boxShadow: "var(--shadow-brutal-sm)" }}
              >
                <Users className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-black text-foreground mb-1.5 tracking-tight">
                Join a Training Group
              </h2>
              <p className="text-muted-foreground text-xs mb-6 font-bold">
                Enter an invite code from your group leader to join their
                training team.
              </p>

              <form onSubmit={handleJoinGroup} className="space-y-3">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Invite Code"
                  maxLength={6}
                  className="w-full px-4 placeholder:font-sans py-4 rounded-xl bg-background border-2 border-foreground text-foreground text-center text-xl font-mono tracking-[0.3em] placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase font-black"
                />
                {joinError && (
                  <p className="text-destructive text-xs font-bold">{joinError}</p>
                )}
                <button
                  type="submit"
                  disabled={inviteCode.length < 4 || isJoining}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-150 border-2 border-foreground flex items-center justify-center gap-2 uppercase tracking-wide ${
                    inviteCode.length < 4 || isJoining
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "text-primary-foreground btn-brutal"
                  }`}
                  style={{
                    backgroundColor: inviteCode.length < 4 || isJoining ? undefined : "var(--color-memorization)",
                    boxShadow:
                      inviteCode.length < 4 || isJoining
                        ? "none"
                        : "var(--shadow-brutal)",
                  }}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
          <div className="space-y-5">
            <div
              className="rounded-xl bg-card border-2 border-foreground p-7 text-center"
              style={{ boxShadow: "var(--shadow-brutal-lg)" }}
            >
              <div
                className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--color-mastery)", boxShadow: "var(--shadow-brutal-sm)" }}
              >
                <Plus className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-black text-foreground mb-1.5 tracking-tight">
                Create a Training Group
              </h2>
              <p className="text-muted-foreground text-xs mb-6 font-bold">
                Start a group for your church, fellowship, or study circle.
                Invite members with your unique code.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-3">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name (e.g., Faith Warriors)"
                  className="w-full px-4 py-3.5 rounded-xl bg-background border-2 border-foreground text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm font-medium"
                />
                <button
                  type="submit"
                  disabled={!groupName.trim() || isCreating}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-150 border-2 border-foreground flex items-center justify-center gap-2 uppercase tracking-wide ${
                    !groupName.trim() || isCreating
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "text-primary-foreground btn-brutal"
                  }`}
                  style={{
                    backgroundColor: !groupName.trim() || isCreating ? undefined : "var(--color-mastery)",
                    boxShadow:
                      !groupName.trim() || isCreating
                        ? "none"
                        : "var(--shadow-brutal)",
                  }}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-card border-2 border-foreground rounded-2xl p-7 overflow-hidden"
              style={{ boxShadow: "var(--shadow-brutal-xl)" }}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-destructive" />

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center border-2 border-red-200">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Delete Group?
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm">
                    Deleting{" "}
                    <span className="text-foreground font-black italic">
                      "{userGroup?.name}"
                    </span>{" "}
                    will remove all members.
                  </p>
                  <p className="text-[10px] text-destructive font-bold bg-red-50 p-2.5 rounded-lg border border-red-100 uppercase tracking-wider">
                    This cannot be undone.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-2.5 pt-2">
                  <button
                    onClick={async () => {
                      setIsDeleting(true);
                      const success = await deleteGroup();
                      setIsDeleting(false);
                      if (success) {
                        setIsDeleteModalOpen(false);
                        dispatch({ type: "SET_VIEW", payload: "dashboard" });
                      }
                    }}
                    disabled={isDeleting}
                    className="w-full py-3.5 bg-destructive text-primary-foreground font-black text-sm rounded-xl border-2 border-foreground btn-brutal disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Yes, Delete Forever"
                    )}
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full py-3.5 bg-card text-foreground font-black text-sm rounded-xl border-2 border-foreground hover:bg-muted transition-all"
                  >
                    Actually, Keep It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
