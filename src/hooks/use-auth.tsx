import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccessStatus = "pending" | "approved" | "rejected";

interface ProfileInfo {
  accessStatus: AccessStatus;
  isAdmin: boolean;
  displayName: string | null;
  email: string | null;
  requestReason: string | null;
  termsAccepted: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  phone: string | null;
  limits: {
    plan: string;
    faqCount: number;
    faqLimit: number;
    trialEndsAt: string;
  } | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileInfo | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  const loadProfile = async (uid: string) => {
    const [{ data: p }, { data: roles }, { data: lim }] = await Promise.all([
      supabase
        .from("profiles")
        .select("access_status,display_name,email,request_reason,terms_accepted,email_verified,phone_verified,phone")
        .eq("id", uid)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase
        .from("user_limits")
        .select("plan,faq_count,faq_limit,trial_ends_at")
        .eq("user_id", uid)
        .maybeSingle(),
    ]);
    setProfile({
      accessStatus: (p?.access_status as AccessStatus) || "pending",
      isAdmin: !!roles?.some((r: { role: string }) => r.role === "admin"),
      displayName: p?.display_name || null,
      email: p?.email || null,
      requestReason: p?.request_reason || null,
      termsAccepted: !!p?.terms_accepted,
      emailVerified: !!p?.email_verified,
      phoneVerified: !!p?.phone_verified,
      phone: p?.phone || null,
      limits: lim ? {
        plan: lim.plan,
        faqCount: lim.faq_count,
        faqLimit: lim.faq_limit,
        trialEndsAt: lim.trial_ends_at,
      } : null,
    });
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setProfile(null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        profile,
        refreshProfile: async () => {
          if (session?.user) await loadProfile(session.user.id);
        },
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
