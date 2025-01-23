import { generateUUID } from '../../utils/uuid';
import JoinType from './JoinType';
import TableSource from './TableSource';
import Condition from './Condition';

export default class Join {
	id: string = generateUUID();
	edit = false;
	tableSource: TableSource | null = null;
	searchConditions: Condition[] = [];
	searchCondition: string | null = null;
	joinType: JoinType | null = null;
}
