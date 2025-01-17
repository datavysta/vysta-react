import { WithTranslation } from 'react-i18next';

interface IProperty extends WithTranslation {
	design?: boolean;
	data?: any;
	onPropertyChanged?(propertyName: string, value: any): void;
}

export default IProperty;
