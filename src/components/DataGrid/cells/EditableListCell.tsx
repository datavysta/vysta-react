import { LazyLoadList } from '../../LazyLoadList/LazyLoadList';
import { BaseEditableCell } from './BaseEditableCell';
import type { IReadonlyDataService } from '@datavysta/vysta-client';

interface ListConfig {
    listService: IReadonlyDataService<Record<string, unknown>>;
    displayColumn: string;
    clearable?: boolean;
}

export class EditableListCell extends BaseEditableCell {
    render() {
        const { listService, displayColumn, clearable } = this.props as unknown as ListConfig;
        const options = (this.props as Record<string, unknown>).listOptions || {};

        return (
            <LazyLoadList
                {...options}
                repository={listService}
                value={this.state.value}
                onChange={(newValue) => {
                    this.setState({ value: newValue || '' }, () => {
                        if (this.isDirty) {
                            this.handleSave();
                        }
                    });
                }}
                displayColumn={displayColumn}
                clearable={clearable}
                autoSearchInputFocus={false}
            />
        );
    }
}    