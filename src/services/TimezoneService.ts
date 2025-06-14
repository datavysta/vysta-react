import { VystaClient, IReadonlyDataService, DataResult } from '@datavysta/vysta-client';
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
  private client: VystaClient;
  private basePath = 'api/admin/i18n/timezone';

  constructor(client: VystaClient) {
    this.client = client;
  }

  async getAll(params: Record<string, unknown> = {}): Promise<DataResult<TimezoneWithGroup>> {
    try {
      const timezonesResponse = await this.client.get<Timezone>(this.basePath, params);
      const timezones: Timezone[] = Array.isArray(timezonesResponse.data) ? timezonesResponse.data : (timezonesResponse.data ? [timezonesResponse.data] : []);
      
      const timezonesWithGroups: TimezoneWithGroup[] = await Promise.all(
        timezones.map(async (timezone: Timezone) => {
          try {
            const groupResponse = await this.client.get<string>(`${this.basePath}/${encodeURIComponent(timezone.id)}/group`);
            const group = typeof groupResponse.data === 'string' ? groupResponse.data : this.deriveGroupFromId(timezone.id);
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
      return { 
        data: [], 
        count: 0, 
        error: error instanceof Error ? error : new Error('Unknown error loading timezones')
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
