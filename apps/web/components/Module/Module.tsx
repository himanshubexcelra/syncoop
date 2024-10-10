"use client";

import { useState } from 'react';
import styles from './Module.module.css';
import { ModuleTableProps } from '@/lib/definition';

export default function Module({ features, roleType }: ModuleTableProps) {

    const [featureStates, setFeatureStates] = useState(features);

    const toggleCheckbox = (index: number) => {
        const updatedFeatures = featureStates.map((feature, i) =>
            i === index ? { ...feature, checked: !feature.checked } : feature
        );
        setFeatureStates(updatedFeatures);
    };

    return (
        <div className="grid grid-cols-2 p-4 gap-x-10">
            {featureStates.map((feature, index) => (
                <div className={`grid grid-cols-12 ${styles.row} text-left`} key={feature.value}>
                    <div className="bg-moduleCheckBoxBg w-15 h-15 p-5 col-span-1">
                        <input
                            type="checkbox"
                            className={`form-checkbox w-4 h-4 ${styles.checboxEdge}`}
                            checked={feature.checked}
                            onChange={roleType === 'admin' ? () => toggleCheckbox(index) : undefined}
                            disabled={roleType !== 'admin'}
                        />
                    </div>
                    <span className={`p-4 col-span-11 ${styles.text}`}>{feature.name}</span>
                </div>
            ))}
        </div>
    );
};