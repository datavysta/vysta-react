import { generateUUID } from '../../utils/uuid';
import ObjectRef from './ObjectRef';
import SelectStatement from './SelectStatement';
import Join from './Join';

export default interface TableSource {
	id: string;
	alias: string | null;
	objectRef: ObjectRef;
	subQuery: SelectStatement | null;
	joins: Join[];
}

export const newTableSource = (objectRef: ObjectRef): TableSource => ({
	id: generateUUID(),
	alias: null,
	objectRef,
	subQuery: null,
	joins: []
});
