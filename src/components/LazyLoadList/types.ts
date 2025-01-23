import { IReadonlyDataService } from '@datavysta/vysta-client';
import { ComboboxStylesNames, InputStylesNames, ScrollAreaStylesNames, MantineTheme } from '@mantine/core';
import { CSSProperties } from 'react';

type StylesRecord<T extends string> = Partial<Record<T, CSSProperties>>;
type StylesFn<T extends string> = (theme: MantineTheme) => StylesRecord<T>;
type Styles<T extends string> = StylesRecord<T> | StylesFn<T>;

export interface LazyLoadListStyles {
    combobox?: Styles<ComboboxStylesNames>;
    input?: Styles<InputStylesNames>;
    search?: Styles<InputStylesNames>;
    scrollArea?: Styles<ScrollAreaStylesNames>;
    option?: Partial<Record<'option', CSSProperties>>;
    loader?: CSSProperties;
    errorDot?: CSSProperties;
    clearButton?: CSSProperties;
}

export interface LazyLoadListProps<T extends object> {
    /**
     * The data service to fetch items from
     */
    repository: IReadonlyDataService<T>;

    /**
     * The currently selected value (UUID)
     */
    value: string | null;

    /**
     * Callback when selection changes
     */
    onChange: (value: string | null) => void;

    /**
     * Optional label for the list
     */
    label?: string;

    /**
     * Filters to apply to the data service
     */
    filters?: { [K in keyof T]?: any };

    /**
     * Additional input properties for the data service
     */
    inputProperties?: {
        [key: string]: string;
    };

    /**
     * The field to display in the list
     * Must be a key of T
     */
    displayColumn: keyof T;

    /**
     * Optional field to group items by
     * Must be a key of T
     */
    groupBy?: keyof T;

    /**
     * Number of items to load per page
     * @default 20
     */
    pageSize?: number;

    /**
     * Trigger a refresh when this value changes
     */
    tick?: number;

    /**
     * The primary key field to use for identifying items
     * If not provided, will try to use repository.primaryKey or fall back to 'id'
     */
    primaryKey?: keyof T;

    /**
     * Optional order by configuration
     * If not provided, will sort by displayColumn ascending
     */
    orderBy?: { [K in keyof T]?: 'asc' | 'desc' };

    /**
     * Whether to show the search input and allow filtering
     * @default true
     */
    searchable?: boolean;

    /**
     * Whether to show a clear button when a value is selected
     * @default false
     */
    clearable?: boolean;

    styles?: LazyLoadListStyles;
}

export interface LoaderResult<T> {
    data: T[];
    count?: number;
} 