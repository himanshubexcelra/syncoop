/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { MoleculeType, Status } from "@/lib/definition"
import { useEffect, useState } from "react";
import StatusCard from "@/ui/StatusCard";
import { COLOR_SCHEME, moleculeStatus, sample_molecule_ids } from "@/utils/constants";
import { getADMECalculation, getAverage, getStatusObject, randomValue } from "@/utils/helpers";
import { CheckBox, DataGrid } from "devextreme-react";
import { Column, Paging, Selection } from "devextreme-react/cjs/data-grid";
import { getMoleculeData } from "../Libraries/service";
import CustomTooltip from "@/ui/CustomTooltip";
import AdmeInfo from "../Tooltips/AdmeInfo";
import Image from "next/image";
import MoleculeStructureActions from "@/ui/MoleculeStructureActions";
import './TestComponent.css'
/* 
const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
); */

type TestProps = {
    sessionData: any,
}

export default function TestComponent({ sessionData }: TestProps) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);  // Track loading state
    const [error, setError] = useState<any>(null);  // Track errors
    const { actionsEnabled } = sessionData;
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [enabledData, setEnabledData] = useState([]);

    // Condition to disable selection for specific rows (e.g., based on 'disabled' field)
    const onSelectionChanged = (e: any) => {
        console.log(2);
        setSelectedRowKeys(e.selectedRowKeys);
    };


    const showEditMolecule = (data?: MoleculeType) => {
        console.log(data);
        /* const moleculesToEdit = data ? [data] : selectedRowsData;
        setEditMolecules(moleculesToEdit.filter(d => !isMoleculeInCart.includes(d.id)));
        setViewEditMolecule(true); */
    };

    const handleStructureZoom = (event: any, data: any) => {
        console.log(event, data);
        /* const { x, y } = event.event.target.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        setPopupCords({ x, y: y >= screenHeight / 2 ? y - 125 : y });
        setPopupVisible(true);
        setCellData(data); */
    }

    const addToFavourite = async (data: MoleculeType, existingFavourite: boolean) => {
        console.log(existingFavourite, data);
        /* const dataField: addToFavoritesProps = {
            molecule_id: data.id,
            user_id: userData.id,
            favourite_id: data.favourite_id,
            favourite: !existingFavourite
        };
        // if (existingFavourite) dataField.existingFavourite = existingFavourite;
        const response = await addToFavorites(dataField);
        if (!response.error) {
            fetchMoleculeData(data.library_id);

        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
        } */
    }

    // Function to check if a row can be selected
    const rowSelected = (rowData: any) => {
        // Disable selection if the 'disabled' field is true
        return !rowData.disabled;
    };

    // onCellPrepared to disable the checkbox
    const onCellPrepared = (e: any) => {
        if (e.rowType === 'data' && e.column.type === 'selection') {
            const rowData = e.row.data;

            // Disable the checkbox for rows where 'disabled' is true
            if (rowData.disabled) {
                // Set pointer-events to 'none' to disable interaction with the checkbox
                e.cellElement.style.pointerEvents = 'none';

                // Optional: Add some visual feedback like reducing opacity
                e.cellElement.style.opacity = 0.2;
            }
        }
    };

    // Handle the 'Select All' logic in the header checkbox
    const handleSelectAll = (args: any) => {
        if (args.value) {
            setSelectedRowKeys(enabledData);
        } else if (args.value !== null) {
            setSelectedRowKeys([]);
        }
    }

    // Determine if the header checkbox should be checked or not

    let isHeaderCheckboxChecked: any = false;
    if (selectedRowKeys.length === enabledData.length) {
        isHeaderCheckboxChecked = true;
    } else if (selectedRowKeys.length && selectedRowKeys.length < enabledData.length) {
        isHeaderCheckboxChecked = null;
    }

    const columns: any = [
        {
            dataField: 'id',
            title: 'Molecule ID',
            allowHeaderFiltering: false,
            alignment: "center",
            width: 140,
            defaultSortOrder: "desc",
            allowSorting: true,
            allowSelection: (rowData: any) => rowSelected(rowData)

        },
        {
            dataField: "favourite",
            type: "bookmark",
            width: 60,
            allowSorting: false,
            headerCellRenderer: () => <Image src="/icons/star.svg" width={24}
                height={24} alt="Bookmark" />,
            headerFilter: {
                dataSource: [
                    { value: true, text: 'Favourites' },
                    { value: false, text: 'Non-Favourites' },
                ],
            },
            customRender: (data: any) => {
                return (
                    <span className={`flex
                                    justify-center
                                    cursor-pointer`}
                        onClick={() =>
                            addToFavourite(
                                data,
                                data.favourite
                            )
                        }>
                        <Image
                            src={data.favourite ?
                                "/icons/star-filled.svg" :
                                "/icons/star.svg"
                            }
                            width={24}
                            height={24}
                            alt="favourite"
                        />
                    </span>
                );
            }
        },
        {
            dataField: 'smiles_string',
            title: 'Structure',
            minWidth: 180,
            width: 180,
            allowSorting: false,
            allowHeaderFiltering: false,
            alignment: 'center',
            customRender: (data: any) => (
                <MoleculeStructureActions
                    smilesString={data.smiles_string}
                    structureName={data.source_molecule_name}
                    molecule_id={data.id}
                    onZoomClick={(e: any) => handleStructureZoom(e, data)}
                    enableEdit={actionsEnabled.includes('edit_molecule')}
                    enableDelete={actionsEnabled.includes('delete_molecule')}
                    onEditClick={() => showEditMolecule(data)}
                />
            ),
        },
        {
            dataField: 'source_molecule_name',
            title: 'Molecule Name',
            width: 140,
            allowHeaderFiltering: false,
            alignment: "center"
        },
        {
            dataField: 'molecular_weight',
            title: 'Molecular Weight',
            width: 140,
            alignment: "center",
            allowHeaderFiltering: false,
            cssClass: 'moleculeStatus',
            customRender: (data: any) => {
                if (data.molecular_weight) {
                    const key = 'molecular_weight';
                    const formulaeFound = COLOR_SCHEME[key].formulaes.find(
                        (formulae: {
                            min: number,
                            max: number,
                            formulae: (value: string) => void
                        }) =>
                            data.molecular_weight >= formulae.min &&
                            data.molecular_weight < formulae.max
                    );
                    const { formulae } = formulaeFound;
                    const calculatedResult = formulae(data.molecular_weight);
                    const colorFound = COLOR_SCHEME[key].color.find((color: any) => {
                        return calculatedResult >= color.min && calculatedResult < color.max
                    });
                    return (
                        <span className={`${colorFound?.className} status-mark`}
                            title={calculatedResult.toFixed(2)}>
                            {Number(data.molecular_weight).toFixed(2)}
                        </span>
                    );
                }
                return '';
            }
        },
        {
            dataField: 'status_name',
            title: 'Status',
            width: 160,
            alignment: "center",
            cssClass: 'moleculeStatus',
            customRender: (data: MoleculeType) => {
                const status: Status[] = getStatusObject(moleculeStatus, data.status_name);
                if (status.length) {
                    return (
                        <StatusCard id={data.id} stat={status[0]} />
                    );
                }
            }
        },
        {
            dataField: 'yield',
            title: 'Yield(%)',
            width: 100,
            alignment: "center",
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.reaction_data) {
                    const key = 'yield';
                    const { rxn_product_yield } = data.reaction_data;
                    const yieldValue = rxn_product_yield.split('%')[0];
                    const formulaeFound = COLOR_SCHEME[key].formulaes.find((formulae: {
                        min: number,
                        max: number,
                        formulae: (value: string) => void
                    }) =>
                        yieldValue >= formulae.min &&
                        yieldValue < formulae.max
                    );
                    const { formulae } = formulaeFound;
                    const calculatedResult = formulae(yieldValue);
                    const reference = COLOR_SCHEME[key].reference
                    const colorFound = COLOR_SCHEME[key].color.find((color: any) => {
                        return calculatedResult >= color.min && calculatedResult < color.max
                    });
                    const id = `${key}-${data.molecule_id}`
                    return (
                        <div className={`${colorFound?.className} status-mark`}>
                            <span id={id}>{rxn_product_yield}</span>
                            <CustomTooltip
                                id={id}
                            >
                                <AdmeInfo
                                    rawValues={[rxn_product_yield]}
                                    status={colorFound.status}
                                    reference={reference} />
                            </CustomTooltip>
                        </div>
                    );
                }

            }
        },
        {
            dataField: 'analyse',
            title: 'Analyse',
            width: 80,
            allowHeaderFiltering: false,
            allowSorting: false,

            customRender: (data: any) => {
                if (data.reaction_data) {
                    /* const imgPath = basename(data.reaction_data.rxn_product_nmr);
                       const pdfPath = basename(data.reaction_data.rxn_product_lcms); */
                    const imgPath = '1001_nmr_image_3.png';
                    const pdfPath = '1001_lcms_report_3.pdf';
                    return (
                        <div className={`flex flex-col items-center 
                        justify-center text-themeBlueColor`}>
                            <div className="flex items-center">
                                <a href={`/images/${imgPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center">
                                    <span className="font-lato text-sm font-normal mr-2">NMR</span>
                                    <Image
                                        src={"/icons/new-tab-icon.svg"}
                                        alt="link tab"
                                        width={14}
                                        height={15}
                                    />
                                </a>
                            </div>
                            <div className="flex items-center">
                                <a href={`/data/${pdfPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center">
                                    <span className="font-lato text-sm font-normal mr-2">MS</span>
                                    <Image
                                        src={"/icons/new-tab-icon.svg"}
                                        alt="link tab"
                                        width={14}
                                        height={15}
                                    />
                                </a>
                            </div>
                        </div>)
                }
                return '';
            }
        },
        {
            dataField: 'Caco2_Papp',
            title: 'Caco-2(cm/sec)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'Caco2_Papp';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toExponential(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'CLint_Human',
            title: 'CLint Human(μL/min/mg)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'CLint_Human';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return ''
                }
                return '';
            }
        },
        {
            dataField: 'CLint_Rat',
            title: 'CLint Rat(μL/min/mg)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,
            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'CLint_Rat';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'CLint_Mouse',
            title: 'CLint Mouse(μL/min/mg)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'CLint_Mouse';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'Fub_Human',
            title: 'Fub Human(%)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'Fub_Human';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'Fub_Rat',
            title: 'Fub Rat(%)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'Fub_Rat';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'Fub_Mouse',
            title: 'Fub Mouse(%)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'Fub_Mouse';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'HepG2_IC50',
            title: 'HepG2 IC50(μM)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'HepG2_IC50';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'hERG_Ki',
            title: 'hERG Ki(μM)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'hERG_Ki';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        },
        {
            dataField: 'solubility',
            title: 'Solubility(μM)',
            width: 80,
            cssClass: 'moleculeStatus',
            allowHeaderFiltering: false,
            allowSorting: true,

            customRender: (data: any) => {
                if (data.adme_data) {
                    const key = 'Solubility';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = COLOR_SCHEME[key].color.find((color: any) =>
                            calculatedResult >= color.min && calculatedResult < color.max)
                        const id = `${key}-${data.molecule_id}`
                        return (
                            <div className={`${colorFound?.className} status-mark`}>
                                <span id={id}>{average.toFixed(2)}</span>
                                <CustomTooltip
                                    id={id}
                                >
                                    <AdmeInfo
                                        rawValues={[value1, value2]}
                                        status={colorFound.status}
                                        reference={reference} />
                                </CustomTooltip>
                            </div>
                        );
                    }
                    return '';
                }
                return '';
            }
        }
    ];

    const fetchMoleculeData = async () => {
        const params = {
            library_id: 214,
            sample_molecule_id: randomValue(sample_molecule_ids)
        }
        const list = await getMoleculeData(params);
        // Set selected rows after filtering out disabled rows
        // setSelectedRowKeys(filteredSelectedRows);
        setData(list);
        const filteredSelectedRows = list.filter(
            (row: any) => !row.disabled
        );

        setEnabledData(filteredSelectedRows);
        setLoading(false);  // Data is loaded
        setError('Error fetching data');
    }

    useEffect(() => {
        fetchMoleculeData();
    }, []);

    /* const [checkBoxValue, setCheckBoxValue] = useState(null);
 
    const onValueChanged = useCallback((args: CheckBoxTypes.ValueChangedEvent) => {
        setCheckBoxValue(args.value);
    }, []); */

    if (loading) {
        return <div>Loading...</div>;  // Show a loading message while fetching data
    }

    if (error) {
        return <div>{error}</div>;  // Display error message if fetching fails
    }

    return (
        <div>
            <h1>My DataGrid</h1>
            <DataGrid
                dataSource={data}
                selectedRowKeys={selectedRowKeys}
                onSelectionChanged={onSelectionChanged}
                onCellPrepared={onCellPrepared}
                className="molecule-dg"
            // Passing the columns configuration as a prop
            >
                <Selection mode="multiple" showCheckBoxesMode="always" />
                <Paging defaultPageSize={5} />

                {/* Custom Select All Checkbox Header */}
                <Column
                    dataField="id"
                    caption="Select All"
                    width={60}
                    cellRender={() => null} // Empty cell renderer for this column
                    allowSorting={false}
                    headerCellRender={() => (
                        <>
                            <CheckBox
                                /* enableThreeStateBehavior={true} */
                                value={isHeaderCheckboxChecked}
                                onValueChanged={handleSelectAll}
                            />
                        </>
                    )}
                    alignment="center"
                />

                {/* Render dynamic columns */}
                {columns.map((col: any) => {
                    return (<Column
                        key={col.dataField}
                        dataField={col.dataField}
                        caption={col.caption}
                        width={col.width} />
                    )
                })}
            </DataGrid>
        </div>
    );
}

