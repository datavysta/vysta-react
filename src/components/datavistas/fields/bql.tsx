import React from 'react';
import AceEditor from 'react-ace';
import { withTranslation } from 'react-i18next';
import { Ace } from 'ace-builds';
import { FaTimesCircle } from 'react-icons/fa';
import { Card } from '@mantine/core';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/ext-language_tools';
import IFieldProperty from '../../../public/fieldproperty';
import defaultFieldProperty from '../../../public/defaultfieldproperty';
import SearchCondition from '../../Filter/searchcondition';

class BQLComponent extends React.Component<IFieldProperty> {
	public static defaultProps = defaultFieldProperty;

	constructor(props: IFieldProperty) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.onLoad = this.onLoad.bind(this);
	}

	//@ts-expect-error event currently isn't needed
	private onChange(value: string, event?: any): void {
		const { onChange } = this.props;
		if (!onChange) {
			return;
		}

		onChange(value);
	}

	private onLoad(editor: Ace.Editor) {
		const props = this.props;
		if (!props.onSearch) {
			return;
		}

		const customCompleter = {
			getCompletions: async function (
				_: any, //editor
				__: any, //session
				___: any, //pos
				prefix: any,
				callback: Function
			) {
				const condition = new SearchCondition();
				condition.keywords = prefix;
				const dataItems = await props.onSearch!(condition);
				const completions = dataItems.map((item) => ({
					value: item.value,
					score: 100,
				}));

				callback(null, completions);
			},
		};

		editor.completers.push(customCompleter);

		const customKeyWordCompleter = {
			getCompletions(
				editor: any,
				session: any,
				pos: any,
				prefix: any,
				callback: Function
			) {
				if (session.$mode.completer) {
					return session.$mode.completer.getCompletions(
						editor,
						session,
						pos,
						prefix,
						callback
					);
				}
				const state = editor.session.getState(pos.row);
				let keywordCompletions;
				if (prefix === prefix.toUpperCase()) {
					keywordCompletions = session.$mode.getCompletions(
						state,
						session,
						pos,
						prefix
					);
					keywordCompletions = keywordCompletions.map((obj: any) => {
						const copy = obj;
						copy.value = obj.value.toUpperCase();
						return copy;
					});
				} else {
					keywordCompletions = session.$mode.getCompletions(
						state,
						session,
						pos,
						prefix
					);
				}
				return callback(null, keywordCompletions);
			},
		};
		editor.completers.push(customKeyWordCompleter);
	}

	static renderError(error: string | undefined) {
		if (!error) {
			return;
		}

		return (
			<Card
				withBorder
				bg={'rgba(162, 72, 87, .2)'}
				style={{ borderColor: 'maroon' }}
				className={'vy-flex vy-flex-gap-10 vy-flex-align-center'}
			>
				<FaTimesCircle color={'maroon'} /> {error}
			</Card>
		);
	}

	render() {
		const { readOnly, placeholder, error, value, onBlur, onFocus } =
			this.props;

		if (readOnly) {
			return <>{value}</>;
		}

		return (
			<>
				<AceEditor
					placeholder={placeholder}
					mode="sql"
					name="blah2"
					onLoad={this.onLoad}
					onChange={this.onChange}
					onBlur={onBlur}
					onFocus={onFocus}
					fontSize={14}
					showPrintMargin={true}
					showGutter={true}
					highlightActiveLine={true}
					value={value ? value : ''}
					width={'100%'}
					className={'vy-flex-1-expand'}
					setOptions={{
						enableBasicAutocompletion: false,
						enableLiveAutocompletion: true,
						enableSnippets: false,
						showLineNumbers: true,
						tabSize: 2,
					}}
				/>
				{BQLComponent.renderError(error)}
			</>
		);
	}
}

export default withTranslation()(BQLComponent);
