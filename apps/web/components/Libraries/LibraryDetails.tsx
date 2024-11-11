/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import toast from "react-hot-toast";
import Accordion, { Item } from 'devextreme-react/accordion';
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {
    OrganizationDataFields,
    ProjectDataFields,
    userType,
    User,
    LibraryFields,
    UserData,
    MoleculeFavourite,
    MoleculeType,
    addToFavouritesProps,
    StatusCode,
} from '@/lib/definition';
import DataGrid, {
    Item as ToolbarItem,
    Column,
    Toolbar as GridToolbar,
    DataGridRef,
    Scrolling,
    Sorting,
    Selection,
    DataGridTypes,
    SearchPanel,
    HeaderFilter,
} from "devextreme-react/data-grid";
import { Popup, Position } from "devextreme-react/popup";
import { Button } from "devextreme-react/button";
import { SelectBox } from 'devextreme-react/select-box';
import { useSearchParams, useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import '../Organization/form.css';
import {
    DataType,
    StatusCodeBgAPI,
    StatusCodeAPIType,
    StatusCodeType,
    StatusCodeBg
} from '@/utils/constants';
import { FormRef } from "devextreme-react/cjs/form";
import StatusMark from '@/ui/StatusMark';
import {
    formatDatetime,
    formatDetailedDate,
    popupPositionValue,
    debounce,
    fetchMoleculeStatus
} from '@/utils/helpers';
import {
    addToFavourites,
    getLibraries,
    getLibraryById,
    addMoleculeToCart,
    getMoleculeCart
} from './libraryService';
import { sortByDate, sortNumber, sortString } from '@/utils/sortString';
import { Messages } from "@/utils/message";
import TextWithToggle from '@/ui/TextWithToggle';
import CreateLibrary from './CreateLibrary';
import { DELAY } from "@/utils/constants";
import { delay } from "@/utils/helpers";
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import { useContext } from "react";
import { AppContext } from "../../app/AppState";
import AddMolecule from '../Molecule/AddMolecule/AddMolecule';
import EditMolecule from '../Molecule/EditMolecule/EditMolecule';
import dynamic from 'next/dynamic';

const MoleculeStructure = dynamic(
    () => import("@/utils/MoleculeStructure"),
    { ssr: false }
);

const selectAllFieldLabel = { 'aria-label': 'Select All Mode' };
const showCheckboxesFieldLabel = { 'aria-label': 'Show Checkboxes Mode' };

const showCheckBoxesModes = ['none', 'onClick', 'onLongTap', 'always'];
const selectAllModes = ['allPages', 'page'];

const sortByFields = ['Name', 'Owner', 'Updation Time', 'Creation Time', 'Count of Molecules'];

type breadCrumbParams = {
    projectTitle?: string,
    projectHref?: string,
    projectSvg?: string,
    projectState?: boolean,
}

const breadcrumbArr = ({
    projectTitle = '',
    projectHref = '',
    projectSvg = '',
    projectState = false
}: breadCrumbParams) => {
    return [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        {
            label: 'Projects',
            svgPath: '/icons/project-inactive.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/projects',
        },
        {
            label: `Project: ${projectTitle}`,
            svgPath: projectSvg || "/icons/project-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: `/projects${projectHref}`,
            isActive: projectState
        },
    ];
}

const initialProjectData: ProjectDataFields = {
    name: '',
    id: 0,
    description: '',
    organization_id: undefined,
    organization: {} as OrganizationDataFields, // Provide a default organization object
    user: {} as userType, // Provide a default user object
    sharedUsers: [],
    target: '',
    type: '',
    userWhoUpdated: {} as userType, // Provide a default user object
    userWhoCreated: {} as userType, // Provide a default user object
    updated_at: new Date(),
    userId: undefined,
    owner: {} as User, // Provide a default owner object
    ownerId: 0,
    orgUser: undefined,
    created_at: new Date(),
    libraries: [] as unknown as LibraryFields[],
};

type LibraryDetailsProps = {
    userData: UserData,
    actionsEnabled: string[],
}

interface CellData {
    smiles_string: string;
}

const urlHost = process.env.NEXT_PUBLIC_UI_APP_HOST_URL;

export default function LibraryDetails({ userData, actionsEnabled }: LibraryDetailsProps) {
    const cartEnabled = actionsEnabled.includes('create_molecule_order');
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ id: string }>();
    const [library_id, setLibraryId] = useState(searchParams.get('library_id'));
    const [tableData, setTableData] = useState<MoleculeType[]>([]);
    const [projects, setProjects] = useState<ProjectDataFields>(initialProjectData);
    const [initProjects, setInitProjects] = useState<ProjectDataFields>(initialProjectData);
    const [popupVisible, setPopupVisible] = useState(false);
    const [cellData, setCellData] = useState<CellData>({ smiles_string: "" });
    const [popupCords, setPopupCords] = useState({ x: 0, y: 0 });
    const [selectedLibrary, setSelectedLibrary] =
        useState(library_id ? parseInt(library_id, 10) : '');
    const [selectedLibraryName, setSelectedLibraryName] = useState('untitled');
    const [loader, setLoader] = useState(true);
    const [moleculeLoader, setMoleculeLoader] = useState(false);
    const [allMode, setAllMode] = useState<DataGridTypes.SelectAllMode>('allPages');
    const [expanded, setExpanded] = useState(library_id ? false : true);
    const [checkBoxesMode, setCheckBoxesMode] =
        useState<DataGridTypes.SelectionColumnDisplayMode>('always');
    const [editMolecules, setEditMolecules] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [expandMenu, setExpandedMenu] = useState(-1);
    const [isExpanded, setIsExpanded] = useState<number[]>([]);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [editPopupVisible, setEditPopupVisibility] = useState(false);
    const [selectedLibraryIdx, setSelectedLibraryIndex] = useState(-1);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [isProjectExpanded, setProjectExpanded] = useState(false);
    const [editEnabled, setEditStatus] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState('Creation Time');
    const [breadcrumbValue, setBreadCrumbs] = useState(breadcrumbArr({}));
    const context: any = useContext(AppContext);
    const appContext = context.state;

    const [moleculeData, setMoleculeData] = useState([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]); // Store selected item IDs
    const [isMoleculeInCart, setCartMolecule] = useState<number[]>([]); // Store selected item IDs
    const [selectedRowsData, setSelectedRowsData] = useState([])
    const [viewAddMolecule, setViewAddMolecule] = useState(false);
    const [viewEditMolecule, setViewEditMolecule] = useState(false);
    let toastShown = false;
    const grid = useRef<DataGridRef>(null);
    const formRef = useRef<FormRef>(null);

    const { myRoles } = userData;
    const magnifyButtonRef = useRef<HTMLButtonElement | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const createEnabled = actionsEnabled.includes('create_library');

    const fetchLibraries = async () => {
        const projectData = await getLibraries(['libraries'], params.id);
        let selectedLib = { name: '' };
        if (library_id && projectData) {
            selectedLib = projectData.libraries.find(
                (library: LibraryFields) => library.id === parseInt(library_id, 10));
        }
        if (projectData && !!selectedLib) {
            const sortKey = 'created_at';
            const sortBy = 'desc';
            const tempLibraries = sortByDate(projectData.libraries, sortKey, sortBy);
            setProjects({ ...projectData, libraries: tempLibraries });
            setInitProjects({ ...projectData, libraries: tempLibraries });
            let breadcrumbTemp = breadcrumbArr({
                projectTitle: `${projectData.name}`,
                projectHref: `/${params.id}`
            });
            if (library_id) {
                const libraryData = await getLibraryById(['molecule'], library_id);
                setTableData(libraryData.molecule || []);
                const libName = libraryData.name;
                setSelectedLibraryName(libName);
                setSelectedLibrary(parseInt(library_id));
                breadcrumbTemp = breadcrumbArr({
                    projectTitle: `${projectData.name}`,
                    projectHref: `/${params.id}`, projectSvg: "/icons/project-inactive.svg"
                });
                breadcrumbTemp = [
                    ...breadcrumbTemp,
                    {
                        label: libName,
                        svgPath: "/icons/library-active.svg",
                        svgWidth: 16,
                        svgHeight: 16,
                        href: `/projects/${params.id}?library_id=${library_id}`,
                        isActive: true,
                    }];
            } else {
                if (tempLibraries.length) {
                    const libraryData = await getLibraryById(['molecule'], tempLibraries[0]?.id);
                    setTableData(libraryData.molecule || []);
                    setLibraryId(libraryData.id);
                } const libName = tempLibraries[0]?.name || 'untitled';
                setSelectedLibraryName(libName);
                setSelectedLibrary(tempLibraries[0]?.id);
                setSortBy('Creation Time');
                setExpanded(true);
                breadcrumbTemp = breadcrumbArr({
                    projectTitle: `${projectData.name}`,
                    projectHref: `/${params.id}`,
                    projectSvg: '/icons/project-icon.svg', projectState: true
                });
            }
            setBreadCrumbs(breadcrumbTemp);
            setMoleculeLoader(false);
            setLoader(false);
        } else {
            if (!toastShown) {
                toastShown = true;
                const toastId = toast.error(Messages.INVALID_URL);
                await delay(DELAY);
                toast.remove(toastId);
                router.back();
            }
        }
    }

    const callLibraryId = async () => {
        setMoleculeLoader(true);
        const libraryData =
            await getLibraryById(['molecule'], selectedLibrary.toString());
        setMoleculeLoader(false);
        setTableData(libraryData.molecule || []);
    }

    const fetchCartData = async () => {
        const moleculeCart = library_id ?
            await getMoleculeCart(Number(userData.id), Number(library_id), Number(projects.id))
            : [];
        const molecule_ids = moleculeCart.map((item: any) => item.molecule_id);
        const molecule_idsInCart = moleculeCart
            .filter((item: any) => item.molecule.is_added_to_cart)
            .map((item: any) => item.molecule_id);
        setCartMolecule(molecule_idsInCart)
        setSelectedRows(molecule_ids)
    };


    useEffect(() => {
        fetchCartData();
    }, [library_id, userData.id, appContext]);

    useEffect(() => {
        fetchLibraries();
    }, [params.id, library_id]);

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);

    const onCheckBoxesModeChanged = useCallback(({ value }: any) => {
        setCheckBoxesMode(value);
    }, []);

    const onAllModeChanged = useCallback(({ value }: any) => {
        setAllMode(value);
    }, []);

    const addToFavourite = async ({ data, existingFavourite }: {
        data: MoleculeType,
        existingFavourite: MoleculeFavourite
    }) => {
        setMoleculeLoader(true);
        const dataField: addToFavouritesProps = {
            molecule_id: data.id, user_id: userData.id, favourite: true
        };
        if (existingFavourite) dataField.existingFavourite = existingFavourite;
        const response = await addToFavourites(dataField);
        if (!response.error) {
            const libraryData =
                await getLibraryById(['molecule'], data.library_id.toString());
            setMoleculeLoader(false);
            setTableData(libraryData.molecule || []);
        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
            setMoleculeLoader(false);
        }
    }

    const handleSortChange = (value: string) => {
        setLoader(true);
        setSortBy(value);
        if (value) {
            let sortKey = value;
            let sortBy = 'asc';
            let object = false;
            let tempLibraries: LibraryFields[] = [];
            if (sortKey === 'Updation Time') {
                sortKey = 'updated_at';
                sortBy = 'desc';
            } else if (sortKey === 'Creation Time') {
                sortKey = 'created_at';
                sortBy = 'desc';
            } else if (sortKey === 'Owner') {
                sortKey = 'owner.first_name';
                object = true;
            } else if (sortKey === 'Count of Molecules') {
                sortKey = 'molecule';
                sortBy = 'desc';
            } else {
                sortKey = 'name';
            }
            if (sortKey === 'molecule') {
                tempLibraries = sortNumber(projects.libraries, sortKey, sortBy);
            } else if (sortKey !== 'updated_at' && sortKey !== 'created_at') {
                tempLibraries = sortString(projects.libraries, sortKey, sortBy, object);
            } else {
                tempLibraries = sortByDate(projects.libraries, sortKey, sortBy);
            }
            setProjects((prevState) => ({
                ...prevState,
                libraries: tempLibraries,
            }));
        } else {
            setProjects(initProjects);
        }
        setLoader(false);
    }


    const sortItemsRender = (item: string) => {
        return (
            <div className='sort-list'>
                {item}
            </div>
        );
    };

    const copyUrl = (type: string, name: string, id?: number) => {
        if (typeof window !== "undefined") {
            let url = `${urlHost}/projects/${params.id}`;
            if (type === 'library') url = `${urlHost}/projects/${params.id}?library_id=${id}`;
            navigator.clipboard.writeText(url)
                .then(() => toast.success(Messages.urlCopied(type, name)))
                .catch(() => toast.error(Messages.URL_COPY_ERROR));
        }
    }


    const handleSearch = debounce((value: string) => {
        setLoader(true);
        if (value) {
            if (projects.libraries.length > 0) {
                const filteredLibraries = projects.libraries.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.molecule.length.toString().includes(value.toLowerCase())
                );
                setProjects((prevState) => ({
                    ...prevState,
                    libraries: filteredLibraries,
                }));
            } else {
                const filteredLibraries = initProjects.libraries.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.molecule.length.toString().includes(value.toLowerCase())
                );
                setProjects((prevState) => ({
                    ...prevState,
                    libraries: filteredLibraries,
                }));
            }
        }
        else {
            setProjects(initProjects);
        }
        setLoader(false);
    }, 500);

    const searchLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        handleSearch(e.target.value);
    }

    const renderTitle = (title: string) => (
        <div className="accordion-title">{title}</div>
    );

    const toggleExpanded = (id: number, type: string) => {
        if (type === 'library') {
            let expandedDescription = [...isExpanded];
            if (expandedDescription.includes(id)) {
                expandedDescription = expandedDescription.filter(
                    (descriptionId: number) => descriptionId !== id);
            } else expandedDescription.push(id);
            setIsExpanded(expandedDescription);
        } else {
            setProjectExpanded(!isProjectExpanded);
        }
    }

    const checkDisabled = (item: LibraryFields) => {
        setEditStatus(checkDisabledField(item));
    }

    const checkDisabledField = (item: LibraryFields) => {
        const owner = item.ownerId === userData.id;
        const admin = ['admin', 'org_admin'].some((role) => myRoles?.includes(role));
        return !(owner || admin);
    }
    const showEditMolecule = useCallback((data: any | null = null) => {
        const moleculesToEdit = data ? [data] : selectedRowsData;
        setEditMolecules(moleculesToEdit);
        setViewEditMolecule(true);
    }, [selectedRowsData]);

    const onSelectionChanged = async (e: any) => {
        setSelectedRows(e.selectedRowKeys);
        setSelectedRowsData(e.selectedRowsData)
        const checkedMolecule = e.selectedRowsData;
        const selectedProjectMolecule = checkedMolecule.map((item: any) => ({
            ...item,
            molecule_id: item.id,
            library_id: library_id,
            userId: userData.id,
            organization_id: projects.organization_id,
            project_id: projects.id
        }));

        const moleculeCart = library_id ?
            await getMoleculeCart(Number(userData.id), Number(library_id), Number(projects.id))
            : [];
        const preselectedIds = moleculeCart.map((item: any) => item.molecule_id);
        const updatedMoleculeCart = selectedProjectMolecule.filter((item: any) =>
            !preselectedIds.includes(item.molecule_id));
        // If the check box is unchecked
        if (e.currentDeselectedRowKeys.length > 0) {
            const newmoleculeData = checkedMolecule.filter((
                item: any) => item.id !== e.currentDeselectedRowKeys[0].id
                && item.project_id !== projects.id);
            setMoleculeData(newmoleculeData);
        }
        else {
            setMoleculeData(updatedMoleculeCart);
        }
    };

    const addProductToCart = () => {
        context?.addToState({
            ...appContext, cartDetail: [...moleculeData]
        })
        addMoleculeToCart(moleculeData)
            .then((res) => {
                toast.success(Messages.addMoleculeCartMessage(res.count));
            })
            .catch((error) => {
                toast.success(error);
            })
    }
    const onCellPrepared = (e: any) => {
        if (isMoleculeInCart.includes(e.key)) {
            e.cellElement.style.pointerEvents = 'none';
            e.cellElement.style.opacity = 0.5;
        }
        if (e.rowType === "data") {
            if (e.column.dataField === "status") {
                const color: StatusCodeType = e.data.status?.toUpperCase();
                e.cellElement.classList.add(StatusCodeBg[color]);
            }
        }
    };
    const closeMagnifyPopup = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setPopupVisible(false);
        }
    };
    const handleMagnifyClick = (data: any) => {
        if (magnifyButtonRef.current) {
            const buttonRect =
                magnifyButtonRef.current.getBoundingClientRect();
            setPopupCords({
                x: buttonRect.bottom + window.scrollY,
                y: buttonRect.left + window.scrollX,
            });
            setPopupVisible(true);
            setCellData(data);
        }
    }
    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbValue} />
            <div className='p-[20px]' onClick={closeMagnifyPopup}>
                {loader ?
                    <LoadIndicator
                        visible={loader}
                    /> :
                    <div>
                        <div className="flex justify-between">
                            <main className="main main-title">
                                <Image
                                    src="/icons/libraries.svg"
                                    width={33}
                                    height={30}
                                    alt="organization"
                                />
                                <span>{`Library: ${selectedLibraryName}`}</span>
                                <Image
                                    src={expanded ? "/icons/collapse.svg" : "/icons/expand.svg"}
                                    width={33}
                                    height={30}
                                    alt="showDetailedView"
                                    className='cursor-pointer'
                                    onClick={() => setExpanded(!expanded)}
                                />
                            </main>
                        </div>
                        <div className='flex gap-[20px]'>
                            {expanded && (<div className='w-[40vw] projects'>
                                <Accordion multiple={true} collapsible={true}>
                                    {/* Project Details Section */}
                                    <Item titleRender={
                                        () => renderTitle(`Project Details: ${projects.name}`)}>
                                        <div>
                                            <div className={
                                                `library-name
                                                no-border
                                                flex
                                                items-center
                                                justify-between`
                                            }>
                                                <div>
                                                    Project Owner:
                                                    <span>
                                                        {`${projects.owner.first_name}
                                                         ${projects.owner.last_name}`}
                                                    </span>
                                                </div>
                                                <div className='flex'>
                                                    <Button
                                                        text="Manage Users"
                                                        type="normal"
                                                        stylingMode="contained"
                                                        elementAttr={{
                                                            class: "form_btn_primary mr-[20px]"
                                                        }}
                                                        disabled={true}
                                                    />
                                                    <Button
                                                        text="Link"
                                                        type="normal"
                                                        stylingMode="contained"
                                                        elementAttr={{ class: "btn-primary" }}
                                                        onClick={
                                                            () => copyUrl('project', projects.name)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className='library-name no-border'>
                                                Target: <span>{projects.target}</span>
                                            </div>
                                            <div className='library-name no-border'>
                                                Last Modified: <span>
                                                    {formatDetailedDate(projects.updated_at)}
                                                </span>
                                            </div>
                                            <div className='library-name no-border'>
                                                {projects.description ?
                                                    <TextWithToggle
                                                        text={projects.description}
                                                        isExpanded={isProjectExpanded}
                                                        toggleExpanded={toggleExpanded}
                                                        id={projects.id}
                                                        heading='Description:'
                                                        component="project"
                                                        clamp={12}
                                                    /> :
                                                    <>Description: </>
                                                }
                                            </div>
                                        </div>
                                    </Item>

                                    {/* Libraries List Section */}
                                    <Item titleRender={() => renderTitle("Library List")}>
                                        <div className='libraries'>
                                            <div className={
                                                `flex 
                                                    justify-between 
                                                    items-center 
                                                    p-2`
                                            }>
                                                <div className='flex items-center'>
                                                    <span className={`select-header mr-[5px]`}>
                                                        sort by:
                                                    </span>
                                                    <SelectBox
                                                        dataSource={sortByFields}
                                                        value={sortBy}
                                                        itemRender={sortItemsRender}
                                                        className=
                                                        {`w-[145px] bg-transparent library-select`}
                                                        onValueChange={(e) => handleSortChange(e)}
                                                        placeholder=''
                                                    />
                                                </div>
                                                <div className='flex'>
                                                    {createEnabled && <Button
                                                        text="Add Library"
                                                        icon="plus"
                                                        type="default"
                                                        stylingMode='text'
                                                        onClick={() => {
                                                            setEditPopupVisibility(false);
                                                            setCreatePopupVisibility(true);
                                                        }}
                                                        render={() => (
                                                            <>
                                                                <Image
                                                                    src="/icons/plus.svg"
                                                                    width={15}
                                                                    height={13}
                                                                    alt="Add"
                                                                />
                                                                <span className='pl-2 pt-[1px]'>
                                                                    Add Library
                                                                </span>
                                                            </>
                                                        )}
                                                    />
                                                    }
                                                    <Button
                                                        text="Filter"
                                                        icon="filter"
                                                        type="normal"
                                                        stylingMode='text'
                                                        disabled={true}
                                                        render={() => (
                                                            <>
                                                                <Image
                                                                    src="/icons/filter.svg"
                                                                    width={24}
                                                                    height={24}
                                                                    alt="Filter"
                                                                />
                                                                <span>Filter</span>
                                                            </>
                                                        )}
                                                    />
                                                    <div
                                                        className={`search-box 
                                                        bg-themeSilverGreyColor`}
                                                    >
                                                        <Image
                                                            src="/icons/search.svg"
                                                            width={24}
                                                            height={24}
                                                            alt="Sort"
                                                            className='search-icon library-search'
                                                        />
                                                        <input
                                                            placeholder="Search"
                                                            className="search-input"
                                                            width={120}
                                                            style={{ paddingLeft: '30px' }}
                                                            value={searchValue}
                                                            onChange={searchLibrary}
                                                        />
                                                    </div>
                                                </div>
                                                {createPopupVisible && (
                                                    <Popup
                                                        title="Add Library"
                                                        visible={createPopupVisible}
                                                        contentRender={() => (
                                                            <CreateLibrary
                                                                formRef={formRef}
                                                                setCreatePopupVisibility={
                                                                    setCreatePopupVisibility}
                                                                fetchLibraries={fetchLibraries}
                                                                userData={userData}
                                                                projectData={projects}
                                                                library_idx={-1}
                                                            />
                                                        )}
                                                        width={477}
                                                        hideOnOutsideClick={true}
                                                        height="100%"
                                                        position={popupPosition}
                                                        onHiding={() => {
                                                            formRef.current?.instance().reset();
                                                            setCreatePopupVisibility(false);
                                                        }}
                                                        showCloseButton={true}
                                                        wrapperAttr={
                                                            {
                                                                class: "create-popup mr-[15px]"
                                                            }
                                                        }
                                                    />
                                                )}
                                            </div>
                                            {actionsEnabled.includes('edit_library') &&
                                                editPopupVisible && (
                                                    <Popup
                                                        title="Edit Library"
                                                        visible={editPopupVisible}
                                                        contentRender={() => (
                                                            <CreateLibrary
                                                                formRef={formRef}
                                                                setCreatePopupVisibility={
                                                                    setEditPopupVisibility}
                                                                fetchLibraries={fetchLibraries}
                                                                userData={userData}
                                                                projectData={projects}
                                                                library_idx={selectedLibraryIdx}
                                                            />
                                                        )}
                                                        width={477}
                                                        hideOnOutsideClick={true}
                                                        height="100%"
                                                        position={popupPosition}
                                                        onHiding={() => {
                                                            formRef.current?.instance().reset();
                                                            setEditPopupVisibility(false);
                                                            setSelectedLibraryIndex(-1);
                                                        }}
                                                        showCloseButton={true}
                                                        wrapperAttr={
                                                            {
                                                                class: "create-popup mr-[15px]"
                                                            }
                                                        }
                                                    />
                                                )}
                                            {projects.libraries.map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    className={
                                                        `box-item
                                                        library
                                                        mb-[10px]
                                                        cursor-pointer
                                                        ${(selectedLibrary === item.id) ?
                                                            'selected-accordion' : ''
                                                        }`
                                                    }
                                                    onClick={async () => {
                                                        setMoleculeLoader(true)
                                                        setSelectedLibrary(item.id);
                                                        setSelectedLibraryName(item.name);
                                                        const libraryData =
                                                            await getLibraryById(['molecule'],
                                                                item.id.toString());
                                                        setTableData(libraryData.molecule || []);
                                                        setMoleculeLoader(false)
                                                    }}>
                                                    <div className={
                                                        `library-name
                                                        flex
                                                        justify-around
                                                        no-border`
                                                    }>
                                                        <div className='flex w-[55%]'>
                                                            <div className=
                                                                {`flex`}>
                                                                Library:
                                                            </div>
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <div className=
                                                            {`flex justify-between w-[45%]`}>
                                                            <div>Created On:
                                                                <span>{
                                                                    formatDatetime(item.created_at)
                                                                }
                                                                </span>
                                                            </div>
                                                            <Image
                                                                src="/icons/more.svg"
                                                                alt="more button"
                                                                width={5}
                                                                height={3}
                                                                className='cursor-pointer'
                                                                id={`image${item.id}`}
                                                                onClick={() => {
                                                                    setExpandedMenu(item.id);
                                                                    checkDisabled(item);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Popup
                                                        visible={expandMenu === item.id}
                                                        onHiding={() => setExpandedMenu(-1)}
                                                        dragEnabled={false}
                                                        hideOnOutsideClick={true}
                                                        showCloseButton={false}
                                                        showTitle={false}
                                                        width={70}
                                                        height={110}
                                                    >
                                                        <Position
                                                            at="left bottom"
                                                            my="right top"
                                                            of={`#image${item.id}`}
                                                            collision="fit" />
                                                        <p
                                                            className={
                                                                `mb-[20px] 
                                                                ${!editEnabled ?
                                                                    'cursor-pointer' : ''}`
                                                            }
                                                            onClick={() => {
                                                                if (!editEnabled) {
                                                                    setExpandedMenu(-1);
                                                                    setCreatePopupVisibility(false);
                                                                    setSelectedLibraryIndex(idx);
                                                                    setEditPopupVisibility(true);
                                                                }
                                                            }}
                                                        >
                                                            Edit
                                                        </p>
                                                        <p
                                                            className='cursor-pointer'
                                                            onClick={() =>
                                                                copyUrl(
                                                                    'library',
                                                                    item.name,
                                                                    item.id)
                                                            }
                                                        >
                                                            URL
                                                        </p>
                                                    </Popup>
                                                    <div className={
                                                        `library-name
                                                        flex 
                                                        justify-around 
                                                        no-border`
                                                    }>
                                                        <div className='flex w-[55%]'>
                                                            <div className=
                                                                {`flex`}>
                                                                Owner:
                                                            </div>
                                                            <span>
                                                                {item.owner.first_name}
                                                                {item.owner.last_name}
                                                            </span>
                                                        </div>
                                                        <div className='w-[45%] flex justify-start'>
                                                            {item.userWhoUpdated &&
                                                                <>
                                                                    Last Updated By:
                                                                    <span>
                                                                        {`${item.userWhoUpdated
                                                                            .first_name} 
                                                                            ${item.userWhoUpdated
                                                                                .last_name}`}
                                                                    </span>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className={
                                                        `library-name
                                                        flex
                                                        justify-around
                                                        no-border`
                                                    }>
                                                        <div className='flex w-[55%]'>
                                                            <div className=
                                                                {`flex`}>
                                                                Target:
                                                            </div>
                                                            <span>{item.target}</span></div>
                                                        <div className='w-[45%]'>
                                                            {item.updated_at &&
                                                                <>
                                                                    Last Updated On:
                                                                    <span>
                                                                        {formatDatetime(
                                                                            item.updated_at)}
                                                                    </span>
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    {
                                                        <div
                                                            className={
                                                                `library-name
                                                                gap-[10px]
                                                                flex mt-[8px]
                                                                flex-wrap
                                                                justify-between
                                                                no-border`
                                                            }>
                                                            <div>Molecules:
                                                                <span>{item.molecule.length}</span>
                                                                {Object.entries(
                                                                    fetchMoleculeStatus(item))
                                                                    .map(([status, count]) => {
                                                                        let type = 'info';
                                                                        if (status === 'Failed') {
                                                                            type = 'error';
                                                                        }
                                                                        else if
                                                                            (status === 'Done') {
                                                                            type = 'success';
                                                                        }
                                                                        return (
                                                                            <span
                                                                                key={status}
                                                                                className={
                                                                                    `badge ${type}`
                                                                                }
                                                                            >
                                                                                <b
                                                                                    className="
                                                                                    pr-[5px]"
                                                                                >
                                                                                    {count}
                                                                                </b>
                                                                                {status}
                                                                            </span>
                                                                        )
                                                                    })}
                                                            </div>
                                                        </div>
                                                    }
                                                    <div className='library-name no-border'>
                                                        {
                                                            item.description ?
                                                                <TextWithToggle
                                                                    text={item.description}
                                                                    isExpanded={
                                                                        isExpanded.includes(item.id)
                                                                    }
                                                                    toggleExpanded={toggleExpanded}
                                                                    id={item.id}
                                                                    heading='Description:'
                                                                    component="library"
                                                                    clamp={2}
                                                                /> :
                                                                <>Description: </>
                                                        }
                                                    </div>
                                                    <div className='flex justify-end'>
                                                        <Button
                                                            text="Open"
                                                            type="normal"
                                                            stylingMode="contained"
                                                            elementAttr={
                                                                {
                                                                    class: "btn-primary mr-[20px]"
                                                                }
                                                            }
                                                            onClick={() => {
                                                                const url =
                                                                    `/projects/${params.id}` +
                                                                    `?library_id=${item.id}`;
                                                                setSelectedLibrary(idx);
                                                                setSelectedLibraryName(item.name);
                                                                setExpanded(false);
                                                                router.push(url);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {projects.libraries.length == 0 && (
                                                <div className={
                                                    `flex justify-center 
                                                    items-center 
                                                    p-[40px] 
                                                    h-[70px] 
                                                    nodata`
                                                }>
                                                    {Messages.LIBRARY_LIST_EMPTY}
                                                </div>
                                            )}
                                        </div>
                                    </Item>
                                </Accordion>
                            </div>
                            )
                            }
                            {moleculeLoader ?
                                <LoadIndicator
                                    visible={moleculeLoader}
                                /> :
                                <div className={
                                    `border
                                border-solid
                                ${expanded ? 'w-[60vw]' : 'w-100vw'}`}>
                                    <DataGrid
                                        dataSource={tableData}
                                        showBorders={true}
                                        ref={grid}
                                        keyExpr="id"
                                        selectedRowKeys={selectedRows}
                                        onSelectionChanged={onSelectionChanged}
                                        columnAutoWidth={false}
                                        width="100%"
                                        onCellPrepared={onCellPrepared}
                                    >
                                        <Selection
                                            mode="multiple"
                                            selectAllMode={allMode}
                                            showCheckBoxesMode={checkBoxesMode}

                                        />
                                        <Sorting mode="single" />
                                        <Scrolling mode="infinite" />
                                        <HeaderFilter visible={true} />
                                        <Column
                                            dataField="bookmark"
                                            width={90}
                                            alignment="center"
                                            allowSorting={false}
                                            allowHeaderFiltering={false}
                                            headerCellRender={() =>
                                                <Image
                                                    src="/icons/star.svg"
                                                    width={24}
                                                    height={24}
                                                    alt="favourite-header"
                                                />}
                                            cellRender={({ data }) => {
                                                const existingFavourite =
                                                    data.molecule_favorites.find((
                                                        val: MoleculeFavourite) =>
                                                        val.user_id === userData.id &&
                                                        val.molecule_id === data.id);
                                                return (
                                                    <span className={`flex
                                                justify-center
                                                cursor-pointer`}
                                                        onClick={() =>
                                                            addToFavourite({
                                                                data,
                                                                existingFavourite
                                                            })
                                                        }>
                                                        <Image
                                                            src={existingFavourite ?
                                                                "/icons/star-filled.svg" :
                                                                "/icons/star.svg"
                                                            }
                                                            width={24}
                                                            height={24}
                                                            alt="favourite"
                                                        />
                                                    </span>
                                                )
                                            }}
                                        />
                                        <Column dataField="Structure"
                                            minWidth={300}
                                            allowHeaderFiltering={false}
                                            cellRender={({ data, rowIndex }) => (
                                                <span className='flex justify-center gap-[7.5px]'
                                                >
                                                    <MoleculeStructure
                                                        structure={data.smiles_string}
                                                        id={`smiles-${rowIndex}`}
                                                        width={80}
                                                        height={80}
                                                        svgMode={true}
                                                    />
                                                    <Button
                                                        disabled=
                                                        {!actionsEnabled.includes('edit_molecule')}
                                                        render={() => (
                                                            <>
                                                                <Image
                                                                    src="/icons/edit.svg"
                                                                    width={24}
                                                                    height={24}
                                                                    alt="edit"
                                                                    onClick={
                                                                        () =>
                                                                            showEditMolecule(data)}
                                                                />
                                                            </>
                                                        )}

                                                    />
                                                    <Button
                                                        render={() => (
                                                            <button ref={magnifyButtonRef}
                                                                onClick={() =>
                                                                    handleMagnifyClick(data)}
                                                            >
                                                                <Image
                                                                    src="/icons/zoom.svg"
                                                                    width={24}
                                                                    height={24}
                                                                    alt="zoom"
                                                                />
                                                            </button>
                                                        )}
                                                    />
                                                    <Button
                                                        disabled={true}
                                                        render={() => (
                                                            <>
                                                                <Image
                                                                    src="/icons/delete.svg"
                                                                    width={24}
                                                                    height={24}
                                                                    alt="delete"
                                                                />
                                                            </>
                                                        )}
                                                    />

                                                </span>
                                            )} />
                                        <Column
                                            dataField="id"
                                            caption="Molecule ID"
                                            minWidth={150}
                                            allowHeaderFiltering={false}
                                            alignment="center"
                                        />
                                        <Column
                                            dataField="molecular_weight"
                                            caption="Molecular Weight"
                                            allowHeaderFiltering={false}
                                            width={160}
                                            alignment="center"
                                        />
                                        <Column
                                            dataField="status"
                                            minWidth={120}
                                            cellRender={({ data }: { data: DataType }) => {
                                                const colorKey = data.status.toUpperCase() as
                                                    keyof typeof StatusCode;
                                                return (
                                                    <span className={`flex items-center gap-[5px]`}>
                                                        {data.status}
                                                        <StatusMark status={StatusCode[colorKey]} />
                                                    </span>
                                                )
                                            }} />
                                        <Column
                                            dataField="yield"
                                            visible={!expanded}
                                            allowHeaderFiltering={false}
                                            allowSorting={false}
                                        />
                                        <Column
                                            dataField="analyse"
                                            visible={!expanded}
                                            allowHeaderFiltering={false}
                                            allowSorting={false}
                                        />
                                        <Column
                                            dataField="herg"
                                            caption="HERG"
                                            visible={!expanded}
                                            allowHeaderFiltering={false}
                                            allowSorting={false}
                                            cellRender={({ data }) => {
                                                let color: StatusCodeAPIType = 'READY';
                                                if (data.herg <= 0.5) color = 'FAILED';
                                                else if (data.herg >= 0.5 && data.herg < 1) {
                                                    color = 'INFO';
                                                } else if (data.herg >= 1) {
                                                    color = 'DONE';
                                                }
                                                return (
                                                    <span className={`flex items-center
                                                gap-[5px] ${StatusCodeBgAPI[color]}`}>
                                                        {data.herg}
                                                    </span>
                                                )
                                            }} />
                                        <Column
                                            dataField="caco2"
                                            caption="CACO-2"
                                            visible={!expanded}
                                            allowHeaderFiltering={false}
                                            allowSorting={false}
                                            cellRender={({ data }) => {
                                                let color: StatusCodeAPIType = 'READY';
                                                if (data.caco2 <= 0.5) color = 'FAILED';
                                                else if (data.caco2 >= 0.5 && data.caco2 < 1) {
                                                    color = 'INFO';
                                                } else if (data.caco2 >= 1) {
                                                    color = 'DONE';
                                                }
                                                return (
                                                    <span className={`flex items-center
                                                    gap-[5px] ${StatusCodeBgAPI[color]}`}>
                                                        {data.caco2}
                                                    </span>
                                                )
                                            }} />
                                        <Column
                                            dataField="clint"
                                            caption="cLint"
                                            visible={!expanded}
                                            allowSorting={false}
                                            allowHeaderFiltering={false}
                                            cellRender={({ data }) => {
                                                let color: StatusCodeAPIType = 'READY';
                                                if (data.clint <= 0.5) color = 'FAILED';
                                                else if (data.clint >= 0.5 && data.clint < 1) {
                                                    color = 'INFO';
                                                } else if (data.clint >= 1) {
                                                    color = 'DONE';
                                                }
                                                return (
                                                    <span className={`flex items-center
                                                 gap-[5px] ${StatusCodeBgAPI[color]}`}>
                                                        {data.clint}
                                                    </span>
                                                )
                                            }} />
                                        <Column
                                            dataField="hepg2cytox"
                                            caption="HepG2-cytox"
                                            visible={!expanded}
                                            allowHeaderFiltering={false}
                                            allowSorting={false}
                                            cellRender={({ data }) => {
                                                let color: StatusCodeAPIType = 'READY';
                                                if (data.hepg2cytox <= 0.5) color = 'FAILED';
                                                else if (data.hepg2cytox >= 0.5 &&
                                                    data.hepg2cytox < 1) {
                                                    color = 'INFO';
                                                } else if (data.hepg2cytox >= 1) {
                                                    color = 'DONE';
                                                }
                                                return (
                                                    <span className={`flex items-center
                                                 gap-[5px] ${StatusCodeBgAPI[color]}`}>
                                                        {data.hepg2cytox}
                                                    </span>
                                                )
                                            }} />
                                        <Column
                                            dataField="solubility"
                                            visible={!expanded}
                                            allowHeaderFiltering={false}
                                            allowSorting={false}
                                            cellRender={({ data }) => {
                                                let color: StatusCodeAPIType = 'READY';
                                                if (data.solubility <= 0.5) color = 'FAILED';
                                                else if (data.solubility >= 0.5 &&
                                                    data.solubility < 1) {
                                                    color = 'INFO';
                                                } else if (data.solubility >= 1) {
                                                    color = 'DONE';
                                                }
                                                return (
                                                    <span className={`flex items-center
                                                    gap-[5px] ${StatusCodeBgAPI[color]}`}>
                                                        {data.solubility}
                                                    </span>
                                                )
                                            }} />

                                        <GridToolbar>
                                            {actionsEnabled.includes('create_molecule') &&
                                                selectedLibrary &&
                                                <ToolbarItem location="after">
                                                    <Button
                                                        text="Add Molecule"
                                                        icon="plus"
                                                        visible={
                                                            actionsEnabled.includes(
                                                                'create_molecule')
                                                        }
                                                        onClick={() => setViewAddMolecule(true)}
                                                        render={(buttonData: any) => (
                                                            <>
                                                                <Image
                                                                    src="/icons/plus.svg"
                                                                    width={24}
                                                                    height={24}
                                                                    alt="Create"
                                                                />
                                                                <span className='ml-[5px]'>
                                                                    {buttonData.text}
                                                                </span>
                                                            </>
                                                        )}
                                                    />
                                                </ToolbarItem>}
                                            {actionsEnabled.includes('edit_molecule') &&
                                                <ToolbarItem location="after">
                                                    <Button
                                                        disabled={selectedRows?.length < 1}
                                                        onClick={() => showEditMolecule()}
                                                        render={() => (
                                                            <span>
                                                                {`Edit (${selectedRows?.length})`}
                                                            </span>
                                                        )}
                                                    />
                                                </ToolbarItem>}
                                            {cartEnabled &&
                                                <ToolbarItem location="after">
                                                    <Button
                                                        onClick={addProductToCart}
                                                        disabled={
                                                            selectedRows.length > 0 ? false : true
                                                        }
                                                        render={() => (
                                                            <span>
                                                                {`Add to Cart
                                                                    (${selectedRows?.length})
                                                                `}
                                                            </span>
                                                        )}
                                                    />
                                                </ToolbarItem>
                                            }
                                            <ToolbarItem name="searchPanel" location="before" />
                                        </GridToolbar>
                                        <SearchPanel
                                            visible={!expanded}
                                            highlightSearchText={true}
                                        />
                                        <div>
                                            <div>
                                                <SelectBox
                                                    id="select-all-mode"
                                                    inputAttr={selectAllFieldLabel}
                                                    dataSource={selectAllModes}
                                                    value={allMode}
                                                    disabled={checkBoxesMode === 'none'}
                                                    onValueChanged={onAllModeChanged}
                                                />
                                            </div>
                                            <div className="option checkboxes-mode">
                                                <SelectBox
                                                    id="show-checkboxes-mode"
                                                    inputAttr={showCheckboxesFieldLabel}
                                                    dataSource={showCheckBoxesModes}
                                                    value={checkBoxesMode}
                                                    onValueChanged={onCheckBoxesModeChanged}
                                                />
                                            </div>
                                        </div>
                                    </DataGrid>
                                    {popupVisible && (
                                        <div
                                            ref={popupRef}
                                            style={{
                                                top: `${popupCords.y}px`,
                                                left: `${popupCords.x + 200}px`,
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
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {viewAddMolecule && <Popup
                                        title="Add Molecule"
                                        visible={viewAddMolecule}
                                        contentRender={() => (
                                            <AddMolecule
                                                libraryId={library_id}
                                                projectId={params.id}
                                                userData={userData}
                                                setViewAddMolecule={setViewAddMolecule}
                                                callLibraryId={callLibraryId}
                                            />
                                        )}
                                        resizeEnabled={true}
                                        hideOnOutsideClick={true}
                                        defaultWidth={700}
                                        defaultHeight={'100%'}
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
                                                libraryId={library_id}
                                                projectId={params.id}
                                                userData={userData}
                                                setViewEditMolecule={setViewEditMolecule}
                                                callLibraryId={callLibraryId} />
                                        )}
                                        resizeEnabled={true}
                                        hideOnOutsideClick={true}
                                        defaultWidth={900}
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
                                                font-bold`
                                            }>Select All {tableData.length}
                                            </span>}
                                    </div>
                                </div >
                            }
                        </div >
                    </div >
                }
            </ div>
        </>
    )
}