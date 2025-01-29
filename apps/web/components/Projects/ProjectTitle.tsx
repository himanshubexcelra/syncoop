/*eslint max-len: ["error", { "code": 100 }]*/
import React from 'react';
import Image from "next/image";
import { ProjectDataFields } from '@/lib/definition';
import { isCustomReactionCheck } from '@/utils/helpers';

export default function ProjectTitle(data: ProjectDataFields) {
    const libraryCount = data.other_container?.length || 0;
    const { metadata } = data
    const isCustomReaction = isCustomReactionCheck(metadata);
    const entityLabel = isCustomReaction
        ? 'Reaction'
        : 'Molecule'
    const moleculeCount = data.other_container?.reduce((count, library: any) => {
        // Add the count of molecules in each library
        return count + library._count.libraryMolecules;
    }, 0);
    return (
        <div>
            <div className='flex'>
                {isCustomReaction
                    ? <Image
                        src="/icons/custom-reaction-md.svg"
                        width={26}
                        height={27}
                        alt="Custom Reaction"
                    />
                    : <Image
                        src="/icons/retrosynthesis-md.svg"
                        width={35}
                        height={32}
                        alt="Retrosynthesis"
                    />}
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
                    <span>
                        {moleculeCount} {moleculeCount !== 1 ? `${entityLabel}s` : entityLabel}
                    </span>
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
