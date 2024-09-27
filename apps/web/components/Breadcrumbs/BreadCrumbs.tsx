import Link from 'next/link';
import React from 'react';
import { BreadCrumbsObj } from '@/lib/definition';
import Image from 'next/image';

interface BreadcrumbProps {
    breadcrumbs: BreadCrumbsObj[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbs }) => {
    return (
        <nav className="inline-flex items-center px-5 py-2">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                    <Link
                        href={item.href}
                        className="ml-1 flex items-center text-themeGreyColor font-lato font-normal text-[14px] leading-[20px] text-center">
                        {item.svgPath && <Image
                            src={item.svgPath}
                            alt={item.label}
                            width={item.svgWidth}
                            height={item.svgHeight}
                        />}
                        <span className={`ml-2 text-[14px] leading-[20px] font-['Lato'] ${item.isActive ? 'text-themeBlueColor font-bold' : 'text-themeGreyColor'}`}>{item.label}</span>
                    </Link>
                    {index < breadcrumbs.length - 1 && (
                        <span className={`ml-1`}>
                            <Image src={index === breadcrumbs.length - 2 ? '/icons/arrow.svg' : '/icons/arrow-inactive.svg'}
                                alt="arrow"
                                width={16}
                                height={16} />
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;