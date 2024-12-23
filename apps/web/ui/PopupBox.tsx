"use client";
import { useEffect, useRef } from 'react';
import { DropDownItem } from "@/lib/definition";
import styles from './popupBox.module.css';

type PopupBoxProps = {
    isOpen: boolean;
    onItemSelected: (item: DropDownItem) => void;
    onClose: () => void;
    items: DropDownItem[];
};

export function PopupBox({ isOpen, onItemSelected, onClose, items }: PopupBoxProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        isOpen && (
            <div className="relative" ref={popupRef}>
                <ul className={styles.popupBox}>
                    {items.map((item) => (
                        <li
                            className="w-full px-4 py-2 text-center text-neutral-999 font-lato text-sm normal-case font-normal leading-normal hover:bg-grayHover cursor-pointer"
                            onClick={() => onItemSelected(item)}
                            key={item.value}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>)
    );
}