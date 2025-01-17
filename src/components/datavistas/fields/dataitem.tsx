import React from 'react';
import IDataItem from '../../Models/public/dataitem';

class DataItemComponent extends React.Component<IDataItemProperties> {
	render() {
		const { value } = this.props;

		return <>{value.label ? value.label : value.value}</>;
	}
}

interface IDataItemProperties {
	value: IDataItem;
}

export default DataItemComponent;
