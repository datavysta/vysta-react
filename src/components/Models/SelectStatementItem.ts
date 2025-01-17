import { v4 as uuidv4 } from 'uuid';
import GroupBy from './GroupBy';
import ColumnRef from './ColumnRef';

export default class SelectStatementItem {
	id: string = uuidv4().toLowerCase();
	alias: string | null = null;
	expression: string | null = null;
	groupBy: GroupBy | null = null;
	output = true;
	column: ColumnRef | null = null;
}
