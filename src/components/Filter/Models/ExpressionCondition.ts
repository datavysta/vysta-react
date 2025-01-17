import { Condition } from './Condition';
import { ConditionType } from './ConditionType';
import { ComparisonOperator } from './ComparisonOperator';
import { DataType } from './DataType';
import isNil from '../../../utils/isNil';

export class ExpressionCondition extends Condition {
    constructor(
        field: string,
        operator: ComparisonOperator,
        values: string[] | null = null,
        dataType: DataType = DataType.String
    ) {
        super(ConditionType.Expression);
        this.field = field;
        this.operator = operator;
        this.values = values;
        this.dataType = dataType;
    }

    field: string;
    operator: ComparisonOperator;
    values: string[] | null;
    dataType: DataType;

    clone(): ExpressionCondition {
        return new ExpressionCondition(
            this.field,
            this.operator,
            isNil(this.values) ? null : [...this.values],
            this.dataType
        );
    }
} 