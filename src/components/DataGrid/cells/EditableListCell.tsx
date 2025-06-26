import { LazyLoadList } from '../../LazyLoadList/LazyLoadList';
import { BaseEditableCell } from './BaseEditableCell';
import type { IReadonlyDataService } from '@datavysta/vysta-client';

interface ListConfig {
    listService: IReadonlyDataService<Record<string, unknown>>;
    displayColumn: string;
    clearable?: boolean;
    useCache?: boolean;
}

export class EditableListCell extends BaseEditableCell {
    getValue() {
        // Get the field name and look up the value from the row data
        const fieldName = this.props.colDef?.field;
        
        // Check local edits first (same logic as DataGrid's cellEditorParams)
        const rowId = this.props.data ? (this.props as any).getRowId?.(this.props.data) : null;
        const localEdits = rowId ? this.props.context?.localEdits?.current?.get(rowId) : null;
        
        let value;
        if (localEdits && fieldName && fieldName in localEdits) {
            // Use the local edit value
            value = localEdits[fieldName];
        } else if (fieldName && this.props.data) {
            // Use the original data value
            value = this.props.data[fieldName];
        } else {
            // Fallback to props.value
            value = this.props.value;
        }
        
        return String(value) || '';
    }

    // Tell AG Grid this is a popup editor
    isPopup(): boolean {
        return true;
    }

    // Tell AG Grid where to position the popup
    getPopupPosition(): string {
        return 'under';
    }

    handleChange = (newValue: string | null) => {
        // Only update and save if the value actually changed
        if (newValue === this.state.value) {
            return;
        }
        
        this.setState({ value: newValue || '' }, () => {
            if (this.isDirty) {
                this.handleSave().then(() => {
                    // Lists are funny - this delay prevents premature closing
                    setTimeout(() => {
                        this.props.api?.stopEditing();
                    }, 100);
                });
            }
        });
    };

    render() {
        const { listService, displayColumn, clearable, useCache } = this.props as unknown as ListConfig;
        const options = (this.props as Record<string, unknown>).listOptions || {};
        
        // Get the column width from AG Grid
        const columnWidth = this.props.column?.getActualWidth() || 200;

        // Get the actual value from the data using our getValue method
        const currentValue = this.getValue();
        
        // Get the display value from props if it was passed by DataGrid
        const initialDisplayValue = (this.props as any).displayValue;
        


        return (
            <LazyLoadList
                    {...options}
                    repository={listService}
                    value={currentValue}
                    onChange={this.handleChange}
                    displayColumn={displayColumn}
                    clearable={clearable}
                    useCache={useCache}
                    autoSearchInputFocus={true}
                    withinPortal={false} // Keep dropdown in the same DOM tree to prevent AG Grid from closing it
                    defaultOpened={true} // Open dropdown automatically when cell editor appears
                    initialDisplayValue={initialDisplayValue}
                    styles={{
                        input: {
                            wrapper: {
                                width: columnWidth,
                            },
                            input: {
                                height: this.props.node?.rowHeight || undefined
                            }
                        }
                    }}
                />
        );
    }
}    