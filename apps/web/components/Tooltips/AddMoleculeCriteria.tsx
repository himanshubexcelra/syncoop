import React from 'react';
import styles from './Tooltip.module.css';

const AddMoleculeCriteria = () => {
    return (
        <div className={styles.box}>
            <p className={styles.heading}>The added molecules or SMILES are being processed for
                following cases and then updated in the system:</p>
            <div className={styles.list}>
                <p> 1. Implicit Hydrogens are removed.</p>
                <p> 2. Salt is stripped.</p>
                <p> 3. Structures are represented in Kekule Forms.</p>
            </div>
        </div>
    );
};

export default AddMoleculeCriteria;