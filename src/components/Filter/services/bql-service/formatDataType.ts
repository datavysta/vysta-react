import DataType from '../../../Models/DataType';

const formatDataType = (
	dataType: DataType | string,
	length: number | null,
	precision: number | null,
	scale: number | null
): string => {
	if (length) {
		return `${dataType}(${length})`;
	}

	if (precision && scale) {
		return `${dataType}(${precision}, ${scale})`;
	}

	if (precision) {
		return `${dataType}(${precision})`;
	}

	return dataType;
};

export default formatDataType;
