"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAppState, useAppDispatch } from "@/lib/store/context";

export function useAuth() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { signIn, signOut } = useAuthActions();

  const login = async () => {
    try {
      await signIn("google", {
        redirectTo: "/dashboard",
      });
    } catch (error) {
      console.error("Google login failed", error);
    }
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

  return { user: state.user, login, logout, isAuthenticated: !!state.user };
}
