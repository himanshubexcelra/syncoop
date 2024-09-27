import { DropDownItem } from "@/lib/definition";
import styles from './popupBox.module.css';

type PopupBoxProps = {
    isOpen: boolean;
    onItemSelected: (value: string) => void;
    items: DropDownItem[];
};

export function PopupBox({ isOpen, onItemSelected, items }: PopupBoxProps) {
    return (
        isOpen && (
            <div className="relative">
                <ul className={styles.popupBox}>
                    {items.map((item) => (
                        <li
                            className="w-full px-4 py-2 text-center text-neutral-999 font-lato text-sm normal-case font-normal leading-normal hover:bg-gray-200 cursor-pointer"
                            onClick={() => onItemSelected(item.value)}
                            key={item.value}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>
        )
    );
};