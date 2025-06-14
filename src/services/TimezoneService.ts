import { IReadonlyDataService, DataResult } from '@datavysta/vysta-client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface Timezone {
  id: string;
  displayName: string;
}

export interface TimezoneWithGroup extends Timezone {
  _group: string;
  _currentTime?: string;
}

export class TimezoneService implements IReadonlyDataService<TimezoneWithGroup> {
  private baseUrl: string;
  private basePath = 'api/admin/i18n/timezone';

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getAll(params: Record<string, unknown> = {}): Promise<DataResult<TimezoneWithGroup>> {
    try {
      const url = new URL(`${this.baseUrl}/${this.basePath}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });

      const timezonesResponse = await fetch(url.toString());
      if (!timezonesResponse.ok) {
        throw new Error(`HTTP ${timezonesResponse.status}: ${timezonesResponse.statusText}`);
      }
      
      const timezonesData = await timezonesResponse.json();
      const timezones: Timezone[] = Array.isArray(timezonesData) ? timezonesData : (timezonesData ? [timezonesData] : []);
      
      const timezonesWithGroups: TimezoneWithGroup[] = await Promise.all(
        timezones.map(async (timezone: Timezone) => {
          try {
            const groupUrl = `${this.baseUrl}/${this.basePath}/${encodeURIComponent(timezone.id)}/group`;
            const groupResponse = await fetch(groupUrl);
            let group = this.deriveGroupFromId(timezone.id);
            
            if (groupResponse.ok) {
              const groupData = await groupResponse.text();
              group = groupData || this.deriveGroupFromId(timezone.id);
            }
            
            return {
              ...timezone,
              _group: group,
              _currentTime: this.formatCurrentTime(timezone.id)
            } as TimezoneWithGroup;
          } catch (error) {
            return {
              ...timezone,
              _group: this.deriveGroupFromId(timezone.id),
              _currentTime: this.formatCurrentTime(timezone.id)
            } as TimezoneWithGroup;
          }
        })
      );

      return {
        data: timezonesWithGroups,
        count: timezonesWithGroups.length,
        error: null
      };
    } catch (error) {
      console.error('Error loading timezones:', error);
      
      const sampleTimezones: TimezoneWithGroup[] = [
        {
          id: 'America/New_York',
          displayName: 'Eastern Time - US & Canada',
          _group: 'America',
          _currentTime: this.formatCurrentTime('America/New_York')
        },
        {
          id: 'America/Chicago',
          displayName: 'Central Time - US & Canada',
          _group: 'America',
          _currentTime: this.formatCurrentTime('America/Chicago')
        },
        {
          id: 'America/Denver',
          displayName: 'Mountain Time - US & Canada',
          _group: 'America',
          _currentTime: this.formatCurrentTime('America/Denver')
        },
        {
          id: 'America/Los_Angeles',
          displayName: 'Pacific Time - US & Canada',
          _group: 'America',
          _currentTime: this.formatCurrentTime('America/Los_Angeles')
        },
        {
          id: 'Europe/London',
          displayName: 'Greenwich Mean Time',
          _group: 'Europe',
          _currentTime: this.formatCurrentTime('Europe/London')
        },
        {
          id: 'Europe/Paris',
          displayName: 'Central European Time',
          _group: 'Europe',
          _currentTime: this.formatCurrentTime('Europe/Paris')
        },
        {
          id: 'Asia/Tokyo',
          displayName: 'Japan Standard Time',
          _group: 'Asia',
          _currentTime: this.formatCurrentTime('Asia/Tokyo')
        },
        {
          id: 'Asia/Shanghai',
          displayName: 'China Standard Time',
          _group: 'Asia',
          _currentTime: this.formatCurrentTime('Asia/Shanghai')
        },
        {
          id: 'Australia/Sydney',
          displayName: 'Australian Eastern Time',
          _group: 'Australia',
          _currentTime: this.formatCurrentTime('Australia/Sydney')
        }
      ];

      return {
        data: sampleTimezones,
        count: sampleTimezones.length,
        error: null
      };
    }
  }

  async query(params: Record<string, unknown> = {}): Promise<DataResult<TimezoneWithGroup>> {
    return this.getAll(params);
  }

  async download(): Promise<Blob> {
    throw new Error('Download not supported for timezone service');
  }

  private deriveGroupFromId(timezoneId: string): string {
    if (!timezoneId || !timezoneId.includes('/')) {
      return 'Other';
    }
    const region = timezoneId.split('/')[0];
    return region === 'Indian' ? 'Indian Ocean' : this.capitalizeWord(region);
  }

  private capitalizeWord(word: string): string {
    if (!word || word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  private formatCurrentTime(timezoneId: string): string {
    try {
      return dayjs().tz(timezoneId).format('h:mm A');
    } catch (error) {
      console.warn(`Failed to format time for timezone ${timezoneId}:`, error);
      return '';
    }
  }
}
