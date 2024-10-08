"use client";
import styles from './Module.module.css';
import { ModuleTableProps } from '@/lib/definition';

export default function Module({ featuresLeft, featuresRight }: ModuleTableProps) {
    return (
        <div className="grid grid-cols-2 p-4 gap-8">
            <div>
                {featuresLeft.map((feature) => (
                    <div className={`grid grid-cols-12 ${styles.row} text-left`} key={feature.value}>
                        <div className="bg-moduleCheckBoxBg w-15 h-15 p-5 col-span-1">
                            <input
                                type="checkbox"
                                className="form-checkbox w-4 h-4"
                                checked={feature.checked}
                                readOnly
                            />
                        </div>
                        <span className={`p-4 col-span-11 ${styles.text}`}>{feature.name}</span>
                    </div>
                ))}
            </div>
            <div>
                {featuresRight.map((feature) => (
                    <div className={`grid grid-cols-12 ${styles.row} text-left`} key={feature.value}>
                        <div className="bg-moduleCheckBoxBg w-15 h-15 p-5 col-span-1">
                            <input
                                type="checkbox"
                                className="form-checkbox w-4 h-4"
                                checked={feature.checked}
                                readOnly
                            />
                        </div>
                        <span className={`p-4 col-span-11 ${styles.text}`}>{feature.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};