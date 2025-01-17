import escapeIdentifier from './escapeIdentifierIfRequired';
import escapeRef from './escapeRefIfRequired';
import SelectStatementItem from '../../../Models/SelectStatementItem';
import OrderBy from '../../../Models/OrderBy';
import Join from '../../../Models/Join';
import JoinType from '../../../Models/JoinType';
import OrderByType from '../../../Models/OrderByType';
import GroupBy from '../../../Models/GroupBy';
import BqlTableSource from '../../../Models/TableSource';
import SelectStatement from '../../../Models/SelectStatement';

export default class Writer {
	private NewLine = '\r\n';
	private IndentSpacing = 4;
	private indentChars = '';
	private levelChars = '';
	private builder = '';

	constructor(
		private readonly statement: SelectStatement,
		private format = false,
		private nestingLevel = 0
	) {
		this.statement = _.cloneDeep(statement);

		for (let index = 0; index < this.IndentSpacing; index++) {
			this.indentChars += ' ';
		}

		for (let level = 0; level < this.nestingLevel; level++) {
			this.levelChars += this.indentChars;
		}

		this.optimize();
	}

	private optimize() {
		const items = this.statement.items.filter((item) => {
			if (item.expression) {
				return item;
			}

			if (item.alias) {
				return item;
			}

			if (item.groupBy) {
				return item;
			}

			return undefined;
		});

		this.statement.items = items;
	}

	private writeNewLine() {
		if (this.format === false) {
			this.builder += ' ';

			return;
		}

		this.builder += this.NewLine;
	}

	private writeLevel() {
		this.builder += this.levelChars;
	}

	private writeIndent() {
		if (this.format === false) {
			return;
		}

		this.builder += this.indentChars;
	}

	toBql() {
		const { statement } = this;

		this.writeLevel();
		this.builder += 'SELECT';

		if (statement.distinct) {
			this.builder += ' DISTINCT';
		}

		this.writeNewLine();
		this.writeSelectItems();
		this.writeFrom();
		this.writeWhere();
		this.writeGroupBy();
		this.writeHaving();
		this.writeOrderBy();

		if (statement.limit) {
			this.writeNewLine();
			this.builder += `LIMIT ${statement.limit}`;
		}

		if (statement.offSet) {
			this.writeNewLine();
			this.builder += `OFFSET ${statement.offSet}`;
		}

		return this.builder;
	}

	private writeOrderBy() {
		const orderBy = this.statement.orderBy.filter((item) => {
			if (item.expression) {
				return true;
			}

			if (item.type) {
				return true;
			}

			return false;
		});

		if (orderBy.length === 0) {
			return;
		}

		this.writeNewLine();
		this.builder += 'ORDER BY';
		this.writeNewLine();

		const lastIndex = orderBy.length - 1;
		let index = 0;
		orderBy.forEach((item) => {
			this.writeIndent();
			this.writeOrderByExpression(item);
			this.writeOrderByType(item);

			if (index !== lastIndex) {
				this.builder += ',';
				this.writeNewLine();
			}

			index++;
		});
	}

	private writeOrderByExpression(item: OrderBy) {
		this.builder += item.expression;
	}

	private writeOrderByType(item: OrderBy) {
		const orderByType = item.type;

		switch (orderByType) {
			case OrderByType.ASC:
				this.builder += ' ASC';
				break;
			case OrderByType.DESC:
				this.builder += ' DESC';
				break;
			default:
				this.builder += ' ASC';
		}
	}

	private writeGroupBy() {
		if (!this.statement.items) {
			return;
		}

		const items = this.statement.items.filter((item) => {
			if (!item.groupBy) {
				return undefined;
			}

			if (item.groupBy !== GroupBy.GroupBy) {
				return undefined;
			}

			return item;
		});

		if (items.length === 0) {
			return;
		}

		this.writeNewLine();
		this.builder += 'GROUP BY';
		this.writeNewLine();

		const last = items[items.length - 1];
		items.forEach((item) => {
			this.writeIndent();
			this.builder += item.expression;

			if (item !== last) {
				this.builder += ',';
				this.writeNewLine();
			}
		});
	}

	private writeFrom() {
		if (!_.has(this.statement, 'sources')) {
			return;
		}

		const { sources } = this.statement;
		if (sources.length === 0) {
			return;
		}

		this.writeNewLine();
		this.builder += 'FROM';

		const last = sources[sources.length - 1];
		sources.forEach((source) => {
			this.writeSource(source);

			if (source !== last) {
				this.builder += ',';
			}
		});
	}

