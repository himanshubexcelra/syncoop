/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useEffect, useState, useTransition } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DialogPopUp from '@/ui/DialogPopUp';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';
import UpdateMoleculePopup from './UpdateMolecule';
import KetcherDrawBox from '@/components/KetcherTool/KetcherBox';
import dynamic from "next/dynamic";
import { MoleculeType, RejectedSmiles, SaveMoleculeParams, UserData } from '@/lib/definition';
import { uploadMoleculeSmiles } from '../service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { delay } from '@/utils/helpers';
import { LoadIndicator, Popup } from 'devextreme-react';
import { DELAY } from '@/utils/constants';
import RejectedDialog from '../AddMolecule/RejectedDialog';
import { getDeAromatizeSmile } from '@/components/KetcherTool/service';

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

const dialogProperties = {
    width: 455,
    height: 151,
}

type EditMoleculeProps = {
    editMolecules: MoleculeType[]
    userData: UserData;
    libraryId: number;
    projectId: string;
    organizationId: string;
    setViewEditMolecule: (val: boolean) => void;
    callLibraryId: () => void;
}

const EditMolecule = ({
    editMolecules,
    userData,
    libraryId,
    projectId,
    organizationId,
    setViewEditMolecule,
    callLibraryId
}: EditMoleculeProps) => {
    const [resetVisible, setResetVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false)
    const [moleculeName, setMoleculeName] = useState<string>('')
    const [editedMolecules, setEditedMolecules] = useState<any[]>(editMolecules)
    const [, startTransition] = useTransition();
    const [rejected, setRejected] = useState<RejectedSmiles[]>([])
    const [showRejectedDialog, setShowRejectedDialog] = useState(false);
    const [moleculeIndex, setMoleculeIndex] = useState(0);
    const hideResetPopup = () => {
        setResetVisible(false);
    };
    const hideUpdateVisible = () => {
        setUpdateVisible(false)
    }

    const hideRejectPopUp = () => {
        setShowRejectedDialog(false);
        callLibraryId();
        setViewEditMolecule(false)
    }

    const rejectContentProps = {
        visible: showRejectedDialog,
        rejected,
        onClose: hideRejectPopUp,
    }

    const updateSmileChange = (update = false) => {
        KetcherFunctions?.exportSmile().then(async (str) => {
            if (str !== "") {
                editedMolecules[moleculeIndex].smiles_string = str;
                setEditedMolecules(editedMolecules);
            }
        })
        if (update) {
            setUpdateVisible(true);
        }
    }

    const handleMoleculeClick = async (index: number) => {
        // setSelectedMolecule(molecule);
        setMoleculeIndex(index);
        setMoleculeName(editedMolecules[index]?.source_molecule_name)
        updateSmileChange();
    };
    const resetEditedList = () => {
        const molList = JSON.stringify(editMolecules);
        setEditedMolecules(JSON.parse(molList))
    }
    const onDiscardSubmit = async () => {
        resetEditedList();
        const actualMol = editMolecules.filter((mol) => mol.id === editMolecules[moleculeIndex]?.id)
        const smile = actualMol.length
            && actualMol[0].smiles_string

        const updatedSmile = smile && await getDeAromatizeSmile(smile);
        KetcherFunctions?.renderFromCtab(updatedSmile?.struct)
        setMoleculeName(actualMol.length ? actualMol[0].source_molecule_name : '')
    }
    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);
    const [saveButtonText, setSaveButtonText] = useState('Add as New Molecule');
    const saveMoleculeCall = (molecule: SaveMoleculeParams, inPopup = false) => {
        const {
            setLoader,
            setButtonText,
        } = molecule;
        if (inPopup) {
            setLoader(true);
            setButtonText('');
        }
        KetcherFunctions?.exportSmile().then(async (str) => {
            if (str) {
                if (!inPopup) {
                    setSaveLoadIndicatorVisible(true);
                    setSaveButtonText('');
                }
                const formData = new FormData();
                formData.append('smiles', str);
                formData.append('created_by_user_id', userData?.id.toString());
                formData.append('library_id', libraryId?.toString());
                formData.append('project_id', projectId?.toString());
                formData.append('organization_id', organizationId?.toString());
                formData.append('source_molecule_name', moleculeName);
                startTransition(async () => {
                    await uploadMoleculeSmiles(formData).then(async (result) => {
                        if (result?.rejected_smiles?.length) {
                            const rejectedSmile = result.rejected_smiles[0]
                            const message = Messages.ADD_MOLECULE_ERROR + rejectedSmile.reason;
                            const toastId = toast.error(message);
                            await delay(DELAY);
                            toast.remove(toastId);
                        } else if (result?.detail) {
                            setViewEditMolecule(false);
                            callLibraryId();
                            const message = result?.detail;
                            const toastId = toast.error(message);
                            await delay(DELAY);
                            toast.remove(toastId);
                        } else {
                            setViewEditMolecule(false);
                            callLibraryId();
                            const message = Messages.ADD_MOLECULE_SUCCESS;
                            const toastId = toast.success(message);
                            await delay(DELAY);
                            toast.remove(toastId);
                        }
                    }, async (error) => {
                        const toastId = toast.error(error.message);
                        await delay(DELAY);
                        toast.remove(toastId);
                    })
                    if (inPopup) {
                        setLoader(false);
                        setButtonText('Add as New Molecule');
                    } else {
                        setSaveLoadIndicatorVisible(false);
                        setSaveButtonText('Add as New Molecule');
                    }
                });
            }
        });
    }
    const moleculeDetails = {
        setLoader: setSaveLoadIndicatorVisible,
        setButtonText: setSaveButtonText,
    }

    useEffect(() => {
        if (editMolecules.length) {
            setMoleculeName(editMolecules?.[moleculeIndex]?.source_molecule_name || '')
            resetEditedList();
        }
    }, [editMolecules]);

    const onSmilesRejected = (rejectedSmiles: RejectedSmiles[]) => {
        setRejected(rejectedSmiles)
        setShowRejectedDialog(true);
    }

    const onMoleculeNameChanged = (event: any) => {
        setMoleculeName(event.target.value)
        editedMolecules[moleculeIndex].source_molecule_name = event.target.value;
        setEditedMolecules(editedMolecules);
    }

    return (
        <>
            <div className="flex gap-2 h-full">
                {editedMolecules?.length > 1 ?
                    <div className={`w-[170px] overflow-y-auto pr-2`}>
                        {editedMolecules?.map((molecule: any, index: number) => (
                            <div
                                key={molecule.id}
                                onClick={() => handleMoleculeClick(index)}
                                className={`${index === moleculeIndex
                                    ? styles.moleculeViewBoxHighlighted
                                    : styles.moleculeViewBox} 
                                    ${(index !== editedMolecules?.length - 1) ? 'mb-4' : ''}`}
                            >
                                <div className='flex justify-center items-center'>
                                    {molecule.smiles_string && <MoleculeStructure
                                        structure={molecule.smiles_string}
                                        id={molecule.id}
                                        width={140}
                                        height={120}
                                        structureName={molecule.source_molecule_name}
                                    />}
                                </div>
                            </div>
                        ))}
                    </div> : null}
                <div className={editMolecules?.length > 1 ? 'w-[calc(100%-190px)]' : 'w-[100%]'}>
                    <div className={styles.ketcherContainer}>
                        <KetcherDrawBox
                            reactionString={editedMolecules[moleculeIndex]?.smiles_string} />
                    </div>
                    <div className="flex flex-col gap-2 mt-5">
                        <label className='text-normal text-greyMessage'>
                            Molecule name (optional)
                        </label>
                        <input
                            type="text"
                            name="molecule"
                            className={styles.moleculeInput}
                            placeholder="Molecule name"
                            value={moleculeName}
                            onChange={(event) => onMoleculeNameChanged(event)}
                        />
                    </div>
                    <div className="flex justify-start gap-2 mt-5 ">
                        <button
                            className='primary-button'
                            disabled={loadIndicatorVisibleSave}
                            onClick={() => updateSmileChange(true)}
                        >
                            Update Molecule
                        </button>
                        {editMolecules.length === 1 && <button
                            disabled={loadIndicatorVisibleSave}
                            className={loadIndicatorVisibleSave
                                ? 'disableButton w-[151px]'
                                : "secondary-button"}
                            onClick={() => saveMoleculeCall(moleculeDetails)}
                        > <LoadIndicator className={
                            `button-indicator ${styles.white}`
                        }
                            visible={loadIndicatorVisibleSave}
                            height={20}
                            width={20} />
                            {saveButtonText}
                        </button>}
                        <button
                            className='button-no-border'
                            disabled={loadIndicatorVisibleSave}
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
                    onSubmit: onDiscardSubmit,
                }
            } />
            <DialogPopUp {
                ...{
                    visible: showRejectedDialog,
                    dialogProperties,
                    Content: RejectedDialog,
                    hidePopup: hideRejectPopUp,
                    contentProps: rejectContentProps,
                }
            } />
            {updateVisible && <Popup
                visible={updateVisible}
                showTitle={false}
                onHiding={hideUpdateVisible}
                dragEnabled={false}
                showCloseButton={true}
                width={455}
                height={151}
                contentRender={() => <UpdateMoleculePopup
                    {...{
                        userData,
                        libraryId,
                        projectId,
                        setViewEditMolecule,
                        callLibraryId,
                        onClose: hideUpdateVisible,
                        onDiscardSubmit,
                        saveMoleculeCall,
                        editedMolecules,
                        editMolecules,
                        onSmilesRejected
                    }}
                />}
            />}
        </>
    );
};

export default EditMolecule;
