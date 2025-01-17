import { v4 as uuidv4 } from 'uuid';
import TableSource from './TableSource';
import JoinType from './JoinType';
import Condition from './Condition';

export default class Join {
	id: string = uuidv4().toLowerCase();
	edit = false;
	tableSource: TableSource | null = null;
	searchConditions: Condition[] = [];
	searchCondition: string | null = null;
	joinType: JoinType | null = null;
}
