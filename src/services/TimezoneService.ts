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

export class TimezoneService {
  private baseUrl: string;
  private basePath = 'api/admin/i18n/timezone';

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async getAllTimezones(): Promise<TimezoneWithGroup[]> {
    try {
      const url = `${this.baseUrl}/${this.basePath}`;
      const timezonesResponse = await fetch(url);
      
      if (!timezonesResponse.ok) {
        throw new Error(`HTTP ${timezonesResponse.status}: ${timezonesResponse.statusText}`);
      }
      
      const timezonesData = await timezonesResponse.json();
      const timezones: Timezone[] = Array.isArray(timezonesData) ? timezonesData : (timezonesData ? [timezonesData] : []);
      
      const timezonesWithGroups: TimezoneWithGroup[] = timezones.map((timezone: Timezone) => {
        return {
          ...timezone,
          _group: this.deriveGroupFromId(timezone.id),
          _currentTime: this.formatCurrentTime(timezone.id)
        } as TimezoneWithGroup;
      });

      return timezonesWithGroups;
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

      return sampleTimezones;
    }
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
