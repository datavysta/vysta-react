import { useState } from 'react';
import { TimezoneSelector } from '@datavysta/vysta-react';
import { useServices } from './ServicesProvider';
import { Stack } from '@mantine/core';

interface TimezoneSelectorExampleProps {
  tick: number;
}

export function TimezoneSelectorExample({ tick }: TimezoneSelectorExampleProps) {
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null);
  const [selectedTimezoneNoGroup, setSelectedTimezoneNoGroup] = useState<string | null>(null);
  
  const { timezoneService } = useServices();

  return (
    <div style={{ maxWidth: '400px', padding: '20px' }}>
      <h2>Timezone Selector Example</h2>
      <Stack gap="md">
        <div>
          <p>Select timezone with grouping:</p>
          <TimezoneSelector
            timezoneService={timezoneService}
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            groupByRegion={true}
          />
          {selectedTimezone && (
            <p style={{ marginTop: '10px' }}>Selected: {selectedTimezone}</p>
          )}
        </div>

        <div>
          <p>Select timezone without grouping:</p>
          <TimezoneSelector
            timezoneService={timezoneService}
            value={selectedTimezoneNoGroup}
            onChange={setSelectedTimezoneNoGroup}
            groupByRegion={false}
          />
          {selectedTimezoneNoGroup && (
            <p style={{ marginTop: '10px' }}>Selected: {selectedTimezoneNoGroup}</p>
          )}
        </div>
      </Stack>
    </div>
  );
}
