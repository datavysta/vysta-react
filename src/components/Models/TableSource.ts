import ObjectRef from './ObjectRef';
import Join from './Join';
import { v4 as uuidv4 } from 'uuid';
import SelectStatement from './SelectStatement';

export default class TableSource {
	id: string = uuidv4().toLowerCase();
	alias: string | null = null;
	object: ObjectRef | null = null;
	subQuery: SelectStatement | null = null;
	joins: Join[] = [];
}
