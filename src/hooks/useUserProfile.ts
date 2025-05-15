import { useState, useEffect, useMemo } from 'react';
import type { UserProfile, ObjectPermission } from '@datavysta/vysta-client';
import { VystaClient, VystaPermissionService } from '@datavysta/vysta-client';

// Hook input parameters
export interface UseUserProfileOptions {
  client: VystaClient;
  permissionService?: VystaPermissionService;
  apps?: string[]; // List of app/connection names to fetch permissions for
  tick?: number; // Optional: triggers refresh when changed
}

// Hook return type
export interface UseUserProfileResult {
  profile: UserProfile | null;
  permissions: Record<string, ObjectPermission> | null;
  loading: boolean;
  error: unknown;
  canSelectConnection: (app: string) => boolean;
}

export function useUserProfile(
  options: UseUserProfileOptions
): UseUserProfileResult {
  const { client, permissionService, apps, tick } = options;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Record<string, ObjectPermission> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  if (!client) {
    throw new Error("Client required for hook");
  }

  // Memoize the stringified apps array to avoid unnecessary reloads
  const appsString = useMemo(() => JSON.stringify(apps), [apps]);
  const appsMemo = useMemo(() => apps, [appsString]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        // Fetch profile
        const profilePromise = client.getUserProfile();
        let permissionsResult: Record<string, ObjectPermission> | null = null;

        if (permissionService && appsMemo && appsMemo.length > 0) {
          // Fetch permissions for each app concurrently
          const perms = await Promise.all(
            appsMemo.map(async (app) => {
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

        const profileResult = await profilePromise;

        if (isMounted) {
          setProfile(profileResult);
          setPermissions(permissionsResult);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
    // Only re-run if services, apps, or tick change
  }, [client, permissionService, appsMemo, tick]);

  // Helper: Returns true if the cached permissions for the app include the 'SELECT' grant
  const canSelectConnection = (app: string): boolean => {
    if (!permissions || !permissions[app]) return false;
    const grants = permissions[app].grants || [];
    return grants.map(g => g.toUpperCase()).includes('SELECT');
  };

  return {
    profile,
    permissions,
    loading,
    error,
    canSelectConnection,
  };
}    