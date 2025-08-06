import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
	ColDef,
	GridApi,
	GridOptions,
	GridReadyEvent,
	ICellRendererParams,
	IGetRowsParams,
	RowClassParams,
	GetRowIdParams,
	ModuleRegistry,
	InfiniteRowModelModule,
	SortModelItem,
	TextEditorModule,
	ColumnApiModule,
	CustomEditorModule,
	RenderApiModule,
	ColumnResizedEvent,
	Column,
	BodyScrollEvent,
	ValueGetterParams
} from 'ag-grid-community';
import type { Theme } from "ag-grid-community";
import type {
	OrderBy,
	SortDirection,
	IReadonlyDataService,
	IDataService,
	SelectColumn
} from '@datavysta/vysta-client';
import { FileType } from '@datavysta/vysta-client';
import moduleStyles from './DataGrid.module.css';
import type Condition from '../Models/Condition';
import { EditableTextCell } from './EditableTextCell';
import { EditableFieldType } from './types';
import type { EditableFieldConfig } from './types';
import { EditableNumberCell } from './cells/EditableNumberCell';
import { EditableDateCell } from './cells/EditableDateCell';
import { EditableListCell } from './cells/EditableListCell';
import { useObjectReference } from "../../hooks/useObjectReference";
import { useMemoizedColumnDefs } from "../../hooks/useMemoizedColumnDefs";

ModuleRegistry.registerModules([
	InfiniteRowModelModule,
	TextEditorModule,
	ColumnApiModule,
	CustomEditorModule,
	RenderApiModule
]);

export interface DataGridStyles {
	root?: React.CSSProperties;
	container?: React.CSSProperties;
	toolbar?: React.CSSProperties;
	titleSection?: React.CSSProperties;
	title?: React.CSSProperties;
	badge?: React.CSSProperties;
	actions?: React.CSSProperties;
	searchInput?: React.CSSProperties;
	grid?: React.CSSProperties;
	createButton?: React.CSSProperties;
	downloadButton?: React.CSSProperties;
	deleteButton?: React.CSSProperties;
	aggregateFooter?: React.CSSProperties;
}

export interface DataGridProps<T extends object, U extends T = T> {
	title: string;
	noun: string;
	repository: IReadonlyDataService<T, U>;
	columnDefs: ColDef<U>[];
	gridOptions?: GridOptions<U>;
	supportRegularDownload?: boolean;
	supportInsert?: boolean;
	supportDelete?: boolean;
	deleteButton?: (onDelete: () => void) => React.ReactNode;
	filters?: { [K in keyof T]?: Record<string, unknown> };
	conditions?: Condition[];
	inputProperties?: {
		[key: string]: string;
	};
	wildcardSearch?: string;
	toolbarItems?: React.ReactNode;
	onDataFirstLoaded?: (gridApi: GridApi<U>) => void;
	/**
	 * Called every time data is loaded, including filter changes and initial load
	 * Not called for infinite scroll loads
	 */
	onDataLoaded?: (gridApi: GridApi<U>, data: U[]) => void;
	getRowClass?: ((params: RowClassParams<U>) => string | string[] | undefined);
	getRowId: (data: T) => string;
	theme?: Theme | 'legacy';
	tick?: number;
	styles?: DataGridStyles;
	editService?: IDataService<T, U>;
	editableFields?: {
		[K in keyof U]?: EditableFieldConfig;
	};
	noRowsComponent?: React.ComponentType<Record<string, unknown>>;
	loadingComponent?: React.ComponentType<Record<string, unknown>>;
	/**
	 * Columns to aggregate and show as a summary/footer row below the grid.
	 * Uses Vysta aggregate queries (AVG, SUM, etc). See SelectColumn in @datavysta/vysta-client.
	 */
	aggregateSelect?: SelectColumn<T>[];
	/**
	 * Optional custom render for the aggregate summary row. If not provided, a default row is rendered.
	 */
	renderAggregateFooter?: (summary: Record<string, unknown>) => React.ReactNode;
	/**
	 * Called whenever the row count changes due to filter updates, data changes, etc.
	 * Receives the current row count.
	 */
	onRowCountChange?: (count: number) => void;
	/**
	 * Enable caching for this DataGrid's queries. Defaults to false.
	 */
	useCache?: boolean;
	/**
	 * Called after a cell edit is successfully saved.
	 * @param params Object containing the field, old value, new value, row data, and row ID
	 */
	onSaveComplete?: (params: {
		field: string;
		oldValue: unknown;
		newValue: unknown;
		rowId: string;
		rowData: U;
		gridApi: GridApi<U>;
	}) => void;
}

