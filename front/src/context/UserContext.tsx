import React, { createContext, useContext, useState } from "react";

type UserContextValue = {
  userId: string;
  setUserId: (v: string) => void;
};

const Ctx = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState("");
  return <Ctx.Provider value={{ userId, setUserId }}>{children}</Ctx.Provider>;
}

export function useUser() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUser must be used within <UserProvider>");
  return v;
}
