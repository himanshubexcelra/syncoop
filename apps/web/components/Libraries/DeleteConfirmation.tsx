import React, { useEffect, useState } from 'react';
import { Popup } from 'devextreme-react';
import { Messages } from '@/utils/message';


interface ConfirmationDialogProps {
    onSave: () => void;
    openConfirmation: boolean;
    setConfirm: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    msg: string;
}

const DeleteConfirmation = ({
    onSave,
    openConfirmation,
    setConfirm,
    msg,
}: ConfirmationDialogProps) => {
    const [visible, setVisible] = useState(openConfirmation);
    const [isDisable, setDisable] = useState(true);
    // Update the visibility whenever openConfirmation state changes
    useEffect(() => {
        setVisible(openConfirmation);
    }, [openConfirmation]);

    // Handle Confirm (Save the action)
    const handleConfirm = () => {
        if (!isDisable) {
            onSave(); // Call the onSave function passed from parent
            setConfirm(false); // Close the confirmation dialog
        }
    };

    const validateDeleteText = (e: any) => {
        if (e.target.value === "delete") {
            setDisable(false)
        }
        else {
            setDisable(true)
        }
    }

    // Handle Cancel (Close the dialog without action)
    const handleCancel = () => {
        setConfirm(false); // Close the confirmation dialog
    };
    return (
        <div>
            <Popup
                visible={visible}
                onHiding={() => setConfirm(false)}
                showTitle={false}
                title=""
                width={577}
                height={236}
                position={{ of: window, my: 'center', at: 'center', offset: 'window' }}  // Apply left offset here
                wrapperAttr={{ class: 'order-popup-internal' }}
            >
                <div className='flex items-center gap-[20px] h-full'>
                    <div className="flex flex-col">
                        <div className="text-[20px]">{msg}</div>
                        <div className="text-[16px] mt-4">{Messages.TYPE_DELETE}</div>
                        <div className="mt-4">
                            <input type='text'
                                placeholder='delete'
                                style={{ border: '1px solid', height: '38px', width: '99px', padding: '10px' }}
                                onChange={(e) => { validateDeleteText(e) }}
                            />
                        </div>

                        <div className='confirmButton'>
                            <button
                                className={isDisable
                                    ? 'primary-button w-[100px] text-sm disableButton'
                                    : 'primary-button w-[100px] text-sm'}
                                onClick={handleConfirm}
                            >Delete</button>
                            <button
                                className={"secondary-button w-[80px] text-sm"}
                                onClick={handleCancel}
                            >Cancel</button>
                            {/* <Button className="btn-primary" text="Confirm" onClick={handleConfirm} /> */}
                            {/* <Btn className="btn-primary" text="No" onClick={handleCancel} /> */}
                        </div>
                    </div>

                </div>
            </Popup>
        </div>
    );
};

export default DeleteConfirmation;