export function DataGrid<T extends object, U extends T = T>({
    title,
    noun,
    repository,
    columnDefs,
    gridOptions,
    supportRegularDownload = false,
    supportInsert = false,
    supportDelete = false,
    deleteButton,
    filters,
    conditions,
    inputProperties,
    wildcardSearch,
    toolbarItems,
    onDataFirstLoaded,
    onDataLoaded,
    getRowId,
    theme,
    tick = 0,
    styles = {},
    editService,
    editableFields,
    noRowsComponent,
    loadingComponent,
    aggregateSelect,
    renderAggregateFooter,
    onRowCountChange,
    useCache = false,
    onSaveComplete,
}: DataGridProps<T, U>) {
	const gridApiRef = useRef<GridApi<U> | null>(null);
	const [lastKnownRowCount, setLastKnownRowCount] = useState<number>(-1);
	const dataFirstLoadedRef = useRef(false);
	const isMountedRef = useRef(true);
	const [aggregateSummary, setAggregateSummary] = useState<Record<string, unknown> | null>(null);
	const aggregateFooterRef = useRef<HTMLDivElement>(null);

	// Memoize columnDefs to prevent unnecessary re-renders when content hasn't changed
	const memoizedColumnDefs = useMemoizedColumnDefs(columnDefs);

	// We will keep track of the events on its own object, that will allow us to:
	// 1. Update this object only if the method changed
	// 2. Always call the latest function(s), without having to rebuild any other
	//    callback/object (e.g. getCells)
	// 3. Both combined allow us to accept inline anonymous methods even if they
	//    are changed on every render call (e.g.
	//		<DataGrid ... onRowCountChange={{(count) => console.log(count)}}
	//    ).
	const delegates = useObjectReference({
		onDataFirstLoaded,
		onDataLoaded,
		onRowCountChange,
		onSaveComplete,
		getRowId
	});

	// Track component mount status
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const defaultColDef = useMemo<ColDef>(() => ({
		sortable: true,
		resizable: true,
		flex: 1,
		...(gridOptions?.defaultColDef || {}),
	}), [gridOptions]);

	const actionsCellRenderer = useCallback((params: ICellRendererParams<U>) => {
		if (!supportDelete || !params.data) return null;

		const rowId = delegates.current.getRowId(params.data);
		return deleteButton ?
			deleteButton(() => handleDelete(rowId)) :
			(
				<button
					onClick={() => handleDelete(rowId)}
					className={moduleStyles.deleteButton}
					style={styles.deleteButton}
				>
					Delete
				</button>
			);
	}, [supportDelete, deleteButton]);

	const handleDelete = async (id: string) => {
		if (!id) return;

		// Type guard to ensure repository has delete capability
		if (!('delete' in repository) || typeof (repository as IDataService<T, U>).delete !== 'function') {
			console.error('Repository does not support delete operations');
			return;
		}

		try {
			await (repository as IDataService<T, U>).delete(id);
			if (gridApiRef.current) {
				gridApiRef.current.updateGridOptions({datasource: dataSource});
			}
		} catch (error) {
			console.error('Failed to delete:', error);
		}
	};

	const handleDownload = useCallback(async () => {
		try {
			const order: OrderBy<T> = {};
			const gridApi = gridApiRef.current;
			if (gridApi) {
				const sortModel = (gridApi as GridApi<U>).getColumnState() as SortModelItem[];
				if (sortModel?.length > 0) {
					for (const sort of sortModel) {
						const key = sort.colId;
						order[key as keyof T] = sort.sort?.toLowerCase() as SortDirection;
					}
				}
			}

			const select: SelectColumn<T>[] = memoizedColumnDefs
				.filter(col => {
					if (!col.field || col.field.startsWith('_')) return false;

					const cellClass = col.cellClass;
					if (typeof cellClass === 'string') {
						return cellClass !== 'no-download';
					} else if (Array.isArray(cellClass)) {
						return !cellClass.includes('no-download');
					}

					return true;
				})
				.map(col => ({
					name: String(col.field) as keyof T,
					alias: (col.headerName || String(col.field)).replace(/,/g, '')
				}));

			const blob = await repository.download({
				select,
				order,
				filters,
				conditions,
				inputProperties,
				recordCount: false
			}, FileType.CSV);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Download failed:', error);
		}
	}, [repository, memoizedColumnDefs, filters, conditions, inputProperties, title]);

	const hasEditableColumns = useMemo(() =>
		editableFields !== undefined && Object.keys(editableFields).length > 0,
		[editableFields]
	);

	if (hasEditableColumns && !editService && !('update' in repository)) {
		throw new Error('Grid has editable columns but no edit capability. Either provide an editService or use a repository that supports updates');
	}

	const modifiedColDefs = useMemo(() => {
		const cols = memoizedColumnDefs.map(col => {
			const originalCol = { ...col };
			if (originalCol.field && editableFields?.[(originalCol.field as unknown) as keyof U]) {
				const fieldConfig = editableFields[(originalCol.field as unknown) as keyof U];
				const cellEditor = (() => {
					switch (fieldConfig?.dataType) {
						case EditableFieldType.Number:
							return EditableNumberCell;
						case EditableFieldType.Date:
							return EditableDateCell;
						case EditableFieldType.List:
							return EditableListCell;
						case EditableFieldType.Text:
						default:
							return EditableTextCell;
					}
				})();

				return {
					...originalCol,
					editable: true,
					cellEditor,
					cellEditorPopup: fieldConfig?.dataType === EditableFieldType.List,
					cellEditorParams: (params: ICellRendererParams<U>) => {
						// Get the raw value from the data
						const rawValue = originalCol.field && params.data
							? (params.data as Record<string, unknown>)[originalCol.field]
							: params.value;



						// Get the display value if there's a valueGetter
						let displayValue: unknown = undefined;
						if (originalCol.valueGetter && typeof originalCol.valueGetter === 'function' && params.column) {
							try {
								// Create a ValueGetterParams object with the required getValue function
								const valueGetterParams = {
									...params,
									column: params.column,
									getValue: (field: string) => {
										return params.data ? (params.data as Record<string, unknown>)[field] : undefined;
									}
								};
								displayValue = originalCol.valueGetter(valueGetterParams as ValueGetterParams<U>);
							} catch (e) {
								// If valueGetter fails, we'll just not have a display value
								console.warn('Failed to get display value from valueGetter:', e);
							}
						}



						return {
							// Pass the raw value
							value: rawValue,
							// Pass the display value if it's different from raw value
							displayValue: displayValue !== rawValue ? displayValue : undefined,
							// Pass getRowId so cell editors can access local edits
							getRowId: (data: T) => delegates.current.getRowId(data),
							onSave: async (newValue: string) => {
								if (!originalCol.field || !params.data) return;

								const service = editService || repository as IDataService<T, U>;
								const id = delegates.current.getRowId(params.data);
								const oldValue = rawValue; // Capture the old value before update

								await service.update(id, {
									[originalCol.field as string]: newValue
								} as Partial<T>);

								if (fieldConfig?.dataType !== EditableFieldType.List) {
									params.api.stopEditing();
									params.node.setDataValue(originalCol.field, newValue);
								}

								try {
									await refreshAggregates();
								} catch (error) {
									console.error('Failed to refresh aggregates after cell edit:', error);
								}

								// Call the onSaveComplete callback if provided
								if (delegates.current.onSaveComplete) {
									delegates.current.onSaveComplete({
										field: originalCol.field as string,
										oldValue,
										newValue,
										rowId: id,
										rowData: params.data,
										gridApi: params.api
									});
								}
							},
							...fieldConfig
						};
					}
				};
			}
			return originalCol;  // Return the column with wrapped valueGetter
		});

		if (supportDelete) {
			cols.push({
				headerName: '',
				cellRenderer: 'actionsCellRenderer',
				maxWidth: 110,
				sortable: false,
				filter: false,
			});
		}

		return cols;
	}, [memoizedColumnDefs, supportDelete, editService, repository, editableFields]);

	const getFieldsFromColDefs = (colDefs: ColDef[]): string[] => {
		return colDefs.reduce<string[]>((acc, col) => {
			if (col.field && !col.field.startsWith('_')) {
				acc.push(String(col.field));
			}
			const children = (col as Record<string, unknown>).children as ColDef<U>[] | undefined;
			if (children) {
				acc.push(...getFieldsFromColDefs(children));
			}
			return acc;
		}, []);
	};

	const dataSource = useMemo(() => ({
		getRows: async (params: IGetRowsParams) => {
			const {startRow, endRow, sortModel} = params;
			const limit = endRow - startRow;

			try {
				const order: OrderBy<T> = {};
				if (sortModel?.length > 0) {
					for (const sort of sortModel) {
						const key = sort.colId;
						order[key as keyof T] = sort.sort.toLowerCase() as SortDirection;
					}
				}

				const primaryKey = (repository as unknown as Record<string, unknown>).primaryKey as keyof T | Array<keyof T>;
				const select = [...new Set([
					...getFieldsFromColDefs(memoizedColumnDefs),
					...(primaryKey ? (Array.isArray(primaryKey) ? primaryKey : [primaryKey]) : [])
				])] as (keyof T)[];

				const result = await repository.query({
					select,
					limit,
					offset: startRow,
					order,
					filters,
					conditions,
					inputProperties,
					recordCount: startRow === 0,
					q: wildcardSearch,
					useCache
				});

				// Guard against updates after unmounting
				if (!isMountedRef.current) return;

				if (startRow === 0 && result.count !== undefined) {
					setLastKnownRowCount(result.count);
				}

				const lastRow = result.data.length < limit ? startRow + result.data.length : undefined;
				params.successCallback(result.data, lastRow);

				if (!dataFirstLoadedRef.current && gridApiRef.current && isMountedRef.current) {
					delegates.current.onDataFirstLoaded?.(gridApiRef.current);
					dataFirstLoadedRef.current = true;
				}

				if (gridApiRef.current && delegates.current.onDataLoaded && isMountedRef.current) {
					delegates.current.onDataLoaded(gridApiRef.current, result.data);
				}
			} catch (error) {
				console.error('Error fetching rows:', error);
				if (isMountedRef.current) {
					params.failCallback();
				}
			}
		}
	}), [
		repository,
		memoizedColumnDefs,
		filters,
		conditions,
		inputProperties,
		wildcardSearch,
		useCache
	]);

	const getRowIdHandler = useCallback((params: GetRowIdParams<U>) =>
		params.data ? delegates.current.getRowId(params.data) : '', []);

	// Helper to update footer column widths from AG Grid ColumnApi
	const updateFooterColWidths = (api: GridApi<U>) => {
		let columns: Column[] = api.getAllDisplayedColumns?.() ?? [];
		if (!columns || columns.length === 0) {
			columns = api.getColumns?.() ?? [] as Column[];
		}
		const widths: Record<string, number> = {};
		columns.forEach((col: Column) => {
			const colId = col.getColId();
			if (colId) widths[String(colId)] = col.getActualWidth();
		});
	};

	// Use only onColumnResized to update footer widths
	const onColumnResized = (event: ColumnResizedEvent<U>) => {
		if (event.api) {
			updateFooterColWidths(event.api as GridApi<U>);
		}
	};

	// Sync aggregate footer scroll with grid scroll using AG Grid's onBodyScroll event
	const handleBodyScroll = useCallback((event: BodyScrollEvent) => {
		if (aggregateFooterRef.current) {
			aggregateFooterRef.current.scrollLeft = event.left;
		}
	}, []);

	const actualGridOptions = useMemo<GridOptions<U>>(() => {
		const { components: gridOptionsComponents, ...restGridOptions } = gridOptions || {};

		return {
			// Defaults that can be overridden by user's gridOptions
			cacheBlockSize: 50,
			paginationPageSize: 50,

			// User's gridOptions (excluding components, which are merged separately)
			...restGridOptions,

			// DataGrid's specific settings that take precedence
			rowModelType: 'infinite', // Essential for this component's design
			columnDefs: modifiedColDefs,
			defaultColDef, // This is the merged version from useMemo
			components: {
				...(gridOptionsComponents || {}),
				actionsCellRenderer,
				EditableTextCell
			},
			singleClickEdit: hasEditableColumns,
			stopEditingWhenCellsLoseFocus: hasEditableColumns,
			getRowId: getRowIdHandler,
			noRowsOverlay: noRowsComponent,
			suppressNoRowsOverlay: !noRowsComponent,
			loadingOverlay: loadingComponent,
			suppressLoadingOverlay: !loadingComponent,
			onColumnResized,
			onBodyScroll: handleBodyScroll,
			popupParent: hasEditableColumns ? document.body : undefined
		};
	}, [modifiedColDefs, defaultColDef, gridOptions, getRowIdHandler, hasEditableColumns, noRowsComponent, loadingComponent, handleBodyScroll]);

	useEffect(() => {
		if (isMountedRef.current) {
			dataFirstLoadedRef.current = false;
			gridApiRef.current?.updateGridOptions({datasource: dataSource});
		}
	}, [tick, dataSource]);

	const onGridReady = (params: GridReadyEvent<U>) => {
		if (isMountedRef.current) {
			gridApiRef.current = params.api;

			params.api.updateGridOptions({ datasource: dataSource });
			if (typeof gridOptions?.onGridReady === 'function') {
				gridOptions.onGridReady(params);
			}
		}
	};

	const refreshAggregates = useCallback(async () => {
		if (!aggregateSelect) {
			setAggregateSummary(null);
			return;
		}
		try {
			const result = await repository.query({
				select: aggregateSelect,
				filters,
				conditions,
				inputProperties,
				q: wildcardSearch,
				useCache
			});
			if (isMountedRef.current) {
				setAggregateSummary((result.data?.[0] as Record<string, unknown>) || null);
			}
		} catch {
			if (isMountedRef.current) setAggregateSummary(null);
		}
	}, [aggregateSelect, filters, conditions, inputProperties, wildcardSearch, repository, useCache]);

	// Refresh aggregates whenever dependencies change (filters, etc.)
	useEffect(() => {
		refreshAggregates();
	}, [refreshAggregates]);

	useEffect(() => {
		if (lastKnownRowCount >= 0) {
			delegates.current.onRowCountChange?.(lastKnownRowCount);
		}
	}, [lastKnownRowCount]);

	// Require all aggregateSelect entries to have an alias
	if (aggregateSelect) {
		const missingAlias = aggregateSelect.find(sel => !sel.alias);
		if (missingAlias) {
			throw new Error('All aggregateSelect entries must have an alias. Missing for: ' + String(missingAlias.name ?? 'unknown'));
		}
	}

	// Helper to render the aggregate summary row
	function renderAggregateFooterRow() {
		if (!aggregateSummary || !gridApiRef.current) return null;
		const columns = gridApiRef.current.getAllDisplayedColumns?.() ?? [];
		return (
			<div style={{ display: 'flex' }}>
				{columns.map(col => {
					const colId = col.getColId();
					const colDef = col.getColDef();
					const width = col.getActualWidth();
					// Find the aggregate for this column by name
					const agg = aggregateSelect?.find(sel => sel.name === (colDef.field ? String(colDef.field) : undefined));
					const value = agg && aggregateSummary[agg.alias!] != null
						? String(aggregateSummary[agg.alias!])
						: '';
					const style = {
						width,
						minWidth: width,
						maxWidth: width,
						flex: 'none',
					};
					// format value using colDef.valueFormatter if available
					let displayValue: string = value;
					if (value !== '' && colDef && 'valueFormatter' in colDef && typeof colDef.valueFormatter === 'function') {
						try {
							displayValue = String((colDef.valueFormatter as (p: { value: unknown }) => string)({ value }));
						} catch {/* ignore formatter errors */}
					}
					return (
						<div
							key={colId}
							className={moduleStyles.aggregateFooterCell}
							data-field={colId}
							style={style}
						>
							<span className={moduleStyles.aggregateValue}>{displayValue}</span>
						</div>
					);
				})}
			</div>
		);
	}

	return (
		<div className={moduleStyles.container} style={styles.container}>
			<div className={moduleStyles.toolbar} style={styles.toolbar}>
				<div className={moduleStyles.titleSection} style={styles.titleSection}>
					<p className={moduleStyles.title} style={styles.title}>{title}</p>
					{lastKnownRowCount >= 0 && (
						<span className={moduleStyles.badge} style={styles.badge}>{lastKnownRowCount}</span>
					)}
				</div>
				<div className={moduleStyles.actions} style={styles.actions}>
					{toolbarItems}
					{supportInsert && (
						<button className={moduleStyles.createButton} style={styles.createButton} disabled>
							New {noun}
						</button>
					)}
					{supportRegularDownload && (
						<button
							className={moduleStyles.downloadButton}
							style={styles.downloadButton}
							onClick={handleDownload}
						>
							Download
						</button>
					)}
				</div>
			</div>
			<div className={moduleStyles.grid} style={styles.grid}>
				<AgGridReact
					{...actualGridOptions}
					onGridReady={onGridReady}
					theme={theme}
				/>
			</div>
			{aggregateSelect && aggregateSummary && (
				<div
					className={moduleStyles.aggregateFooter}
					style={{ ...styles.aggregateFooter, overflowX: 'hidden', width: '100%' }}
					ref={aggregateFooterRef}
				>
					{renderAggregateFooter ? renderAggregateFooter(aggregateSummary) : renderAggregateFooterRow()}
				</div>
			)}
		</div>
	);
}
