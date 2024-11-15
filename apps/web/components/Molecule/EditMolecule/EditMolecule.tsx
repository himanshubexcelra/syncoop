/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useEffect, useState } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DialogPopUp from '@/ui/DialogPopUp';
import DiscardMolecule from '../AddMolecule/DiscardMolecule';
import UpdateMoleculePopup from './UpdateMolecule';
import KetcherDrawBox from '@/components/KetcherTool/KetcherBox';
import dynamic from "next/dynamic";
import { MoleculeType, SaveMoleculeParams, UserData } from '@/lib/definition';
import { uploadMoleculeSmiles } from '../service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { delay } from '@/utils/helpers';
import { LoadIndicator, Popup } from 'devextreme-react';

const MoleculeStructure = dynamic(
    () => import("../../../utils/MoleculeStructure"),
    { ssr: false }
);

const dialogProperties = {
    width: 455,
    height: 151,
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
    const [moleculeName, setMoleculeName] = useState<string>('')
    const [editedMolecules, setEditedMolecules] = useState<any[]>([])

    const [selectedMolecule, setSelectedMolecule]
        = useState<MoleculeType | null>();
    const hideResetPopup = () => {
        setResetVisible(false);
    };
    const hideUpdateVisible = () => {
        setUpdateVisible(false)
    }
    const saveChanges = async (update = false) => {
        if (selectedMolecule) {
            KetcherFunctions.exportSmile().then(async (str) => {
                editedMolecules.map(mol => {
                    if (mol.id === selectedMolecule?.id) {
                        mol.smiles_string = str
                    }
                })
                if (update) {
                    setUpdateVisible(true)
                }
            })
        }
        setEditedMolecules(editedMolecules);
    }

    const handleMoleculeClick = async (molecule: any) => {
        await saveChanges();
        setSelectedMolecule(molecule);
        setMoleculeName(molecule?.source_molecule_name || '')
    };
    const resetEditedList = () => {
        const molList = JSON.stringify(editMolecules);
        setEditedMolecules(JSON.parse(molList))
    }
    const onDiscardSubmit = () => {
        resetEditedList();
        const actualMol = editMolecules.filter((mol) => mol.id === selectedMolecule?.id)
        KetcherFunctions.renderFromCtab(actualMol.length ? actualMol[0].smiles_string : '')
        setMoleculeName(actualMol.length ? actualMol[0].source_molecule_name : '')
    }
    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);
    const [saveButtonText, setSaveButtonText] = useState('Add as New Molecule');
    const saveMoleculeCall = (molecule: SaveMoleculeParams) => {
        const {
            setLoader,
            setButtonText,
        } = molecule;
        setLoader(true);
        setButtonText('');
        KetcherFunctions.exportSmile().then(async (str) => {
            const result = await uploadMoleculeSmiles({
                smiles: [str],
                "created_by_user_id": userData.id,
                "library_id": libraryId?.toString() || '',
                "project_id": projectId?.toString() || '',
                "organization_id": userData.organization_id?.toString() || '',
                "source_molecule_name": moleculeName,
            })
            if (result.rejected_smiles.length) {
                setLoader(false);
                setButtonText('Add as New Molecule');
                const rejectedSmile = result.rejected_smiles[0]
                const message = Messages.ADD_MOLECULE_ERROR + rejectedSmile.reason;
                const toastId = toast.error(message);
                await delay(4000);
                toast.remove(toastId);
            } else {
                setViewEditMolecule(false);
                callLibraryId();
                setLoader(false);
                setButtonText('Add as New Molecule');
                const message = Messages.ADD_MOLECULE_SUCCESS;
                const toastId = toast.success(message);
                await delay(4000);
                toast.remove(toastId);
            }
        });
    }
    const moleculeDetails = {
        setLoader: setSaveLoadIndicatorVisible,
        setButtonText: setSaveButtonText,
    }

    useEffect(() => {
        if (editMolecules.length) {
            setSelectedMolecule(editMolecules[0])
            setMoleculeName(editMolecules?.[0]?.source_molecule_name || '')
            resetEditedList();
        }
    }, [editMolecules])
    return (
        <>
            <div className="flex gap-2">
                {editedMolecules?.length > 1 ? <div className='w-1/5'>
                    {editedMolecules?.map((molecule: any) => (
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
                </div> : null}
                <div className={editMolecules?.length > 1 ? 'w-4/5' : 'w-full'}>
                    <div className={styles.ketcherContainer}>
                        <KetcherDrawBox
                            reactionString={selectedMolecule?.smiles_string ||
                                editMolecules[0]?.smiles_string} />
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
                            onChange={(event) => setMoleculeName(event.target.value)}
                        />
                    </div>
                    <div className="flex justify-start gap-2 mt-5 ">
                        <button
                            className='primary-button'
                            onClick={() => saveChanges(true)}
                        >
                            Update Molecule
                        </button>
                        <button
                            className="secondary-button"
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
                            className='button-no-border'
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
                        moleculeName,
                        onDiscardSubmit,
                        moleculeId: selectedMolecule?.id,
                        saveMoleculeCall,
                        editedMolecules,
                        editMolecules
                    }}
                />}
            />}
        </>
    );
};

export default EditMolecule;
