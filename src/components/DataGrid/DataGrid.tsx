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
	ColDefField,
	ModuleRegistry,
	InfiniteRowModelModule,
} from 'ag-grid-community';
import type {Theme} from "ag-grid-community/dist/types/src/theming/Theme";
import {IDataService, OrderBy, SortDirection} from '@datavysta/vysta-client';
import moduleStyles from './DataGrid.module.css';



ModuleRegistry.registerModules([
	InfiniteRowModelModule,
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

export interface DataGridProps<T extends object> {
	title: string;
	noun: string;
	repository: IDataService<T>;
	columnDefs: ColDef<T>[];
	gridOptions?: GridOptions<T>;
	supportRegularDownload?: boolean;
	supportInsert?: boolean;
	supportDelete?: boolean;
	filters?: { [K in keyof T]?: any };
	toolbarItems?: React.ReactNode;
	onDataFirstLoaded?: (gridApi: GridApi<T>) => void;
	getRowClass?: ((params: RowClassParams<T>) => string | string[] | undefined);
	onRowClicked?: (event: RowClickedEvent<T>) => void;
	getRowId: (data: T) => string;
	theme?: Theme | 'legacy';
	tick?: number;
	styles?: DataGridStyles;
}

export function DataGrid<T extends object>({
	                                           title,
	                                           noun,
	                                           repository,
	                                           columnDefs,
	                                           gridOptions,
	                                           supportRegularDownload = false,
	                                           supportInsert = false,
	                                           supportDelete = false,
	                                           filters = {},
	                                           toolbarItems,
	                                           onDataFirstLoaded,
	                                           getRowClass,
	                                           onRowClicked,
	                                           getRowId,
												theme,
	                                           tick = 0,
	                                           styles = {},
                                           }: DataGridProps<T>) {
	const gridApiRef = useRef<GridApi<T> | null>(null);
	const [lastKnownRowCount, setLastKnownRowCount] = useState<number>(-1);
	const [dataFirstLoaded, setDataFirstLoaded] = useState(false);

	const defaultColDef = useMemo<ColDef>(() => ({
		sortable: true,
		resizable: true,
		flex: 1,
	}), []);

	const actionsCellRenderer = useCallback((params: ICellRendererParams<T>) => {
		if (!supportDelete || !params.data) return null;

		const rowId = getRowId(params.data);
		return (
			<button
				onClick={() => handleDelete(rowId)}
				className={moduleStyles.deleteButton}
				style={styles.deleteButton}
			>
				Delete
			</button>
		);
	}, [supportDelete, getRowId]);

	const handleDelete = async (id: string) => {
		if (!id) return;

		try {
			await repository.delete(id);
			if (gridApiRef.current) {
				gridApiRef.current.updateGridOptions({datasource: dataSource});
			}
		} catch (error) {
			console.error('Failed to delete:', error);
		}
	};

	const modifiedColDefs = useMemo(() => {
		const cols = [...columnDefs];

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
	}, [columnDefs, supportDelete]);

	const dataSource = {
		getRows: async (params: IGetRowsParams) => {
			const {startRow, endRow, sortModel} = params;
			const limit = endRow - startRow;

			try {
				const order: OrderBy<T> = {};
				if (sortModel?.length > 0) {
					sortModel.forEach(sort => {
						const colId = sort.colId as keyof T;
						order[colId] = sort.sort.toLowerCase() as SortDirection;
					});
				}

				const select = columnDefs
					.filter((col): col is ColDef<T> & { field: ColDefField<T> } =>
						col.field !== undefined
					)
					.map(col => col.field as keyof T);

				const primaryKey = (repository as any).primaryKey as keyof T;
				if (primaryKey && !select.includes(primaryKey)) {
					select.push(primaryKey);
				}

				const result = await repository.getAll({
					select,
					limit,
					offset: startRow,
					order,
					filters,
					recordCount: startRow === 0
				});

				if (startRow === 0 && result.count !== undefined) {
					setLastKnownRowCount(result.count);
				}

				const lastRow = result.data.length < limit ? startRow + result.data.length : undefined;
				params.successCallback(result.data, lastRow);

				if (!dataFirstLoaded && gridApiRef.current) {
					onDataFirstLoaded?.(gridApiRef.current);
					setDataFirstLoaded(true);
				}
			} catch (error) {
				console.error('Error fetching rows:', error);
				params.failCallback();
			}
		}
	};

	const getRowIdHandler = useCallback((params: GetRowIdParams<T>) => {
		return params.data ? getRowId(params.data) : '';
	}, [getRowId]);

	const actualGridOptions = useMemo<GridOptions<T>>(() => ({
		columnDefs: modifiedColDefs,
		rowModelType: 'infinite',
		cacheBlockSize: 50,
		paginationPageSize: 50,
		defaultColDef,
		components: {
			actionsCellRenderer
		},
		getRowClass,
		onRowClicked,
		getRowId: getRowIdHandler,
		...gridOptions,
	}), [modifiedColDefs, defaultColDef, gridOptions, getRowClass, onRowClicked, getRowIdHandler]);

	useEffect(() => {
		gridApiRef.current?.updateGridOptions({datasource: dataSource});
	}, [tick, filters]);

	const onGridReady = (params: any) => {
		gridApiRef.current = params.api;
		params.api.updateGridOptions({datasource: dataSource});
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
						<button className={moduleStyles.downloadButton} style={styles.downloadButton} disabled>
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