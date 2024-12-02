/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import styles from './ReactionDetails.module.css';
import CustomDataGrid from '@/ui/dataGrid';
import Image from 'next/image';
import {
    ColumnConfig,
    ReactionCompoundType,
    ReactionDetailType,
} from '@/lib/definition';
import { COMPOUND_TYPE_A, COMPOUND_TYPE_R } from '@/utils/constants';

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

// Define Types for Props
interface ReactionDetailsProps {
    isReactantList: boolean;
    data: ReactionDetailType | []; // Array of ReactionData objects
    onDataChange: (changes: RowChange[]) => void;
    solventList?: string[];
    temperatureList?: number[];
    onSolventChange: (value: string) => void;
    onTemperatureChange: (value: number) => void;
    setReactionDetail: (reactionDetail: {
        solvent?: string;
        temperature?: number;
        id?: string | number;
        reactionTemplate?: string;
    }) => void;
}

// RowChange type for changes (updated to be more specific)
interface RowChange {
    id: number;
    [field: string]: any;
}

// The Arrow component type
interface ArrowProps {
    color: string;
}

export function Arrow({ color }: ArrowProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="219"
            height="16"
            viewBox="0 0 219 16"
            fill="none"
        >
            <path
                d="M218.707 8.70711C219.098 8.31658 219.098 7.68342 218.707 7.29289L212.343 
                0.928932C211.953 0.538408 211.319 0.538408 210.929 0.928932C210.538 1.31946 
                210.538 1.95262 210.929 2.34315L216.586 8L210.929 13.6569C210.538 14.0474 
                210.538 14.6805 210.929 15.0711C211.319 15.4616 211.953 15.4616 212.343 
                15.0711L218.707 8.70711ZM0 9H218V7H0V9Z"
                fill={color}
            />
        </svg>
    );
}

