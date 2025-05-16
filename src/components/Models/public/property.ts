interface IProperty {
	design?: boolean;
	data?: Record<string, unknown>;
	onPropertyChanged?(propertyName: string, value: unknown): void;
}

export default IProperty;
