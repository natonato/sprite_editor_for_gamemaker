import React from 'react';
import '../scss/helpButton.scss';

const Help = () => {
    const handleClickHelpBtn = () => {
        console.log('clickHelp!');
    };

    return (
        <button className="btn_gotop" onClick={handleClickHelpBtn}>
            <span>help</span>
        </button>
    );
};

export default Help;
