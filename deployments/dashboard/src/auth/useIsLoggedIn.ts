import { useAuth } from "./AuthProvider";

export default function useIsLoggedIn() {
  const { loading, loggedIn } = useAuth();

  return {
    isLoggedIn: loggedIn,
    isLoading: loading,
  };
}
