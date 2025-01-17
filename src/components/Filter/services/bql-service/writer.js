import escapeIdentifier from './escapeIdentifierIfRequired';
import escapeRef from './escapeRefIfRequired';
import JoinType from '../../../Models/JoinType';
import OrderByType from '../../../Models/OrderByType';
import GroupBy from '../../../Models/GroupBy';
import isNil from '../../../../utils/isNil';

export default class Writer {
    constructor(statement, format = false, nestingLevel = 0) {
        Object.defineProperty(this, "statement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: statement
        });
        Object.defineProperty(this, "format", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: format
        });
        Object.defineProperty(this, "nestingLevel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: nestingLevel
        });
        Object.defineProperty(this, "NewLine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '\r\n'
        });
        Object.defineProperty(this, "IndentSpacing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 4
        });
        Object.defineProperty(this, "indentChars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "levelChars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "builder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        this.statement = {...statement};
        for (let index = 0; index < this.IndentSpacing; index++) {
            this.indentChars += ' ';
        }
        for (let level = 0; level < this.nestingLevel; level++) {
            this.levelChars += this.indentChars;
        }
        this.optimize();
    }

    // ... rest of the code ...

    writeGroupBy() {
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

    writeSelectItemExpression(item) {
        if (!item.groupBy) {
            this.builder += item.expression;
            return;
        }
        if (isNil(item.groupBy)) {
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