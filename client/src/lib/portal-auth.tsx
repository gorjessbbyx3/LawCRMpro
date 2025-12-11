import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from './queryClient';

interface PortalUser {
  id: string;
  clientId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PortalAuthContextType {
  user: PortalUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: user, isLoading, refetch } = useQuery<PortalUser | null>({
    queryKey: ['/api/portal/auth/me'],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/portal/auth/login', { email, password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/auth/me'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/portal/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/portal/auth/me'], null);
      queryClient.clear();
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <PortalAuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading || isLoggingOut,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
}
