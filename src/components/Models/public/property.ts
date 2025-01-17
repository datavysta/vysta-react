interface IProperty {
	design?: boolean;
	data?: any;
	onPropertyChanged?(propertyName: string, value: any): void;
}

export default IProperty;
