import React from 'react';
import styles from './Tooltip.module.css';

// Define the interface for props
interface AdmeInfoProps {
    rawValues: number[];
    status: string;
    reference: string;
}
export default function AdmeInfo
    ({ rawValues, status, reference }: AdmeInfoProps) {
    return (
        <div className={styles.box}>
            <div className={styles.list}>
                <div><strong>
                    Raw Values: {rawValues.join(", ")}
                </strong></div>
                <div><strong>
                    Biological Implication: {status}
                </strong></div>
                <div><strong>
                    Biological Reference: {reference}
                </strong></div>
            </div>
        </div>
    );
};

