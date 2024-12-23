/*eslint max-len: ["error", { "code": 100 }]*/
'use client';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import Image from "next/image";
import toast from "react-hot-toast";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import { AppContext } from "../../app/AppState";
import {
    CartDetail,
    CellData,
    ColumnConfig,
    MoleculeStatusCode,
    MoleculeType,
    ProjectDataFields,
    Status,
    UserData,
    addToFavouritesProps
} from '@/lib/definition';
import {
    addToFavourites,
    /* getLibraryById, */
    addMoleculeToCart,
    getMoleculeCart,
    getMoleculeOrder,
    getMoleculeData
} from './service';
import {
    COLOR_SCHEME, DELAY,
    moleculeStatus,
    sample_molecule_ids
} from "@/utils/constants";
import {
    delay, getStatusObject, randomValue,
    getADMEColorScheme,
    getAverage,
    isAdmin,
    isLibraryManger
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
import CustomTooltip from '@/ui/CustomTooltip';
import AdmeInfo from '../Tooltips/AdmeInfo';

type MoleculeListType = {
    /* moleculeLoader: boolean, */
    expanded: boolean,
    tableData: MoleculeType[],
    userData: UserData,
    /* setMoleculeLoader: (value: boolean) => void, */
    setTableData: (value: MoleculeType[]) => void,
    actionsEnabled: string[],
    selectedLibrary: number,
    library_id: number,
    projectData: ProjectDataFields,
    projectId: string,
    organizationId: string,
    fetchLibraries: () => void,
}
const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

export default function MoleculeList({
    /* moleculeLoader, */
    expanded,
    /* tableData, */
    userData,
    /* setMoleculeLoader, */
    /* setTableData, */
    actionsEnabled,
    selectedLibrary,
    library_id,
    projectData,
    projectId,
    organizationId,
    fetchLibraries
}: MoleculeListType) {
    const { myRoles } = userData;
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const cartEnabled = actionsEnabled.includes('create_molecule_order');
    const [editMolecules, setEditMolecules] = useState<any[]>([]);
    const [viewAddMolecule, setViewAddMolecule] = useState(false);
    const [viewEditMolecule, setViewEditMolecule] = useState(false);
    const [selectedRowsData, setSelectedRowsData] = useState([])
    const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs
    const [isMoleculeInCart, setCartMolecule] = useState<number[]>([]); // Store selected item ID
    const [inOrderMolecules, setOrderMolecule] = useState<number[]>([]); // Store selected item ID
    const [tableData, setTableData] = useState([]);
    const [moleculeData, setMoleculeData] = useState([]);
    const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(true);
    const [reloadMolecules, setReloadMolecules] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [cellData, setCellData] = useState<CellData>({
        smiles_string: "",
        source_molecule_name: ''
    });
    const [inDoneMolecules, setDoneMolecule] = useState<number[]>([]);
    const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);
    const [moleculeLoader, setMoleculeLoader] = useState(false);
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

    const fetchMoleculeData = async (library_id: number) => {
        setMoleculeLoader(true);
        try {
            const params = {
                library_id,
                sample_molecule_id: randomValue(sample_molecule_ids)
            }
            const moleculeData = await getMoleculeData(params);
            setTableData(moleculeData);
            setMoleculeLoader(false);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchMoleculeData(library_id);
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
                    { value: true, text: 'Favourites' },
                    { value: false, text: 'Non-Favourites' },
                ],
            },
            customRender: (data) => {
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
            customRender: (data) => (
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
            dataField: 'id',
            title: 'Molecule ID',
            allowHeaderFiltering: false,
            alignment: "center",
            width: 140,
            defaultSortOrder: "desc",
            allowSorting: true,
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Caco2_Papp';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'CLint_Human';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'CLint_Rat';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'CLint_Mouse';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Fub_Human';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Fub_Rat';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Fub_Mouse';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'HepG2_IC50';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'hERG_Ki';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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
            visible: !expanded,
            customRender: (data) => {
                if (data.adme_data) {
                    const key = 'Solubility';
                    const result = getAverage(data.adme_data, key);
                    if (result) {
                        const { average, value1, value2 } = result;
                        const calculatedResult = getADMEColorScheme(average, key);
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

    const fetchCartData = async () => {
        // OPT: 5
        const params: object = {
            user_id: userData.id,
            library_id,
            project_id: projectData.id,
        }

        if (isAdmin(myRoles) || isLibraryManger(myRoles)) {
            const moleculeCart = library_id ? await getMoleculeCart(params) : [];
            const molecule_ids = moleculeCart.map((item: any) => item.molecule_id);
            setSelectedRows(molecule_ids)
            const inCartMolecule = moleculeCart
                .filter((item: any) => item.molecule.status !== 1)
                .map((item: any) => item.molecule_id);
            setCartMolecule(inCartMolecule);
        }

        const moleculeOrder = await getMoleculeOrder(params);

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
    };

    useEffect(() => {
        fetchCartData();
    }, [library_id, userData.id, appContext]);

    const onCellPrepared = (e: any) => {
        if (isMoleculeInCart.includes(e.key)) {
            e.cellElement.style.pointerEvents = 'none';
            e.cellElement.style.opacity = 0.5;
        }
        if (inDoneMolecules.includes(e.key)) {
            e.cellElement.style.pointerEvents = 'none';
            e.cellElement.style.opacity = 0.5;
        }
    };

    const addToFavourite = async (data: MoleculeType, existingFavourite: boolean) => {
        const dataField: addToFavouritesProps = {
            molecule_id: data.id,
            user_id: userData.id,
            favourite_id: data.favourite_id,
            favourite: !existingFavourite
        };
        // if (existingFavourite) dataField.existingFavourite = existingFavourite;
        const response = await addToFavourites(dataField);
        if (!response.error) {
            /* const libraryData =
                await getLibraryById(['molecule'], data.library_id.toString()); */
            fetchMoleculeData(data.library_id);

        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
        }
    }

    const onSelectionChanged = async (e: any) => {
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
    };

    const showEditMolecule = useCallback((data?: MoleculeType) => {
        const moleculesToEdit = data ? [data] : selectedRowsData;
        setEditMolecules(moleculesToEdit.filter(d => !isMoleculeInCart.includes(d.id)));
        setViewEditMolecule(true);
    }, [selectedRowsData]);

    const addProductToCart = () => {
        context?.addToState({
            ...appContext, cartDetail: [...moleculeData]
        })

        addMoleculeToCart(moleculeData, MoleculeStatusCode.NewInCart)
            .then((res) => {
                toast.success(Messages.addMoleculeCartMessage(res.count));
                setReloadMolecules(true);
                setIsAddToCartEnabled(true)
            })
            .catch((error) => {
                toast.success(error);
            })
    }

    useEffect(() => {
        if (reloadMolecules) {
            (async () => {
                setEditMolecules([]);
                setSelectedRowsData([]);
                setSelectedRows([]);
                if (selectedLibrary) {
                    /* const libraryData =
                        await getLibraryById(['molecule'], selectedLibrary.toString());
                    setTableData(libraryData.libraryMolecules || []); */
                    await fetchMoleculeData(selectedLibrary);
                }
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
    const rowsNotInCartLength =
        (selectedRows.filter(value => !isMoleculeInCart.includes(value)).length)
    const toolbarButtons = [
        {
            text: "Add Molecule",
            onClick: addMolecule,
            icon: '/icons/plus-white.svg',
            visible: actionsEnabled.includes('create_molecule') && !!library_id,
            class: 'btn-primary toolbar-item-spacing',
        },
        {
            text: `Edit (${rowsNotInCartLength})`,
            onClick: showEditMolecule,
            class: !selectedRows.length ||
                !rowsNotInCartLength
                ? 'btn-disable toolbar-item-spacing' : 'btn-secondary toolbar-item-spacing',
            disabled: !selectedRows.length ||
                !rowsNotInCartLength,
            visible: actionsEnabled.includes('edit_molecule') && !!library_id
        },
        {
            text: `Add to Cart (${rowsNotInCartLength})`,
            onClick: addProductToCart,
            class: isAddToCartEnabled ||
                !rowsNotInCartLength
                ? 'btn-disable' : 'btn-secondary',
            disabled: isAddToCartEnabled ||
                !rowsNotInCartLength,
            visible: cartEnabled && !!library_id
        }
    ];
    const renderTitleField = () => {
        return (
            <div className="flex items-center relative">
                <div className="flex items-center">
                    <p className='form-title mr-2'>{`Add Molecule`}</p>
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
                            <AddMoleculeCriteria />
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
            {moleculeLoader ?
                <LoadIndicator
                    visible={moleculeLoader}
                /> :
                <div className={
                    `pb-[10px] ${expanded ? 'w-3/5' : 'w-full'}`}
                    onClick={closeMagnifyPopup}>
                    <CustomDataGrid
                        columns={columns}
                        data={tableData}
                        enableRowSelection
                        enableGrouping
                        enableInfiniteScroll={false}
                        enableSorting
                        enableFiltering={false}
                        enableOptions={false}
                        toolbarButtons={toolbarButtons}
                        loader={moleculeLoader}
                        enableHeaderFiltering
                        enableSearchOption={!expanded}
                        selectedRowKeys={selectedRows}
                        onSelectionChanged={onSelectionChanged}
                        onCellPrepared={onCellPrepared}
                    />
                    {viewAddMolecule && <Popup
                        titleRender={renderTitleField}
                        visible={viewAddMolecule}
                        contentRender={() => (
                            <AddMolecule
                                libraryId={selectedLibrary}
                                projectId={projectId}
                                organizationId={organizationId}
                                userData={userData}
                                setViewAddMolecule={setViewAddMolecule}
                                callLibraryId={callLibraryId}
                            />
                        )}
                        resizeEnabled={true}
                        hideOnOutsideClick={true}
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
                        hideOnOutsideClick={true}
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
                    <div className='flex justify-center mt-[25px]'>
                        <span className='text-themeGreyColor'>
                            {tableData.length}
                            <span className='pl-[3px]'>
                                {tableData.length === 1 ? 'molecule' : 'molecules'}
                            </span>
                            <span className='pl-[2px]'> found</span>
                        </span>
                        {!!tableData.length && <span>&nbsp;|&nbsp;</span>}
                        {!!tableData.length &&
                            <span className={
                                `text-themeSecondayBlue 
                                                pl-[5px] 
                                                font-bold pb-[10px]`
                            }>Select All {tableData.length}
                            </span>}
                    </div>
                </div >
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