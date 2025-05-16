import React, { forwardRef, useImperativeHandle } from 'react';
import { ActionIcon, TextInput } from '@mantine/core';
import { ICellEditorParams } from 'ag-grid-community';

interface EditableTextCellProps {
    onSave: (newValue: string) => Promise<void>;
}

export const EditableTextCell = forwardRef((
    props: ICellEditorParams & EditableTextCellProps,
    ref
) => {
    const [value, setValue] = React.useState(props.value);
    const isDirty = value !== props.value;

    useImperativeHandle(ref, () => ({
        getValue() {
            return value;
        }
    }));

    const handleSave = async () => {
        if (!isDirty) return;
        try {
            await props.onSave(value);
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    return (
        <TextInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            data-autofocus
            onFocus={(e) => e.target.select()}
            onKeyDownCapture={(e) => {
                if (e.key === 'Enter' && isDirty) {
                    e.preventDefault();
                    handleSave();
                }
            }}
            styles={{
                wrapper: { 
                    width: '100%', 
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                },
                input: { 
                    height: '100%',
                    border: 'none',
                    borderRadius: 0,
                    paddingRight: '40px',
                    backgroundColor: 'white',
                }
            }}
            rightSection={
                <ActionIcon 
                    color="green" 
                    variant="subtle" 
                    onClick={handleSave}
                    disabled={!isDirty}
                    styles={{
                        root: {
                            opacity: isDirty ? 1 : 0.5,
                            transition: 'opacity 0.3s ease'
                        }
                    }}
                >
                    ✓
                </ActionIcon>
            }
        />
    );
}); 

EditableTextCell.displayName = 'EditableTextCell';  