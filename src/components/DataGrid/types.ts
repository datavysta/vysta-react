import type { NumberInputProps } from '@mantine/core';
import type { DatePickerInput } from '@mantine/dates';
import type { IReadonlyDataService } from '@datavysta/vysta-client';
import type { LazyLoadListProps } from '../LazyLoadList/types';

export enum EditableFieldType {
    Text = 'text',
    Number = 'number',
    Date = 'date',
    List = 'list'
}

export interface EditableFieldConfig {
    dataType: EditableFieldType;
    // For list type
    listService?: IReadonlyDataService<Record<string, unknown>>;
    displayColumn?: string;
    clearable?: boolean;
    useCache?: boolean;
    listOptions?: Partial<LazyLoadListProps<Record<string, unknown>>>;
    // For number type
    numberOptions?: Partial<NumberInputProps>;
    // For date type
    dateOptions?: Partial<Parameters<typeof DatePickerInput>[0]>;
}

export interface BaseEditableCellProps {
    onSave: (newValue: string) => Promise<void>;
    value: string;
}
