import React from 'react';
import { useState, useRef, useEffect } from 'react';

import './Modal.css';

// Pop up message
function Modal({ isActive, onCloseCallBack, direction=null, children }) {

    const [pointAt, setPointAt] = useState(null);
    const [modalPosition, setModalPosition] = useState({top: undefined, left: undefined});
    const ref = useRef();

    // Initialize direction to point at, if applicable
    useEffect(() => {

        switch (direction) {

            case '1':
                setPointAt('up');
                break;
            case '2':
                setPointAt('right');
                break;
            case '3':
                setPointAt('down');
                break;
            case '4':
                setPointAt('left');
                break;
            case '5':
                setPointAt('center');
                setModalPosition({ 
                    top: window.innerHeight / 2, 
                    left: window.innerWidth / 2
                });
                break;
        }
    }, []);

    // Determine where to position pop up relative to object of interest
    const calculatePosition = () => {

        const parentRect = ref.current.parentElement.getBoundingClientRect();
        const modalRect = ref.current.getBoundingClientRect();

        let top = 0, left = 0;
        switch (pointAt) {

            case 'up': case 'down':
                top = (pointAt === 'up' ? parentRect.bottom : parentRect.top);
                left = parentRect.left + (parentRect.width - modalRect.width) / 2;
                break;
            case 'right': case 'left':
                top = parentRect.top + (parentRect.height - modalRect.height) / 2;
                left = (pointAt === 'right' ? parentRect.left : parentRect.right);
                break;
        }
        setModalPosition({ top, left });
    }

    // Open or close pop up
    useEffect(() => {

        if (isActive) {
            if (direction !== '5') {calculatePosition();}
            ref.current?.showModal();
        } else
            ref.current?.close();
    }, [isActive]);

    return (

        <dialog 
            ref={ref}
            className={`modal-container ${pointAt ? 'pointing' : ''} ${pointAt}`}
            style={(modalPosition.top) ? modalPosition : {display: "none"}}
            onCancel={onCloseCallBack}
        >
            {direction !== '5'  && <div className={`pointer ${pointAt}`}></div>}
            {children}
        </dialog>
    );
}

export default Modal;