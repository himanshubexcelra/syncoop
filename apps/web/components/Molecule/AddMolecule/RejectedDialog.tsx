import Image from 'next/image';
import { RejectedSmiles } from '@/lib/definition';
import { downloadCSV } from '../file';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { useEffect, useState } from 'react';

interface RejectedDialogProps {
    onClose: () => void;
    rejected?: RejectedSmiles[];
    rejectedMessage?: string[]
    uploadDuplicate?: () => void;
    duplicateSmiles?: { smiles: string; reason: string; molecule_id: string; existing_status: string; existing_status_id: string }[];
    isLoader?: boolean;
}
export default function RejectedDialog({ onClose, rejected, rejectedMessage, uploadDuplicate, duplicateSmiles = [], isLoader }: RejectedDialogProps) {
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(isLoader ?? false);
    }, [isLoader]);
    const downloadTemplate = () => {
        const header = { smiles: "SMILE", reason: "Reason" }
        downloadCSV(header, rejected, 'rejected_smiles')
    }

    return (
        <><div className="flex justify-between">
            <div className="header-text text-messageDarkBlue">
                Rejected Molecules
            </div>
            <Image
                className='cursor-pointer'
                src="/icons/cross-icon.svg"
                alt="close icon"
                width={21.1}
                height={22.5}
                onClick={onClose} />
        </div>
            {rejectedMessage && <div className='text-[14px] mt-2 flex flex-col gap-[5px]'>
                {rejectedMessage?.map(
                    (message: string, index: number) =>
                        <p key={index}>{message}</p>
                )}

            </div>}
            <div className="flex justify-start gap-2 mt-5">
                <button
                    className='secondary-button'
                    onClick={() => downloadTemplate()}
                >Download Rejected List
                </button>
                {duplicateSmiles?.length > 0 &&
                    <button
                        className='secondary-button'
                        onClick={() => uploadDuplicate && uploadDuplicate()}
                    >
                        <LoadIndicator className="button-indicator"
                            visible={isLoading}
                            height={5}
                            width={95} />
                        {isLoading ? '' : 'Upload Duplicate'}

                    </button>
                }
                <button className='reject-button' onClick={onClose}>Close</button>
            </div>

        </>
    );
}