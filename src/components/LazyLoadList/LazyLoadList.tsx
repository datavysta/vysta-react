import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { LazyLoadListProps } from './types';
import { Combobox, ScrollArea, Text, InputBase, Input, useCombobox, Tooltip, Loader, Group, Highlight, CloseButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { OrderBy } from '@datavysta/vysta-client';
import moduleStyles from './LazyLoadList.module.css';

export function LazyLoadList<T extends object>({
    repository,
    value,
    onChange,
    label,
    filters,
    inputProperties = {},
    displayColumn,
    groupBy,
    pageSize = 20,
    tick,
    orderBy,
    searchable = true,
    styles = {},
    clearable = true,
    disableInitialValueLoad = false,
}: LazyLoadListProps<T>) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [options, setOptions] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [moreDataExists, setMoreDataExists] = useState(true);
    const [valueResolved, setValueResolved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());
    const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
    const [totalLoaded, setTotalLoaded] = useState(0);

    const effectivePrimaryKey = ((repository as any).primaryKey || 'id') as keyof T;
    const effectiveFilters = useMemo(() => filters || {}, [filters]);
    const effectiveOrderBy = useMemo(() => orderBy || { [displayColumn]: 'asc' }, [orderBy, displayColumn]);
    const selectedOption = options.find(opt => String(opt[effectivePrimaryKey]) === value);
    const displayValue = selectedOption ? String(selectedOption[displayColumn]) : '';

    const combobox = useCombobox({
        onDropdownClose: () => {
            combobox.resetSelectedOption();
            setSearch('');
        },
        onDropdownOpen: () => {
            if (error) {
                return;
            }
            combobox.updateSelectedOptionIndex('active');
            setTimeout(() => searchInputRef.current?.focus(), 0);
        },
    });

    // Handle value changes and add temporary option if needed
    useEffect(() => {
        if (!value) return;

        const hasValue = options.some(opt => String(opt[effectivePrimaryKey]) === value);
        const hasTempValue = options.some(opt => (opt as any).__isTemp && String(opt[effectivePrimaryKey]) === value);
        
        // Only throw if we've loaded all data and value isn't found
        if (!moreDataExists && options.some(opt => !(opt as any).__isTemp) && !hasValue) {
            throw new Error(`Value ${value} not found in loaded options`);
        }

        // Add temporary option if value not found and we're not querying for details
        if (!hasValue && !hasTempValue && (disableInitialValueLoad || displayColumn === effectivePrimaryKey)) {
            const tempItem = {
                [effectivePrimaryKey]: value,
                [displayColumn]: value,
                __isTemp: true
            } as unknown as T;
            setOptions(prev => [tempItem, ...prev.filter(opt => !(opt as any).__isTemp)]);
        }
    }, [value, options, effectivePrimaryKey, displayColumn, disableInitialValueLoad, moreDataExists]);

    // Load value details if provided
    useEffect(() => {
        if (!value || valueResolved) return;
        
        // Skip loading if disabled or if display matches key
        if (disableInitialValueLoad || 
            !displayColumn || 
            displayColumn === effectivePrimaryKey || 
            value === displayValue) {
            setValueResolved(true);
            return;
        }

        loadValueData();
    }, [value, displayColumn, effectivePrimaryKey, disableInitialValueLoad]);

    // Load options when search changes or tick changes
    useEffect(() => {
        if (error || !combobox.dropdownOpened) return;
        
        setOffset(0);
        setMoreDataExists(true);
        loadOptions(false);
    }, [debouncedSearch, effectiveFilters, tick]);

    // Separate effect for dropdown open state
    useEffect(() => {
        if (error || !combobox.dropdownOpened) return;
        
        loadOptions(false);
    }, [combobox.dropdownOpened]);

    const loadValueData = async () => {
        if (!value) return;

        try {
            let valueData: T;
            
            if ('getById' in repository) {
                valueData = await (repository as any).getById(value);
            } else {
                const result = await repository.getAll({
                    filters: { 
                        ...effectiveFilters,
                        [effectivePrimaryKey]: { eq: value } 
                    },
                    select: Array.from(new Set([effectivePrimaryKey, displayColumn])) as (keyof T)[],
                    limit: 2
                });
                
                if (result.data.length === 0) {
                    throw new Error('Value not found');
                }
                valueData = result.data[0];
            }

            // Add a temporary flag to the resolved item
            const tempItem = {
                ...valueData,
                __isTemp: true
            };

            // If we already have options loaded, merge the temp item with existing options
            setOptions(prev => {
                // Remove any previous temp items
                const filtered = prev.filter(item => !(item as any).__isTemp);
                return [tempItem, ...filtered];
            });
            setResolvedItems(new Set([value]));
            setValueResolved(true);
        } catch (error) {
            console.error('Error loading value data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load value data');
        }
    };

    const loadOptions = useCallback(async (incremental: boolean) => {
        if (loading || (!incremental && !combobox.dropdownOpened)) return;

        setLoading(true);
        setError(null);
        const useOffset = incremental ? offset : 0;

        try {
            const result = await repository.getAll({
                select: Array.from(new Set([effectivePrimaryKey, displayColumn, ...(groupBy ? [groupBy] : [])])) as (keyof T)[],
                limit: pageSize,
                offset: useOffset,
                order: effectiveOrderBy as OrderBy<T>,
                q: searchable && debouncedSearch ? debouncedSearch : undefined,
                filters: effectiveFilters,
                inputProperties,
                recordCount: true
            });

            // If this is a fresh load and we have a selected value, ensure it stays in the options
            let newData = result.data;
            if (!incremental && selectedOption) {
                const selectedInResults = result.data.some(item => 
                    String(item[effectivePrimaryKey]) === value
                );
                if (!selectedInResults) {
                    newData = [selectedOption, ...result.data];
                }
            }

            if (!incremental) {
                setOptions(newData);
                setTotalLoaded(newData.length);
                setTotalCount(result.count && result.count > 0 ? result.count : undefined);
                
                // If we find our value in the real results, remove it from resolved items
                const valueInResults = newData.some(item => 
                    String(item[effectivePrimaryKey]) === value && 
                    !resolvedItems.has(String(item[effectivePrimaryKey]))
                );
                if (valueInResults) {
                    setResolvedItems(prev => {
                        const next = new Set(prev);
                        next.delete(value!);
                        return next;
                    });
                }
            } else {
                setOptions(prev => [...prev, ...newData]);
                setTotalLoaded(prev => prev + newData.length);
            }
            
            const newOffset = useOffset + result.data.length;
            const hasMoreData = result.data.length === pageSize;

            setOffset(newOffset);
            setMoreDataExists(hasMoreData);
        } catch (error) {
            console.error('Error loading options:', error);
            setError(error instanceof Error ? error.message : 'Failed to load options');
            setOptions(selectedOption ? [selectedOption] : []);
            setMoreDataExists(false);
        } finally {
            setLoading(false);
        }
    }, [
        loading,
        combobox.dropdownOpened,
        offset,
        effectivePrimaryKey,
        displayColumn,
        groupBy,
        pageSize,
        effectiveFilters,
        effectiveOrderBy,
        searchable,
        debouncedSearch,
        inputProperties,
        selectedOption,
        value,
        resolvedItems
    ]);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        if (error || loading) return;
        
        const target = event.target as HTMLElement;
        const bottom = Math.abs(
            target.scrollHeight - (target.scrollTop + target.clientHeight)
        ) <= 1;

        if (bottom && moreDataExists) {
            loadOptions(true);
        }
    }, [error, loading, moreDataExists, offset, totalLoaded, totalCount, loadOptions]);

    const groupedOptions = groupBy
        ? options.reduce((acc, item) => {
            const group = String(item[groupBy]) || 'Other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {} as Record<string, T[]>)
        : { 'Items': options };

    const getRightSection = () => {
        if (loading) {
            return (
                <Loader 
                    size="sm" 
                    style={styles?.loader}
                />
            );
        }
        
        if (error) {
            return (
                <Tooltip 
                    label={error} 
                    color="red" 
                    position="bottom-end"
                    multiline
                    w={300}
                    styles={{ tooltip: styles?.errorDot }}
                >
                    <div />
                </Tooltip>
            );
        }

        if (clearable && value) {
            return (
                <CloseButton 
                    variant="transparent"
                    size="sm"
                    style={styles?.clearButton}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(null);
                    }}
                    aria-label="Clear value"
                />
            );
        }

        return <Combobox.Chevron />;
    };

    const renderOptions = (items: T[]) => {
        return items
            .filter(item => {
                // Filter out temporary items
                return !(item as any).__isTemp;
            })
            .map((item) => {
                const itemId = String(item[effectivePrimaryKey]);
                const isActive = itemId === value;
                const displayText = String(item[displayColumn]);
                
                return (
                    <Combobox.Option
                        key={itemId}
                        value={itemId}
                        active={isActive}
                        styles={styles?.option}
                        className={moduleStyles.option}
                    >
                        <Group gap="sm" wrap="nowrap">
                            <Highlight highlight={search} size="sm">
                                {displayText}
                            </Highlight>
                            {isActive && (
                                <Text size="sm" c="blue">
                                    ✓
                                </Text>
                            )}
                        </Group>
                    </Combobox.Option>
                );
            });
    };

    return (
        <Combobox
            store={combobox}
            withinPortal={true}
            onOptionSubmit={(val) => {
                onChange(val);
                combobox.closeDropdown();
            }}
            styles={styles?.combobox}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={getRightSection()}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents={loading || (clearable && value) ? 'auto' : 'none'}
                    styles={styles?.input}
                    classNames={{ input: moduleStyles.input }}
                >
                    {displayValue || <Input.Placeholder>{label || 'Select...'}</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                {searchable && (
                    <Combobox.Search
                        ref={searchInputRef}
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        placeholder="Search..."
                        styles={styles?.search}
                        classNames={{ input: moduleStyles.searchInput }}
                    />
                )}
                <ScrollArea.Autosize
                    mah="30vh"
                    type="scroll"
                    scrollbarSize={6}
                    onScrollCapture={handleScroll}
                    viewportRef={scrollAreaRef}
                    styles={styles?.scrollArea}
                >
                    <Combobox.Options>
                        {Object.entries(groupedOptions).map(([group, items]) => (
                            groupBy ? (
                                <Combobox.Group 
                                    label={group} 
                                    key={group}
                                >
                                    {renderOptions(items)}
                                </Combobox.Group>
                            ) : (
                                renderOptions(items)
                            )
                        ))}
                        {!loading && (!options.length || options.every(item => (item as any).__isTemp)) && (
                            <Combobox.Empty>No options found</Combobox.Empty>
                        )}
                    </Combobox.Options>
                </ScrollArea.Autosize>
            </Combobox.Dropdown>
        </Combobox>
    );
} 