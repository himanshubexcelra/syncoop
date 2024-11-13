/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react'
import Image from 'next/image';
import { Messages } from "@/utils/message";
const OrderDetails = ({ closeOrderPopup }: { closeOrderPopup: () => void }) => {
  return (
    <div className='flex flex-col md:flex-row' style={{ paddingBottom: '50px' }}>
      <div className='flex-shrink-0 md:w-1/2 mb-4 md:mb-0'>
        <Image
          src="/icons/Group8511.svg"
          width={184}
          height={154}
          alt="Order Details"
        />
      </div>
      <div className='md:w-1/2 flex flex-col justify-center'>
        <p className='mb-4 text-center md:text-left'>{Messages.SUBMIT_ORDER}</p>
      </div>
      <button className="mt-auto mx-auto px-4 
      py-2 bg-blue-500 text-white rounded-lg
       hover:bg-blue-600"
        onClick={closeOrderPopup}
      >
        Close
      </button>

    </div>
  )
}

export default OrderDetails