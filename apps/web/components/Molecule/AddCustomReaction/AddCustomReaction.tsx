/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import React, { useRef, useState } from 'react';
import styles from '../AddMolecule/AddMolecule.module.css'
import DiscardCustomReaction from './DiscardCustomReaction';
import DialogPopUp from '@/ui/DialogPopUp';
import { LoadIndicator } from 'devextreme-react';
import { downloadCSV } from '../file';
import Image from 'next/image';

const DiscardDialogProperties = {
    width: 455,
    height: 158,
}


export default function AddCustomReaction() {
    const [file, setFile] = useState<File | null>(null);
    const [discardvisible, setDiscardVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [moleculeName, setMoleculeName] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
    const [buttonText, setButtonText] = useState('Upload');
    const [loadIndicatorVisibleSave, setSaveLoadIndicatorVisible] = useState(false);

    const isLoading = loadIndicatorVisible || loadIndicatorVisibleSave
    const hidePopup = () => {
        setDiscardVisible(false);
    };



    const onDiscardSubmit = () => {
        setFile(null)
        setMoleculeName('')
    }

    const saveMolecule = () => {
        setSaveLoadIndicatorVisible(true)
        console.log('save file');
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
            console.log(file);

        }
    }
    const downloadTemplate = () => {
        const header = { col1: "ID (optional)", col2: "SMILES (mandatory)" }
        downloadCSV(header, [], 'molecule_template')
    }
    return (
        <>
            <div className="flex flex-col h-full">
                {file &&
                    <div className="overflow-y-auto max-h-[calc(100%-280px)]">

                        {[1, 2].map((_, index) => (
                            <div className={`w-full p-3 ${styles.uploadPart} mb-5`} key={index} >
                                <div className="relative w-full">
                                    <Image
                                        src="/images/Custom_Reaction1.png"
                                        alt="Custom_Reaction1"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-full h-auto max-w-full object-contain"
                                        priority
                                    />
                                </div>
                                <div className='flex justify-between items-center mb-2 mt-4'>
                                    <div className="flex flex-col gap-2 mt-5">
                                        <label className='text-normal text-grayMessage'>
                                            Custom Reaction name (optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="molecule"
                                            className={styles.moleculeInput}
                                            placeholder="Reaction name"
                                            value={moleculeName}
                                            onChange={(event) =>
                                                setMoleculeName(event.target.value)}
                                        />
                                    </div>
                                    <div className="mt-[35px]">
                                        <button
                                            className='secondary-button'
                                        >
                                            <Image
                                                src="/icons/delete.svg"
                                                alt="Remove"
                                                width={16}
                                                height={16}
                                                priority
                                            />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>))}
                    </div>
                }


                <div className={`w-full p-3 mt-[25px] ${styles.uploadPart}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className={styles.heading}>Upload RDF</h2>
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
                            <div className='flex justify-start gap-2 rounded-lg 
                                bg-blueLightBg pr-2'>
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
                <div>
                    <div className="flex justify-start gap-2 mt-5 ">
                        <button className={loadIndicatorVisibleSave
                            ? 'disableButton w-[170px]'
                            : 'primary-button'}
                            disabled={isLoading}

                            onClick={() => saveMolecule()}>
                            <LoadIndicator className={
                                `button-indicator ${styles.white}`
                            }
                                visible={loadIndicatorVisibleSave}
                                height={20}
                                width={20} />
                            {loadIndicatorVisibleSave ? '' : 'Save Custom Reaction(s)'}
                        </button>
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
                        Content: DiscardCustomReaction,
                        hidePopup
                    }
                } />
            </div>

        </>
    );
};