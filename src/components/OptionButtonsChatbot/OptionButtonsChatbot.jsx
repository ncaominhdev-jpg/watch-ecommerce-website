import React from 'react';
import '../../styles/css/OptionButtonsChatbot.css';

export default function OptionButtonsChatbot({ options, onSelect }) {
    return (
        <div className="option-buttons-container">
            {options.map((opt, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(opt)}
                    className="option-button"
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
