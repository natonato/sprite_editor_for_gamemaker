import { LeftArrow, RightArrow } from 'components/arrows';
import React, { useState } from 'react';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import { Link } from 'react-router-dom';
import 'scss/page3.scss';

const HorizontalScrollMock = ({ idx, itemId }: { idx: string; itemId: string }) => {
    const visibility = React.useContext(VisibilityContext);

    const visible = visibility.isItemVisible(itemId);

    return (
        <div className="flex">
            <div
                style={{
                    display: 'flex',
                    minHeight: '40vh',
                    minWidth: '100vw',
                    backgroundColor: 'greenyellow',
                }}
                tabIndex={0}
                className="card"
            >
                <div>
                    <div>{idx}번 데이터</div>
                    <div style={{ backgroundColor: visible ? 'transparent' : 'gray' }}>
                        visible: {JSON.stringify(visible)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Page3 = () => {
    const [mockDataList, setMockDataList] = useState(['1', '2', '3', '4', '5']);
    return (
        <div className="page3">
            page3!
            <br />
            <Link to="/">
                <button>To Page 1</button>
            </Link>
            <ScrollMenu
                LeftArrow={LeftArrow}
                RightArrow={RightArrow}
                options={{ throttle: 0 }} // NOTE: for center items
            >
                {mockDataList.map((data) => (
                    <HorizontalScrollMock idx={data} itemId={data} key={data} />
                ))}
            </ScrollMenu>
        </div>
    );
};

export default Page3;
