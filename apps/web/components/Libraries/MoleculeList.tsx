/*eslint max-len: ["error", { "code": 100 }]*/
'use client';
import { useCallback, useContext, useEffect, useState, useRef, useMemo } from 'react';
import Image from "next/image";
import toast from "react-hot-toast";
import DeleteConfirmation from "@/ui/DeleteConfirmation";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import ExcelJS from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { AppContext } from "../../app/AppState";
import {
    CellData,
    ColumnConfig,
    FetchUserType,
    LibraryFields,
    MoleculeStatusCode,
    MoleculeType,
    NodeType,
    ProjectDataFields,
    Status,
    UserData,
    addToFavoritesProps
} from '@/lib/definition';
import {
    addToFavorites,
    addMoleculeToCart,
    getMoleculeData,
    deleteMolecule
} from './service';
import {
    COLOR_SCHEME,
    DELAY,
    PATHWAY_BOX_WIDTH,
    moleculeStatus,
    sample_molecule_ids
} from "@/utils/constants";
import {
    getStatusObject,
    randomValue,
    getADMECalculation,
    getAverage,
    getADMEColor,
    delay,
    isCustomReactionCheck,
    createAssayColumns,
    setPath,
    popupPositionValue,
} from "@/utils/helpers";
import { Popup, Tooltip } from 'devextreme-react';
import AddMolecule from '../Molecule/AddMolecule/AddMolecule';
import AddMoleculeCriteria from '../Tooltips/AddMoleculeCriteria';
import EditMolecule from '../Molecule/EditMolecule/EditMolecule';
import { Messages } from '@/utils/message';
import CustomDataGrid from '@/ui/dataGrid';
import MoleculeStructureActions from '@/ui/MoleculeStructureActions';
import StatusCard from '@/ui/StatusCard';
import dynamic from 'next/dynamic';
/* import { basename } from 'path'; */
import './MoleculeList.css';
import CustomTooltip from '@/ui/CustomTooltip';
import AdmeInfo from '../Tooltips/AdmeInfo';
import AddCustomReaction from '../Molecule/AddCustomReaction/AddCustomReaction';
import CopyDialog from '../Molecule/CopyTo/CopyDialog';
import saveAs from 'file-saver';
import { DataGridTypes } from 'devextreme-react/cjs/data-grid';
import { RowClickEvent } from 'devextreme/ui/data_grid';
import PathwayAction from '../PathwayImage/PathwayAction';
import PathwayImage from '../PathwayImage/PathwayImage';

type MoleculeListType = {
    /* moleculeLoader: boolean, */
    expanded: boolean,
    tableData: MoleculeType[],
    userData: UserData,
    /* setMoleculeLoader: (value: boolean) => void, */
    setTableData: (value: MoleculeType[]) => void,
    selectedLibraryId: number,
    selectedLibraryName: string,
    projectData: ProjectDataFields,
    projectId: string,
    organizationId: string,
    fetchLibraries: FetchUserType,
    editEnabled: boolean,
    projectPermission: boolean,
}

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

