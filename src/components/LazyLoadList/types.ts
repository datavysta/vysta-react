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
    filters?: { [K in keyof T]?: Record<string, unknown> };

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

    /** Disable the initial value load query. Useful when the display value matches the key or when you don't need to load additional data. */
    disableInitialValueLoad?: boolean;

    /** Whether the list should be opened by default */
    defaultOpened?: boolean;

    /** Styles for the list components in the format of Mantine's theme */
    styles?: LazyLoadListStyles;

    /** Whether to automatically focus the search input when dropdown opens */
    autoSearchInputFocus?: boolean;

    /** Whether to render the dropdown in a portal
     * @default true
     */
    withinPortal?: boolean;

    /** Custom function to render each option */
    renderOption?: (item: T, isActive: boolean, search: string) => React.ReactNode;
}

export interface LoaderResult<T> {
    data: T[];
    count?: number;
}    