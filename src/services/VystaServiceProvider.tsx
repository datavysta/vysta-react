import React, { createContext, useContext, useMemo } from 'react';
import { VystaClient, VystaConfig, VystaRoleService, VystaPermissionService } from '@datavysta/vysta-client';
import { useAuth, AuthWrapper } from '../hooks/useAuth';

export interface VystaServiceContextValue {
  roleService: VystaRoleService;
  permissionService: VystaPermissionService;
  profile: ReturnType<typeof useAuth>["profile"];
  permissions: ReturnType<typeof useAuth>["permissions"];
  canSelectConnection: ReturnType<typeof useAuth>["canSelectConnection"];
  isAuthenticated: boolean;
  profileLoading: boolean;
  profileError: any;
  loginLoading: boolean;
  loginError: any;
  auth: AuthWrapper;
}

const VystaServiceContext = createContext<VystaServiceContextValue | undefined>(undefined);

export interface VystaServiceProviderProps {
  config: VystaConfig;
  children: (client: VystaClient) => React.ReactNode;
  apps?: string[]; // Optional: for permissions
}

export const VystaServiceProvider: React.FC<VystaServiceProviderProps> = ({ config, children, apps }) => {
  // Memoize the client and core services
  const client = useMemo(() => {
    return new VystaClient(config);
  }, [config]);
  const roleService = useMemo(() => new VystaRoleService(client), [client]);
  const permissionService = useMemo(() => new VystaPermissionService(client), [client]);

  // Use the new useAuth hook, passing apps and permissionService
  const {
    profile,
    permissions,
    canSelectConnection,
    isAuthenticated,
    profileLoading,
    profileError,
    loginLoading,
    loginError,
    auth,
  } = useAuth({ client, permissionService, apps });

  const value = useMemo(() => ({
    roleService,
    permissionService,
    profile,
    permissions,
    canSelectConnection,
    isAuthenticated,
    profileLoading,
    profileError,
    loginLoading,
    loginError,
    auth,
  }), [roleService, permissionService, profile, permissions, canSelectConnection, isAuthenticated, profileLoading, profileError, loginLoading, loginError, auth]);

  return (
    <VystaServiceContext.Provider value={value}>
      {children(client)}
    </VystaServiceContext.Provider>
  );
};

export function useVystaServices(): VystaServiceContextValue {
  const ctx = useContext(VystaServiceContext);
  if (!ctx) throw new Error('useVystaServices must be used within a VystaServiceProvider');
  return ctx;
} 