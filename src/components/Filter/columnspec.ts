import IColumnSmallSummary from '../Models/ColumnSmallSummary';
import OrderByDirection from '../Models/OrderByDirection';

export default interface ColumnSpec extends IColumnSmallSummary {
	index: number;
	orderByNumber: number | null;
	orderByType: OrderByDirection | null;
}

export const defaultColumnSpec: ColumnSpec = {
	icon: '',
	fullDataType: '',
	length: null,
	precision: null,
	scale: null,
	description: null,
	primaryKey: false,
	insertable: true,
	updateable: true,
	analysis: null,
	orderByNumber: null,
	orderByType: null,
} as unknown as ColumnSpec;
