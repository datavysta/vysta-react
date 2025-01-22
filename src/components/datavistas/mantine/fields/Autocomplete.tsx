import { FC } from 'react';
import { Autocomplete as MantineAutocomplete, Loader } from '@mantine/core';

interface IDataItem {
    value: string;
    label: string;
}

enum OrderByDirection {
    ASC = 'asc',
    DESC = 'desc'
}

interface AutocompleteFieldProps {
    items: IDataItem[];
    readOnly?: boolean;
    name: string;
    required?: boolean;
    label: string;
    loading?: boolean;
    placeholder?: string;
    description?: string;
    value: string;
    multiple?: boolean;
    onSearch: (condition: SearchCondition) => void;
    onChange: (value: string) => void;
}

interface SearchCondition {
    keywords: string | null;
    limit: number | null;
    offSet: number | null;
    orderBy: OrderByDirection;
    recordCount?: boolean;
    orderByPropertyNames: string[];
    tags: string[];
}

const defaultSearchCondition: SearchCondition = {
    keywords: null,
    limit: null,
    offSet: null,
    orderBy: OrderByDirection.ASC,
    recordCount: true,
    orderByPropertyNames: [],
    tags: [],
};

export const AutocompleteField: FC<AutocompleteFieldProps> = ({
    readOnly = false,
    name,
    onSearch,
    onChange,
    required = false,
    label,
    loading = false,
    placeholder,
    description,
    value,
    items,
    multiple = false,
}) => {
    const data = items?.map(item => ({ 
        value: item.value, 
        label: item.label 
    })) ?? [{ value, label: value }];

    if (readOnly) {
        return <>{value}</>;
    }

    return (
        <MantineAutocomplete
            data={data}
            readOnly={readOnly}
            key={name}
            required={required}
            label={label}
            placeholder={placeholder}
            description={description}
            multiple={multiple}
            onChange={onChange}
            value={value || ''}
            onDropdownOpen={() => onSearch?.(defaultSearchCondition)}
            rightSection={loading ? <Loader size="xs" /> : null}
        />
    );
};

export default AutocompleteField; 