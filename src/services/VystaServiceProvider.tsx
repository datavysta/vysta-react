import React, { createContext, useContext, useMemo } from 'react';
import { VystaClient, VystaConfig, VystaRoleService, VystaPermissionService } from '@datavysta/vysta-client';
import { useUserProfile } from '../hooks/useUserProfile';
import { AuthService } from './AuthService';

export interface VystaServiceContextValue {
  roleService: VystaRoleService;
  permissionService: VystaPermissionService;
  userProfile: ReturnType<typeof useUserProfile>;
  authService: AuthService;
}

const VystaServiceContext = createContext<VystaServiceContextValue | undefined>(undefined);

export interface VystaServiceProviderProps {
  config: VystaConfig;
  children: (client: VystaClient) => React.ReactNode;
  apps?: string[]; // Optional: for permissions
}

export const VystaServiceProvider: React.FC<VystaServiceProviderProps> = ({ config, children, apps }) => {
  // Memoize the client and core services
  const client = useMemo(() => new VystaClient(config), [config]);
  const roleService = useMemo(() => new VystaRoleService(client), [client]);
  const permissionService = useMemo(() => new VystaPermissionService(client), [client]);
  const authService = useMemo(() => new AuthService(client), [client]);
  const userProfile = useUserProfile({ client, permissionService, apps });

  const value = useMemo(() => ({
    roleService,
    permissionService,
    userProfile,
    authService,
  }), [roleService, permissionService, userProfile, authService]);

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