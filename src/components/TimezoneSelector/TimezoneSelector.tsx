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
  return (
    <LazyLoadList<TimezoneWithGroup>
      repository={timezoneService}
      displayColumn={displayColumn}
      groupBy={groupByRegion ? '_group' : undefined}
      label={label}
      searchable={true}
      clearable={true}
      {...props}
    />
  );
}
