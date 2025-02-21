import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {
	ColDef,
	GridApi,
	GridOptions,
	ICellRendererParams,
	IGetRowsParams,
	RowClassParams,
	RowClickedEvent,
	GetRowIdParams,
	ModuleRegistry,
	InfiniteRowModelModule,
	SortModelItem, TextEditorModule,
} from 'ag-grid-community';
import type {Theme} from "ag-grid-community/dist/types/src/theming/Theme";
import type {OrderBy, SortDirection, IReadonlyDataService, IDataService} from '@datavysta/vysta-client';
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
	TextEditorModule
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
	filters?: { [K in keyof T]?: any };
	conditions?: Condition[];
	inputProperties?: {
		[key: string]: string;
	};
	toolbarItems?: React.ReactNode;
	onDataFirstLoaded?: (gridApi: GridApi<U>) => void;
	/**
	 * Called every time data is loaded, including filter changes and initial load
	 * Not called for infinite scroll loads
	 */
	onDataLoaded?: (gridApi: GridApi<U>, data: U[]) => void;
	getRowClass?: ((params: RowClassParams<U>) => string | string[] | undefined);
	onRowClicked?: (event: RowClickedEvent<U>) => void;
	getRowId: (data: T) => string;
	theme?: Theme | 'legacy';
	tick?: number;
	styles?: DataGridStyles;
	editService?: IDataService<T, U>;
	editableFields?: {
		[K in keyof U]?: EditableFieldConfig;
	};
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
	                                           toolbarItems,
	                                           onDataFirstLoaded,
	                                           onDataLoaded,
	                                           getRowId,
	                                           theme,
	                                           tick = 0,
	                                           styles = {},
	                                           editService,
	                                           editableFields,
                                           }: DataGridProps<T, U>) {
	const gridApiRef = useRef<GridApi<U> | null>(null);
	const [lastKnownRowCount, setLastKnownRowCount] = useState<number>(-1);
	const dataFirstLoadedRef = useRef(false);

	const defaultColDef = useMemo<ColDef>(() => ({
		sortable: true,
		resizable: true,
		flex: 1
	}), []);

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
		if (!('delete' in repository) || typeof (repository as any).delete !== 'function') {
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
				const sortModel = (gridApi as any).getColumnState() as SortModelItem[];
				if (sortModel?.length > 0) {
					for (const sort of sortModel) {
						const key = sort.colId;
						order[key as keyof T] = sort.sort?.toLowerCase() as SortDirection;
					}
				}
			}

			const select = [...new Set(
				columnDefs
					.filter(col => col.field && !col.field.startsWith('_'))
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

				const select = [...new Set(
					columnDefs
						.filter(col => col.field && !col.field.startsWith('_'))
						.map(col => String(col.field) as keyof T)
				)];

				const primaryKey = (repository as any).primaryKey as keyof T | Array<keyof T>;
				if (primaryKey) {
					const keysToAdd = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
					for (const key of keysToAdd) {
						if (!select.includes(key)) {
							select.push(key);
						}
					}
				}

				const result = await repository.query({
					select,
					limit,
					offset: startRow,
					order,
					filters,
					conditions,
					inputProperties,
					recordCount: startRow === 0
				});

				if (startRow === 0 && result.count !== undefined) {
					setLastKnownRowCount(result.count);
				}

				const lastRow = result.data.length < limit ? startRow + result.data.length : undefined;
				params.successCallback(result.data, lastRow);

				if (!dataFirstLoadedRef.current && gridApiRef.current) {
					onDataFirstLoaded?.(gridApiRef.current);
					dataFirstLoadedRef.current = true;
				}

				if (gridApiRef.current && onDataLoaded) {
					onDataLoaded(gridApiRef.current, result.data);
				}
			} catch (error) {
				console.error('Error fetching rows:', error);
				params.failCallback();
			}
		}
	};

	const getRowIdHandler = useCallback((params: GetRowIdParams<U>) => {
		return params.data ? getRowId(params.data) : '';
	}, [getRowId]);

	const actualGridOptions = useMemo<GridOptions<U>>(() => {
		return {
			columnDefs: modifiedColDefs,
			rowModelType: 'infinite',
			cacheBlockSize: 50,
			paginationPageSize: 50,
			defaultColDef,
			components: {
				actionsCellRenderer,
				EditableTextCell
			},
			singleClickEdit: hasEditableColumns,
			stopEditingWhenCellsLoseFocus: hasEditableColumns,
			getRowId: getRowIdHandler,
			...gridOptions,
		};
	}, [modifiedColDefs, defaultColDef, gridOptions, getRowIdHandler, hasEditableColumns]);

	useEffect(() => {
		dataFirstLoadedRef.current = false;
		gridApiRef.current?.updateGridOptions({datasource: dataSource});
	}, [tick, filters, conditions, inputProperties]);

	const onGridReady = (params: any) => {
		gridApiRef.current = params.api;
		params.api.updateGridOptions({datasource: dataSource});

		if (typeof gridOptions?.onGridReady === 'function') {
			gridOptions.onGridReady(params);
		}
	};

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
		</div>
	);
} 