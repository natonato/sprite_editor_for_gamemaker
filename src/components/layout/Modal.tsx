import classNames from 'classnames';
import React, { MouseEvent, ReactChild, useRef } from 'react';
import 'scss/modal.scss';

type TProps = {
    title: string;
    show: Boolean;
    close: () => void;
    children?: ReactChild;
};
const Modal = ({ title, show, close, children }: TProps) => {
    const background = useRef(null);

    const handleClickOutside = (props: MouseEvent<HTMLElement>) => {
        // close when click outside
        props.target === background.current && close();
    };

    return (
        <div id="modal">
            {show && (
                <div
                    ref={background}
                    className={classNames('background', { show: show })}
                    onClick={(e) => handleClickOutside(e)}
                >
                    <div className={classNames('popup', { show: show })}>
                        <div className="title">
                            <h2>{title}</h2>
                        </div>
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" className="close" onClick={close}>
                            &times;
                        </a>
                        <div className="close" onClick={close}>
                            &times;
                        </div>
                        <div className="content">{children}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Modal;
