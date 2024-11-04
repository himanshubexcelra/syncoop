/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react'
import Image from 'next/image';
import { Messages } from "@/utils/message";

const OrderDetails = () => {
  return (
    <div className='flex flex-col md:flex-row bg-white'>
      <div className='flex-shrink-0 md:w-1/2 mb-4 md:mb-0'>
        <Image
          src="/icons/Group8511.svg"
          width={184}
          height={154}
          alt="Order Details"
        />
      </div>
      <div className='md:w-1/2 flex flex-col justify-center'>
        <p className='mb-4'>{Messages.SUBMIT_ORDER}</p>
      </div>
    </div>
  )
}

export default OrderDetails