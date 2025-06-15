import React, { useState, useEffect } from 'react';
import { Select, Group, Text, Loader } from '@mantine/core';
import { TimezoneService, TimezoneWithGroup } from '../../services/TimezoneService';

export interface TimezoneSelectorProps {
  timezoneService: TimezoneService;
  value?: string | null;
  onChange?: (value: string | null) => void;
  groupByRegion?: boolean;
  displayColumn?: keyof TimezoneWithGroup;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
}

export function TimezoneSelector({
  timezoneService,
  value,
  onChange,
  groupByRegion = true,
  displayColumn = 'displayName',
  label = 'Select Timezone',
  placeholder = 'Select timezone...',
  searchable = true,
  clearable = true,
  disabled = false,
  error
}: TimezoneSelectorProps) {
  const [timezones, setTimezones] = useState<TimezoneWithGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimezones = async () => {
      try {
        setLoading(true);
        const data = await timezoneService.getAllTimezones();
        setTimezones(data);
      } catch (error) {
        console.error('Failed to load timezones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimezones();
  }, [timezoneService]);

  const selectData = React.useMemo(() => {
    if (!timezones || timezones.length === 0) {
      return [];
    }

    if (groupByRegion) {
      const grouped = timezones.reduce((acc, timezone) => {
        const group = timezone._group;
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push({
          value: timezone.id,
          label: `${String(timezone[displayColumn])}${timezone._currentTime ? ` - ${timezone._currentTime}` : ''}`
        });
        return acc;
      }, {} as Record<string, Array<{ value: string; label: string }>>);

      return Object.entries(grouped).map(([group, items]) => ({
        group,
        items: items.sort((a, b) => a.label.localeCompare(b.label))
      }));
    } else {
      return timezones
        .map(timezone => ({
          value: timezone.id,
          label: `${String(timezone[displayColumn])}${timezone._currentTime ? ` - ${timezone._currentTime}` : ''}`
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
  }, [timezones, groupByRegion, displayColumn]);

  if (loading) {
    return (
      <Group gap="xs">
        <Loader size="sm" />
        <Text size="sm">Loading timezones...</Text>
      </Group>
    );
  }

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data={selectData}
      searchable={searchable}
      clearable={clearable}
      disabled={disabled}
      error={error}
      maxDropdownHeight={300}
    />
  );
}
