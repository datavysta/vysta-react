import { generateUUID } from '../../utils/uuid';

export default interface OrderBy {
	id: string;
	column: string;
	direction: 'asc' | 'desc';
}

export const newOrderBy = (column: string, direction: 'asc' | 'desc'): OrderBy => ({
	id: generateUUID(),
	column,
	direction
});
