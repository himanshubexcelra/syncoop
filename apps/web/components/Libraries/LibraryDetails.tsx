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
    BreadCrumbsObj,
} from '@/lib/definition';
import DataGrid, {
    Item as ToolbarItem,
    Column,
    Toolbar as GridToolbar,
    DataGridRef,
    Paging,
    Sorting,
    Selection,
    DataGridTypes,
} from "devextreme-react/data-grid";
import { Popup, Position } from "devextreme-react/popup";
import { Button } from "devextreme-react/button";
import { SelectBox } from 'devextreme-react/select-box';
import { useSearchParams, useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import '../Organization/form.css';
import { MOLECULES, StatusCodeBg, StatusCodeType } from '@/utils/constants';
import { FormRef } from "devextreme-react/cjs/form";
import StatusMark from '@/ui/StatusMark';
import { formatDatetime, formatDetailedDate, popupPositionValue, debounce } from '@/utils/helpers';
import { getLibraries, addMoleculeToCart, getMoleculeCart } from './libraryService';
import { sortByDate, sortString } from '@/utils/sortString';
import { Messages } from "@/utils/message";
import Textbox, { TextBoxTypes } from 'devextreme-react/text-box';
import TextWithToggle from '@/ui/TextWithToggle';
import CreateLibrary from './CreateLibrary';
import { DELAY } from "@/utils/constants";
import { delay } from "@/utils/helpers";
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import { useContext } from "react";
import { AppContext } from "../../app/AppState";


const selectAllFieldLabel = { 'aria-label': 'Select All Mode' };
const showCheckboxesFieldLabel = { 'aria-label': 'Show Checkboxes Mode' };

const showCheckBoxesModes = ['none', 'onClick', 'onLongTap', 'always'];
const selectAllModes = ['allPages', 'page'];

const sortByFields = ['Name', 'Owner', 'UpdationTime', 'CreationTime'];

const initialProjectData: ProjectDataFields = {
    name: '',
    id: 0,
    description: '',
    organizationId: undefined,
    organization: {} as OrganizationDataFields, // Provide a default organization object
    user: {} as userType, // Provide a default user object
    sharedUsers: [],
    target: '',
    type: '',
    updatedBy: {} as userType, // Provide a default user object
    updatedAt: new Date(),
    userId: undefined,
    owner: {} as User, // Provide a default owner object
    ownerId: 0,
    orgUser: undefined,
    createdAt: new Date(),
    libraries: [] as unknown as LibraryFields[], // Initialize as an array if multiple libraries are expected
};

type LibraryDetailsProps = {
    userData: UserData,
    actionsEnabled: string[],
    breadcrumbs: BreadCrumbsObj[]
}
type ProductModel = {
    id: number;
    moleculeId: number;
    molecularWeight: number;
    projectId: number;
    projectName: string;
};
const urlHost = process.env.NEXT_PUBLIC_UI_APP_HOST_URL;

export default function LibraryDetails({ userData, actionsEnabled, breadcrumbs }: LibraryDetailsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ id: string }>();
    const libraryId = searchParams.get('libraryId');
    const [tableData, setTableData] = useState<OrganizationDataFields[]>([]);
    const [projects, setProjects] = useState<ProjectDataFields>(initialProjectData);
    const [initProjects, setInitProjects] = useState<ProjectDataFields>(initialProjectData);
    const [selectedLibrary, setSelectedLibrary] = useState(libraryId ? parseInt(libraryId, 10) : '');
    const [selectedLibraryName, setSelectedLibraryName] = useState('untitled');
    const [loader, setLoader] = useState(true);
    const [allMode, setAllMode] = useState<DataGridTypes.SelectAllMode>('allPages');
    const [expanded, setExpanded] = useState(libraryId ? false : true);
    const [checkBoxesMode, setCheckBoxesMode] = useState<DataGridTypes.SelectionColumnDisplayMode>('always');
    const [searchValue, setSearchValue] = useState('');
    const [expandMenu, setExpandedMenu] = useState(-1);
    const [isExpanded, setIsExpanded] = useState<number[]>([]);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [editPopupVisible, setEditPopupVisibility] = useState(false);
    const [selectedLibraryIdx, setSelectedLibraryIndex] = useState(-1);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [isProjectExpanded, setProjectExpanded] = useState(false);
    const [editEnabled, setEditStatus] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState('CreationTime');
    const [breadcrumbValue, setBreadCrumbs] = useState(breadcrumbs);
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const [moleculeData, setMoleculeData] = useState<ProductModel[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Store selected item IDs

    const [isCartUpdate, updateCart] = useState(false)


    let toastShown = false;

    const grid = useRef<DataGridRef>(null);
    const formRef = useRef<FormRef>(null);

    const { myRoles } = userData;

    const createEnabled = actionsEnabled.includes('create_library') || myRoles?.includes('admin') || myRoles?.includes('org_admin')


    const fetchLibraries = async () => {
        const projectData = await getLibraries(['libraries'], params.id);
        if (projectData) {
            setTableData(MOLECULES);
            const sortKey = 'createdAt';
            const sortBy = 'desc';
            const tempLibraries = sortByDate(projectData.libraries, sortKey, sortBy);
            setProjects({ ...projectData, libraries: tempLibraries });
            setInitProjects({ ...projectData, libraries: tempLibraries });
            const breadcrumbTemp = [...breadcrumbs];
            breadcrumbTemp[1].label = `Project: ${projectData.name}`;
            breadcrumbTemp[1].href = `/projects/${params.id}`;
            if (libraryId) {
                const selectedLib = projectData.libraries.filter((library: LibraryFields) => library.id === parseInt(libraryId, 10));
                const libName = selectedLib[0].name;
                setSelectedLibraryName(libName);
                breadcrumbTemp.push({
                    label: tempLibraries[0]?.name,
                    svgPath: "/icons/libraries.svg",
                    svgWidth: 16,
                    svgHeight: 16,
                    href: `/projects/${params.id}?libraryId=${libraryId}`,
                    isActive: true,
                })
            } else {
                const libName = tempLibraries[0]?.name || 'untitled';
                setSelectedLibraryName(libName);
                setSelectedLibrary(tempLibraries[0]?.id);
                setSortBy('CreationTime');
                breadcrumbTemp[1].isActive = true;
            }
            setBreadCrumbs(breadcrumbTemp);
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

    useEffect(() => {
        const fetchCartData = async () => {
            const moleculeCart: any = libraryId ? await getMoleculeCart(Number(libraryId)) : [];
            const moleculeIds = moleculeCart.map(item => item.moleculeId);
            setSelectedRowKeys(moleculeIds) // For pre selected value containing only moleculeID required for dev-extreme []
        };
        fetchCartData();
    }, [libraryId]);

    useEffect(() => {
        fetchLibraries();
    }, []);

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);


    const onCheckBoxesModeChanged = useCallback(({ value }: any) => {
        setCheckBoxesMode(value);
    }, []);

    const onAllModeChanged = useCallback(({ value }: any) => {
        setAllMode(value);
    }, []);

    const bookMarkItem = () => {
    }

    const handleSortChange = (value: string) => {
        setLoader(true);
        setSortBy(value);
        if (value) {
            let sortKey = value;
            let sortBy = 'asc';
            let object = false;
            let tempLibraries: LibraryFields[] = [];
            if (sortKey === 'UpdationTime') {
                sortKey = 'updatedAt';
                sortBy = 'desc';
            } else if (sortKey === 'CreationTime') {
                sortKey = 'createdAt';
                sortBy = 'desc';
            } else if (sortKey === 'Owner') {
                sortKey = 'owner.firstName';
                object = true;
            } else {
                sortKey = 'name';
            }

            if (sortKey !== 'updatedAt' && sortKey !== 'createdAt')
                tempLibraries = sortString(projects.libraries, sortKey, sortBy, object);
            else tempLibraries = sortByDate(projects.libraries, sortKey, sortBy);
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
            if (type === 'library') url = `${urlHost}/projects/${params.id}?libraryId=${id}`;
            navigator.clipboard.writeText(url)
                .then(() => toast.success(Messages.urlCopied(type, name)))
                .catch(() => toast.error(Messages.URL_COPY_ERROR));
        }
    }


    const handleSearch = debounce((value: string) => {
        setLoader(true);
        if (value) {
            const filteredLibraries = projects.libraries.filter((item) =>
                item.name.toLowerCase().includes(value.toLowerCase()) ||
                item.description?.toLowerCase().includes(value.toLowerCase()) ||
                item.owner.firstName.toLowerCase().includes(value.toLowerCase()) ||
                item.owner.lastName.toLowerCase().includes(value.toLowerCase())
            );
            setProjects((prevState) => ({
                ...prevState,
                libraries: filteredLibraries,
            }));
        }
        else {
            setProjects(initProjects);
        }
        setLoader(false);
    }, 500);

    const searchLibrary = (e: TextBoxTypes.ValueChangedEvent) => {
        const { value } = e;
        setSearchValue(value);
        handleSearch(value);
    }

    const renderTitle = (title: string) => (
        <div className="accordion-title">{title}</div> // Add your custom class here
    );

    const toggleExpanded = (id: number, type: string) => {
        if (type === 'library') {
            let expandedDescription = [...isExpanded];
            if (expandedDescription.includes(id)) {
                expandedDescription = expandedDescription.filter(descriptionId => descriptionId !== id);
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
        const admin = myRoles?.includes("admin") || myRoles?.includes("org_admin");
        return !(owner || admin);
    }

    const onSelectionChanged = async (e: any) => {
        updateCart(true);
        // Check if the data exists in storage
        setSelectedRowKeys(e.selectedRowKeys);
        const checkedMolecule = e.selectedRowsData;
        const selectedProjectMolecule = checkedMolecule.map(item => ({
            ...item,
            libraryId: libraryId,
            userId: userData.id
        }));
        const moleculeCart = libraryId ? await getMoleculeCart(Number(libraryId)) : [];
        const preselectedIds = moleculeCart.map(item => item.moleculeId);
        const updatedMoleculeCart = selectedProjectMolecule.filter(item => !preselectedIds.includes(item.moleculeId));
        // If the check box is unchecked
        if (e.currentDeselectedRowKeys.length > 0) {
            const newmoleculeData: ProductModel[] = checkedMolecule.filter((item: any) => item.id !== e.currentDeselectedRowKeys[0].id && item.projectId !== projects.id);
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
        toast.success('Molecule is updated in your cart.');
    }

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbValue} />
            <div className='p-[20px]'>
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
                            {expanded && (
                                <div className='w-[40vw] projects'>
                                    <Accordion multiple={true} collapsible={true}>
                                        {/* Project Details Section */}
                                        <Item titleRender={() => renderTitle(`Project Details: ${projects.name}`)}>
                                            <div>
                                                <div className='library-name no-border flex items-center justify-between'>
                                                    <div>
                                                        Project Owner:
                                                        <span>{projects.owner.firstName} {projects.owner.lastName}</span>
                                                    </div>
                                                    <div className='flex'>
                                                        <Button
                                                            text="Manage Users"
                                                            type="normal"
                                                            stylingMode="contained"
                                                            elementAttr={{ class: "form_btn_primary mr-[20px]" }}
                                                            disabled={true}
                                                        />
                                                        <Button
                                                            text="Link"
                                                            type="normal"
                                                            stylingMode="contained"
                                                            elementAttr={{ class: "btn-primary" }}
                                                            onClick={() => copyUrl('project', projects.name)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='library-name no-border'>
                                                    Target: <span>{projects.target}</span>
                                                </div>
                                                <div className='library-name no-border'>
                                                    Last Modified: <span>{formatDetailedDate(projects.updatedAt)}</span>
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
                                                <div className='flex justify-between items-center p-2'>
                                                    <div className='flex items-center'>
                                                        <span className='select-header mr-[5px]'>sort by:</span>
                                                        <SelectBox
                                                            dataSource={sortByFields}
                                                            value={sortBy}
                                                            itemRender={sortItemsRender}
                                                            className='w-[130px] bg-transparent library-select'
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
                                                                    <span className='pl-2 pt-[1px]'>Add Library</span>
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
                                                        <div className="search-box">
                                                            <Image
                                                                src="/icons/search.svg"
                                                                width={24}
                                                                height={24}
                                                                alt="Sort"
                                                                className='search-icon library-search'
                                                            />
                                                            <Textbox
                                                                placeholder="Search"
                                                                className="search-input"
                                                                width={120}
                                                                inputAttr={{
                                                                    style: { paddingRight: '30px' }
                                                                }}
                                                                value={searchValue}
                                                                valueChangeEvent="keyup"
                                                                onValueChanged={searchLibrary}
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
                                                                    setCreatePopupVisibility={setCreatePopupVisibility}
                                                                    fetchLibraries={fetchLibraries}
                                                                    userData={userData}
                                                                    projectData={projects}
                                                                    libraryIdx={-1}
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
                                                            wrapperAttr={{ class: "create-popup mr-[15px]" }}
                                                        />
                                                    )}
                                                </div>
                                                {editPopupVisible && (
                                                    <Popup
                                                        title="Edit Library"
                                                        visible={editPopupVisible}
                                                        contentRender={() => (
                                                            <CreateLibrary
                                                                formRef={formRef}
                                                                setCreatePopupVisibility={setEditPopupVisibility}
                                                                fetchLibraries={fetchLibraries}
                                                                userData={userData}
                                                                projectData={projects}
                                                                libraryIdx={selectedLibraryIdx}
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
                                                        wrapperAttr={{ class: "create-popup mr-[15px]" }}
                                                    />
                                                )}
                                                {projects.libraries.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        className={`box-item library mb-[10px] cursor-pointer ${selectedLibrary === item.id ? 'selected-accordion' : ''}`}
                                                        onClick={() => {
                                                            setSelectedLibrary(item.id);
                                                            setSelectedLibraryName(item.name);
                                                        }}>
                                                        <div className='library-name flex justify-around no-border'>
                                                            <div className='flex w-[55%]'><div className="w-[20%] flex justify-end">Library: </div><span>{item.name}</span></div>
                                                            <div className='flex justify-between w-[45%]'>
                                                                <div>Created On: <span>{formatDatetime(item.createdAt)}</span></div>
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
                                                                className={`mb-[20px] ${!editEnabled ? 'cursor-pointer' : ''}`}
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
                                                                onClick={() => copyUrl('library', item.name, item.id)}
                                                            >
                                                                URL
                                                            </p>
                                                        </Popup>
                                                        <div className='library-name flex justify-around no-border'>
                                                            <div className='flex w-[55%]'>
                                                                <div className="w-[20%] flex justify-end">Owner:</div>
                                                                <span>{item.owner.firstName} {item.owner.lastName}</span>
                                                            </div>
                                                            <div className='w-[45%] flex justify-start'>
                                                                {item.updatedBy &&
                                                                    <>
                                                                        Last Updated By:
                                                                        <span>{item.updatedBy.firstName} {item.updatedBy.lastName}</span>
                                                                    </>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className='library-name flex justify-around no-border'>
                                                            <div className='flex w-[55%]'>
                                                                <div className="w-[20%] flex justify-end">Target: </div>
                                                                <span>{item.target}</span></div>
                                                            <div className='w-[45%]'>
                                                                {item.updatedAt &&
                                                                    <>
                                                                        Last Updated On:
                                                                        <span>{formatDatetime(item.updatedAt)}</span>
                                                                    </>
                                                                }
                                                            </div>
                                                        </div>
                                                        {
                                                            item.status &&
                                                            <div
                                                                className='library-name gap-[10px] flex mt-[8px] flex-wrap justify-around no-border'>
                                                                <div>Molecules:
                                                                    {item.status?.map(val => (
                                                                        <span
                                                                            key={val.name}
                                                                            className={`badge ${val.type}`}
                                                                        >
                                                                            {val.count} {val.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        }
                                                        < div className='library-name no-border' >
                                                            {
                                                                item.description ?
                                                                    <TextWithToggle
                                                                        text={item.description}
                                                                        isExpanded={isExpanded.includes(item.id)}
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
                                                                elementAttr={{ class: "btn-primary mr-[20px]" }}
                                                                onClick={() => {
                                                                    setSelectedLibrary(idx);
                                                                    setSelectedLibraryName(item.name);
                                                                    setExpanded(false);
                                                                    router.push(`/projects/${params.id}?libraryId=${item.id}`)
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {projects.libraries.length == 0 && (
                                                    <div className='flex justify-center items-center p-[40px] h-[70px] nodata'>
                                                        Your library list is empty, add a library to import molecules
                                                    </div>
                                                )}
                                            </div>
                                        </Item>
                                    </Accordion>
                                </div>
                            )
                            }
                            <div className={`border border-solid ${expanded ? 'w-[60vw]' : 'w-100vw'}`}>
                                <DataGrid
                                    dataSource={tableData}
                                    showBorders={true}
                                    ref={grid}
                                    keyExpr="moleculeId"
                                    selectedRowKeys={selectedRowKeys}
                                    onSelectionChanged={onSelectionChanged}

                                >
                                    <Selection
                                        mode="multiple"
                                        selectAllMode={allMode}
                                        showCheckBoxesMode={checkBoxesMode}
                                    />
                                    <Paging defaultPageSize={10} defaultPageIndex={0} />
                                    <Sorting mode="single" />
                                    <Column
                                        dataField="bookmark"
                                        width={90}
                                        alignment="center"
                                        allowSorting={false}
                                        headerCellRender={() =>
                                            <Image
                                                src="/icons/star.svg"
                                                width={24}
                                                height={24}
                                                alt="Create"
                                            />
                                        }
                                        cellRender={() => (
                                            <span className='flex justify-center cursor-pointer' onClick={bookMarkItem}>
                                                <Image
                                                    src="/icons/star-filled.svg"
                                                    width={24}
                                                    height={24}
                                                    alt="Create"
                                                />
                                            </span>
                                        )}
                                    />
                                    <Column dataField="Structure"
                                        minWidth={150}
                                        cellRender={() => (
                                            <span className='flex justify-center gap-[7.5px]' onClick={bookMarkItem}>
                                                <Image
                                                    src="/icons/libraries.svg"
                                                    width={24}
                                                    height={24}
                                                    alt="Create"
                                                />
                                                <Button
                                                    disabled={true}
                                                    render={() => (
                                                        <>
                                                            <Image
                                                                src="/icons/edit.svg"
                                                                width={24}
                                                                height={24}
                                                                alt="edit"
                                                            />
                                                        </>
                                                    )}
                                                />
                                                <Button
                                                    disabled={true}
                                                    render={() => (
                                                        <>
                                                            <Image
                                                                src="/icons/zoom.svg"
                                                                width={24}
                                                                height={24}
                                                                alt="zoom"
                                                            />
                                                        </>
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
                                    <Column dataField="moleculeId" caption="Molecule ID" />
                                    <Column dataField="molecularWeight" caption="Molecular Weight" />
                                    <Column dataField="status" cellRender={({ data }: any) => (
                                        <span className={`flex items-center gap-[5px]`}>
                                            {data.status}
                                            <StatusMark status={data.status} />
                                        </span>
                                    )} />
                                    <Column dataField="analyse" />
                                    <Column dataField="herg" caption="HERG" cellRender={({ data }) => {
                                        let color: StatusCodeType = 'ready';
                                        if (data.herg <= 0.5) color = 'failed';
                                        else if (data.herg >= 0.5 && data.herg < 1) color = 'info';
                                        else if (data.herg >= 1) color = 'done';
                                        return (
                                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                                {data.herg}
                                            </span>
                                        )
                                    }} />
                                    <Column dataField="caco2" caption="CACO-2" cellRender={({ data }) => {
                                        let color: StatusCodeType = 'ready';
                                        if (data.caco2 <= 0.5) color = 'failed';
                                        else if (data.caco2 >= 0.5 && data.caco2 < 1) color = 'info';
                                        else if (data.caco2 >= 1) color = 'done';
                                        return (
                                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                                {data.caco2}
                                            </span>
                                        )
                                    }} />
                                    <Column dataField="clint" caption="cLint" cellRender={({ data }) => {
                                        let color: StatusCodeType = 'ready';
                                        if (data.clint <= 0.5) color = 'failed';
                                        else if (data.clint >= 0.5 && data.clint < 1) color = 'info';
                                        else if (data.clint >= 1) color = 'done';
                                        return (
                                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                                {data.clint}
                                            </span>
                                        )
                                    }} />
                                    <Column dataField="hepg2cytox" caption="HepG2-cytox" cellRender={({ data }) => {
                                        let color: StatusCodeType = 'ready';
                                        if (data.hepg2cytox <= 0.5) color = 'failed';
                                        else if (data.hepg2cytox >= 0.5 && data.hepg2cytox < 1) color = 'info';
                                        else if (data.hepg2cytox >= 1) color = 'done';
                                        return (
                                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                                {data.hepg2cytox}
                                            </span>
                                        )
                                    }} />
                                    <Column dataField="solubility" cellRender={({ data }) => {
                                        let color: StatusCodeType = 'ready';
                                        if (data.solubility <= 0.5) color = 'failed';
                                        else if (data.solubility >= 0.5 && data.solubility < 1) color = 'info';
                                        else if (data.solubility >= 1) color = 'done';
                                        return (
                                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                                {data.solubility}
                                            </span>
                                        )
                                    }} />

                                    <GridToolbar>
                                        <ToolbarItem location="after">
                                            <Button
                                                text="Add Molecule"
                                                icon="plus"
                                                disabled={true}
                                                render={(buttonData: any) => (
                                                    <>
                                                        <Image
                                                            src="/icons/plus.svg"
                                                            width={24}
                                                            height={24}
                                                            alt="Create"
                                                        />
                                                        <span className='ml-[5px]'>{buttonData.text}</span>
                                                    </>
                                                )}
                                            />
                                        </ToolbarItem>
                                        <ToolbarItem location="after">
                                            <Button
                                                text="Filter"
                                                icon="filter"
                                                elementAttr={{ class: "ml-[5px]" }}
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
                                        </ToolbarItem>
                                        <ToolbarItem location="after">
                                            <Button
                                                onClick={addProductToCart}
                                                disabled={!isCartUpdate}
                                                render={() => (
                                                    <>
                                                        <span>Add to cart</span>
                                                    </>
                                                )}
                                            />
                                        </ToolbarItem>
                                    </GridToolbar>
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
                            </div>
                        </div >
                    </div >
                }
            </div>
        </>
    )
}