export default function MoleculeList({
    expanded,
    userData,
    selectedLibraryId,
    projectId,
    selectedLibraryName,
    organizationId,
    fetchLibraries,
    editEnabled,
    projectData,
    projectPermission,
}: MoleculeListType) {
    const context: any = useContext(AppContext);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const appContext = context.state;
    const cartEnabled = editEnabled;
    const [editMolecules, setEditMolecules] = useState<any[]>([]);
    const [viewAddMolecule, setViewAddMolecule] = useState(false);
    const [viewEditMolecule, setViewEditMolecule] = useState(false);
    const [selectedRowsData, setSelectedRowsData] = useState([])
    const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs
    const [tableData, setTableData] = useState<MoleculeType[]>([]);
    const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(true);
    const [reloadMolecules, setReloadMolecules] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [viewImage, setViewImage] = useState(false);
    const [pathwayWidth] = useState<number>(PATHWAY_BOX_WIDTH);
    const [cellData, setCellData] = useState<CellData>({
        smiles_string: "",
        source_molecule_name: ''
    });
    const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);
    const [moleculeLoader, setMoleculeLoader] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [loader, setLoader] = useState(false);
    const [deleteMoleculeId, setDeleteMolecules] = useState({ id: 0, name: '', favorite_id: 0 });
    const [selectionEnabledRows, setSelectionEnabledRows] = useState<MoleculeType[]>([]);
    const [loadingCartEnabled, setLoadingCartEnabled] = useState(false);
    const [assays, setAssays] = useState<Map<number, object[]>>();
    const [groupingEnabled, setGroupingEnabled] = useState<boolean>(false);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [selectedRow, setSelectRow] = useState(-1);
    const [nodeValue, setNodes] = useState<NodeType[][]>([]);
    const [clickedMolecule, setClickedMolecule] = useState(-1);
    const [pathwayView, setPathwayView] = useState(false);
    const [popupWidth, setPopupWidth] = useState(PATHWAY_BOX_WIDTH);
    const [synthesisPopupPos, setSynthesisPopupPosition] = useState<any>({});

    const groupOptions = [
        { id: 'molecule', category: "Molecule" },
        { id: 'library', category: "Library" }
    ];

    // const [selectedValue, setSelectedValue] = useState(groupOptions[0]);

    const dropdownButtons = useMemo(() => [
        {
            key: 'molecules',
            text: "Group By:",
            options: groupOptions,
        },], [])

    const rowGroupName = () => groupOptions[0].id;

    const [copyDialog, setCopyDialog] = useState(false);

    const closeMagnifyPopup = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setPopupVisible(false);
            setButtonClicked(false);
        }
    };

    const handleStructureZoom = (event: any, data: any) => {
        if (isCustomReaction) {
            setPath({
                rowData: data, myRoles: userData.myRoles, setNodes,
                setPathwayView: setPopupVisible
            });
            setClickedMolecule(data.molecule_id);
            if (!data.disabled) {
                setSelectRow(event.rowIndex);
            }
        } else {
            setCellData(data);
        }
        const { x, y } = event.event.target.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        setPopupCords({
            x, y: y >= screenHeight / 2 ?
                y - Number(`${isCustomReaction ? 350 : 125}`) : y
        });
        if (!isCustomReaction) {
            setPopupVisible(true);
        }
    }

    const isCustomReaction = isCustomReactionCheck(projectData.metadata);

    const columns: ColumnConfig[] = [
        {
            dataField: "favorite",
            type: "bookmark",
            width: 90,
            allowSorting: false,
            alignment: 'center',
            headerCellRenderer: () => <Image src="/icons/star.svg" width={24}
                height={24} alt="Bookmark" />,
            headerFilter: {
                dataSource: [
                    { value: true, text: 'Favorites' },
                    { value: false, text: 'Non-Favorites' },
                ],
            },
            editingEnabled: true,
            customRender: (data) => {
                return (
                    <span className={`flex
                                    justify-center
                                    cursor-pointer`}>
                        <Image
                            src={data.favorite ?
                                "/icons/star-filled.svg" :
                                "/icons/star.svg"
                            }
                            width={24}
                            height={24}
                            alt="favorite"
                        />
                    </span>
                );
            }
        },
        {
            dataField: 'smiles_string',
            title: isCustomReaction ? 'Product' : 'Structure',
            minWidth: 180,
            width: 180,
            allowSorting: false,
            allowHeaderFiltering: false,
            alignment: 'center',
            customRender: (data) => (
                <MoleculeStructureActions
                    smilesString={data.smiles_string}
                    structureName={data.source_molecule_name}
                    molecule_id={data.id}
                    onZoomClick={(e: any) => {
                        e.event.stopPropagation();
                        setButtonClicked(true);
                        handleStructureZoom(e, data);
                    }}
                    enableEdit={data.status === MoleculeStatusCode.New && editEnabled
                        && !isCustomReaction}
                    enableDelete={data.status === MoleculeStatusCode.New &&
                        editEnabled}
                    onEditClick={() => showEditMolecule(data)}
                    onDeleteClick={() => deleteMoleculeCart(data)}
                />
            ),
        },
        {
            dataField: 'molecule_id',
            title: 'Molecule ID',
            allowHeaderFiltering: false,
            alignment: "center",
            width: 140,
            defaultSortOrder: "desc",
            allowSorting: true,
            customRender: (data) => {
                return isCustomReaction ? (
                    <button
                        className="text-themeBlueColor underline"
                    >
                        {data.molecule_id}
                    </button>
                ) : (
                    <p>{data.molecule_id}</p>
                );
            }
        },
        {
            dataField: 'source_molecule_name',
            title: isCustomReaction ? 'Name' : 'Molecule Name',
            width: 140,
            allowHeaderFiltering: false,
            alignment: "center"
        },
        {
            dataField: 'molecular_weight',
            title: isCustomReaction ? 'Product MW' : 'Molecule Weight',
            width: 140,
            alignment: "center",
            allowHeaderFiltering: false,
            cssClass: 'moleculeStatus',
            customRender: (data) => {
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
                        <span className={`${colorFound?.className} status-mark`}>
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
            visible: !expanded,
            customRender: (data) => {
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
                    data['yield'] = rxn_product_yield;
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
            visible: !expanded,
            customRender: (data) => {
                if (data.reaction_data) {
                    /* const imgPath = basename(data.reaction_data.rxn_product_nmr);
                       const pdfPath = basename(data.reaction_data.rxn_product_lcms); */
                    const imgPath = '1001_nmr_image_3.png';
                    const pdfPath = '1001_lcms_report_3.pdf';
                    return (
                        <div className={`flex flex-col items-center
                        justify-center text-themeBlueColor gap-[8px]`}>
                            <div className="flex items-center">
                                <span
                                    className="font-lato text-sm font-normal mr-2 cursor-pointer"
                                    onClick={() => {
                                        setEditMolecules([data])
                                        setViewImage(true)
                                    }}>NMR</span>
                                <a href={`/images/${imgPath}`}
                                    target="_blank"
                                    download
                                    rel="noopener noreferrer"
                                    className="flex items-center">
                                    <Image
                                        src={"/icons/download.svg"}
                                        alt="link tab"
                                        width={20}
                                        height={20}
                                    />
                                </a>
                            </div>
                            <div className="flex items-center">
                                <a href={`/data/${pdfPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <span className="font-lato text-sm font-normal mr-2">MS</span>
                                </a>
                                <a href={`/data/${pdfPath}`}
                                    target="_blank"
                                    download
                                    rel="noopener noreferrer"
                                    className="flex items-center">
                                    <Image
                                        src={"/icons/download.svg"}
                                        alt="link tab"
                                        width={20}
                                        height={20}
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Caco2_Papp';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["Caco2_Papp"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'CLint_Human';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference;
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["CLint_Human"] = average.toExponential(2);
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
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'CLint_Rat';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["CLint_Rat"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'CLint_Mouse';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["CLint_Mouse"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Fub_Human';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["Fub_Human"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Fub_Rat';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["Fub_Rat"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Fub_Mouse';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["Fub_Mouse"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'HepG2_IC50';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["HepG2_IC50"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'hERG_Ki';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound = getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["hERG_Ki"] = average.toExponential(2);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Solubility';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMECalculation(average, key);
                        const reference = COLOR_SCHEME[key].reference
                        const colorFound =
                            getADMEColor(calculatedResult, key);
                        const id = `${key}-${data.molecule_id}`
                        data["solubility"] = average.toExponential(2);
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

    const [moleculeColumns, setMoleculeColumns] = useState(columns);

    const fetchMoleculeData = async (library_id?: number, project_id?: string) => {
        setMoleculeLoader(true);
        try {
            let params = {};
            if (library_id) {
                params = {
                    library_id,
                    sample_molecule_id: randomValue(sample_molecule_ids)
                };
                setGroupingEnabled(false);
            } else {
                params = {
                    project_id,
                    sample_molecule_id: randomValue(sample_molecule_ids)
                };
                const { other_container } = projectData;
                if (other_container?.length) {
                    setGroupingEnabled(other_container?.length > 1);
                } else {
                    setGroupingEnabled(true);
                }
            };

            const moleculeData = await getMoleculeData(params);
            const selectionEnabledRows = moleculeData.filter(
                (row: MoleculeType) => !row.disabled);

            setSelectionEnabledRows(selectionEnabledRows);
            setTableData(moleculeData);
            const columnConfigs = createAssayColumns(moleculeData);
            const newColumns = [...columns, ...columnConfigs];
            setMoleculeColumns(newColumns);
            setMoleculeLoader(false);
        } catch (error: any) {
            const toastId = toast.error(error);
            await delay(DELAY);
            toast.remove(toastId);
        }
    };

    useEffect(() => {
        fetchMoleculeData(selectedLibraryId, projectId);
        setSynthesisPopupPosition(popupPositionValue());
    }, [selectedLibraryId]);


    /* const fetchCartData = async () => {
        // OPT: 5
        const params: object = {
            user_id: userData.id,
            library_id,
            project_id: projectData.id,
        }

        if (isAdmin(myRoles) || isLibraryManger(myRoles)) {
            const moleculeCart = library_id ? await getMoleculeCart(params) : [];
            const molecule_ids = moleculeCart?.length > 0 &&
                moleculeCart?.map((item: any) => item.molecule_id);
            setSelectedRows(molecule_ids)
            const inCartMolecule = moleculeCart?.length > 0 &&
                moleculeCart?.filter((item: any) => item?.molecule?.status !== 1)
                    .map((item: any) => item?.molecule_id);
            setCartMolecule(inCartMolecule);
        }

        const moleculeOrder: any = await getMoleculeOrder(params);
        const inOrderMolecule: number[] = [];
        const inOrderMoleculewithDone: number[] = [];
        moleculeOrder.forEach((order: any) => {
            if (order.status !== MoleculeStatusCode.New) {
                inOrderMolecule.push(order.molecule_id);
            }
            if (order.status !== MoleculeStatusCode.Done &&
                order.status !== MoleculeStatusCode.New) {
                inOrderMoleculewithDone.push(order.molecule_id);
            }
        });
        setDoneMolecule(inOrderMoleculewithDone);
        setOrderMolecule(inOrderMolecule)
    }; */

    /* useEffect(() => {
        fetchCartData();
    }, [library_id, userData.id, appContext]); */

    /* const onCellPrepared = (e: any) => {
        if (isMoleculeInCart.includes(e.key)) {
            e.cellElement.style.pointerEvents = 'none';
            e.cellElement.style.opacity = 0.5;
        }
        if (inDoneMolecules?.includes(e.key)) {
            e.cellElement.style.pointerEvents = 'none';
            e.cellElement.style.opacity = 0.5;
        }
    }; */

    const onRowClick = (e: RowClickEvent) => {
        if (e.rowType === 'data') {
            const rowData = e.data;
            if (!buttonClicked) {
                if (isCustomReaction) {
                    setPath({
                        rowData, myRoles: userData.myRoles, setNodes,
                        setPathwayView: setPathwayView
                    });
                    setSelectRow(e.rowIndex);
                }
            }
        }
    };

    const onExporting = (e: any) => {
        // Create a new workbook and worksheet.
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Molecule List');

        exportDataGrid({
            component: e.component,
            worksheet: worksheet,
            customizeCell: (options: any) => {
                if (options.gridCell?.rowType === 'data') {
                    //  format the "molecular_weight" column.
                    if (options.gridCell.column?.dataField === 'molecular_weight') {
                        options.excelCell.value = Number(options.gridCell.value).toFixed(2);
                    }
                }
                options.excelCell.font = { name: 'Arial', size: 12 };
                options.excelCell.alignment = { horizontal: 'left' };
            }
        }).then(() => {
            // if (e.selectedRowsOnly) {
            //     // Export in Excel
            // workbook.xlsx.writeBuffer().then((buffer) => {
            //     saveAs(
            //         new Blob([buffer], { type: "application/octet-stream" }),
            //         `MoleculeList_${selectedLibraryName}_${new Date().toISOString()}.xlsx`
            //     );
            // });
            // } else {
            //  export in CSV
            workbook.csv.writeBuffer().then((buffer) => {
                saveAs(
                    new Blob([buffer], { type: "application/octet-stream" }),
                    `MoleculeList_${selectedLibraryName}_${new Date()}.csv`
                );
            });
            // }
        });

        // Prevent the default export behavior.
        e.cancel = true;
    };

    const addToFavorite = (selectedRow: MoleculeType) => {
        const dataField: addToFavoritesProps = {
            molecule_id: selectedRow.id,
            user_id: userData.id,
            favorite_id: selectedRow.favorite_id,
            favorite: selectedRow.favorite
        };
        addToFavorites(dataField).then(() => { },
            async (error) => {
                const toastId = toast.error(error);
                await delay(DELAY);
                toast.remove(toastId);
            })
    }

    const onSelectionUpdated = (selectedRowsKeys: number[], selectedRowsData: object[]) => {
        setIsAddToCartEnabled(!selectedRowsKeys.length);
        setSelectedRows(selectedRowsKeys);
        setSelectedRowsData(selectedRowsData as []);
    }

    /* const onSelectionChanged = async (e: any) => {
        setIsAddToCartEnabled(!e.selectedRowKeys.length);
    
        const totalOrderedMolecules = [...inOrderMolecules, ...isMoleculeInCart];
        let updatedselectedRowsData: any = [];
        let updateSelectedRowKeys: number[] = [];
        e.selectedRowKeys.forEach(
            (value: number, index: number) => {
                if (!totalOrderedMolecules.includes(value)) {
                    updateSelectedRowKeys = [
                        ...updateSelectedRowKeys, value
                    ];
                    updatedselectedRowsData = [
                        ...updatedselectedRowsData,
                        e.selectedRowsData[index]
                    ];
                }
            });
    
        setSelectedRows(updateSelectedRowKeys);
        setSelectedRowsData(updatedselectedRowsData)
        const selectedLibraryMolecule = updatedselectedRowsData.map((item: MoleculeType) => {
            return {
                ...item,
                molecule_id: item.id,
                user_id: userData.id,
            }
        });
        // OPT: 6
        const updatedMoleculeCart = selectedLibraryMolecule.filter((item: CartDetail) =>
            !totalOrderedMolecules.includes(item.molecule_id));
        setMoleculeData(updatedMoleculeCart);
        // If the check box is unchecked
    }; */

    const showEditMolecule = useCallback((data?: MoleculeType) => {
        const moleculesToEdit = data ? [data] : selectedRowsData;
        setEditMolecules(moleculesToEdit)
        /* setEditMolecules(moleculesToEdit.filter(
            (d: any) => !isMoleculeInCart.includes(d.id))); */
        setViewEditMolecule(true);
    }, [selectedRowsData]);

    const deleteMoleculeCart = (data?: MoleculeType) => {
        setConfirm(true)
        if (data?.status === MoleculeStatusCode.New) {
            setDeleteMolecules(
                {
                    id: data.id,
                    name: data.source_molecule_name,
                    favorite_id: data.favorite_id
                })
            setConfirm(true)
        }
    }

    const onRowPrepared = (e: DataGridTypes.RowPreparedEvent) => {
        if (e.rowType === 'data') {
            e.rowElement.style.height = "90px";
            if (e.rowType === 'data' && isCustomReaction) {
                e.rowElement.style.cursor = 'pointer';
                if (selectedRow === e.rowIndex)
                    e.rowElement.style.backgroundColor = 'var(--rowHoverColor)';
            }
        }
    }

    const handleDeleteMolecule = async () => {
        setLoader(true);
        const result =
            await deleteMolecule(deleteMoleculeId.id, deleteMoleculeId.favorite_id);
        if (result) {
            toast.success(Messages.deleteMoleculeMsg(deleteMoleculeId.name));
            setDeleteMolecules({ id: 0, name: '', favorite_id: 0 });
            callLibraryId()
            setLoader(false);
        }
    }

    const handleCancel = () => {
        setConfirm(false)
    }

    const setAssayFieldValue = (data: LibraryFields) => {
        const inherits = data?.inherits_bioassays ?? true;
        let metaData = data?.metadata?.assay
        if (inherits) {
            if (projectData?.metadata?.assay) {
                metaData = projectData?.metadata?.assay
            }
            else {
                metaData = projectData?.container?.metadata?.assay
            }
        }
        return metaData || [];
    }

    const fetchAssays = () => {
        const libraries = projectData.other_container;
        const tempAssay = new Map<number, object[]>();
        if (libraries?.length) {
            libraries.forEach(library => {
                const data = setAssayFieldValue(library);
                tempAssay.set(library.id, data);
            });
        }
        setAssays(tempAssay);
    }

    const addProductToCart = async () => {
        setLoadingCartEnabled(true);
        const moleculeData = selectedRowsData.map((row: MoleculeType) => ({
            molecule_id: row.molecule_id,
            library_id: row.library_id,
            organization_id: row.organization_id,
            project_id: row.project_id,
            user_id: userData.id,
            assays: assays?.get(row.library_id),
        }));

        const response = await addMoleculeToCart(moleculeData, MoleculeStatusCode.NewInCart);
        if (!response.error) {
            context?.addToState({
                ...appContext,
                cartDetail: [...moleculeData]
            });
            setLoadingCartEnabled(false);
            toast.success(Messages.addMoleculeCartMessage(response.count));
            setReloadMolecules(true);
            setIsAddToCartEnabled(true)
        } else {
            const toastId = toast.error(response.error);
            await delay(DELAY);
            toast.remove(toastId);
            setLoadingCartEnabled(false);
        }
    }

    const copyTo = () => {
        setCopyDialog(true)
    }

    useEffect(() => {
        if (reloadMolecules) {
            (async () => {
                setEditMolecules([]);
                setSelectedRowsData([]);
                setSelectedRows([]);

                await fetchMoleculeData(selectedLibraryId, projectId);

                setReloadMolecules(false);
            })();
        }
    }, [reloadMolecules])

    useEffect(() => {
        setReloadMolecules(true)
    }, [appContext?.refreshCart]);

    useEffect(() => {
        fetchAssays();
    }, [projectData.other_container?.length, appContext?.refreshAssayTable]);

    useEffect(() => {
        setPopupVisible(false);
    }, [expanded]);

    const callLibraryId = async () => {
        setReloadMolecules(true);
        fetchLibraries()
    }

    const addMolecule = () => {
        setViewAddMolecule(true)
    }

    const toolbarButtons = [
        {
            text: "Add Molecule",
            onClick: addMolecule,
            icon: '/icons/plus-white.svg',
            visible: editEnabled && !!selectedLibraryId && !isCustomReaction,
            class: 'btn-primary toolbar-item-spacing',
        },
        {
            text: "Add Reaction",
            onClick: addMolecule,
            icon: '/icons/plus-white.svg',
            visible: editEnabled && !!selectedLibraryId && isCustomReaction,
            class: 'btn-primary toolbar-item-spacing',
        },
        {
            text: `Copy To`,
            onClick: copyTo,
            class: !selectedRows.length
                ? 'btn-disable toolbar-item-spacing'
                : 'btn-secondary toolbar-item-spacing',
            disabled: !selectedRows.length,
            visible: editEnabled,
        },
        {
            text: `Edit (${selectedRows.length})`,
            onClick: showEditMolecule,
            class: !selectedRows.length
                ? 'btn-disable toolbar-item-spacing' : 'btn-secondary toolbar-item-spacing',
            disabled: !selectedRows.length,
            visible: editEnabled && !!selectedLibraryId && !isCustomReaction
        },
        {
            text: `Add to Cart (${selectedRows.length})`,
            onClick: addProductToCart,
            class: isAddToCartEnabled
                ? 'btn-disable' : 'btn-secondary',
            disabled: isAddToCartEnabled,
            visible: cartEnabled,
            loader: loadingCartEnabled
        }
    ];

    const renderTitleField = () => {
        return (
            <div className="flex items-center relative">
                <div className="flex items-center">
                    <p className='form-title mr-2 ml-[15px]'>  {isCustomReaction
                        ? 'Add Custom Reaction'
                        : 'Add Molecule'}</p>
                    <div id="info-container">
                        <Image
                            src="/icons/info-icon.svg"
                            alt="info"
                            width={14}
                            height={15}
                            priority
                            className="cursor-pointer"
                            id="info-Add-Molecule"
                        />
                        <Tooltip
                            target="#info-Add-Molecule"
                            showEvent="mouseenter"
                            hideEvent="mouseleave"
                            position="bottom"
                            hideOnOutsideClick={false}
                        >
                            {isCustomReaction
                                ? <div>Add Custom reaction</div>
                                : <AddMoleculeCriteria />}
                        </Tooltip>
                    </div>
                </div>
                <div className="close-button">
                    <button
                        className="dx-closebutton"
                        onClick={() => {
                            setViewAddMolecule(false)
                        }}
                        style={{ position: "absolute", top: "10px", right: "10px" }}
                    >
                        <span className="dx-icon dx-icon-close" />
                    </button>
                </div>
            </div>
        );
    };

    const onRowUpdated = (e: DataGridTypes.RowUpdatingEvent) => {
        if (e.newData.favorite !== undefined) {
            addToFavorite({
                ...e.oldData,
                favorite: e.newData.favorite
            })
        }
    };

    const handleResize = (e: any) => {
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }

        resizeTimeoutRef.current = setTimeout(() => {
            if (e.component.option("width") >= PATHWAY_BOX_WIDTH)
                setPopupWidth(e.component.option("width"));
            else setPopupWidth(PATHWAY_BOX_WIDTH);
        }, 500);
    };

    const [gridHeight, setGridHeight] = useState(typeof window !== 'undefined' ?
        window.innerHeight - 100 : 'auto');

    const adjustGridHeight = () => {
        const newHeight = window.innerHeight; // Subtract any offset if needed
        setGridHeight(newHeight);
    };

    useEffect(() => {
        // Adjust height when the window is resized
        window.addEventListener('resize', adjustGridHeight);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', adjustGridHeight);
        };
    }, []);

    return (
        <>
            {confirm && (
                <DeleteConfirmation
                    onSave={() => handleDeleteMolecule()}
                    openConfirmation={confirm}
                    isLoader={loader}
                    setConfirm={() => handleCancel()}
                    msg={Messages.DELETE_MOLECULE}
                    title={Messages.DELETE_MOLECULE_TITLE}
                />
            )}
            {moleculeLoader ?
                <div className="center">
                    <LoadIndicator
                        visible={moleculeLoader}
                    />
                </div> :
                <div className={
                    `pb-[10px] w-[100%]`}
                    onClick={closeMagnifyPopup}>
                    <CustomDataGrid
                        columns={moleculeColumns}
                        data={tableData}
                        height={gridHeight}
                        enableRowSelection
                        enableGrouping={groupingEnabled}
                        enableSorting
                        enableFiltering={false}
                        enableOptions={false}
                        enableExport={true}
                        enableColumnChooser={true}
                        toolbarButtons={toolbarButtons}
                        loader={moleculeLoader}
                        enableHeaderFiltering
                        enableSearchOption={!expanded}
                        cssClass={`${'molecule-list' + (groupingEnabled ? ' group' : ' no-group')}`}
                        onSelectionUpdated={onSelectionUpdated}
                        selectionEnabledRows={selectionEnabledRows}
                        onExporting={onExporting}
                        showFooter={true}
                        groupingColumn={groupingEnabled ? rowGroupName() : undefined}
                        dropdownButtons={dropdownButtons}
                        onRowUpdated={onRowUpdated}
                        onRowPrepared={onRowPrepared}
                        onRowClick={onRowClick}
                    />
                    {viewAddMolecule && <Popup
                        titleRender={renderTitleField}
                        visible={viewAddMolecule}
                        contentRender={() => (
                            isCustomReaction ?
                                <AddCustomReaction
                                    libraryId={selectedLibraryId}
                                    projectId={projectId}
                                    organizationId={organizationId}
                                    userData={userData}
                                    setViewAddMolecule={setViewAddMolecule}
                                    callLibraryId={callLibraryId}
                                /> :
                                <AddMolecule
                                    libraryId={selectedLibraryId}
                                    projectId={projectId}
                                    organizationId={organizationId}
                                    userData={userData}
                                    setViewAddMolecule={setViewAddMolecule}
                                    callLibraryId={callLibraryId}
                                />
                        )}
                        resizeEnabled={true}
                        hideOnOutsideClick={false}
                        defaultWidth={710}
                        minWidth={710}
                        defaultHeight={'100%'}
                        minHeight={'100%'}
                        position={{
                            my: { x: 'right', y: 'top' },
                            at: { x: 'right', y: 'top' },
                        }}
                        onHiding={() => {
                            setViewAddMolecule(false)
                        }}
                        dragEnabled={false}
                        showCloseButton={true}
                        wrapperAttr={
                            {
                                class: "create-popup mr-[15px]"
                            }
                        } />
                    }
                    {viewEditMolecule && <Popup
                        title="Edit Molecule"
                        visible={viewEditMolecule}
                        contentRender={() => (
                            <EditMolecule
                                editMolecules={editMolecules}
                                libraryId={selectedLibraryId}
                                projectId={projectId}
                                organizationId={organizationId}
                                userData={userData}
                                setViewEditMolecule={setViewEditMolecule}
                                callLibraryId={callLibraryId} />
                        )}
                        resizeEnabled={true}
                        hideOnOutsideClick={false}
                        defaultWidth=
                        {editMolecules.length > 1
                            ? 896 : 710}
                        minWidth={editMolecules.length > 1
                            ? 896 : 710}
                        minHeight={'100%'}
                        defaultHeight={'100%'}
                        position={{
                            my: { x: 'right', y: 'top' },
                            at: { x: 'right', y: 'top' },
                        }}
                        onHiding={() => {
                            setViewEditMolecule(false)
                        }}
                        dragEnabled={false}
                        showCloseButton={true}
                        wrapperAttr={
                            {
                                class: "create-popup mr-[15px]"
                            }
                        } />
                    }
                    {pathwayView &&
                        <Popup
                            title='Custom Reaction'
                            visible={pathwayView}
                            contentRender={() => (
                                <div>
                                    {nodeValue?.length > 0 && (
                                        <div style={{
                                        }}>{
                                                // nodeValue.map((node, idx) => {
                                                // return (
                                                <div key={`node-${0}`}
                                                    className="mt-[10px] mb-[10px]">
                                                    <PathwayImage
                                                        pathwayId={`node-${0}`}
                                                        nodes={nodeValue[0]}
                                                        updatedAt={Date.now()}
                                                        key={`node-${0}`}
                                                        style={{
                                                            position: 'relative',
                                                            background: "#fff"
                                                        }}
                                                        width={pathwayWidth}
                                                        height={300}
                                                        currentReaction={0}
                                                    >
                                                        <PathwayAction
                                                            pathwayId={`node-${0}`} />
                                                    </PathwayImage>
                                                </div>
                                                // )
                                                // })
                                            }
                                        </div>
                                    )
                                    }
                                </div>
                            )}
                            hideOnOutsideClick={false}
                            defaultWidth={popupWidth}
                            minWidth={PATHWAY_BOX_WIDTH}
                            dragEnabled={false}
                            resizeEnabled={true}
                            onResize={handleResize}
                            height="100%"
                            minHeight={'100%'}
                            position={synthesisPopupPos}
                            onHiding={() => {
                                context?.addToState({
                                    ...appContext,
                                    pathwayReaction: {}
                                })
                                setPathwayView(false);
                                setSelectRow(-1);
                                if (typeof window !== "undefined") {
                                    localStorage.setItem('pathway_box_width',
                                        JSON.stringify(popupWidth));
                                }
                            }}
                            showCloseButton={true}
                            wrapperAttr={
                                {
                                    class: "pathway-popup"
                                }
                            }
                        />
                    }
                    {viewImage && (
                        <Popup
                            title={editMolecules[0]?.source_molecule_name
                                ? `${editMolecules[0]?.source_molecule_name} Analysis`
                                : `Analysis`}
                            visible={viewImage}
                            contentRender={() => (
                                <>
                                    <div className="flex flex-col items-center
                                        justify-center w-full h-full">
                                        <div className="flex justify-end w-full">
                                            <button
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = '/images/1001_nmr_image_3.png';
                                                    link.download = '1001_nmr_image_3.png';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                className="primary-button"
                                            >
                                                Download
                                            </button>
                                        </div>
                                        <div className="relative w-full h-full">
                                            <Image
                                                src="/images/1001_nmr_image_3.png"
                                                alt="Viewed Image"
                                                layout="fill"
                                                objectFit="contain"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            resizeEnabled={true}
                            hideOnOutsideClick={false}
                            defaultWidth={870}
                            minWidth={870}
                            minHeight={'100%'}
                            defaultHeight={'100%'}
                            position={{
                                my: { x: 'right', y: 'top' },
                                at: { x: 'right', y: 'top' },
                            }}
                            onHiding={() => {
                                setViewImage(false);
                            }}
                            dragEnabled={false}
                            showCloseButton={true}
                            wrapperAttr={{
                                class: "create-popup mr-[15px]"
                            }}
                        />
                    )}
                </div>
            }
            {popupVisible && (
                <div
                    ref={popupRef}
                    style={{
                        top: `${isCustomReaction && expanded ?
                            `${popupCords.y}px` : `${popupCords.y}px`}`,
                        left: `${isCustomReaction && expanded ? `${popupCords.x - 750}px`
                            : `${popupCords.x + 225}px`}`,
                    }}
                    className={`fixed
                    ${isCustomReaction ? 'w-[835px] h-[350px]' :
                            'transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px]'}
                            bg-gray-100
                            bg-opacity-80
                            z-50
                            `}
                >
                    <div
                        className={`absolute
                        ${!isCustomReaction ? `top-1/2
                                left-1/2
                                transform -translate-x-1/2 -translate-y-1/2` : `
                                top-0
                                left-0
                                w-[100%] h-[100%]
                                `}`}
                    >
                        {isCustomReaction ? (
                            <div className="bg-themelightGreyColor relative p-[16px]">
                                <p>{`Molecule Id: ${clickedMolecule}`}</p>
                                <PathwayImage
                                    pathwayId={`node-${0}`}
                                    nodes={nodeValue[0]}
                                    updatedAt={Date.now()}
                                    key={`node-${0}`}
                                    style={{
                                        position: 'relative',
                                        background: "#fff"
                                    }}
                                    width={pathwayWidth}
                                    height={300}
                                    currentReaction={0}
                                >
                                    <PathwayAction
                                        pathwayId={`node-${0}`} />
                                </PathwayImage>
                            </div>
                        ) :
                            <MoleculeStructure
                                structure={cellData?.smiles_string}
                                width={200}
                                height={200}
                                svgMode={true}
                                structureName=
                                {cellData.source_molecule_name}
                            />}
                    </div>
                </div>
            )}
            {copyDialog && <Popup
                visible={copyDialog}
                contentRender={() => (
                    <CopyDialog
                        selectedMolecules={selectedRowsData}
                        setCopyDialog={setCopyDialog}
                        user_id={userData.id}
                        callLibraryId={callLibraryId}
                        myRoles={userData.myRoles}
                        currentLibraryId={selectedLibraryId}
                        organizationId={organizationId}
                        projectId={projectId}
                        projectPermission={projectPermission}
                    />
                )}
                resizeEnabled={false}
                hideOnOutsideClick={false}
                onHiding={() => {
                    setCopyDialog(false)
                }}
                dragEnabled={false}
                showCloseButton={true}
                showTitle={false}
                width={556}
                height={527}
            />}
        </>
    )
}