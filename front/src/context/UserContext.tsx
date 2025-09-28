import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type UserContextValue = {
  userId: string;
  setUserId: (v: string) => void;
};

const Ctx = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = "rideshare:userId";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ?? "";
  });

  const setUserId = useCallback((value: string) => {
    setUserIdState(value);
    if (typeof window === "undefined") {
      return;
    }
    if (value) {
      window.sessionStorage.setItem(STORAGE_KEY, value);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const contextValue = useMemo(() => ({ userId, setUserId }), [userId, setUserId]);

  return <Ctx.Provider value={contextValue}>{children}</Ctx.Provider>;
}

export function useUser() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUser must be used within <UserProvider>");
  return v;
}
