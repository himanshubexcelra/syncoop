/*eslint max-len: ["error", { "code": 100 }]*/
import { Popup } from 'devextreme-react';
import { useState, useEffect, useRef } from 'react';

const usePopupAndReset = () => {
    const [reset, setReset] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const childRef = useRef<HTMLDivElement>(null);

    const handlePopupClose = (saveChanges: boolean) => {
        if (saveChanges) {
            setReset('save');
            setShowPopup(false);
        } else {
            setReset('reset');
            setShowPopup(false);
        }
    };

    useEffect(() => {
        if (reset) {
            const timer = setTimeout(() => {
                setReset('');
                setIsDirty(false);
            }, 1);
            return () => clearTimeout(timer); // Cleanup timer if reset changes before timeout
        }
    }, [reset]);

    const onSelectedIndexChange = () => {
        if (isDirty) {
            setShowPopup(true); // Show the popup
        }
    }

    const popup = (
        <Popup
            visible={showPopup}
            onHiding={() => setShowPopup(false)}
            title="Confirmation"
            showTitle={true}
            width={400}
            height={210}
        >
            <div>
                <p className="mb-[20px]">
                    You have unsaved ADME config. Do you want to save your changes?
                </p>
                <button className="primary-button"
                    onClick={() => handlePopupClose(true)}
                >Yes</button>
                <button className="secondary-button ml-[10px]"
                    onClick={() => handlePopupClose(false)}
                >No</button>
            </div>
        </Popup>
    );


    return {
        reset,
        showPopup,
        setIsDirty,
        childRef,
        popup,
        handlePopupClose,
        setShowPopup,
        isDirty,
        onSelectedIndexChange,
        setReset,
    };
};

export default usePopupAndReset;
