import React from 'react';

import { getItemsPos, slidingWindow, VisibilityContext } from 'react-horizontal-scrolling-menu';

function Arrow({ children, onClick }: { children: React.ReactNode; onClick: VoidFunction }) {
    return (
        <button
            onClick={onClick}
            style={{
                // backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '4rem',
                minHeight: '2rem',
                padding: 10,
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 5,
                borderRadius: 15,
                border: 0,
                textAlign: 'center',
            }}
        >
            {children}
        </button>
    );
}

export function LeftArrow() {
    const { items, visibleItems, getItemById, scrollToItem } = React.useContext(VisibilityContext);

    // NOTE: for center items
    const prevGroupItems = slidingWindow(items.toItemsKeys(), visibleItems).prev();
    let { center } = getItemsPos(prevGroupItems);
    const scrollPrevCentered = () => {
        if (!center) {
            visibleItems.push('' + (Number(visibleItems[0].charAt(0)) - 1));
            center = getItemsPos(slidingWindow(items.toItemsKeys(), visibleItems).next()).center;
        }

        scrollToItem(getItemById(center), 'smooth', 'center');
    };

    return <Arrow onClick={scrollPrevCentered}>Left</Arrow>;
}

export function RightArrow() {
    const { getItemById, items, scrollToItem, visibleItems } = React.useContext(VisibilityContext);

    // NOTE: for center items
    const nextGroupItems = slidingWindow(items.toItemsKeys(), visibleItems).next();
    let { center } = getItemsPos(nextGroupItems);
    const scrollNextCentered = () => {
        if (!center) {
            visibleItems.push(visibleItems[0].charAt(0));
            center = getItemsPos(slidingWindow(items.toItemsKeys(), visibleItems).next()).center;
        }

        scrollToItem(getItemById(center), 'smooth', 'center');
    };

    console.log(getItemById(center));

    return <Arrow onClick={scrollNextCentered}>Right</Arrow>;
}
