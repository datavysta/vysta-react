import React, { ChangeEvent } from 'react';
import { Switch } from '@mantine/core';
import { withTranslation } from 'react-i18next';
import IFieldProperty from '../../Models/public/fieldproperty';
import defaultFieldProperty from '../../Models/public/defaultfieldproperty';

class ToggleComponent extends React.Component<IFieldProperty> {
	public static defaultProps = defaultFieldProperty;

	constructor(props: IFieldProperty) {
		super(props);
		this.onChange = this.onChange.bind(this);
	}

	private onChange(event: ChangeEvent<any>): void {
		const { onChange } = this.props;
		if (!onChange) {
			return;
		}

		onChange(`${event.target.checked}`);
	}

	render() {
		const { readOnly, disabled, value, label, t } = this.props;
		if (readOnly) {
			if (value === undefined || value === null) {
				return;
			}

			let converted = `${value}`.toLowerCase();
			if (converted === 'true') {
				converted = 'Yes';
			} else if (converted === 'false') {
				converted = 'No';
			}

			return <span>{t(converted)}</span>;
		}

		let checked: boolean | undefined = undefined;
		const strValue = `${value}`.toLowerCase();
		if (strValue === 'true') {
			checked = true;
		} else if (strValue === 'false') {
			checked = false;
		}

		return (
			<Switch
				disabled={disabled}
				label={label ? label : ''}
				checked={checked}
				onClick={this.onChange}
			/>
		);
	}
}

export default withTranslation()(ToggleComponent);
