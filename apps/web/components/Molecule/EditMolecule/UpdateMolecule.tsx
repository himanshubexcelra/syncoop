import Image from 'next/image';
import styles from '../AddMolecule/AddMolecule.module.css'
import { useState } from 'react';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { delay } from '@/utils/helpers';
import { MoleculeType, RejectedSmiles, SaveMoleculeParams, UserData } from '@/lib/definition';
import { updateMoleculeSmiles } from '../service';
import { LoadIndicator } from 'devextreme-react';
import { DELAY } from '@/utils/constants';

type UpdateMoleculeProps = {
    userData: UserData;
    setViewEditMolecule: (val: boolean) => void;
    callLibraryId: () => void;
    onClose: () => void;
    onDiscardSubmit: () => void;
    saveMoleculeCall: (moleculeDetails: SaveMoleculeParams, inPopup: boolean) => void;
    editMolecules: MoleculeType[];
    editedMolecules: MoleculeType[];
    onSmilesRejected: (smiles: RejectedSmiles[]) => void

}

export default function UpdateMoleculePopup(props: UpdateMoleculeProps) {
    const {
        userData,
        setViewEditMolecule,
        callLibraryId,
        onClose,
        onDiscardSubmit,
        saveMoleculeCall,
        onSmilesRejected,
        editedMolecules
    } = props;
    const [saveButtonText, setSaveButtonText] = useState('Add as New Molecule');
    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);
    const [submitText, setSubmitText] = useState('Yes');
    const [submitLoadIndicatorVisible, setSubmitLoadIndicatorVisible] = useState(false);
    const reset = () => {
        onDiscardSubmit()
        onClose()
    }
    const updateSubmit = async () => {
        const molecules: any[] = [];
        editedMolecules.forEach((molecule: any) => {
            const moleculeObj = {
                id: molecule.id,
                smile: molecule.smiles_string,
                sourceMoleculeName: molecule.source_molecule_name,
            }
            molecules.push(moleculeObj)
        });
        setSubmitLoadIndicatorVisible(true);
        setSubmitText('');
        const formData = new FormData();
        formData.set('molecules', JSON.stringify(molecules));
        formData.set('updatedBy', userData?.id?.toString())
        await updateMoleculeSmiles(formData).then(async (result) => {
            if (result.detail) {
                const toastId = toast.error(result.error);
                await delay(DELAY);
                toast.remove(toastId);
            } else {
                if (result?.status) {
                    if (result?.rejected_smiles?.length) {
                        onSmilesRejected(result.rejected_smiles);
                        onClose();
                    } else {
                        setViewEditMolecule(false);
                        callLibraryId();
                        setSubmitText('Yes');
                        const message = Messages.UPDATE_MOLECULE_SUCCESS;
                        const toastId = toast.success(message);
                        await delay(DELAY);
                        toast.remove(toastId);
                    }
                } else if (result) {
                    setSubmitText('Yes');
                    const rejectedSmile = result.rejected_smiles[0]
                    const message = Messages.ADD_MOLECULE_ERROR + rejectedSmile.reason;
                    const toastId = toast.error(message);
                    await delay(DELAY);
                    toast.remove(toastId);
                }
            }
        }, async (error) => {
            const toastId = toast.error(error?.message);
            await delay(DELAY);
            toast.remove(toastId);
        })
        setSubmitLoadIndicatorVisible(false);
        onClose();
    }
    const moleculeDetails = {
        setLoader: setSaveLoadIndicatorVisible,
        setButtonText: setSaveButtonText,
    }

    return (
        <><div className="flex justify-end">
            <Image
                className='cursor-pointer'
                src="/icons/cross-icon.svg"
                alt="close icon"
                width={21.1}
                height={22.5}
                onClick={onClose} />
        </div>
            <div className='header-text text-messageDarkBlue'>
                Update Molecule with Changes
            </div>
            <div className="flex justify-start gap-2 mt-5">
                <button className='primary-button'
                    onClick={() => updateSubmit()}>
                    <LoadIndicator className={
                        `button-indicator ${styles.white}`
                    }
                        visible={submitLoadIndicatorVisible}
                        height={20}
                        width={20} />{submitText}</button>
                {editedMolecules.length === 1 && <button
                    className='secondary-button'
                    onClick={() => saveMoleculeCall(moleculeDetails, true)}
                > <LoadIndicator className={
                    `button-indicator ${styles.white}`
                }
                    visible={loadIndicatorVisibleSave}
                    height={20}
                    width={20} />
                    {saveButtonText}
                </button>}
                <button
                    className='reject-button'
                    onClick={reset}
                >
                    No, discard the changes
                </button>
            </div>
        </>
    );
}