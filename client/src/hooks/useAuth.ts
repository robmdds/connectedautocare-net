import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Optional: Handle 401 explicitly
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include", // Ensure cookies are sent
      });
      if (!response.ok) {
        // If 401 or other error, return null to clear user
        return null;
      }
      return response.json();
    },
  });

  return {
    user: error || !user ? null : user, // Ensure user is null on error
    isLoading,
    isAuthenticated: !!user && !error, // Only true if user exists and no error
  };
}