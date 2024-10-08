import Image from 'next/image';
import styles from './ForgotContent.module.css'
import { Messages } from '@/utils/message';

export default function PopupContent({ onClose }: { onClose: () => void }) {
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
            <div className='flex flex-col items-center gap-6'>
                <Image src="/images/lock-image.svg"
                    alt="lock image"
                    priority
                    width={178}
                    height={164} />
                <div className='gap-4'>
                    <div className={`${styles.subHeading}`}>Forgot Password?</div>
                    <div className={`${styles.message}`}>
                        {Messages.forgotPassword}
                    </div>
                </div>

                <button className={`p-2 ${styles.closeButton}`}
                    onClick={onClose}
                >
                    Close
                </button>
            </div></>
    );
}
