/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import Image from "next/image";
import { ProjectDataFields } from '@/lib/definition';

export default function ProjectTitle(data: ProjectDataFields) {
    const libraryCount = data.libraries?.length || 0;
    const moleculeCount = data.libraries.reduce((count, library: any) => {
        return count + library._count.molecule; // Add the count of molecules in each library
    }, 0);
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
                    <span>{moleculeCount} {moleculeCount !== 1 ? 'Molecules' : 'Molecule'}</span>
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
