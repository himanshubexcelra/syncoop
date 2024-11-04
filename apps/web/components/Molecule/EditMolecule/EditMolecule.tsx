/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useState } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DialogPopUp from '@/ui/DialogPopUp';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';
import UpdateMoleculePopup from './UpdateMolecule';
import KetcherDrawBox from '@/components/KetcherTool/KetcherBox';
import dynamic from "next/dynamic";

const MoleculeStructure = dynamic(
    () => import("../../../utils/MoleculeStructure"),
    { ssr: false }
);

const dialogProperties = {
    width: 455,
    height: 148,
}

const EditMolecule = (editMolecules: any) => {
    const [resetVisible, setResetVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false)
    const hideResetPopup = () => {
        console.log(editMolecules)
        setResetVisible(false);
    };
    const hideUpdateVisible = () => {
        setUpdateVisible(false)
    }
    return (
        <>
            <div className="flex gap-2">
                <div className='w-1/5'>
                    <div>
                        <MoleculeStructure structure={"C1=CC=CC=C1"} id="smiles" />
                    </div>
                    <div>
                        <MoleculeStructure structure={"C1=CC=CC=C1"} id="smiles" />
                    </div>
                </div>
                <div className='w-4/5'>
                    <div className={styles.ketcherContainer}><KetcherDrawBox /></div>
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
