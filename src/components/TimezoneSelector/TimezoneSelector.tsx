import { Group, Highlight, Text } from '@mantine/core';
import { LazyLoadList } from '../LazyLoadList/LazyLoadList';
import { LazyLoadListProps } from '../LazyLoadList/types';
import { TimezoneService, TimezoneWithGroup } from '../../services/TimezoneService';

export interface TimezoneSelectorProps extends Omit<LazyLoadListProps<TimezoneWithGroup>, 'repository' | 'displayColumn' | 'groupBy'> {
  timezoneService: TimezoneService;
  
  groupByRegion?: boolean;
  
  displayColumn?: keyof TimezoneWithGroup;
}

export function TimezoneSelector({
  timezoneService,
  groupByRegion = true,
  displayColumn = 'displayName',
  label = 'Select Timezone',
  ...props
}: TimezoneSelectorProps) {
  const renderTimezoneOption = (item: TimezoneWithGroup, isActive: boolean, search: string) => (
    <Group justify="space-between" wrap="nowrap" w="100%">
      <Highlight highlight={search} size="sm">
        {String(item[displayColumn])}
      </Highlight>
      <Group gap="xs" wrap="nowrap">
        {item._currentTime && (
          <Text size="sm" c="dimmed">
            {item._currentTime}
          </Text>
        )}
        {isActive && (
          <Text size="sm" c="blue">
            ✓
          </Text>
        )}
      </Group>
    </Group>
  );

  return (
    <LazyLoadList<TimezoneWithGroup>
      repository={timezoneService}
      displayColumn={displayColumn}
      groupBy={groupByRegion ? '_group' : undefined}
      label={label}
      searchable={true}
      clearable={true}
      renderOption={renderTimezoneOption}
      {...props}
    />
  );
}
