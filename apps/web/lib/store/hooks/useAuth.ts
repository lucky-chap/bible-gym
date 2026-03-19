"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useAppState, useAppDispatch } from "@/lib/store/context";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const login = async () => {
    openSignIn({ forceRedirectUrl: "/dashboard" });
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch({ type: "LOGOUT" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("word-mastery-state");
      }
      router.push("/");
    }
  };

  return {
    user: state.user,
    clerkUser,
    isLoaded,
    login,
    logout,
    isAuthenticated: !!clerkUser,
  };
}
