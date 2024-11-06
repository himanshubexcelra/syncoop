import React from 'react';
import styles from './PasswordCriteria.module.css';

const PasswordCriteria = () => {
    return (
        <div className={styles.box}>
            <p className={styles.heading}>Password must have minimum:</p>
            <div className={styles.list}>
                <p>8 characters</p>
                <p>1 uppercase letter (A-Z)</p>
                <p>1 lowercase letter (a-z)</p>
                <p>1 number (0-9)</p>
                <p>1 special character (#@&$...)</p>
            </div>
        </div>
    );
};

export default PasswordCriteria;