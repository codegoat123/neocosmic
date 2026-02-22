import { useState, useCallback } from "react";

const ADMIN_PASSWORD = "2013";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem("neocosmic_admin") === "true";
  });

  const login = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("neocosmic_admin", "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem("neocosmic_admin");
  }, []);

  return { isAdmin, login, logout };
};
