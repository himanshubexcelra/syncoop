import Image from 'next/image';
import styles from './AddMolecule.module.css'

export default function DiscardMolecule({ onClose }: { onClose: () => void }) {
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
                Discard uploaded file / drawn molecule?
            </div>
            <div className="flex justify-start gap-2 mt-5">
                <button className={styles.secondaryButton}>Yes</button>
                <button className={styles.rejectButton} onClick={onClose}>No</button>
            </div>
        </>
    );
}