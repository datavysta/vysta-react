import {FC, ReactNode, useState, useRef, useEffect} from 'react';
import {useTranslationContext} from '../TranslationContext';
import DataType from '../../Models/DataType';
import angleDown from "../../../assets/svg/angle-down.svg?react";
import {SvgIcon} from "../../SvgIcon.tsx";
import './FilterAutocomplete.css';

interface IFilterProps {
	data: FilterAutocompleteOption[];
	dataType?: DataType;
	initialValue?: string;
	label?: string;
	onChange: (value: string) => void;
}

export interface FilterAutocompleteOption {
	datatype: DataType;
	description?: string;
	group?: string;
	icon?: ReactNode;
	system?: boolean;
	value: string;
	label: string;
	items?: FilterAutocompleteOption[];
}

const FilterAutocomplete: FC<IFilterProps> = ({
	data,
	label,
	initialValue,
	onChange,
}: IFilterProps) => {
	const { t } = useTranslationContext();
	const [value, setValue] = useState(initialValue || '');
	const [searchValue, setSearchValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleChange = (newValue: string) => {
		setValue(newValue);
		onChange(newValue);
		setIsOpen(false);
		setSearchValue("");
	};

	const cleanData = (data: FilterAutocompleteOption[]): void => {
		data.forEach((item) => {
			if (!item.group) {
				delete item.group;
			}
			if (item.items) {
				cleanData(item.items);
			}
		});
	};
	cleanData(data);

	const getFilteredOptions = () => {
		if (!searchValue) return data;
		return data.filter(option => 
			option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
			option.value.toLowerCase().includes(searchValue.toLowerCase()) ||
			(option.description && option.description.toLowerCase().includes(searchValue.toLowerCase()))
		);
	};

	const highlightText = (text: string) => {
		if (!searchValue) return text;
		const parts = text.split(new RegExp(`(${searchValue})`, 'gi'));
		return parts.map((part, i) => 
			part.toLowerCase() === searchValue.toLowerCase() ? 
				<mark key={i} className="filter-autocomplete-highlight">{part}</mark> : 
				<span key={i}>{part}</span>
		);
	};

	const selectedOption = data.find(opt => opt.value === value);

	return (
		<div className="filter-autocomplete-wrapper" ref={wrapperRef}>
			{label && <label className="filter-autocomplete-label">{label}</label>}
			<div className="filter-autocomplete-input-wrapper">
				<input
					ref={inputRef}
					type="text"
					className="filter-autocomplete-input"
					value={isOpen ? searchValue : (selectedOption?.label || '')}
					onChange={(e) => {
						setSearchValue(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					placeholder={t('Select')}
				/>
				<button 
					className="filter-autocomplete-toggle"
					onClick={() => {
						setIsOpen(!isOpen);
						if (!isOpen) {
							inputRef.current?.focus();
						}
					}}
				>
					<SvgIcon
						Icon={angleDown}
						size={18}
						style={{
							color: 'var(--mantine-color-Gray-25)',
							transform: isOpen ? 'rotate(180deg)' : 'none',
							transition: 'transform 0.2s ease'
						}}
					/>
				</button>
			</div>
			{isOpen && (
				<div className="filter-autocomplete-dropdown">
					{getFilteredOptions().map((option) => (
						<button
							key={option.value}
							className="filter-autocomplete-option"
							onClick={() => handleChange(option.value)}
						>
							<div className="filter-autocomplete-option-content">
								<div className="filter-autocomplete-option-label">
									{highlightText(option.label || option.value)}
								</div>
								{option.icon && (
									<div className="filter-autocomplete-option-icon" style={{opacity: option.value === value ? 1 : 0.5}}>
										{option.icon}
									</div>
								)}
								{option.description && (
									<div className="filter-autocomplete-option-description">
										{highlightText(option.description)}
									</div>
								)}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default FilterAutocomplete;