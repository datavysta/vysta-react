import { useState, useCallback, useEffect } from 'react';
import type { UserProfile, ObjectPermission } from '@datavysta/vysta-client';
import { VystaClient, VystaPermissionService } from '@datavysta/vysta-client';

export interface AuthWrapper {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getSignInMethods: () => Promise<any>;
  getAuthorizeUrl: (providerId: string) => Promise<string>;
  exchangeToken: (token: string) => Promise<any>;
}

export interface UseAuthOptions {
  client: VystaClient;
  permissionService?: VystaPermissionService;
  apps?: string[];
}

export interface UseAuthResult {
  profile: UserProfile | null;
  permissions: Record<string, ObjectPermission> | null;
  canSelectConnection: (app: string) => boolean;
  profileLoading: boolean;
  profileError: any;
  loginLoading: boolean;
  loginError: any;
  isAuthenticated: boolean;
  auth: AuthWrapper;
}

export function useAuth({ client, permissionService, apps }: UseAuthOptions): UseAuthResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Record<string, ObjectPermission> | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<any>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<any>(null);
  const [tick, setTick] = useState(0);

  // Helper: fetch profile and permissions
  const fetchProfileAndPermissions = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const profileResult = await client.getUserProfile();
      let permissionsResult: Record<string, ObjectPermission> | null = null;
      if (permissionService && apps && apps.length > 0) {
        const perms = await Promise.all(
          apps.map(async (app) => {
            try {
              const perm = await permissionService.getConnectionPermissions(app);
              return [app, perm] as [string, ObjectPermission];
            } catch (err) {
              return [app, null];
            }
          })
        );
        permissionsResult = Object.fromEntries(perms);
      }
      setProfile(profileResult);
      setPermissions(permissionsResult);
    } catch (err) {
      setProfile(null);
      setPermissions(null);
      setProfileError(err);
    } finally {
      setProfileLoading(false);
    }
  }, [client, permissionService, apps]);

  // On mount, try to fetch profile (if already authenticated)
  useEffect(() => {
    fetchProfileAndPermissions();
  }, [fetchProfileAndPermissions, tick]);

  // AuthWrapper implementation
  const auth: AuthWrapper = {
    login: async (username: string, password: string) => {
      setLoginLoading(true);
      setLoginError(null);
      try {
        await client.login(username, password);
        setTick(t => t + 1);
      } catch (err) {
        setProfile(null);
        setPermissions(null);
        setLoginError(err);
      } finally {
        setLoginLoading(false);
      }
    },
    logout: async () => {
      setLoginLoading(true);
      setLoginError(null);
      try {
        await client.logout();
        setTick(t => t + 1);
      } catch (err) {
        setLoginError(err);
      } finally {
        setLoginLoading(false);
      }
    },
    getSignInMethods: () => client.getSignInMethods(),
    getAuthorizeUrl: (providerId: string) => client.getAuthorizeUrl(providerId),
    exchangeToken: (token: string) => client.exchangeToken(token),
  };

  // Helper: Returns true if the cached permissions for the app include the 'SELECT' grant
  const canSelectConnection = useCallback((app: string): boolean => {
    if (!permissions || !permissions[app]) return false;
    const grants = permissions[app].grants || [];
    return grants.map(g => g.toUpperCase()).includes('SELECT');
  }, [permissions]);

  const isAuthenticated = !!profile;

  return {
    profile,
    permissions,
    canSelectConnection,
    profileLoading,
    profileError,
    loginLoading,
    loginError,
    isAuthenticated,
    auth,
  };
} 