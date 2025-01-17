export default interface ColumnAnalysis {
	values: number;
	valuesPercent: number;
	uniqueValues: number;
	uniqueValuesPercent: number;
	minValue: string | null;
	maxValue: string | null;
	avgValue: string | null;
}
