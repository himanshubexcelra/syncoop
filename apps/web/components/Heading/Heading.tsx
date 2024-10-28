import React from 'react';
import { HeadingObj } from '@/lib/definition';
import Image from 'next/image';
import { Button } from 'devextreme-react/button';
import styles from "./Heading.module.css"

type HeadingProps = {
    heading: HeadingObj[];
    myRoles?: string[];
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
                            <span className={styles.roleType}>{item.type}</span>
                            &nbsp;
                            <span className={styles.company}>{item.label}</span>
                        </div>}
                    </React.Fragment>
                ))}
            </div>
            {['admin', 'org_admin'].some((role) => myRoles?.includes(role)) && showEditPopup && (
                <Button
                    className='btn-secondary'
                    onClick={() => showEditPopup(true)}
                >
                    Edit
                </Button>
            )}
        </div >
    );
};

export default Heading;