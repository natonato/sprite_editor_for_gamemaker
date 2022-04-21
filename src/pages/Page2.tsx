import React from 'react';
import { Link } from 'react-router-dom';
import 'scss/page2.scss';
import 'scss/common.scss';
import LeftSidebar from 'components/side/LeftSidebar';
import RightSidebar from 'components/side/RightSidebar';

const Page2 = () => {
    return (
        <div className="page2 flex">
            <LeftSidebar />
            <div
                style={{
                    flex: 8,
                }}
            >
                page2!
                <br />
                <Link to="/">
                    <button>To Page 1</button>
                </Link>
            </div>
            <RightSidebar />
        </div>
    );
};

export default Page2;
