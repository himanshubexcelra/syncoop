/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import styles from './ReactionDetails.module.css';
import CustomDataGrid from '@/ui/dataGrid';
import Image from 'next/image';
import {
    ColumnConfig,
    MoleculeStatusLabel,
    ReactionCompoundType,
    ReactionDetailsProps,
    ReactionDetailType,
    RowChange,
    ResetState,
} from '@/lib/definition';
import { COMPOUND_TYPE_A, COMPOUND_TYPE_R, DEFAULT_TEMPERATURE } from '@/utils/constants';
import { capitalizeFirstLetter } from '@/utils/helpers';
import { NumberBox } from 'devextreme-react';

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

const ReactionDetails = ({
    isReactantList,
    data,
    onDataChange,
    solventList = [],
    temperatureList = [],
    onSolventChange,
    onTemperatureChange,
    setReactionDetail,
    handleSwapReaction,
    resetReaction,
    status
}: ReactionDetailsProps,) => {

    const [reactionData, setReactionData] =
        useState<ReactionDetailType | []>(data);
    const [resetReactionData, setResetReactionData] =
        useState<ReactionDetailType | []>(data);
    const [tableData, setTableData] =
        useState<ReactionCompoundType[]>([]);
    const [selectedSolvent, setSelectedSolvent] =
        useState<string>('');
    const [selectedTemperature, setSelectedTemperature] =
        useState<number>();
    const agentList: ReactionCompoundType[] =
        data?.reaction_compound?.filter(
            (item: ReactionCompoundType) => item.compound_type === COMPOUND_TYPE_A
        ) || [];
    const [agentsList,] = useState<ReactionCompoundType[]>(agentList);
    const readOnly = status === MoleculeStatusLabel.InProgress ||
        status === MoleculeStatusLabel.Done || status === MoleculeStatusLabel.Failed;

    useEffect(() => {
        if (Array.isArray(data) || !data) {
            return;
        }
        setReactionDetail({
            solvent: data.solvent,
            temperature: data.temperature,
            id: data.id,
            reactionTemplate: data?.reaction_template_master?.name,
        });
    }, []);

    // Reusable function to update initialData
    const updateInitialData = (reactionData: ReactionDetailType | []) => {
        let initialData: ReactionCompoundType[] = [];

        if (!isReactantList && Object(reactionData).hasOwnProperty('reaction_compound')) {
            const reactionCompounds = (reactionData as ReactionDetailType).reaction_compound;

            const compoundLabels = reactionCompounds.map((compound, i) =>
                compound.compound_label !== undefined && compound.compound_label !== null
                    ? compound.compound_label
                    : String(i + 1)
            );

            const uniqueLabels = Array.from(new Set(compoundLabels)).sort((a, b) => +a - +b);

            let index = 1;
            uniqueLabels.forEach((label, i) => {
                if (label !== String(index)) {
                    uniqueLabels[i] = String(index);
                }
                index++;
            });

            initialData = reactionCompounds.map((compound, i) => ({
                ...compound,
                compound_label: uniqueLabels[i] ?? String(i + 1),
            }));
        } else {
            initialData = reactionData as ReactionCompoundType[];
        }

        // Set table data and other state variables
        setTableData(initialData);
        setSelectedSolvent((reactionData as ReactionDetailType).solvent || '');
        setSelectedTemperature((reactionData as ReactionDetailType).temperature === null ?
            DEFAULT_TEMPERATURE : (reactionData as ReactionDetailType).temperature);
    };

    // Update on initial render or when `data` changes
    useEffect(() => {
        updateInitialData(reactionData);
    }, [reactionData]);

    useEffect(() => {
        if (resetReaction === ResetState.SUBMIT) {
            const updatedData = {
                solvent: selectedSolvent,
                temperature: selectedTemperature,
                reaction_compound: tableData,
            };
            setReactionData((prev) => ({
                ...prev,
                ...updatedData,
            }));
            setResetReactionData((prev) => ({
                ...prev,
                ...updatedData,
            }));
        } else {
            updateInitialData(resetReactionData);
        }
    }, [resetReaction]);

    const reagentCompounds: ReactionCompoundType[] = Array.isArray(tableData)
        ? tableData.filter((compound: ReactionCompoundType) =>
            compound?.compound_type === COMPOUND_TYPE_R).slice(0, 2).reverse()
        : [];

    const agentCompounds: ReactionCompoundType[] = Array.isArray(tableData)
        ? tableData.filter((compound: ReactionCompoundType) =>
            compound?.compound_type === COMPOUND_TYPE_A)
        : [];

    // Handle row changes
    const handleRowChange = (id: number, field: string, value: string | number): RowChange[] => {
        const updatedData = tableData.map((item: ReactionCompoundType) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        // Track changes separately
        const changes: RowChange[] = updatedData
            .filter((item: ReactionCompoundType) => item.id === id)
            .map((item: ReactionCompoundType) => ({
                id: item.id,
                [field]: value,
            }));
        setTableData(updatedData);
        onDataChange(changes);
        return changes;
    };

    const handleReorder = (newOrder: any) => {
        const { itemData, toIndex } = newOrder;
        const newData = [...tableData];
        const fromIndex = newData.findIndex(item => item.id === itemData.id);

        if (fromIndex !== -1) {
            newData.splice(fromIndex, 1);
        }

        newData.splice(toIndex, 0, itemData);

        // Update the 'compound_label' as a string
        const updatedData: ReactionCompoundType[] =
            newData.map((item: ReactionCompoundType, index: number) => ({
                ...item,
                compound_label: String(index + 1)
            }));

        setTableData(updatedData);

        const changes: { id: any; compound_label: any; }[] =
            updatedData.map((item: any) => ({
                id: item.id,
                compound_label: String(item.compound_label)
            }));

        onDataChange(changes);
    };

    // Render compound name (dropdown or span)
    const renderCompoundName = (data: ReactionCompoundType) =>
        data.compound_type === COMPOUND_TYPE_A ? (
            <select
                disabled={readOnly}
                className={styles.selectBox}
                defaultValue={data.compound_name}
                onChange={(e) => handleRowChange(data.id, 'compound_name', e.target.value)}
            >
                {agentsList.map((agent: ReactionCompoundType, index: number) => (
                    <option key={index} value={agent.compound_name}>
                        {capitalizeFirstLetter(agent.compound_name)}
                    </option>
                ))}
            </select>
        ) : (
            <span title={capitalizeFirstLetter(data.compound_name)}>
                {capitalizeFirstLetter(data.compound_name)}
            </span>
        );

    // Custom render for molar_ratio
    const renderMolarRatioInput = useCallback(
        (data: ReactionCompoundType) => (
            <NumberBox
                disabled={readOnly}
                className="h-[32px] border-[1.5px] border-[var(--themeBlueColor)] rounded-[4px]"
                placeholder="Ratio"
                width={120}
                value={data?.molar_ratio}
                onValueChanged={(e) => handleRowChange(data.id, 'molar_ratio', e.value)}
                showSpinButtons={false}
            />

        ),
        [handleRowChange]
    );

    const reactionCompoundColumns: ColumnConfig[] = [
        {
            dataField: 'compound_label',
            title: 'Sequence',
        },
        {
            dataField: 'role',
            title: 'Role',
            customRender: (data: ReactionCompoundType) =>
                <span title={capitalizeFirstLetter(data.role)}>
                    {capitalizeFirstLetter(data?.role)}
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
            customRender: renderMolarRatioInput,
        },
        {
            dataField: 'dispense_time',
            title: 'Dispense Time',
            customRender: (data: ReactionCompoundType) => (
                <select
                    disabled={readOnly}
                    className={styles.selectBox}
                    value={data?.dispense_time || 0}
                    onChange={(e) =>
                        handleRowChange(data.id, 'dispense_time', Number(e.target.value)
                        )}
                >
                    {[0, 1, 2, 3, 4, 5, 6].map((time) => (
                        <option key={time} value={time}>
                            {`${time} hr${time !== 1 && time !== 0 ? 's' : ''}`
                            }                        </option>
                    ))}
                </select>
            ),
        },
    ];

    const reactantListColumns: ColumnConfig[] = [
        {
            dataField: 'compound_name',
            title: 'Name',
            alignment: 'left',
            customRender: (data: ReactionCompoundType) =>
                <span title={capitalizeFirstLetter(data.compound_name)}>
                    {capitalizeFirstLetter(data.compound_name)}
                </span>
        },
        {
            dataField: 'related_to',
            title: 'Reaction #',
            alignment: 'center',
        },
        {
            dataField: 'role',
            title: 'Role',
            alignment: 'center',
            customRender: (data: ReactionCompoundType) =>
                <span title={data.role}>
                    {capitalizeFirstLetter(data?.role)}
                </span>,
        },
        {
            dataField: 'inventory_id',
            title: 'In Stock',
            alignment: 'center',
            customRender: () =>
                <>
                    {/* {data.inventory_id ? ( */}
                    <a
                        // href={data?.inventory_url}
                        href="/aidd-syncoop/test"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-themeBlueColor underline"
                    >
                        Yes
                    </a>
                    {/* // ) : (
                    //     <span>No</span>
                    // )
                // } */}
                </>
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
        handleSwapReaction(reagentCompounds);
        const [first, second] = reagentCompounds;

        // Create a new array where only the swapped compounds will be updated
        const updatedData = tableData.map((compound: ReactionCompoundType) => {
            if (compound?.compound_id === first?.compound_id) {
                // Swap compound_name and smiles_string with second
                return {
                    ...compound,
                    smiles_string: second?.smiles_string,
                    compound_name: second?.compound_name,
                };
            } else if (compound?.compound_id === second?.compound_id) {
                // Swap compound_name and smiles_string with first
                return {
                    ...compound,
                    smiles_string: first?.smiles_string,
                    compound_name: first?.compound_name,
                };
            }
            // Return other compounds unchanged
            return compound;
        });

        // Now process the updated data to send only the changed items
        await handleDataChange(updatedData);

        // Update the state with the updated data
        setTableData(updatedData);
    };

    const handleDataChange = (changes: ReactionCompoundType[]) => {
        // Filter out only the items that have changed (only those with updated fields)
        const updatedData = changes
            .map((change) => {
                const originalItem = tableData.find(item => item.id === change.id);

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
                        {(reactionData as ReactionDetailType)
                            ?.reaction_name?.toUpperCase() || "NA"}
                    </h1>
                    <div className="flex flex-row justify-evenly items-center w-full">
                        <div className="flex flex-row w-full sm:w-[340px] p-4 pl-0">
                            <div className="flex flex-col">
                                <span
                                    title=
                                    {capitalizeFirstLetter(reagentCompounds[0]?.role) || "NA"}
                                    className={` ${styles.reactionLabel} 
                                ${styles.reAgentLabel}`}>
                                    <b>{capitalizeFirstLetter(reagentCompounds[0]?.role)
                                        || "NA"}</b>
                                </span>
                                <span className={styles.moleculeCustomBox}>
                                    <MoleculeStructure
                                        structure={reagentCompounds[0]?.smiles_string}
                                        structureName={reagentCompounds[0]?.compound_name}
                                        id={`reaction + ${reagentCompounds[0]?.id}`}
                                        width={100}
                                        height={80}
                                    />
                                </span>
                            </div>
                            <Image
                                src="/icons/swap.svg"
                                height={24}
                                width={24}
                                alt="swap"
                                onClick={() => {
                                    if (!readOnly) {
                                        handleSwap();
                                    }
                                }}
                                className={`cursor-pointer mx-[8px] 
                                ${readOnly ?
                                        'opacity-50 cursor-not-allowed' : ''}`}
                            />

                            <div className="flex flex-col relative">
                                <span
                                    title={capitalizeFirstLetter(reagentCompounds[1]?.role) || "NA"}
                                    className={` ${styles.reactionLabel} 
                                ${styles.reAgentLabel}`}>
                                    <b>{capitalizeFirstLetter(reagentCompounds[1]?.role)
                                        || "NA"}</b>
                                </span>
                                <span className={styles.moleculeCustomBox}>
                                    <MoleculeStructure
                                        structure={reagentCompounds[1]?.smiles_string}
                                        structureName={reagentCompounds[1]?.compound_name}
                                        id={`reaction + ${reagentCompounds[1]?.id}`}
                                        width={100}
                                        height={80}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center p-8">
                            <div className="flex flex-wrap gap-[8px] mb-[24px]">
                                {agentCompounds.length > 0 &&
                                    agentCompounds.map(
                                        (agent: ReactionCompoundType, index: number) => (
                                            <span
                                                key={index}
                                                title={`${capitalizeFirstLetter(agent?.role)}: ` +
                                                    `${agent?.compound_name || 'NA'}`}
                                                className={`${styles.reactionLabel}
                                             ${styles.agentLabel}`}
                                            >
                                                {capitalizeFirstLetter(agent?.role) || "NA"}:&nbsp;
                                                <b>{agent?.compound_name || 'NA'}</b>
                                            </span>
                                        ))}
                            </div>
                            <Image
                                src={"/icons/arrow-right.svg"}
                                alt="reaction Arrow"
                                className="w-full"
                                loading="lazy"
                                width={0}
                                height={0}
                            />
                            <div className="flex mt-[8px] gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className={styles.selectLabel}>Solvent</label>
                                    <select
                                        disabled={readOnly}
                                        className={`${styles.selectBox} 
                                            ${styles.moleculeSelect}`}
                                        value={selectedSolvent}
                                        onChange={handleSolventChange}
                                    >
                                        {solventList?.map((solvent: string, index: number) => (
                                            <option key={index} value={solvent}>
                                                {capitalizeFirstLetter(solvent)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className={styles.selectLabel}>Temperature</label>
                                    <select
                                        disabled={readOnly}
                                        className={`${styles.selectBox} 
                                            ${styles.moleculeSelect}`}
                                        value={selectedTemperature}
                                        onChange={handleTemperatureChange}
                                    >
                                        {temperatureList?.map((temperature: number,
                                            index: number) => (
                                            <option key={index} value={temperature}>
                                                {`${temperature}°C`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-full sm:w-[120px] p-4">
                            <div className={styles.moleculeBox}>
                                <MoleculeStructure
                                    structure=
                                    {(reactionData as ReactionDetailType).product_smiles_string}
                                    id={`reaction3 + ${(reactionData as ReactionDetailType).id}`}
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
                data={tableData}
                loader={false}
                enableRowSelection={false}
                enableHeaderFiltering={false}
                enableSearchOption={false}
                enableGrouping={false}
                enableAutoScroll={false}
                enableSorting={true}
                enableFiltering={false}
                enableOptions={false}
                enableToolbar={false}
                showDragIcons={!isReactantList ? true : false}
                onReorderFunc={handleReorder}
                height='auto'
                maxHeight='270px'
                scrollMode={'infinite'}
            />
        </div>
    );
};

export default ReactionDetails;
