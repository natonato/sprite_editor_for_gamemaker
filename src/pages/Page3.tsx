import React from 'react';
import { Link } from 'react-router-dom';
import 'scss/page3.scss';

const Page3 = () => {
    return (
        <div className="page1">
            page3!
            <br />
            <Link to="/">
                <button>To Page 1</button>
            </Link>
        </div>
    );
};

export default Page3;
