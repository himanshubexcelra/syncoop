import Image from 'next/image';
import { RejectedSmiles } from '@/lib/definition';
import { downloadCSV } from '@/utils/helpers';

interface RejectedDialogProps {
    onClose: () => void;
    rejected?: RejectedSmiles[];
}
export default function RejectedDialog({ onClose, rejected }: RejectedDialogProps) {

    const downloadTemplate = () => {
        const header = { smiles: "SMILE", reason: "Reason" }
        downloadCSV(header, rejected, 'rejected_smiles')
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
            <div className="header-text text-messageDarkBlue">
                Rejected Molecules
            </div>
            <div className="flex justify-start gap-2 mt-5">
                <button
                    className='secondary-button'
                    onClick={() => downloadTemplate()}
                >Download List
                </button>
                <button className='reject-button' onClick={onClose}>Close</button>
            </div>
        </>
    );
}