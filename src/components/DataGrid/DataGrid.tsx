import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AgGridReact} from 'ag-grid-react';
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
	SortModelItem, TextEditorModule, ColumnApiModule,
	ColumnResizedEvent,
	Column,
	BodyScrollEvent
} from 'ag-grid-community';
import type {Theme} from "ag-grid-community/dist/types/src/theming/Theme";
import type {OrderBy, SortDirection, IReadonlyDataService, IDataService, SelectColumn} from '@datavysta/vysta-client';
import {FileType} from '@datavysta/vysta-client';
import moduleStyles from './DataGrid.module.css';
import type Condition from '../Models/Condition';
import { EditableTextCell } from './EditableTextCell';
import { EditableFieldType } from './types';
import type { EditableFieldConfig } from './types';
import { EditableNumberCell } from './cells/EditableNumberCell';
import { EditableDateCell } from './cells/EditableDateCell';
import { EditableListCell } from './cells/EditableListCell';

ModuleRegistry.registerModules([
	InfiniteRowModelModule,
	TextEditorModule,
	ColumnApiModule
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
}: DataGridProps<T, U>) {
	const gridApiRef = useRef<GridApi<U> | null>(null);
	const [lastKnownRowCount, setLastKnownRowCount] = useState<number>(-1);
	const dataFirstLoadedRef = useRef(false);
	const isMountedRef = useRef(true);
	const [aggregateSummary, setAggregateSummary] = useState<Record<string, unknown> | null>(null);
	const aggregateFooterRef = useRef<HTMLDivElement>(null);

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

		const rowId = getRowId(params.data);
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
	}, [supportDelete, getRowId, deleteButton]);

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

			const select = [...new Set(
				columnDefs
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
					.map(col => String(col.field) as keyof T)
			)];

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
	}, [repository, columnDefs, filters, conditions, inputProperties, title]);

	const hasEditableColumns = useMemo(() => 
		editableFields !== undefined && Object.keys(editableFields).length > 0,
		[editableFields]
	);

	if (hasEditableColumns && !editService && !('update' in repository)) {
		throw new Error('Grid has editable columns but no edit capability. Either provide an editService or use a repository that supports updates');
	}

	const modifiedColDefs = useMemo(() => {
		const cols = columnDefs.map(col => {
			if (col.field && editableFields?.[(col.field as unknown) as keyof U]) {
				const fieldConfig = editableFields[(col.field as unknown) as keyof U];
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
					...col,
					editable: true,
					cellEditor,
					cellEditorParams: (params: ICellRendererParams<U>) => ({
						onSave: async (newValue: string) => {
							if (!col.field || !params.data) return;
							
							const service = editService || repository as IDataService<T, U>;
							const id = getRowId(params.data);

							await service.update(id, {
								[col.field]: newValue
							} as Partial<T>);

							params.api.stopEditing();
							params.node.setDataValue(col.field, newValue);

							params.api.refreshInfiniteCache();
						},
						...fieldConfig
					})
				};
			}
			return col;  // Don't modify non-editable columns
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
	}, [columnDefs, supportDelete, editService, repository, getRowId, editableFields]);

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

	const dataSource = {
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
					...getFieldsFromColDefs(columnDefs),
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
					q: wildcardSearch
				});

				// Guard against updates after unmounting
				if (!isMountedRef.current) return;

				if (startRow === 0 && result.count !== undefined) {
					setLastKnownRowCount(result.count);
				}

				const lastRow = result.data.length < limit ? startRow + result.data.length : undefined;
				params.successCallback(result.data, lastRow);

				if (!dataFirstLoadedRef.current && gridApiRef.current && isMountedRef.current) {
					onDataFirstLoaded?.(gridApiRef.current);
					dataFirstLoadedRef.current = true;
				}

				if (gridApiRef.current && onDataLoaded && isMountedRef.current) {
					onDataLoaded(gridApiRef.current, result.data);
				}
			} catch (error) {
				console.error('Error fetching rows:', error);
				if (isMountedRef.current) {
					params.failCallback();
				}
			}
		}
	};

	const getRowIdHandler = useCallback((params: GetRowIdParams<U>) => {
		return params.data ? getRowId(params.data) : '';
	}, [getRowId]);

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
			console.log('AG Grid onBodyScroll:', event.left);
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
		};
	}, [modifiedColDefs, defaultColDef, gridOptions, getRowIdHandler, hasEditableColumns, noRowsComponent, loadingComponent, handleBodyScroll]);

	useEffect(() => {
		if (isMountedRef.current) {
			dataFirstLoadedRef.current = false;
			gridApiRef.current?.updateGridOptions({datasource: dataSource});
		}
	}, [tick, filters, conditions, inputProperties]);

	const onGridReady = (params: GridReadyEvent<U>) => {
		if (isMountedRef.current) {
			gridApiRef.current = params.api;
			params.api.updateGridOptions({ datasource: dataSource });
			if (typeof gridOptions?.onGridReady === 'function') {
				gridOptions.onGridReady(params);
			}
		}
	};

	// Fetch aggregate summary when aggregateSelect or filters/conditions change
	useEffect(() => {
		let cancelled = false;
		if (!aggregateSelect) {
			setAggregateSummary(null);
			return;
		}
		(async () => {
			try {
				const result = await repository.query({
					select: aggregateSelect,
					filters,
					conditions,
					inputProperties,
					q: wildcardSearch
				});
				if (!cancelled) {
					setAggregateSummary((result.data?.[0] as Record<string, unknown>) || null);
				}
			} catch (e) {
				if (!cancelled) setAggregateSummary(null);
			}
		})();
		return () => { cancelled = true; };
	}, [aggregateSelect, filters, conditions, inputProperties, wildcardSearch, repository]);

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