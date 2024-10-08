import React from 'react';
import { BreadCrumbsObj } from '@/lib/definition';
import Image from 'next/image';
import styles from "./Heading.module.css"
interface HeadingProps {
    heading: BreadCrumbsObj[];
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
                        <span className={styles.company}>{item.label}</span>
                    </div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Heading;