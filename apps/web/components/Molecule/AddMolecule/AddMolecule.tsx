/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import React, { useRef, useState, useTransition } from 'react';
import styles from './AddMolecule.module.css'
import Image from 'next/image';
import DiscardMolecule from './DiscardMolecule';
import DialogPopUp from '@/ui/DialogPopUp';
import { uploadMoleculeSmiles, uploadMoleculeFile } from '../service'
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { DELAY } from '@/utils/constants';
import { delay } from '@/utils/helpers';
import KetcherDrawBox from '@/components/KetcherTool/KetcherBox';
import { UserData } from '@/lib/definition';
import { RejectedSmiles } from '@/lib/definition';
import RejectedDialog from './RejectedDialog';
import { LoadIndicator } from 'devextreme-react';
import { downloadCSV } from '../file';

const DiscardDialogProperties = {
    width: 455,
    height: 158,
}

const RejectDialogProperties = {
    width: 465,
    height: 180,
}

type AddMoleculeProps = {
    userData: UserData;
    libraryId: number;
    projectId: string;
    organizationId: string;
    setViewAddMolecule: (val: boolean) => void;
    callLibraryId: () => void;
}

export default function AddMolecule({
    userData,
    libraryId,
    projectId,
    organizationId,
    setViewAddMolecule,
    callLibraryId
}: AddMoleculeProps) {
    const [file, setFile] = useState<File | null>(null);
    const [discardvisible, setDiscardVisible] = useState(false);
    const [rejected, setRejected] = useState<RejectedSmiles[]>([])
    const [showRejectedDialog, setShowRejectedDialog] = useState(false)
    const [isDragging, setIsDragging] = useState(false);
    const [moleculeName, setMoleculeName] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
    const [buttonText, setButtonText] = useState('Upload');
    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);
    const [saveButtonText, setSaveButtonText] = useState('Save Molecule');
    const [rejectedMessage, setRejectedMessage] = useState<string[]>([]);
    const [, startTransition] = useTransition()
    const isLoading = loadIndicatorVisible || loadIndicatorVisibleSave
    const hidePopup = () => {
        setDiscardVisible(false);
    };

    const hideRejectPopUp = () => {
        setShowRejectedDialog(false);
        callLibraryId();
        removeItem()
        setViewAddMolecule(false)
    }
    const rejectContentProps = {
        rejected,
        rejectedMessage,
        onClose: hideRejectPopUp,
    }
    const onDiscardSubmit = () => {
        KetcherFunctions.resetMolecule()
        setMoleculeName('')
    }
    const saveMolecule = () => {
        KetcherFunctions.exportSmile().then(async (str) => {
            if (str) {
                setSaveLoadIndicatorVisible(true);
                setSaveButtonText('');
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
                            setViewAddMolecule(false);
                            callLibraryId();
                            const message = result?.detail;
                            const toastId = toast.error(message);
                            await delay(DELAY);
                            toast.remove(toastId);
                        } else {
                            setViewAddMolecule(false);
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

                    setSaveLoadIndicatorVisible(false);
                    setSaveButtonText('Save Molecule');
                });
            } else {
                const toastId = toast.error("Invalid Smile.");
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
        const validTypes = ['.csv', '.sdf', '.mol'];
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
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleUpload = () => {
        setLoadIndicatorVisible(true);
        setButtonText('');
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('createdBy', userData?.id.toString());
            formData.append('libraryId', libraryId?.toString());
            formData.append('projectId', projectId?.toString());
            formData.append('organizationId', organizationId?.toString());
            startTransition(async () => {
                await uploadMoleculeFile(formData).then(async (result) => {
                    if (result?.error) {
                        const toastId = toast.error(result?.error?.detail);
                        await delay(DELAY);
                        toast.remove(toastId);
                    } else {
                        if (result?.rejected_smiles?.length) {
                            setRejectedMessage(Messages.displayMoleculeSucessMsg
                                (result?.uploaded_smiles?.length, result?.rejected_smiles?.length))
                            setRejected(result?.rejected_smiles)
                            setShowRejectedDialog(true);

                        } else {
                            const toastId = toast.success(
                                `${result?.uploaded_smiles?.length} ${result?.message}`
                            );
                            await delay(DELAY);
                            toast.remove(toastId);
                            setViewAddMolecule(false);
                            callLibraryId();
                        }
                    }
                }, async (error) => {
                    const toastId = toast.error(error.message);
                    await delay(DELAY);
                    toast.remove(toastId);
                });
                setLoadIndicatorVisible(false);
                setButtonText('Upload');
            });
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
                        accept=".csv,.sdf,.mol"
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
                            className='secondary-button'
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
                            <button className={loadIndicatorVisible
                                ? 'disableButton w-[63px]'
                                : 'primary-button'}
                                onClick={() => handleUpload()}
                                disabled={isLoading}>
                                <LoadIndicator className={
                                    `button-indicator ${styles.white}`
                                }
                                    visible={loadIndicatorVisible}
                                    height={20}
                                    width={20} />
                                {buttonText}</button>
                            <button
                                className='secondary-button'
                                onClick={removeItem}
                            >Reset</button>
                        </div>
                    </div>}
            </div>
            <div className={`mt-5 ${styles.uploadPart} p-4`}>
                <h2 className="subHeading mb-2">Draw a Molecule</h2>
                <div className={styles.ketcherContainer}>
                    <KetcherDrawBox reactionString={''} />
                </div>
            </div>
            <div>
                <div className="flex flex-col gap-2 mt-5">
                    <label className='text-normal text-grayMessage'>Molecule name (optional)</label>
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
                    <button className={loadIndicatorVisibleSave
                        ? 'disableButton w-[107px]'
                        : 'primary-button'}
                        disabled={isLoading}

                        onClick={() => saveMolecule()}>
                        <LoadIndicator className={
                            `button-indicator ${styles.white}`
                        }
                            visible={loadIndicatorVisibleSave}
                            height={20}
                            width={20} />{saveButtonText}</button>
                    <button
                        className='secondary-button'
                        disabled={isLoading}
                        onClick={() => setDiscardVisible(true)}
                    >
                        Reset
                    </button>
                </div>
            </div>
            <DialogPopUp {
                ...{
                    visible: discardvisible,
                    dialogProperties: DiscardDialogProperties,
                    onSubmit: onDiscardSubmit,
                    Content: DiscardMolecule,
                    hidePopup
                }
            } />
            <DialogPopUp {
                ...{
                    visible: showRejectedDialog,
                    dialogProperties: RejectDialogProperties,
                    Content: RejectedDialog,
                    hidePopup: hideRejectPopUp,
                    contentProps: rejectContentProps,
                }
            } />
        </>
    );
};