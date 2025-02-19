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
    listService?: IReadonlyDataService<any>;
    displayColumn?: string;
    clearable?: boolean;
    listOptions?: Partial<LazyLoadListProps<any>>;
    // For number type
    numberOptions?: Partial<NumberInputProps>;
    // For date type
    dateOptions?: Partial<Parameters<typeof DatePickerInput>[0]>;
}

export interface BaseEditableCellProps {
    onSave: (newValue: string) => Promise<void>;
    value: string;
}