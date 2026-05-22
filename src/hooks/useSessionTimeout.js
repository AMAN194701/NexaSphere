import { useEffect } from "react";

const useSessionTimeout = (logout) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      logout();
      alert("Session Expired");
    }, 15 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [logout]);
};

export default useSessionTimeout;