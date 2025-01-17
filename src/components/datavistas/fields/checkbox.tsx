import React from 'react';
import { Checkbox } from '@mantine/core';
import IFieldProperty from "../../Models/public/fieldproperty";
import defaultFieldProperty from '../../Models/public/defaultfieldproperty';

class CheckboxComponent extends React.Component<IFieldProperty> {
	public static defaultProps = defaultFieldProperty;

	render() {
		const { readOnly, disabled, error, value, t } = this.props;
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

		return <Checkbox disabled={disabled} error={error} checked={checked} />;
	}
}

export default CheckboxComponent;
