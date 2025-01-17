import React from 'react';
import { withTranslation } from 'react-i18next';
import { Select } from '@mantine/core';
import IFieldProperty from '../../Models/public/fieldproperty';
import DefaultFieldProperty from '../../Models/public/defaultfieldproperty';
import SearchCondition from '../../Filter/searchcondition';

class SelectComponent extends React.Component<IFieldProperty> {
	public static defaultProps = DefaultFieldProperty;

	render() {
		const {
			readOnly,
			disabled,
			error,
			name,
			onSearch,
			onChange,
			required,
			label,
			placeholder,
			description,
			value,
			items,
			multiple,
			className,
		} = this.props;

		if (readOnly) {
			return <>{value}</>;
		}

		const props: any = {};

		if (!onSearch) {
			let options: any[] = [];
			if (items) {
				options = items.map((i) => {
					return {
						value: i.value,
						label: i.label,
					};
				});
			}

			props.data = options;
		} else {
			props.data = [];
			const condition = new SearchCondition();
			const onSearchChange = (keywords: string) => {
				condition.keywords = keywords;
				onSearch(condition);
			};

			props.onDropdownOpen = () => onSearch(new SearchCondition());
			props.onSearchChange = onSearchChange;
		}

		if (!items) {
			props.data = [{ value, label: value }];
		}

		const myOnChange = (value: string) => {
			if (onChange) {
				onChange(value);
			}
		};

		return (
			<>
				<Select
					{...props}
					readOnly={readOnly}
					key={name}
					error={error}
					disabled={disabled}
					required={required}
					label={label}
					placeholder={placeholder}
					description={description}
					multiple={multiple}
					onChange={myOnChange}
					clearable
					value={value ? value : ''}
					className={className}
				/>
			</>
		);
	}
}

export default withTranslation()(SelectComponent);
