import Image from 'next/image';
import styles from './AddMolecule.module.css'
import { RejectedMolecules } from '@/lib/definition';
import { downloadCSV } from '../service';

interface RejectedDialogProps {
    onClose: () => void;
    rejected?: RejectedMolecules[];
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
            <div className={styles.discardText}>
                Rejected Molecules
            </div>
            <div className="flex justify-start gap-2 mt-5">
                <button
                    className={styles.secondaryButton}
                    onClick={() => downloadTemplate()}
                >Download List
                </button>
                <button className={styles.rejectButton} onClick={onClose}>Close</button>
            </div>
        </>
    );
}