const ReactionDetails = ({
    isReactantList,
    data,
    onDataChange,
    solventList = [],
    temperatureList = [],
    onSolventChange,
    onTemperatureChange,
    setReactionDetail
}: ReactionDetailsProps,) => {

    let initialData;

    if (!isReactantList && Object(data).hasOwnProperty('reaction_compound')) {
        initialData = (data as ReactionDetailType).reaction_compound
    } else {
        {
            initialData = (data as ReactionCompoundType[]).map(
                (reAgents: ReactionCompoundType, index: number) => ({
                    ...reAgents,
                    sNo: index + 1
                }))
        }
    }

    const [reactionData, setReactionData] =
        useState<ReactionCompoundType[]>(initialData);
    const [selectedSolvent, setSelectedSolvent] =
        useState<string>((data as ReactionDetailType).solvent || '');
    const [selectedTemperature, setSelectedTemperature] =
        useState<number>((data as ReactionDetailType).temperature || 0);
    useEffect(() => {
        if (Array.isArray(data) || !data) {
            return;
        }
        setReactionDetail({
            solvent: data.solvent,
            temperature: data.temperature,
            id: data.id,
            reactionTemplate: data.reaction_template,
        });
    }, []);

    const reagentCompounds: ReactionCompoundType[] = Array.isArray(reactionData)
        ? reactionData.filter((compound: ReactionCompoundType) =>
            compound?.compound_type.toLowerCase() === COMPOUND_TYPE_R).slice(0, 2).reverse()
        : [];

    const agentCompounds: ReactionCompoundType[] = Array.isArray(reactionData)
        ? reactionData.filter((compound: ReactionCompoundType) =>
            compound?.compound_type.toLowerCase() === COMPOUND_TYPE_A)
        : [];

    // Handle row changes
    const handleRowChange = (id: number, field: string, value: string | number): RowChange[] => {
        const updatedData = reactionData.map((item: ReactionCompoundType) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        // Track changes separately
        const changes: RowChange[] = updatedData
            .filter((item: ReactionCompoundType) => item.id === id)
            .map((item: ReactionCompoundType) => ({
                id: item.id,
                [field]: value,
            }));
        setReactionData(updatedData);
        onDataChange(changes);
        return changes;
    };

    const handleReorder = (newOrder: any) => {
        const { itemData, toIndex } = newOrder;
        const newData = [...reactionData];
        const fromIndex = newData.findIndex(item => item.id === itemData.id);

        if (fromIndex !== -1) {
            newData.splice(fromIndex, 1);
        }

        newData.splice(toIndex, 0, itemData);

        // Update the 'compound_label' as a string
        const updatedData: ReactionCompoundType[] =
            newData.map((item: ReactionCompoundType, index: number) => ({
                ...item,
                compound_label: (index + 1)
            }));

        setReactionData(updatedData);

        const changes: { id: any; compound_label: any; }[] =
            updatedData.map((item: any) => ({
                id: item.id,
                compound_label: item.compound_label
            }));

        onDataChange(changes);
    };


    // Render compound name (dropdown or span)
    const renderCompoundName = (data: ReactionCompoundType) =>
        data.compound_type.toLowerCase() === 'a' ? (
            <select
                className={styles.selectBox}
                defaultValue={data.compound_name}
                onChange={(e) => handleRowChange(data.id, 'compound_name', e.target.value)}
            >
                {reactionData
                    .filter((item: ReactionCompoundType) =>
                        item.compound_type.toLowerCase() === 'a')
                    .map((agent: ReactionCompoundType, index: number) => (
                        <option key={index} value={agent.compound_name}>
                            {agent.compound_name}
                        </option>
                    ))}
            </select>
        ) : (
            <span title={data.compound_name}>{data.compound_name || 'NA'}</span>
        );

    const reactionCompoundColumns: ColumnConfig<ReactionCompoundType>[] = [
        {
            dataField: 'compound_label',
            title: 'Sequence',
        },
        {
            dataField: 'role',
            title: 'Role',
            customRender: (data: ReactionCompoundType) => <span title={data.role}>
                {data.role || 'NA'}
            </span>,
        },
        {
            dataField: 'compound_name',
            title: 'Name',
            customRender: renderCompoundName,
        },
        {
            dataField: 'molar_ratio',
            title: 'Ratio',
            customRender: (data: ReactionCompoundType) => (
                <input className={styles.boxContentTable}
                    placeholder="Ratio"
                    width={120}
                    value={data?.molar_ratio}
                    style={{ paddingLeft: '30px' }}
                    onChange={(e) =>
                        handleRowChange(data.id, 'molar_ratio', e.target.value
                        )}
                />
            ),
        },
        {
            dataField: 'dispense_time',
            title: 'Dispense Time',
            customRender: (data: ReactionCompoundType) => (
                <select
                    className={styles.selectBox}
                    value={data?.dispense_time || 0}
                    onChange={(e) =>
                        handleRowChange(data.id, 'dispense_time', Number(e.target.value)
                        )}
                >
                    {[0, 1, 2, 3, 4, 5, 6].map((time) => (
                        <option key={time} value={time}>
                            {time === 0 ? '0' : `${time} hrs`}
                        </option>
                    ))}
                </select>
            ),
        },
    ];

    const reactantListColumns: ColumnConfig<ReactionCompoundType>[] = [
        {
            dataField: 'compound_name',
            title: 'Name',
            alignment: 'left',
            width: 240,
            customRender: (data: ReactionCompoundType) =>
                <span title={data.compound_name}>{data.compound_name || 'NA'}</span>
        },
        {
            dataField: 'sNo',
            title: 'reaction #',
            width: 132,
            alignment: 'center',
        },
        {
            dataField: 'role',
            title: 'Role',
            width: 220,
            alignment: 'center',
            customRender: (data: ReactionCompoundType) => <span title={data.role}>
                {data.role || 'NA'}
            </span>,
        },
        {
            dataField: 'inventory_id',
            title: 'In Stock',
            width: 110,
            alignment: 'center',
            customRender: (data: ReactionCompoundType) =>
                <span>{data.inventory_id ? 'Yes' : 'No'}</span>,
        },
    ];

    const handleSolventChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedSolvent(value);
        onSolventChange(value);
    };

    const handleTemperatureChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(event.target.value, 10);
        setSelectedTemperature(value);
        onTemperatureChange(value);
    };

    // Handle molecule swap
    const handleSwap = async () => {
        const [first, second] = reagentCompounds;

        // Create a new array where only the swapped compounds will be updated
        const updatedData = reactionData.map((compound: ReactionCompoundType) => {
            if (compound.compound_id === first.compound_id) {
                // Swap compound_name and smiles_string with second
                return {
                    ...compound,
                    smiles_string: second.smiles_string,
                    compound_name: second.compound_name,
                };
            } else if (compound.compound_id === second.compound_id) {
                // Swap compound_name and smiles_string with first
                return {
                    ...compound,
                    smiles_string: first.smiles_string,
                    compound_name: first.compound_name,
                };
            }
            // Return other compounds unchanged
            return compound;
        });

        // Now process the updated data to send only the changed items
        await handleDataChange(updatedData);

        // Update the state with the updated data
        setReactionData(updatedData);
    };

    const handleDataChange = (changes: ReactionCompoundType[]) => {
        // Filter out only the items that have changed (only those with updated fields)
        const updatedData = changes
            .map((change) => {
                const originalItem = reactionData.find(item => item.id === change.id);

                // Check if either compound_name or smiles_string has changed
                if (
                    originalItem &&
                    (originalItem.compound_name !== change.compound_name ||
                        originalItem.smiles_string !== change.smiles_string)
                ) {
                    // Only return updated fields
                    const updatedFields: {
                        compound_name: string,
                        smiles_string: string,
                        id: number
                    } = {
                        compound_name: '',
                        smiles_string: '',
                        id: 0
                    }

                    if (originalItem.compound_name !== change.compound_name) {
                        updatedFields.compound_name = change.compound_name;
                    }

                    if (originalItem.smiles_string !== change.smiles_string) {
                        updatedFields.smiles_string = change.smiles_string;
                    }

                    return {
                        ...updatedFields,
                        id: change.id,
                    };
                }
                return null;
            })
            .filter((item) => item !== null); // Remove null values from the array

        // Send only the updated data to the parent
        onDataChange(updatedData);
    };

    return (
        <div>
            {!isReactantList &&
                <div className={`${!isReactantList ? 'px-[20px] pt-[10px] pb-[20px]' : ''}`}>
                    <h1 className="subHeading mb-6 flex items-center">
                        {(data as ReactionDetailType).reaction_template?.toUpperCase()}
                    </h1>
                    <div className="flex justify-between items-center">
                        <div className='flex flex-row gap-[16px]'>
                            <div className="flex flex-col">
                                <span
                                    title={`${reagentCompounds[0]?.compound_name || 'NA'}: 
                                ${reagentCompounds[0]?.role || 'NA'}`}
                                    className={` ${styles.reactionLabel} 
                                ${styles.reAgentLabel}`}>
                                    {reagentCompounds[0]?.compound_name
                                        || 'NA'}:&nbsp;
                                    <b>{reagentCompounds[0]?.role || 'NA'}</b>
                                </span>
                                <span className={styles.moleculeCustomBox}>
                                    <MoleculeStructure
                                        structure={reagentCompounds[0]?.smiles_string}
                                        id={`reaction + ${reagentCompounds[0]?.id}`}
                                        width={100}
                                        height={80}
                                    />
                                </span>
                            </div>
                            <Image src="/icons/swap.svg" height={24} width={24} alt="swap"
                                onClick={() => handleSwap()} className='cursor-pointer' />
                            <div className="flex flex-col relative">
                                <span
                                    title={`${reagentCompounds[1]?.compound_name || 'NA'}: 
                                ${reagentCompounds[1]?.role || 'NA'}`}
                                    className={` ${styles.reactionLabel} 
                                ${styles.reAgentLabel}`}>

                                    {reagentCompounds[1]?.compound_name
                                        || 'NA'}:&nbsp;
                                    <b>{reagentCompounds[1]?.role || 'NA'}</b>
                                </span>
                                <span className={styles.moleculeCustomBox}>
                                    <MoleculeStructure
                                        structure={reagentCompounds[1]?.smiles_string}
                                        id={`reaction + ${reagentCompounds[1]?.id}`}
                                        width={100}
                                        height={80}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start w-1/4 mr-[24px]">
                            <div className="flex flex-col flex-wrap gap-[8px] mb-2">
                                {agentCompounds.length > 0 &&
                                    agentCompounds.map(
                                        (agent: ReactionCompoundType, index: number) => (
                                            agent?.role || agent?.compound_name &&
                                            <span
                                                key={index} title={`${agent?.role || 'NA'}: 
                                    ${agent?.compound_name || 'NA'}`}
                                                className={`${styles.reactionLabel}
                                             ${styles.agentLabel}`}
                                            >
                                                {agent?.role || 'NA'}:&nbsp;
                                                <b>{agent?.compound_name || 'NA'}</b>
                                            </span>
                                        ))}
                            </div>
                            <Arrow color="#0F69AF" />
                            <div className="mt-2 space-y-2">
                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className={styles.selectLabel}>Solvent</label>
                                        <select
                                            className={`${styles.selectBox} 
                                            ${styles.moleculeSelect}`}
                                            value={selectedSolvent}
                                            onChange={handleSolventChange}
                                        >
                                            {solventList?.map((solvent: string, index: number) => (
                                                <option key={index} value={solvent}>
                                                    {solvent}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className={styles.selectLabel}>Temperature</label>
                                        <select
                                            className={`${styles.selectBox} 
                                            ${styles.moleculeSelect}`}
                                            value={selectedTemperature}
                                            onChange={handleTemperatureChange}
                                        >
                                            {temperatureList?.map((temperature: number,
                                                index: number) => (
                                                <option key={index} value={temperature}>
                                                    {temperature}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-[135px]">
                            <div className={styles.moleculeBox}>
                                <MoleculeStructure
                                    structure={(data as ReactionDetailType).product_smiles_string}
                                    id={`reaction3 + ${(data as ReactionDetailType).id}`}
                                    width={100}
                                    height={80}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            }

            <CustomDataGrid
                columns={!isReactantList ? reactionCompoundColumns : reactantListColumns}
                data={reactionData}
                height='auto'
                loader={false}
                enableRowSelection={false}
                enableHeaderFiltering={false}
                enableSearchOption={false}
                enableGrouping={false}
                enableInfiniteScroll={false}
                enableAutoScroll={false}
                enableSorting={true}
                enableFiltering={false}
                enableOptions={false}
                enableToolbar={false}
                showDragIcons={!isReactantList ? true : false}
                onReorderFunc={handleReorder}
            />
        </div>
    );
};

export default ReactionDetails;
