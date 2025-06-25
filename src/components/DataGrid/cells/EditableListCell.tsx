import { LazyLoadList } from '../../LazyLoadList/LazyLoadList';
import { BaseEditableCell } from './BaseEditableCell';
import type { IReadonlyDataService } from '@datavysta/vysta-client';

interface ListConfig {
    listService: IReadonlyDataService<Record<string, unknown>>;
    displayColumn: string;
    clearable?: boolean;
}

export class EditableListCell extends BaseEditableCell {
    private hasOpenedDropdown = false;

    getValue() {
        // Get the field name and look up the value from the row data
        const fieldName = this.props.colDef?.field;
        const value = fieldName && this.props.data ? this.props.data[fieldName] : this.props.value;
        return value || '';
    }

    componentDidMount() {
        // Open dropdown after a short delay to ensure everything is rendered
        setTimeout(() => {
            if (this.hasOpenedDropdown) return;
            
            // Try to click the input to open the dropdown
            const button = document.querySelector('.mantine-InputBase-input[type="button"]') as HTMLButtonElement;
            if (button) {
                this.hasOpenedDropdown = true;
                
                // Prevent focus loss by focusing the button first
                button.focus();
                
                // Use a small delay to ensure focus is established
                setTimeout(() => {
                    button.click();
                }, 50);
            }
        }, 100);
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
        const { listService, displayColumn, clearable } = this.props as unknown as ListConfig;
        const options = (this.props as Record<string, unknown>).listOptions || {};
        
        // Get the column width from AG Grid
        const columnWidth = this.props.column?.getActualWidth() || 200;

        // Get the actual value from the data using our getValue method
        const currentValue = this.getValue();

        return (
            <div style={{ 
                width: columnWidth,
                position: 'relative',
                zIndex: 9999
            }}>
                <LazyLoadList
                    {...options}
                    repository={listService}
                    value={currentValue}
                    onChange={this.handleChange}
                    displayColumn={displayColumn}
                    clearable={clearable}
                    useCache={true}
                    autoSearchInputFocus={true}
                    withinPortal={false} // Keep dropdown in the same DOM tree to prevent AG Grid from closing it
                    defaultOpened={true} // Open dropdown automatically when cell editor appears
                />
            </div>
        );
    }
}    