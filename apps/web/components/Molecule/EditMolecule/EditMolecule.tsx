/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useState } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DialogPopUp from '@/ui/DialogPopUp';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';
import UpdateMoleculePopup from './UpdateMolecule';

const dialogProperties = {
    width: 455,
    height: 148,
}

const EditMolecule = (editMolecules: any) => {
    console.log(editMolecules)
    const [resetVisible, setResetVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false)
    const hideResetPopup = () => {
        setResetVisible(false);
    };
    const hideUpdateVisible = () => {
        setUpdateVisible(false)
    }
    return (
        <>
            <div>
                <div className="flex flex-col gap-2 mt-5">
                    <label className={styles.moleculeLabel}>
                        Molecule name (optional)
                    </label>
                    <input
                        type="text"
                        name="molecule"
                        className={styles.moleculeInput}
                        placeholder="Molecule name"
                    />
                </div>
                <div className="flex justify-start gap-2 mt-5 ">
                    <button
                        className={styles.primaryButton}
                        onClick={() => setUpdateVisible(true)}
                    >
                        Update Molecule
                    </button>
                    <button
                        className={styles.secondaryButton}
                    >
                        Add as New Molecule
                    </button>
                    <button
                        className={styles.buttonNoBorder}
                        onClick={() => setResetVisible(true)}>
                        Reset
                    </button>
                </div>
            </div>
            <DialogPopUp {
                ...{
                    visible: resetVisible,
                    dialogProperties,
                    Content: DiscardMolecule,
                    hidePopup: hideResetPopup,
                }
            } />
            <DialogPopUp {
                ...{
                    visible: updateVisible,
                    dialogProperties,
                    Content: UpdateMoleculePopup,
                    hidePopup: hideUpdateVisible,
                }
            } />
        </>
    );
};

export default EditMolecule;
