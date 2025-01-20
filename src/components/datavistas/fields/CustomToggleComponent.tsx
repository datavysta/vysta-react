import React, { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import './CustomToggleComponent.css';

interface ICustomToggleProps extends IFieldProperty {
	value?: string;
	onChange?: (value: string) => void;
}

const CustomToggleComponent: FC<ICustomToggleProps> = ({
	value,
	onChange,
	label
}) => {
	const isChecked = value === 'true';

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.checked.toString());
	};

	return (
		<div className="custom-toggle-wrapper">
			<label>
				{label}
				<input
					type="checkbox"
					checked={isChecked}
					onChange={handleChange}
					className="custom-toggle"
				/>
			</label>
		</div>
	);
};

export default CustomToggleComponent; 