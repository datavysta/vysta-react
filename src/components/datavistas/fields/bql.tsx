import { FC, useRef } from 'react';
import AceEditor from 'react-ace';
import { FaTimesCircle } from 'react-icons/fa';
import IFieldProperty from '../../Models/public/fieldproperty';

const BQLComponent: FC<IFieldProperty> = ({
	readOnly,
	error,
	value,
	onChange
}) => {
	const editorRef = useRef<AceEditor>(null);

	const handleChange = (value: string) => {
		onChange && onChange(value);
	};

	if (readOnly) {
		return <>{value}</>;
	}

	return (
		<div className="vysta-card">
			<AceEditor
				ref={editorRef}
				mode="sql"
				theme="github"
				value={value}
				onChange={handleChange}
				name="bql-editor"
				width="100%"
				height="200px"
				editorProps={{ $blockScrolling: true }}
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: true,
					showLineNumbers: true,
					tabSize: 2,
				}}
			/>
			{error && (
				<div className="vysta-error-message">
					<FaTimesCircle /> {error}
				</div>
			)}
		</div>
	);
};

export default BQLComponent;
