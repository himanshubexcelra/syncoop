import React, { useEffect, useState } from 'react';
import { Popup } from 'devextreme-react';
import Image from 'next/image';

interface ConfirmationDialogProps {
  onSave: () => void;
  openConfirmation: boolean;
  setConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  msg: string;
}

const ConfirmationDialog = ({
  onSave,
  openConfirmation,
  setConfirm,
  msg,
  title
}: ConfirmationDialogProps) => {
  const [visible, setVisible] = useState(openConfirmation);

  // Update the visibility whenever openConfirmation state changes
  useEffect(() => {
    setVisible(openConfirmation);
  }, [openConfirmation]);

  // Handle Confirm (Save the action)
  const handleConfirm = () => {
    onSave(); // Call the onSave function passed from parent
    setConfirm(false); // Close the confirmation dialog
  };

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
        hideOnOutsideClick={false}
        title=""
        width={577}
        height={236}
        position={{ of: window, my: 'center', at: 'center', offset: 'window' }}  // Apply left offset here
        wrapperAttr={{ class: 'order-popup-internal' }}
      >
        <div className='flex items-center gap-[20px] h-full'>
          <div className="image-column">
            <Image
              src="/icons/Group8511.svg"
              width={184}
              height={154}
              alt="Order Details"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-lg">{title}</div>
            <div className="text-lg">{msg}</div>
            <div className='confirmButton'>
              <button
                className={"primary-button w-[100px] text-sm"}
                onClick={handleConfirm}
              >Confirm</button>
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

export default ConfirmationDialog;
