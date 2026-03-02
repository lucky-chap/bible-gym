"use client";

import { useRouter } from "next/navigation";
import { account } from "../../appwrite";
import { OAuthProvider } from "appwrite";
import { useAppState, useAppDispatch } from "@/lib/store/context";

export function useAuth() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const login = async () => {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/`,
      );
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch({ type: "LOGOUT" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("bible-gym-state");
      }
      router.push("/");
    }
  };

  return { user: state.user, login, logout, isAuthenticated: !!state.user };
}
