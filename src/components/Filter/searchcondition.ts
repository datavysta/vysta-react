import OrderBy from '../Models/OrderBy';

export default class SearchCondition {
	keywords: string | null = null;
	limit: number | null = null;
	offSet: number | null = null;
	recordCount?: boolean = true;
	orderBy: OrderBy[] = [];

	constructor(keywords: string | null = null) {
		this.keywords = keywords;
	}
}
