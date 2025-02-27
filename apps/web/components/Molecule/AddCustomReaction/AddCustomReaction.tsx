/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import React, { useRef, useState, useTransition } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DiscardCustomReaction from './DiscardCustomReaction';
import DialogPopUp from '@/ui/DialogPopUp';
import { LoadIndicator } from 'devextreme-react';
import RejectedDialog from '../AddMolecule/RejectedDialog';
import Image from 'next/image';
import { uploadReactionFile } from '../service';
import toast from 'react-hot-toast';
import { delay } from '@/utils/helpers';
import { DELAY } from '@/utils/constants';
import { AddMoleculeProps, RejectedSmiles } from '@/lib/definition';
import { Messages } from '@/utils/message';

const DiscardDialogProperties = {
    width: 455,
    height: 158,
}

const RejectDialogProperties = {
    width: 465,
    height: 180,
}

export default function AddCustomReaction({
    userData,
    libraryId,
    projectId,
    organizationId,
    setViewAddMolecule,
    callLibraryId,
}: AddMoleculeProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [discardvisible, setDiscardVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);
    const [duplicateSmiles, setDuplicateSmiles] = useState<string[]>([]);
    const [updateSmiles, setUploadSmiles] = useState<number>(0);
    const [rejected, setRejected] = useState<RejectedSmiles[]>([]);
    const [rejectedMessage, setRejectedMessage] = useState<string[]>([]);
    const [showRejectedDialog, setShowRejectedDialog] = useState(false);
    const [, startTransition] = useTransition();

    const hidePopup = () => {
        setDiscardVisible(false);
    };

    const onDiscardSubmit = () => {
        setFiles([])
    }

    const saveMolecule = () => {
        setSaveLoadIndicatorVisible(true)

        if (files.length) {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            formData.append('createdBy', userData?.id.toString());
            formData.append('libraryId', libraryId?.toString());
            formData.append('projectId', projectId?.toString());
            formData.append('organizationId', organizationId?.toString());
            formData.append('checkDuplicate', 'true');
            startTransition(async () => {
                await uploadReactionFile(formData).then(async (result) => {
                    setUploadSmiles(result?.uploaded_smiles_count)
                    setRejected(result?.rejected_smiles?.
                        concat(result?.duplicate_smiles));
                    if (result?.error) {
                        const toastId = toast.error(result?.error?.detail);
                        await delay(DELAY);
                        toast.remove(toastId);
                    } else {
                        if (result?.duplicate_smiles?.length) {
                            setDuplicateSmiles(result?.duplicate_smiles)
                        }
                        if (result?.rejected_smiles?.length ||
                            result?.duplicate_smiles?.length) {
                            setRejectedMessage(
                                Messages.displayMoleculeSucessMsg
                                    (result?.uploaded_smiles?.length,
                                        result?.rejected_smiles?.length,
                                        result?.duplicate_smiles?.length, true))
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
                setSaveLoadIndicatorVisible(false);
            });
        }
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
        const validTypes = ['.rdf', '.rd', '.rdfile'];
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

    const hideRejectPopUp = () => {
        setShowRejectedDialog(false);
        if (updateSmiles > 0) {
            callLibraryId();
        }
        setViewAddMolecule(false)
    }

    const handleDrop = (e: any) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files;
        if (!droppedFile) return;

        const currentFiles: File[] = [...files];
        Array.from(droppedFile).forEach((droppedFile: any) => {
            if (validateFile(droppedFile)) {
                currentFiles.push(droppedFile);
            }
        });
        setFiles(currentFiles);
    };
    const handleFileSelect = (e: any) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        const currentFiles: File[] = [...files];
        Array.from(selectedFiles).forEach((selectedFile: any) => {
            if (validateFile(selectedFile)) {
                currentFiles.push(selectedFile);
            }
        });
        setFiles(currentFiles);
    };
    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const removeItem = (fileName: string) => {
        if (fileName) {
            setFiles(files.filter(file => file.name !== fileName))
        }
        else setFiles([])
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const rejectContentProps = {
        rejected,
        rejectedMessage,
        onClose: hideRejectPopUp,
        duplicateSmiles: duplicateSmiles,
        title: 'Reactions',
    }

    return (
        <>
            <div className="flex flex-col h-full">
                <div className={`w-full p-3 mt-[25px] ${styles.uploadPart}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className={styles.heading}>Upload RDF</h2>
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
                            accept=".rdf,.rd,.rdfile"
                            multiple
                            ref={fileInputRef}
                        />
                        <div className="flex items-center justify-center">
                            <p className={`${styles.subMessage} p-4`}>
                                Drag and drop files here or click to browse
                            </p>
                            <button
                                onClick={handleBrowseClick}
                                className='secondary-button'
                            >
                                Browse
                            </button>
                        </div>
                    </div>
                    <div className='flex items-center mb-2 mt-4 flex-wrap'>
                        {files.map((file, index) => (
                            <div className='mb-2 mt-4 mr-2'
                                key={`file-${index}`}>
                                <div className='flex justify-start gap-2 rounded-lg 
                                bg-blueLightBg pr-2'>
                                    <span className={styles.fileName}>{file?.name}</span>
                                    <Image
                                        src="/icons/cross.svg"
                                        alt="X"
                                        width={16}
                                        height={16}
                                        priority
                                        onClick={() => removeItem(file.name)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-start gap-2 mt-5 ">
                        <button className={
                            loadIndicatorVisibleSave || !files.length
                                ? 'disableButton w-[170px]'
                                : 'primary-button'}
                            disabled={loadIndicatorVisibleSave || !files.length}

                            onClick={() => saveMolecule()}>
                            <LoadIndicator className={
                                `button-indicator ${styles.white}`
                            }
                                visible={loadIndicatorVisibleSave}
                                height={20}
                                width={20}
                            />
                            {loadIndicatorVisibleSave ? '' : 'Save Custom Reaction(s)'}
                        </button>
                        <button
                            className='secondary-button'
                            disabled={loadIndicatorVisibleSave}
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
                        Content: DiscardCustomReaction,
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
            </div>

        </>
    );
};