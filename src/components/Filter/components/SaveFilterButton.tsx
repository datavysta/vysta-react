import {useTranslationContext} from '../TranslationContext';
import {useState, useRef, useEffect} from 'react';
import Condition from '../../Models/Condition';
import './SaveFilterButton.css';

interface SaveFilterButtonProps {
	disabled?: boolean;
	conditions: Condition[];
}

interface SavedFilter {
	name: string;
	conditions: Condition[];
}

function SaveFilterButton({ disabled, conditions }: SaveFilterButtonProps) {
	const {t} = useTranslationContext();
	const [isClicked, setIsClicked] = useState(false);
	const [filterName, setFilterName] = useState('');
	const [filterSaved, setFilterSaved] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const hasValidConditions = conditions.some(group => 
		group.children?.some(expr => expr.columnName && expr.comparisonOperator && expr.values !== null)
	);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node)) {
			setIsClicked(false);
		}
	};

	const handleSave = () => {
		const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '[]') as SavedFilter[];
		const newFilter: SavedFilter = {
			name: filterName.trim(),
			conditions
		};

		// If filter with same name exists, replace it
		const existingIndex = savedFilters.findIndex(f => f.name === newFilter.name);
		if (existingIndex >= 0) {
			savedFilters[existingIndex] = newFilter;
		} else {
			savedFilters.push(newFilter);
		}

		localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
		
		setIsClicked(false);
		setFilterSaved(true);
		setFilterName('');
		setTimeout(() => setFilterSaved(false), 3000);
	};

	useEffect(() => {
		if (isClicked && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isClicked]);

	return (
		<div className="save-filter-container">
			{isClicked ? (
				<div className="save-filter-input-wrapper">
					<input
						ref={inputRef}
						type="text"
						className="save-filter-input"
						placeholder="Filter Name"
						value={filterName}
						onChange={(event) => setFilterName(event.currentTarget.value)}
						onBlur={handleBlur}
						disabled={disabled}
					/>
					<div className="save-filter-actions">
						<button
							className="save-filter-action-button"
							onClick={() => setFilterName('')}
							onMouseDown={(e) => e.preventDefault()}
							disabled={disabled}
						>
							⊗
						</button>
						<button
							className="save-filter-action-button save-filter-confirm"
							onClick={() => handleSave()}
							onMouseDown={(e) => e.preventDefault()}
							disabled={!filterName.trim()}
						>
							<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8.5 2.5L3.5 7.5L1 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>
					</div>
				</div>
			) : (
				<div className="save-filter-button-wrapper">
					{filterSaved && (
						<div className="save-filter-success">
							✓
							<span className="save-filter-success-text">
								Filter Saved
							</span>
						</div>
					)}
					<button
						className="save-filter-button"
						onClick={() => setIsClicked(true)}
						disabled={disabled || !hasValidConditions}
					>
						{t('Save')}
					</button>
				</div>
			)}
		</div>
	);
}

export default SaveFilterButton;
