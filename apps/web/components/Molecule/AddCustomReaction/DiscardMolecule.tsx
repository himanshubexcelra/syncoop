import Image from 'next/image';

interface DiscardMoleculeProps {
    onClose: () => void;
    onSubmit?: () => void;
}
export default function DiscardMolecule({ onClose, onSubmit }: DiscardMoleculeProps) {
    const reset = () => {
        if (onSubmit) {
            onSubmit();
        }
        onClose()
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
                Discard uploaded file / Custom Reaction?
            </div>
            <div className="flex justify-start gap-2 mt-5">
                <button className='secondary-button' onClick={reset}>Yes</button>
                <button className='reject-button' onClick={onClose}>No</button>
            </div>
        </>
    );
}