	private writeSource(source: BqlTableSource) {
		this.writeNewLine();
		this.writeIndent();
		if (source.object) {
			this.builder += escapeRef(source.object);
		}

		if (source.subQuery) {
			this.builder += '(';
			const innerWriter = new Writer(
				source.subQuery,
				this.format,
				this.nestingLevel + 1
			);
			this.builder += innerWriter.toBql();
			this.builder += ')';
		}

		if (_.has(source, 'alias') && !_.isEmpty(source.alias)) {
			const escapedAlias = escapeIdentifier(source.alias);
			this.builder += ` AS ${escapedAlias}`;
		}

		if (!_.has(source, 'joins')) {
			return;
		}

		const { joins } = source;
		joins.forEach((join) => {
			this.writeJoin(join);
		});
	}

	private writeJoin(join: Join) {
		switch (join.joinType) {
			case JoinType.Cross:
				this.builder += ' CROSS JOIN';
				break;
			case JoinType.Inner:
				this.builder += ' INNER JOIN';
				break;
			case JoinType.LeftOuter:
				this.builder += ' LEFT OUTER JOIN';
				break;
			case JoinType.FullOuter:
				this.builder += ' FULL OUTER JOIN';
				break;
			case JoinType.RightOuter:
				this.builder += ' RIGHT OUTER JOIN';
				break;
			default:
				throw new Error('Join type not supported.');
		}

		if (!_.has(join, 'tableSource')) {
			return;
		}

		if (!join.tableSource) {
			return;
		}

		this.writeSource(join.tableSource);

		this.builder += this.writeJoinConditions(join);
	}

	private writeJoinConditions(join: Join) {
		if (!join.searchCondition && join.searchConditions.length === 0) {
			return '';
		}

		let where = join.searchCondition ? join.searchCondition : '';

		/*
		//TODO conditions
		if (join.searchConditions.length > 0) {
			const conditionsWhere = conditionsWriter(join.searchConditions);
			if (where) {
				where = `(${where}) AND (${conditionsWhere})`;
			} else {
				where = conditionsWhere;
			}
		}
		 */

		if (!where) {
			return '';
		}

		return ` ON ${where}`;
	}

	private writeWhere() {
		if (
			!this.statement.where &&
			this.statement.whereConditions.length === 0
		) {
			return;
		}

		let where = this.statement.where ? this.statement.where : '';

		/*
		//TODO conditions
		if (this.statement.whereConditions.length > 0) {
			const conditionsWhere = conditionsWriter(this.statement.whereConditions);
			if (where) {
				where = `(${where}) AND (${conditionsWhere})`;
			} else {
				where = conditionsWhere;
			}
		}
		 */

		if (!where) {
			return;
		}

		this.writeNewLine();
		this.builder += 'WHERE';
		this.writeNewLine();
		this.writeIndent();
		this.builder += where;
	}

	private writeHaving() {
		if (
			!this.statement.having &&
			this.statement.havingConditions.length === 0
		) {
			return;
		}

		let having = this.statement.having ? this.statement.having : '';

		/*
		//TODO conditions
		if (this.statement.havingConditions.length > 0) {
			const conditionsWhere = conditionsWriter(this.statement.havingConditions);
			if (having) {
				having = `(${having}) AND (${conditionsWhere})`;
			} else {
				having = conditionsWhere;
			}
		}
		 */

		if (!having) {
			return;
		}

		this.writeNewLine();
		this.builder += 'HAVING';
		this.writeNewLine();
		this.writeIndent();
		this.builder += having;
	}

	private writeSelectItems() {
		if (!_.has(this.statement, 'items')) {
			return;
		}

		const items = this.statement.items.filter((item) => {
			if (item.output === false) {
				return false;
			}

			return true;
		});

		if (items.length === 0) {
			this.writeIndent();
			this.builder += '*';
			return;
		}

		items.forEach((item) => {
			this.writeIndent();
			this.writeSelectItemExpression(item);

			if (item.alias) {
				const escapedAlias = escapeIdentifier(item.alias);
				this.builder += ` AS ${escapedAlias}`;
			}

			const last = items[items.length - 1];
			if (item !== last) {
				this.builder += ',';
				this.writeNewLine();
			}
		});
	}

	private writeSelectItemExpression(item: SelectStatementItem) {
		if (!_.has(item, 'groupBy')) {
			this.builder += item.expression;

			return;
		}

		if (_.isNil(item.groupBy)) {
			this.builder += item.expression;

			return;
		}

		if (item.groupBy === GroupBy.GroupBy) {
			this.builder += item.expression;

			return;
		}

		switch (item.groupBy) {
			case GroupBy.Sum:
				this.builder += `SUM(${item.expression})`;
				return;
			case GroupBy.Count:
				this.builder += `COUNT(${item.expression})`;
				return;
			case GroupBy.Min:
				this.builder += `MIN(${item.expression})`;
				return;
			case GroupBy.Max:
				this.builder += `MAX(${item.expression})`;
				return;
			case GroupBy.Avg:
				this.builder += `AVG(${item.expression})`;
				return;
			default:
				throw new Error('Unsupported GroupBy.');
		}
	}
}
