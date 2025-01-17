import { v4 as uuidv4 } from 'uuid';

import { OrderByType } from './OrderByType';

export default class OrderBy {
	id: string = uuidv4().toLowerCase();
	expression: string | null = null;
	type: OrderByType | null = null;
}
