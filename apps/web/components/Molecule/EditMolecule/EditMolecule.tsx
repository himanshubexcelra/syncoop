/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useEffect, useState } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DialogPopUp from '@/ui/DialogPopUp';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';
import UpdateMoleculePopup from './UpdateMolecule';
import KetcherDrawBox from '@/components/KetcherTool/KetcherBox';
import dynamic from "next/dynamic";
import { MoleculeType, UserData } from '@/lib/definition';
import { uploadMoleculeSmiles } from '../service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { delay } from '@/utils/helpers';
import { LoadIndicator } from 'devextreme-react';

const MoleculeStructure = dynamic(
    () => import("../../../utils/MoleculeStructure"),
    { ssr: false }
);

const dialogProperties = {
    width: 455,
    height: 148,
}

type EditMoleculeProps = {
    editMolecules: any[]
    userData: UserData;
    libraryId: string | null;
    projectId: string | null;
    setViewEditMolecule: (val: boolean) => void;
    callLibraryId: () => void;
}

const EditMolecule = ({
    editMolecules,
    userData,
    libraryId,
    projectId,
    setViewEditMolecule,
    callLibraryId
}: EditMoleculeProps) => {
    const [resetVisible, setResetVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false)
    const [selectedMolecule, setSelectedMolecule]
        = useState<MoleculeType | null>();
    const hideResetPopup = () => {
        setResetVisible(false);
    };
    const hideUpdateVisible = () => {
        setUpdateVisible(false)
    }
    const handleMoleculeClick = (molecule: any) => {
        setSelectedMolecule(molecule);
    };

    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);
    const [saveButtonText, setSaveButtonText] = useState('Add as New Molecule');

    const saveMolecule = async () => {
        setSaveLoadIndicatorVisible(true);
        setSaveButtonText('');
        KetcherFunctions.exportSmile().then(async (str) => {
            const result = await uploadMoleculeSmiles({
                smiles: [str],
                "created_by_user_id": userData.id,
                "library_id": libraryId?.toString() || '',
                "project_id": projectId?.toString() || '',
                "organization_id": userData.organization_id?.toString() || '',
                "source_molecule_name": ''
            })
            if (result.rejected_smiles.length) {
                setSaveLoadIndicatorVisible(false);
                setSaveButtonText('Save Molecule');
                const rejectedSmile = result.rejected_smiles[0]
                const message = Messages.ADD_MOLECULE_ERROR + rejectedSmile.reason;
                const toastId = toast.error(message);
                await delay(4000);
                toast.remove(toastId);
            } else {
                setViewEditMolecule(false);
                callLibraryId();
                setSaveLoadIndicatorVisible(false);
                setSaveButtonText('Save Molecule');
                const message = Messages.ADD_MOLECULE_SUCCESS;
                const toastId = toast.success(message);
                await delay(4000);
                toast.remove(toastId);
            }
        });
    }

    useEffect(() => {
        if (editMolecules.length) {
            setSelectedMolecule(editMolecules[0])
        }
    }, [editMolecules])
    return (
        <>
            <div className="flex gap-2">
                <div className='w-1/5'>
                    {editMolecules?.map((molecule: any) => (
                        <div
                            key={molecule.id}
                            onClick={() => handleMoleculeClick(molecule)}
                            className={`${selectedMolecule?.id === molecule.id
                                ? styles.moleculeViewBoxHighlighted
                                : styles.moleculeViewBox} mb-4`}
                        >
                            <div className='flex justify-center items-center'>
                                <MoleculeStructure
                                    structure={molecule.smiles_string}
                                    id={molecule.id}
                                    width={140}
                                    height={120}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className='w-4/5'>
                    <div className={styles.ketcherContainer}>
                        <KetcherDrawBox
                            reactionString={selectedMolecule?.smiles_string ||
                                editMolecules[0]?.smiles_string} />
                    </div>
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
                            className={`${styles.secondaryButton}`}
                            onClick={() => saveMolecule()}
                        > <LoadIndicator className={
                            `button-indicator ${styles.white}`
                        }
                            visible={loadIndicatorVisibleSave}
                            height={20}
                            width={20} />
                            {saveButtonText}
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
