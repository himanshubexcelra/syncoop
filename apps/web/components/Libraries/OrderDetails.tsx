/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react'
import Image from 'next/image';
import { Messages } from "@/utils/message";
import { Button as Btn } from "devextreme-react/button";

const OrderDetails = ({ closeOrderPopup }: { closeOrderPopup: () => void }) => {
  return (

    <div className="container">
      <div className="image-column">
        <Image
          src="/icons/Group8511.svg"
          width={184}
          height={154}
          alt="Order Details"
          className="object-contain"
        />
      </div>
      <div className="text-column">
        <p>{Messages.SUBMIT_ORDER}</p>
      </div>
      <Btn
        className="btn-primary"
        onClick={closeOrderPopup}
      >
        Close
      </Btn>

    </div>



  )
}

export default OrderDetails