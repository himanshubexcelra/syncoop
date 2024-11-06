/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useRef, useState } from 'react';
import styles from './AddMolecule.module.css'
import Image from 'next/image';
import DiscardMolecule from './DiscardMolecule';
import DialogPopUp from '@/ui/DialogPopUp';
import { downloadCSV, uploadMoleculeFile, uploadMoleculeSmiles } from '../service';
import { getUserData } from '@/utils/auth';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { DELAY } from '@/utils/constants';
import { delay } from '@/utils/helpers';
import KetcherDrawBox from '@/components/KetcherTool/KetcherBox';

const dialogProperties = {
    width: 455,
    height: 148,
}

interface AddMoleculeProps {
    libraryId: string | null;
    projectId: string | null;
}

const AddMolecule: React.FC<AddMoleculeProps> = ({ libraryId, projectId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [discardvisible, setDiscardVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [moleculeName, setMoleculeName] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const hidePopup = () => {
        setDiscardVisible(false);
    };
    const saveMolecule = async () => {
        const sessionData = await getUserData();
        const userData: any = sessionData?.userData;
        KetcherFunctions.exportSmile().then(async (str) => {
            const result = await uploadMoleculeSmiles({
                smiles: [str],
                "created_by_user_id": userData.id,
                "library_id": libraryId?.toString() || '',
                "project_id": projectId?.toString() || '',
                "organization_id": userData.organizationId,
                "source_molecule_name": moleculeName
            })
            if (result.rejected_smiles.length > 0) {
                const rejectedSmile = result.rejected_smiles[0]
                const message = Messages.ADD_MOLECULE_ERROR + rejectedSmile.reason;
                const toastId = toast.error(message);
                await delay(DELAY);
                toast.remove(toastId);
            } else {
                const message = Messages.ADD_MOLECULE_SUCCESS;
                const toastId = toast.success(message);
                await delay(DELAY);
                toast.remove(toastId);
            }
        });
    }
    const handleDragOver = (e: any) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: any) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateFile = (file: any) => {
        const validTypes = ['.csv', '.sdf'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const maxSizeBytes = 10 * 1024 * 1024;
        if (!validTypes.includes(fileExtension)) {
            return false;
        }
        if (file?.size > maxSizeBytes) {
            return false;
        }
        return true;
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (!droppedFile) return;

        if (validateFile(droppedFile)) {
            setFile(droppedFile);
        }
    };

    const handleFileSelect = (e: any) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };
    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const removeItem = () => {
        setFile(null)
    }

    const handleUpload = async () => {
        const sessionData = await getUserData();
        const userData: any = sessionData?.userData;
        if (file) {
            uploadMoleculeFile({
                "file": file,
                "created_by_user_id": userData?.id.toString() || '',
                "library_id": libraryId?.toString() || '',
                "project_id": projectId?.toString() || '',
                "organization_id": userData?.organizationId.toString() || '',
                "updated_by_user_id": userData?.id.toString() || '',
            })
        }
    }
    const downloadTemplate = () => {
        const header = { col1: "ID (optional)", col2: "SMILES (mandatory)" }
        downloadCSV(header, [], 'molecule_template')
    }
    return (
        <>
            <div className={`w-full p-3 ${styles.uploadPart}`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className={styles.heading}>Upload CSV/SDF</h2>
                    <div>
                        <span className={styles.subText}>
                            To use the right format for importing,
                        </span>
                        &nbsp;
                        <button
                            className={styles.templateButton}
                            onClick={() => downloadTemplate()}
                        >
                            Download Template
                        </button>
                    </div>
                </div>
                <div
                    className={isDragging ? styles.dottedBoxActive : styles.dottedBox}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".csv,.sdf"
                        ref={fileInputRef}
                    />
                    <div className="flex items-center justify-center">
                        <p className={`${styles.subMessage} p-4`}>
                            {file
                                ? 'Drop a new file to replace the current one'
                                : 'Drag and drop a file here or click to browse'}
                        </p>
                        <button
                            onClick={handleBrowseClick}
                            className={styles.secondaryButton}
                        >
                            Browse
                        </button>
                    </div>
                </div>
                {file &&
                    <div className='flex justify-between items-center mb-2 mt-4'>
                        <div className='flex justify-start gap-2 rounded-lg bg-blueLightBg pr-2'>
                            <span className={styles.fileName}>{file?.name}</span>
                            <Image
                                src="/icons/cross.svg"
                                alt="X"
                                width={16}
                                height={16}
                                priority
                                onClick={removeItem}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className={styles.primaryButton}
                                onClick={() => handleUpload()}>Upload</button>
                            <button
                                className={styles.secondaryButton}
                                onClick={removeItem}
                            >Reset</button>
                        </div>
                    </div>}
            </div>
            <div className={`mt-5 ${styles.uploadPart} p-4`}>
                <h2 className={`${styles.heading} mb-2`}>Draw a Molecule</h2>
                <div className={styles.ketcherContainer}>
                    <KetcherDrawBox reactionString={''} />
                </div>
            </div>
            <div>
                <div className="flex flex-col gap-2 mt-5">
                    <label className={styles.moleculeLabel}>Molecule name (optional)</label>
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
                    <button className={styles.primaryButton}
                        onClick={() => saveMolecule()}>Save Molecule</button>
                    <button
                        className={styles.secondaryButton}
                        onClick={() => setDiscardVisible(true)}
                    >
                        Reset
                    </button>
                </div>
            </div>
            <DialogPopUp {
                ...{
                    visible: discardvisible,
                    dialogProperties,
                    Content: DiscardMolecule,
                    hidePopup
                }
            } />
        </>
    );
};

export default AddMolecule;
