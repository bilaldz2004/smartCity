import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useSignIn, useSignUp, useClerk, useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { setClerkTokenGetter } from "../services/api";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { signIn, isLoaded: isSignInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded, setActive: setSignUpActive } = useSignUp();
  const { signOut: clerkSignOut } = useClerk();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useClerkAuth();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Register Clerk's getToken with the API service so all requests get the JWT
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  // Build a local user object from Clerk user data
  const buildLocalUser = useCallback((cu: any) => {
    if (!cu) return null;
    return {
      id: cu.id,
      name: cu.fullName || cu.firstName || "User",
      email: cu.primaryEmailAddress?.emailAddress || "",
      role: (cu.publicMetadata as any)?.role || "citizen",
    };
  }, []);

  // Sync Clerk user to Laravel backend (create user record if needed)
  const syncToBackend = useCallback(async (localUser: any) => {
    try {
      const token = await getToken();
      if (!token) return;
      await fetch("http://localhost:8000/api/clerk-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
        }),
      });
    } catch {
      // Non-blocking: backend sync failure should not block the UI
    }
  }, [getToken]);

  // Watch for Clerk user changes and update local state
  useEffect(() => {
    if (!isUserLoaded) return;
    if (clerkUser) {
      const localUser = buildLocalUser(clerkUser);
      setUser(localUser);
      syncToBackend(localUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [clerkUser, isUserLoaded, buildLocalUser, syncToBackend]);

  // Login using Clerk's signIn flow — same signature as before: login(email, password)
  const login = async (email: string, password: string) => {
    if (!isSignInLoaded || !signIn) throw new Error("Auth not ready");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setSignInActive({ session: result.createdSessionId });
        // Wait briefly for Clerk to update the user
        await new Promise((r) => setTimeout(r, 500));

        const localUser = buildLocalUser(clerkUser) || {
          id: result.createdSessionId,
          name: email.split("@")[0],
          email,
          role: "citizen",
        };
        setUser(localUser);

        const role = localUser.role;
        if (role === "admin") navigate("/admin");
        else if (role === "worker") navigate("/worker");
        else navigate("/dashboard");

        return localUser;
      } else {
        throw new Error("Login incomplete. Additional steps may be required.");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      throw new Error(msg);
    }
  };

  // Signup using Clerk's signUp flow — same signature as before: signup(name, email, password, role)
  const signup = async (name: string, email: string, password: string, role = "citizen") => {
    if (!isSignUpLoaded || !signUp) throw new Error("Auth not ready");

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || undefined,
        unsafeMetadata: { role },
      });

      // If email verification is required
      if (result.status === "missing_requirements") {
        // Attempt email verification via the preparation step
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        throw new Error("NEEDS_VERIFICATION");
      }

      if (result.status === "complete" && result.createdSessionId) {
        await setSignUpActive({ session: result.createdSessionId });
        await new Promise((r) => setTimeout(r, 500));

        const localUser = {
          id: result.createdSessionId,
          name,
          email,
          role,
        };
        setUser(localUser);
        await syncToBackend(localUser);

        if (role === "admin") navigate("/admin");
        else if (role === "worker") navigate("/worker");
        else navigate("/dashboard");

        return localUser;
      } else {
        throw new Error("Signup incomplete. Additional steps may be required.");
      }
    } catch (err: any) {
      if (err?.message === "NEEDS_VERIFICATION") throw err;
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Signup failed. Please try again.";
      throw new Error(msg);
    }
  };

  // Logout — same interface as before
  const logout = async () => {
    try {
      await clerkSignOut();
    } catch {
      // ignore
    }
    setUser(null);
    navigate("/");
  };

  const isAuthenticated = () => !!user;

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  if (loading || !isSignInLoaded || !isSignUpLoaded || !isUserLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
