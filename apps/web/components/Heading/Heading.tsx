/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import { HeadingObj } from '@/lib/definition';
import Image from 'next/image';
import { isOrgAdmin } from '@/utils/helpers';

type HeadingProps = {
    heading: HeadingObj[];
    myRoles: string[];
    showEditPopup?: (show: boolean) => void;
}

const Heading: React.FC<HeadingProps> = ({ heading, myRoles, showEditPopup }) => {
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
            {isOrgAdmin(myRoles) && showEditPopup && (
                <button
                    className='secondary-button'
                    onClick={() => showEditPopup(true)}
                >
                    Edit
                </button>
            )}
        </div >
    );
};

export default Heading;