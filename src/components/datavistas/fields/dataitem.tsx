import { FC } from 'react';
import IFieldProperty from '../../Models/public/fieldproperty';
import { useTranslationContext } from '../../Filter/TranslationContext';

interface IDataItemProperties extends IFieldProperty {
	value: string;
	label: string;
}

const DataItemComponent: FC<IDataItemProperties> = ({
	value,
	label
}) => {
	return (
		<div>
			<strong>{label}:</strong> {value}
		</div>
	);
};

export default DataItemComponent;
