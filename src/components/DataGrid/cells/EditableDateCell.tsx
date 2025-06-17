import { DatePickerInput } from '@mantine/dates';
import { ActionIcon } from '@mantine/core';
import { BaseEditableCell } from './BaseEditableCell';

export class EditableDateCell extends BaseEditableCell {
    render() {
        const options = (this.props as Record<string, unknown>).dateOptions || {};
        
        return (
            <DatePickerInput
                {...options}
                value={this.state.value}
                onChange={(date) => {
                    if (date) {
                        this.setState({ value: date }, this.handleSave);
                    }
                }}
                autoFocus
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