import {useTranslationContext} from '../TranslationContext';
import {useState, useRef, useEffect} from 'react';
import {IoCheckmarkCircleOutline, IoClose} from 'react-icons/io5';
import './SaveFilterButton.css';

function SaveFilterButton() {
	const {t} = useTranslationContext();
	const [isClicked, setIsClicked] = useState(false);
	const [filterName, setFilterName] = useState('');
	const [filterSaved, setFilterSaved] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node)) {
			setIsClicked(false);
		}
	};

	const handleSave = () => {
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
					/>
					<div className="save-filter-actions">
						<button
							className="save-filter-action-button"
							onClick={() => setFilterName('')}
							onMouseDown={(e) => e.preventDefault()}
						>
							<IoClose size={14} color="#000"/>
						</button>
						<button
							className="save-filter-action-button save-filter-confirm"
							onClick={() => handleSave()}
							onMouseDown={(e) => e.preventDefault()}
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
							<IoCheckmarkCircleOutline className="save-filter-success-icon" />
							<span className="save-filter-success-text">
								Filter Saved
							</span>
						</div>
					)}
					<button
						className="save-filter-button"
						onClick={() => setIsClicked(true)}
					>
						{t('Save')}
					</button>
				</div>
			)}
		</div>
	);
}

export default SaveFilterButton;
