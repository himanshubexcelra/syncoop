"use client";

import { useState, useEffect } from 'react';
import styles from './Module.module.css';
import { ModuleFeature, ModuleTableProps } from '@/lib/definition';
import { getModule } from './service';
import { LoadIndicator } from 'devextreme-react';

export default function Module({ orgUser, myRoles }: ModuleTableProps) {

    const [features, setFeatures] = useState<ModuleFeature[]>([]);
    const [loader, setLoader] = useState(true);
    const orgId = orgUser?.id

    const fetchData = async () => {
        const moduleData = await getModule(orgId)
        setFeatures(moduleData)
        setLoader(false);
    }
    useEffect(() => {
        fetchData();
    }, [orgId])
    return (
        <>
            {loader && <div className="center">
                <LoadIndicator visible={loader} />
            </div>}
            {!loader && (
                <div className="grid grid-cols-2 p-4 gap-x-10">
                    {features.map((feature) => (
                        <div className={`grid grid-cols-12 ${styles.row} text-left`} key={feature.id}>
                            <div className="bg-moduleCheckBoxBg w-15 h-15 p-5 col-span-1">
                                <input
                                    type="checkbox"
                                    className={`form-checkbox w-4 h-4 ${styles.checkboxEdge}`}
                                    checked={feature.requiredPurchase}
                                    disabled={!myRoles?.includes('admin')}
                                />
                            </div>
                            <span className={`p-4 col-span-11 ${styles.text}`}>{feature.name}</span>
                        </div>
                    ))}
                </div>
            )
            }
        </>
    );
};