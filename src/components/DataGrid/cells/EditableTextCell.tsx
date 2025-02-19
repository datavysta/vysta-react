import { ActionIcon, TextInput } from '@mantine/core';
import { BaseEditableCell } from './BaseEditableCell';

export class EditableTextCell extends BaseEditableCell {
    render() {
        return (
            <TextInput
                value={this.state.value}
                onChange={(e) => this.setState({ value: e.target.value })}
                autoFocus
                data-autofocus
                onFocus={(e) => e.target.select()}
                onKeyDownCapture={(e) => {
                    if (e.key === 'Enter' && this.isDirty) {
                        e.preventDefault();
                        this.handleSave();
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
                        onClick={this.handleSave}
                        disabled={!this.isDirty}
                        styles={{
                            root: {
                                opacity: this.isDirty ? 1 : 0.5,
                                transition: 'opacity 0.3s ease'
                            }
                        }}
                    >
                        ✓
                    </ActionIcon>
                }
            />
        );
    }
} 