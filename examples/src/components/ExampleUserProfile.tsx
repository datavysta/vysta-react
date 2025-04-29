import React, { useMemo } from 'react';
import { useUserProfile } from '../../../src/hooks/useUserProfile';
import { VystaPermissionService } from '@datavysta/vysta-client';
import { useServices } from './ServicesProvider';

export const ExampleUserProfile: React.FC = () => {
  // Get the client from the service context
  const { client } = useServices();

  // Create the permission service instance once per client
  const permissionService = useMemo(() => new VystaPermissionService(client), [client]);
  const apps = useMemo(() => ['Northwinds', 'BadNorthwind'], []);

  const { profile, permissions, loading, error, canSelectConnection } = useUserProfile({
    client,
    permissionService,
    apps,
  });

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>User Profile Example</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {String(error)}</div>}
      {profile && (
        <div>
          <h3>Profile</h3>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
      {permissions && (
        <div>
          <h3>Permissions</h3>
          <pre>{JSON.stringify(permissions, null, 2)}</pre>
        </div>
      )}
      <div>
        <h3>canSelectConnection Results</h3>
        <div>Northwinds: {canSelectConnection('Northwinds') ? '✅ Yes' : '❌ No'}</div>
        <div>BadNorthwind: {canSelectConnection('BadNorthwind') ? '✅ Yes' : '❌ No'}</div>
      </div>
      {!loading && !profile && !error && <div>No profile loaded.</div>}
    </div>
  );
};

export default ExampleUserProfile; 