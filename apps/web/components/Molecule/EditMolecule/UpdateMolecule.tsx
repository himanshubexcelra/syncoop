import Image from 'next/image';
import styles from '../AddMolecule/AddMolecule.module.css'
import { useState } from 'react';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { delay } from '@/utils/helpers';
import { SaveMoleculeParams, UserData } from '@/lib/definition';
import { updateMoleculeSmiles } from '../service';
import { LoadIndicator } from 'devextreme-react';
type UpdateMoleculeProps = {
    userData: UserData;
    libraryId: string | null;
    projectId: string | null;
    setViewEditMolecule: (val: boolean) => void;
    callLibraryId: () => void;
    onClose: () => void;
    moleculeName: string | null;
    onDiscardSubmit: () => void;
    moleculeId: number | undefined;
    saveMoleculeCall: (moleculeDetails: SaveMoleculeParams) => void;
    editedMolecules: any[];
}

export default function UpdateMoleculePopup(props: UpdateMoleculeProps) {
    const {
        userData,
        libraryId,
        projectId,
        setViewEditMolecule,
        callLibraryId,
        onClose,
        moleculeName,
        onDiscardSubmit,
        moleculeId,
        saveMoleculeCall,
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
        const molecules: any[] = []
        editedMolecules.forEach((molecule: any) => {
            const moleculeObj = {
                id: molecule.id,
                smile: molecule.smiles_string,
                sourceMoleculeName: molecule.source_molecule_name
            }
            molecules.push(moleculeObj)
        })
        const formData = new FormData();
        formData.set('molecules', JSON.stringify(molecules));
        formData.set('updatedBy', userData?.id?.toString() || '')
        const result = await updateMoleculeSmiles(formData);
        if (result.detail) {
            const toastId = toast.error(result.error);
            await delay(4000);
            toast.remove(toastId);
        } else {
            if (result?.status) {
                setViewEditMolecule(false);
                callLibraryId();
                setSubmitText('Yes');
                const message = Messages.UPDATE_MOLECULE_SUCCESS;
                const toastId = toast.success(message);
                await delay(4000);
                toast.remove(toastId);
            } else if (result) {
                setSubmitText('Yes');
                const rejectedSmile = result.rejected_smiles[0]
                const message = Messages.ADD_MOLECULE_ERROR + rejectedSmile.reason;
                const toastId = toast.error(message);
                await delay(4000);
                toast.remove(toastId);
            }
        }
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
                <button
                    className='secondary-button'
                    onClick={() => saveMoleculeCall(moleculeDetails)}
                > <LoadIndicator className={
                    `button-indicator ${styles.white}`
                }
                    visible={loadIndicatorVisibleSave}
                    height={20}
                    width={20} />
                    {saveButtonText}
                </button>
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