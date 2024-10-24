import React from 'react';
import Image from "next/image";
import { ProjectDataFields } from '@/lib/definition';

export default function ProjectTitle(data: ProjectDataFields) {
    const libraryCount = data.libraries?.length || 0;
    return (
        <div>
            <div className='flex'>
                <Image
                    src="/icons/project-logo.svg"
                    width={33}
                    height={30}
                    alt="organization"
                />
                <div className='pl-[10px]'>{data.name}</div>
            </div>
            <div className='accordion-header-text'>
                <div>
                    <Image
                        src="/icons/polygon.svg"
                        width={33}
                        height={30}
                        alt="organization"
                    />
                    <span>0 Molecules</span>
                </div>
                <div>
                    <Image
                        src="/icons/libraries.svg"
                        width={33}
                        height={30}
                        alt="organization"
                    />
                    <span>{libraryCount} {libraryCount !== 1 ? 'Libraries' : 'Library'}</span>
                </div>
            </div>
        </div>
    );
}
