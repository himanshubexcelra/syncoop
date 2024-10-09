import React from 'react';
import { HeadingObj } from '@/lib/definition';
import Image from 'next/image';
import styles from "./Heading.module.css"
interface HeadingProps {
    heading: HeadingObj[];
}

const Heading: React.FC<HeadingProps> = ({ heading }) => {
    return (
        <div className="w-full h-[42px] inline-flex items-center px-5 pb-2 gap-[17px]">
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
    );
};

export default Heading;