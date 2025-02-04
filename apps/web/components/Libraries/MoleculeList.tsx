/*eslint max-len: ["error", { "code": 100 }]*/
'use client';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import Image from "next/image";
import toast from "react-hot-toast";
import DeleteConfirmation from "@/ui/DeleteConfirmation";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import { AppContext } from "../../app/AppState";
import {
    CellData,
    ColumnConfig,
    FetchUserType,
    MoleculeStatusCode,
    MoleculeType,
    ProjectDataFields,
    Status,
    UserData,
    addToFavouritesProps
} from '@/lib/definition';
import {
    addToFavourites,
    addMoleculeToCart,
    getMoleculeData,
    deleteMolecule
} from './service';
import {
    COLOR_SCHEME,
    DELAY,
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
    isCustomReactionCheck
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

type MoleculeListType = {
    /* moleculeLoader: boolean, */
    expanded: boolean,
    tableData: MoleculeType[],
    userData: UserData,
    /* setMoleculeLoader: (value: boolean) => void, */
    setTableData: (value: MoleculeType[]) => void,
    selectedLibrary: number,
    selectedLibraryName: string,
    library_id: number,
    projectData: ProjectDataFields,
    projectId: string,
    organizationId: string,
    fetchLibraries: FetchUserType,
    editEnabled: boolean,
}
const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

export default function MoleculeList({
    expanded,
    userData,
    selectedLibrary,
    library_id,
    projectId,
    selectedLibraryName,
    organizationId,
    fetchLibraries,
    editEnabled,
    projectData,
}: MoleculeListType) {
    const context: any = useContext(AppContext);
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
    const [viewImage, setViewImage] = useState(false)
    const [cellData, setCellData] = useState<CellData>({
        smiles_string: "",
        source_molecule_name: ''
    });
    const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);
    const [moleculeLoader, setMoleculeLoader] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [loader, setLoader] = useState(false);
    const [deleteMoleculeId, setDeleteMolecules] = useState({ id: 0, name: '', favourite_id: 0 });
    const [selectionEnabledRows, setSelectionEnabledRows] = useState<MoleculeType[]>([]);
    const [loadingCartEnabled, setLoadingCartEnabled] = useState(false);
    const closeMagnifyPopup = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setPopupVisible(false);
        }
    };
    const handleStructureZoom = (event: any, data: any) => {
        const { x, y } = event.event.target.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        setPopupCords({ x, y: y >= screenHeight / 2 ? y - 125 : y });
        setPopupVisible(true);
        setCellData(data);
    }

    const isCustomReaction = isCustomReactionCheck(projectData.metadata);
    const fetchMoleculeData = async (library_id?: number, project_id?: string) => {
        setMoleculeLoader(true);
        try {
            const params = library_id
                ? {
                    library_id,
                    sample_molecule_id: randomValue(sample_molecule_ids)
                }
                : {
                    project_id,
                    sample_molecule_id: randomValue(sample_molecule_ids)
                };
            const moleculeData = await getMoleculeData(params);
            const selectionEnabledRows = moleculeData.filter(
                (row: MoleculeType) => !row.disabled);

            setSelectionEnabledRows(selectionEnabledRows);
            // }
            setTableData(moleculeData);
            setMoleculeLoader(false);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchMoleculeData(library_id, projectId);
    }, [library_id]);

    const columns: ColumnConfig[] = [
        {
            dataField: "favourite",
            type: "bookmark",
            width: 60,
            allowSorting: false,
            headerCellRenderer: () => <Image src="/icons/star.svg" width={24}
                height={24} alt="Bookmark" />,
            headerFilter: {
                dataSource: [
                    { value: true, text: 'Favorites' },
                    { value: false, text: 'Non-Favorites' },
                ],
            },
            customRender: (data) => {
                return (
                    <span className={`flex
                                    justify-center
                                    cursor-pointer`}
                        onClick={() =>
                            addToFavourite(data)
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
                    onZoomClick={(e: any) => handleStructureZoom(e, data)}
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
            title: isCustomReaction ? 'Reaction ID' : 'Molecule ID',
            allowHeaderFiltering: false,
            alignment: "center",
            width: 140,
            defaultSortOrder: "desc",
            allowSorting: true,
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

    const onExporting = (e: any) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Molecule List');

        exportDataGrid({
            component: e.component,
            worksheet: worksheet,
            customizeCell: function (options) {
                /* const modifiedData = e.component.getDataSource().items().map((item: any) => {
                    // Modify each row data here
                    item.molecular_weight = Number(Number(item.molecular_weight).toFixed(2))
                    return item;
                });

                // Set the modified data for export
                e.component.getDataSource().items = () => modifiedData; */

                if (options.gridCell?.rowType === 'data') {
                    if (options?.gridCell?.column?.dataField === 'molecular_weight') {
                        options.excelCell.value = Number(options?.gridCell?.value).toFixed(2);
                    }
                }

                options.excelCell.font = { name: 'Arial', size: 12 };
                options.excelCell.alignment = { horizontal: 'left' };
            }
        }).then(function () {
            workbook.csv.writeBuffer().then(function (buffer: any) {
                saveAs(new Blob([buffer], { type: "application/octet-stream" }),
                    `MoleculeList_${selectedLibraryName}_${new Date()}.csv`);
            });

        });
    }

    const addToFavourite = (selectedRow: MoleculeType) => {

        const rows = tableData.map(item =>
            item.id === selectedRow.id ? { ...item, favourite: !item.favourite } : item
        );
        setTableData(rows);

        const dataField: addToFavouritesProps = {
            molecule_id: selectedRow.id,
            user_id: userData.id,
            favourite_id: selectedRow.favourite_id,
            favourite: !selectedRow.favourite
        };
        addToFavourites(dataField).then(() => { },
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
                    favourite_id: data.favourite_id
                })
            setConfirm(true)
        }
    }

    const handleDeleteMolecule = async () => {
        setLoader(true);
        const result =
            await deleteMolecule(deleteMoleculeId.id, deleteMoleculeId.favourite_id);
        if (result) {
            toast.success(Messages.deleteMoleculeMsg(deleteMoleculeId.name));
            setDeleteMolecules({ id: 0, name: '', favourite_id: 0 });
            setReloadMolecules(true);
            setLoader(false);
        }
    }

    const handleCancel = () => {
        setConfirm(false)
    }

    const addProductToCart = async () => {
        setLoadingCartEnabled(true);
        const moleculeData = selectedRowsData.map((row: MoleculeType) => ({
            molecule_id: row.molecule_id,
            library_id: row.library_id,
            organization_id: row.organization_id,
            project_id: row.project_id,
            user_id: userData.id
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

    useEffect(() => {
        if (reloadMolecules) {
            (async () => {
                setEditMolecules([]);
                setSelectedRowsData([]);
                setSelectedRows([]);

                await fetchMoleculeData(selectedLibrary, projectId);

                setReloadMolecules(false);
            })();
        }
    }, [reloadMolecules])

    useEffect(() => {
        setReloadMolecules(true)
    }, [appContext?.refreshCart])

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
            visible: editEnabled && !!library_id && !isCustomReaction,
            class: 'btn-primary toolbar-item-spacing',
        },
        {
            text: "Add Reaction",
            onClick: addMolecule,
            icon: '/icons/plus-white.svg',
            visible: editEnabled && !!library_id && isCustomReaction,
            class: 'btn-primary toolbar-item-spacing',
        },
        {
            text: `Edit (${selectedRows.length})`,
            onClick: showEditMolecule,
            class: !selectedRows.length
                ? 'btn-disable toolbar-item-spacing' : 'btn-secondary toolbar-item-spacing',
            disabled: !selectedRows.length,
            visible: editEnabled && !!library_id && !isCustomReaction
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
                        columns={columns}
                        data={tableData}
                        enableRowSelection
                        enableGrouping
                        enableSorting
                        enableFiltering={false}
                        enableOptions={false}
                        enableExport={true}
                        enableColumnChooser={true}
                        toolbarButtons={toolbarButtons}
                        loader={moleculeLoader}
                        enableHeaderFiltering
                        enableSearchOption={!expanded}
                        cssClass='molecule-list'
                        onSelectionUpdated={onSelectionUpdated}
                        selectionEnabledRows={selectionEnabledRows}
                        onExporting={onExporting}
                        showFooter={true}
                    />
                    {viewAddMolecule && <Popup
                        titleRender={renderTitleField}
                        visible={viewAddMolecule}
                        contentRender={() => (
                            isCustomReaction ? <AddCustomReaction /> : <AddMolecule
                                libraryId={selectedLibrary}
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
                                libraryId={selectedLibrary}
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
                        top: `${popupCords.y}px`,
                        left: `${popupCords.x + 225}px`,
                    }}
                    className="fixed
                            transform -translate-x-1/2 -translate-y-1/2
                            bg-gray-100
                            bg-opacity-80
                            z-50
                            w-[250px]
                            h-[250px]"
                >
                    <div
                        className="absolute
                                top-1/2
                                left-1/2
                                transform -translate-x-1/2 -translate-y-1/2"
                    >
                        <MoleculeStructure
                            structure={cellData?.smiles_string}
                            width={200}
                            height={200}
                            svgMode={true}
                            structureName=
                            {cellData.source_molecule_name}
                        />
                    </div>
                </div>
            )}
        </>
    )
}