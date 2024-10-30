/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useRef, useState } from 'react';
import styles from './AddMolecule.module.css'
import Image from 'next/image';

const AddMolecule = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    console.log({ error, isDragging, file });
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

        if (!validTypes.includes(fileExtension)) {
            setError('Please upload a CSV or SDF file');
            return false;
        }

        setError('');
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
                            <button className={styles.primaryButton}>Upload</button>
                            <button
                                className={styles.secondaryButton}
                                onClick={removeItem}
                            >Reset</button>
                        </div>
                    </div>}
            </div>
            <div>
                <div className="flex flex-col gap-2 mt-5">
                    <label className={styles.moleculeLabel}>Molecule name (optional)</label>
                    <input
                        type="text"
                        name="molecule"
                        className={styles.moleculeInput}
                        placeholder="Molecule name"
                    />
                </div>
                <div className="flex justify-start gap-2 mt-5 ">
                    <button className={styles.primaryButton}>Save Molecule</button>
                    <button className={styles.secondaryButton}>Reset</button>
                </div>
            </div>
        </>
    );
};

export default AddMolecule;
