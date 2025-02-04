/*eslint max-len: ["error", { "code": 100 }]*/
"use client";

import React from 'react';
import { HeadingObj } from '@/lib/definition';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isAdmin, isOrgAdmin } from '@/utils/helpers';

type HeadingProps = {
    heading: HeadingObj[];
    myRoles: string[];
    showOrderButton: boolean;
    showEditPopup?: (show: boolean) => void;
    customerOrgId?: number;
}

const Heading: React.FC<HeadingProps> = ({
    heading,
    myRoles,
    showEditPopup,
    showOrderButton,
    customerOrgId }) => {
    const router = useRouter();
    const url = customerOrgId ? `/organization/${customerOrgId}/molecule_order` : '/molecule_order';

    return (
        <div className="w-full h-[42px] inline-flex items-center px-5 pb-2 justify-between">
            <div className="inline-flex items-center gap-[17px]">
                {heading.map((item, index) => (
                    <React.Fragment key={index}>
                        <Image
                            src={item.svgPath}
                            alt={item.svgPath}
                            width={item.svgWidth}
                            height={item.svgHeight}
                        />
                        {item.label && <div>
                            <span className="roleType">{item.type}</span>
                            &nbsp;
                            <span className="company">{item.label}</span>
                        </div>}
                    </React.Fragment>
                ))}
            </div>
            <div className='flex items-center space-x-2'>
                {isOrgAdmin(myRoles) && showEditPopup && (
                    <button
                        className='secondary-button'
                        onClick={() => showEditPopup(true)}
                    >
                        Edit
                    </button>
                )}
                {isAdmin(myRoles) && showOrderButton && (
                    <button
                        className='secondary-button'
                        onClick={
                            () => router.push(url)
                        }
                    >
                        <Image
                            className="icon-help"
                            src="/icons/order-management-icon.svg"
                            alt="Help"
                            width={17}
                            height={18}
                        />
                        Order Mangement
                    </button>
                )}
            </div>
        </div >
    );
};

export default Heading;