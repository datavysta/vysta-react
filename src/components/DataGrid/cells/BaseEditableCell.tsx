import React from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import { BaseEditableCellProps } from '../types';

export abstract class BaseEditableCell extends React.Component<ICellEditorParams & BaseEditableCellProps> {
    state = {
        value: this.props.value,
    };

    get isDirty() {
        return this.state.value !== this.props.value;
    }

    handleSave = async () => {
        if (!this.isDirty) return;
        try {
            await this.props.onSave(this.state.value);
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    getValue() {
        return this.state.value;
    }

    abstract render(): React.ReactNode;
} 