import DataType from './DataType';
import ColumnAnalysis from './columnanalysis';

export default interface IColumnSmallSummary {
	id: string;
	name: string;
	icon: string;
	fullDataType: string;
	dataType: DataType;
	length: number | null;
	precision: number | null;
	scale: number | null;
	direction: string | null;
	description: string | null;
	primaryKey: boolean;
	nullable: boolean;
	insertable: boolean;
	updateable: boolean;
	analysis: ColumnAnalysis | null;
}
