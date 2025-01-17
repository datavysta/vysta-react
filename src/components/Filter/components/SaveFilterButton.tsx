import {ActionIcon, Button, Flex, Text, TextInput} from '@mantine/core';
import {useTranslationContext} from '../TranslationContext';
import {filterButtonStyle} from '../FilterPanel';
import {useState, useRef, useEffect} from 'react';
import {IoCheckmarkCircleOutline, IoClose} from 'react-icons/io5';
import {CheckIcon} from '@mantine/core';

function SaveFilterButton() {
	const {t} = useTranslationContext();
	const [isClicked, setIsClicked] = useState(false);
	const [filterName, setFilterName] = useState('');
	const [filterSaved, setFilterSaved] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const rightSectionSave = (
		<Flex w={'auto'}>
			<ActionIcon
				variant="transparent"
				onMouseDown={(e) => e.preventDefault()}
				onClick={() => setFilterName('')}
				style={{cursor: 'pointer'}}
			>
				<IoClose size={14} color={'#000'}/>
			</ActionIcon>
			<ActionIcon
				color={'var(--mantine-color-Accent2-3)'}
				style={{borderRadius: '0 2.75px 2.75px 0px'}}
				onMouseDown={(e) => e.preventDefault()}
				onClick={() => handleSave()}
			>
				<CheckIcon size={10}/>
			</ActionIcon>
		</Flex>
	);

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
		<div>
			{isClicked ? (
				<TextInput
					ref={inputRef}
					size="xs"
					placeholder={'Filter Name'}
					value={filterName}
					onChange={(event) =>
						setFilterName(event.currentTarget.value)
					}
					rightSection={rightSectionSave}
					onBlur={handleBlur}
					styles={{section: {width: 'auto'}}}
					className="saveFilterInput"
				/>
			) : (
				<Flex align={'center'} gap={12}>
					{filterSaved && (
						<Flex align={'center'} gap={8}>
							<IoCheckmarkCircleOutline
								color={'var(--mantine-color-Accent-1)'}
							/>
							<Text
								fz={'12px'}
								c={'var(--mantine-color-Accent-1)'}
							>
								Filter Saved
							</Text>
						</Flex>
					)}
					<Button
						variant={'outline'}
						size={'xs'}
						style={filterButtonStyle}
						onClick={() => setIsClicked(true)}
					>
						{t('Save')}
					</Button>
				</Flex>
			)}
		</div>
	);
}

export default SaveFilterButton;
