import { v4 as uuidv4 } from 'uuid';
import QueryStatement from './QueryStatement';
import TableSource from './TableSource';
import SelectStatementItem from './SelectStatementItem';
import OrderBy from './OrderBy';
import Condition from './Condition';

export class SelectStatement extends QueryStatement {
	id: string = uuidv4();
	distinct = false;
	items: SelectStatementItem[] = [];
	sources: TableSource[] = [];
	orderBy: OrderBy[] = [];
	whereConditions: Condition[] = [];
	where: string | null = null;
	having: string | null = null;
	havingConditions: Condition[] = [];
	limit: number | null = null;
	offSet: number | null = null;
}

export default SelectStatement;
