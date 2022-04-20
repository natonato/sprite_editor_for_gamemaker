import React from 'react';
import { Link } from 'react-router-dom';
import 'scss/page1.scss';

const Page1 = () => {
    return (
        <div className="page1">
            page1!
            <br />
            <Link to="/test">
                <button>To Page 2</button>
            </Link>
            <Link to="/horizontal_scroll">
                <button>To Page 3</button>
            </Link>
        </div>
    );
};

export default Page1;
