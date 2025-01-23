import { generateUUID } from '../../utils/uuid';
import GroupBy from './GroupBy';
import ColumnRef from './ColumnRef';

export default class SelectStatementItem {
	id: string = generateUUID();
	alias: string | null = null;
	expression: string | null = null;
	groupBy: GroupBy | null = null;
	output = true;
	column: ColumnRef | null = null;
}
