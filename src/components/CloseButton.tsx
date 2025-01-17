import { FC } from 'react';
import './CloseButton.css';

interface CloseButtonProps {
    onClickAction: () => void;
}

const CloseButton: FC<CloseButtonProps> = ({ onClickAction }) => {
    return (
        <button 
            className="close-button"
            onClick={onClickAction}
            aria-label="Close"
        >
            ×
        </button>
    );
};

export default CloseButton; 