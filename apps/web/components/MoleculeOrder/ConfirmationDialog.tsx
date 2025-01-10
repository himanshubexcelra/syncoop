import React, { useEffect, useState } from 'react';
import { Popup } from 'devextreme-react';
import { Button as Btn } from "devextreme-react/button";

interface ConfirmationDialogProps {
  description: string;
  onSave: () => void;
  openConfirmation: boolean;
  setConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfirmationDialog = ({ description, onSave, openConfirmation, setConfirm }: ConfirmationDialogProps) => {
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
        title=""
        width={263}
        height={143}
        position={{ of: window, my: 'center', at: 'center', offset: '450 0' }}  // Apply left offset here

      >
        <div className='confirm-popup'>
          <p>{description}</p>
          <div className='confirmButton'>
            <Btn className="btn-primary" text="Yes" onClick={handleConfirm} />
            <Btn className="btn-primary" text="No" onClick={handleCancel} />
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default ConfirmationDialog;