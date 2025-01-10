/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Accordion, { Item } from 'devextreme-react/accordion';
import { Popup, } from "devextreme-react/popup";
import { Button } from "devextreme-react/button";
import { LibraryFields, ProjectDataFields, MoleculeStatusLabel, UserData } from "@/lib/definition";
import { sortByDate, sortNumber, sortString } from '@/utils/sortString';
import { deleteLibrary } from './service';
import {
    formatDatetime,
    formatDetailedDate,
    popupPositionValue,
    debounce,
    fetchMoleculeStatus,
    isDeleteLibraryEnable
} from '@/utils/helpers';
import TextWithToggle from "@/ui/TextWithToggle";
import { Messages } from "@/utils/message";
import CreateLibrary from './CreateLibrary';
import { FormRef } from "devextreme-react/cjs/form";
import DeleteConfirmation from "./DeleteConfirmation";
import { ClickEvent } from "devextreme/ui/button";

const urlHost = process.env.NEXT_PUBLIC_UI_APP_HOST_URL;

type LibraryAccordionType = {
    projectData: ProjectDataFields,
    setLoader: (value: boolean) => void,
    setSortBy: (value: string) => void,
    setProjects: (value: ProjectDataFields) => void,
    projectInitial: ProjectDataFields,
    projectId: string,
    sortBy: string,
    actionsEnabled: string[],
    fetchLibraries: () => void,
    userData: UserData,
    selectedLibraryId: number,
    /* getLibraryData: (value: LibraryFields) => void, */
    /* setSelectedLibraryName: (value: string) => void, */
    setExpanded: (value: boolean) => void,
    setLibraryId: (value: number) => void,
}

export default function LibraryAccordion({
    projectData,
    setLoader,
    setSortBy,
    setProjects,
    projectInitial,
    projectId,
    sortBy,
    actionsEnabled,
    fetchLibraries,
    userData,
    selectedLibraryId,
    /* getLibraryData, */
    setLibraryId,
    setExpanded,
}: LibraryAccordionType) {
    const router = useRouter();
    const createEnabled = actionsEnabled.includes('create_library');
    const { myRoles } = userData;
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [editPopupVisible, setEditPopupVisibility] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isExpanded, setIsExpanded] = useState<number[]>([]);
    const [selectedLibraryIdIdx, setSelectedLibraryIndex] = useState(-1);
    const [isProjectExpanded, setProjectExpanded] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [confirm, setConfirm] = useState(false);
    const [deleteLibraryData, setDeleteLibraryData] = useState({ id: 0, name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<FormRef>(null);

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);

    const checkDisabledField = (item: LibraryFields) => {
        const owner = item.owner_id === userData.id;
        const admin = ['admin', 'org_admin'].some((role) => myRoles?.includes(role));
        return !(owner || admin);
    }

    const renderTitle = (title: string) => (
        <div className="header-text text-black">{title}</div>
    );

    const sortByFields = ['Name', 'Owner', 'Updation time', 'Recent', 'Count of molecules'];

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setLoader(true);
        setSortBy(value);
        if (value) {
            let sortKey = value;
            let sortBy = 'asc';
            let object = false;
            let tempLibraries: LibraryFields[] = [];
            if (sortKey === 'Updation time') {
                sortKey = 'updated_at';
                sortBy = 'desc';
            } else if (sortKey === 'Recent') {
                sortKey = 'created_at';
                sortBy = 'desc';
            } else if (sortKey === 'Owner') {
                sortKey = 'owner.first_name';
                object = true;
            } else if (sortKey === 'Count of molecules') {
                sortKey = 'libraryMolecules';
                sortBy = 'desc';
            } else {
                sortKey = 'name';
            }
            if (sortKey === 'libraryMolecules') {
                tempLibraries = sortNumber(projectData.other_container, sortKey, sortBy);
            } else if (sortKey !== 'updated_at' && sortKey !== 'created_at') {
                tempLibraries = sortString(projectData.other_container, sortKey, sortBy, object);
            } else {
                tempLibraries = sortByDate(projectData.other_container, sortKey, sortBy);
            }
            const tempProjects = {
                ...projectData,
                other_container: tempLibraries,
            }
            setProjects(tempProjects);
        } else {
            setProjects(projectInitial);
        }
        setLoader(false);
    }

    const handleSearch = debounce((value: string) => {
        setLoader(true);
        if (value) {
            // Search OPT: 4
            if (projectData.other_container?.length) {
                const filteredLibraries = projectData.other_container?.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.libraryMolecules.length.toString().includes(value.toLowerCase())
                );
                const tempProjects = {
                    ...projectData,
                    other_container: filteredLibraries,
                }
                setProjects(tempProjects);
            } else {
                const filteredLibraries = projectInitial.other_container?.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.libraryMolecules.length.toString().includes(value.toLowerCase())
                );

                const tempProjects = {
                    ...projectData,
                    other_container: filteredLibraries,
                }
                setProjects(tempProjects);
            }
        }
        else {
            setProjects(projectInitial);
        }
        setLoader(false);
    }, 500);

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

    const searchLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        handleSearch(e.target.value);
    }

    const copyUrl = (type: string, name: string, id?: number) => {
        if (typeof window !== "undefined") {
            let url = `${urlHost}/projects/${projectId}`;
            if (type === 'library') url = `${urlHost}/projects/${projectId}?library_id=${id}`;
            navigator.clipboard.writeText(url)
                .then(() => toast.success(Messages.urlCopied(type, name)))
                .catch(() => toast.error(Messages.URL_COPY_ERROR));
        }
    }

    const handleDeleteLibrary = (library_id: number, library_name: string) => {
        setConfirm(true);
        setDeleteLibraryData({ id: library_id, name: library_name });
    }
    const deleteLibraryDetail = async () => {
        setIsLoading(true);
        const result = await deleteLibrary(deleteLibraryData.id);
        if (result.length === 0) {
            toast.success(Messages.LIBRARY_NOT_DELETE_MESSAGE);
            setIsLoading(false);
        }
        else {
            if (result.error) {
                toast.error(Messages.DELETE_LIBRARY_ERROR_MESSAGE);
                setIsLoading(false);
            }
            else {
                toast.success(Messages.DELETE_LIBRARY_MESSAGE);
                fetchLibraries();
                setIsLoading(false);

            }
        }
    }
    const handleCancel = () => {
        setConfirm(false)
    };
    return (
        <Accordion multiple={true} collapsible={true}>
            {confirm && (
                <DeleteConfirmation
                    onSave={() => deleteLibraryDetail()}
                    openConfirmation={confirm}
                    isLoader={isLoading}
                    setConfirm={() => handleCancel()}
                    msg={Messages.deleteLibraryMsg(deleteLibraryData.name)}
                    title={Messages.DELETE_LIBRARY_TITLE}
                />
            )}
            {/* Project Details Section */}
            <Item titleRender={
                () => renderTitle(`Project Details: ${projectData.name}`)}>
                <div>
                    <div className={
                        `library-name
                        text-normal
                        no-border
                        flex
                        items-center
                        justify-between`
                    }>
                        <div>
                            Project Owner:
                            <span>
                                {`${projectData?.owner?.first_name}
                                    ${projectData?.owner?.last_name}`}
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
                                    () => copyUrl('project', projectData.name)
                                }
                            />
                        </div>
                    </div>
                    <div className='library-name no-border text-normal'>
                        Target: <span>{projectData.metadata.target}</span>
                    </div>
                    {projectData.updated_at &&
                        <div className='library-name no-border text-normal'>

                            Last Modified: <span>
                                {formatDetailedDate(projectData.updated_at)}
                            </span>
                        </div>}
                    <div className='library-name no-border text-normal'>
                        {projectData.description ?
                            <TextWithToggle
                                text={projectData.description}
                                isExpanded={isProjectExpanded}
                                toggleExpanded={toggleExpanded}
                                id={projectData.id}
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
                            <span className={`text-normal mr-[5px] w-[43px]`}>
                                Sort by:
                            </span>
                            <select
                                value={sortBy}
                                className=
                                {`w-[122px] bg-transparent cursor-pointer font-normal
                                    text-normal text-themeBlueColor`}
                                onChange={(e) => handleSortChange(e)}>
                                {sortByFields.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='flex'>
                            {createEnabled &&
                                <Button
                                    text="Add Library"
                                    icon="plus"
                                    type="default"
                                    stylingMode='text'
                                    onClick={() => {
                                        setEditPopupVisibility(false);
                                        setCreatePopupVisibility(true);
                                    }}
                                    elementAttr={{ class: "btn-primary ml-[5px]" }}
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/plus-white.svg"
                                                width={15}
                                                height={13}
                                                alt="Add" />
                                            <span className='pl-[5px] text-normal'>
                                                Add Library</span>
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
                                            src="/icons/filter-active-icon.svg"
                                            width={9}
                                            height={12}
                                            alt="Filter"
                                        />
                                        <span className="pl-2 pt-[1px] text-themeBlueColor
                                        text-normal">
                                            Filter
                                        </span>
                                    </>
                                )}
                            />
                            <div
                                className={`search-box bg-themeSilverGreyColor`}
                            >
                                <Image
                                    src="/icons/search.svg"
                                    width={24}
                                    height={24}
                                    alt="Sort"
                                    className='search-icon'
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
                                dragEnabled={false}
                                contentRender={() => (
                                    <CreateLibrary
                                        formRef={formRef}
                                        setCreatePopupVisibility={
                                            setCreatePopupVisibility}
                                        fetchLibraries={fetchLibraries}
                                        userData={userData}
                                        projectData={projectData}
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
                                dragEnabled={false}
                                visible={editPopupVisible}
                                contentRender={() => (
                                    <CreateLibrary
                                        formRef={formRef}
                                        setCreatePopupVisibility={
                                            setEditPopupVisibility}
                                        fetchLibraries={fetchLibraries}
                                        userData={userData}
                                        projectData={projectData}
                                        library_idx={selectedLibraryIdIdx}
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
                    {projectData.other_container?.map((item, idx) => (
                        <div
                            key={item.id}
                            className={
                                `text-normal
                                library
                                mb-[10px]
                                cursor-pointer
                                ${(Number(selectedLibraryId) === Number(item.id)) ?
                                    'selected-accordion' : ''
                                }`
                            }
                            onClick={async (e) => {
                                const target = e.target as HTMLElement;
                                const editButtonId = `edit-${item.id}`;
                                const urlButtonId = `url-${item.id}`;
                                const deleteButtonId = `delete-${item.id}`

                                if (
                                    target.id === editButtonId ||
                                    target.id === urlButtonId ||
                                    target.id === deleteButtonId
                                ) {
                                    return;
                                }
                                const url =
                                    `/projects/${projectId}` +
                                    `?library_id=${item.id}`;
                                router.replace(url);
                                setLibraryId(item.id)
                                /* getLibraryData(item); */

                            }}>
                            <div className={
                                `library-name
                                text-normal
                                flex
                                justify-around
                                no-border`
                            }>
                                <div className='flex w-[55%] items-center'>
                                    <div className=
                                        {`flex`}>
                                        Library:
                                    </div>
                                    <span>{item.name}</span>
                                </div>
                                <div className=
                                    {`flex justify-between w-[45%] items-center`}>
                                    <div>Created On:
                                        <span>{
                                            formatDatetime(item.created_at)
                                        }
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={
                                `library-name
                                text-normal
                                flex 
                                justify-around 
                                no-border`
                            }>
                                <div className='flex w-[55%] items-center'>
                                    <div className=
                                        {`flex`}>
                                        Owner:
                                    </div>
                                    <span>
                                        {`${item.owner.first_name} ${item.owner.last_name}`}
                                    </span>
                                </div>
                                <div className='w-[45%] flex justify-start items-center'>
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
                                text-normal
                                flex
                                justify-around
                                no-border`
                            }>
                                <div className='flex w-[55%]'>
                                    <div className=
                                        {`flex`}>
                                        Target:
                                    </div>
                                    <span>{item.metadata.target}</span></div>
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
                                        text-normal
                                        gap-[10px]
                                        flex
                                        no-border`
                                    }>
                                    <div className="my-0.5">Molecules:
                                        <span>{item.libraryMolecules.length}</span>
                                    </div>
                                    <div className="gap-[10px] flex flex-wrap">
                                        {Object.entries(fetchMoleculeStatus(item))
                                            .map(([key, statusObject]) => {
                                                const statusObj = statusObject as
                                                    { count: number, className: string };
                                                return (
                                                    <span key={key} className={
                                                        `text-normal 
                                                        badge 
                                                        ${statusObj.className} 
                                                        float-left`
                                                    }>
                                                        <b className="pr-[5px]">
                                                            {statusObj.count}
                                                        </b>&nbsp;
                                                        {(MoleculeStatusLabel as any)[key]}
                                                    </span>
                                                )
                                            })}
                                    </div>
                                </div>
                            }
                            <div className='library-name no-border text-normal'>
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
                            <div className='flex justify-end gap-4'>
                                <Button
                                    text="Open"
                                    type="normal"
                                    stylingMode="contained"
                                    elementAttr={
                                        {
                                            class: "btn-primary"
                                        }
                                    }
                                    onClick={() => {
                                        setExpanded(false);
                                        const url =
                                            `/projects/${projectId}` +
                                            `?library_id=${item.id}`;
                                        setLibraryId(item.id)
                                        router.push(url);

                                        /* getLibraryData(item); */
                                    }}
                                />
                                {!checkDisabledField(item) && <Button
                                    text="Edit"
                                    type="normal"
                                    id={`edit-${item.id}`}
                                    stylingMode="contained"
                                    elementAttr={
                                        {
                                            class: "btn-secondary"
                                        }
                                    }
                                    onClick={(e: ClickEvent) => {
                                        e.event?.stopPropagation();
                                        setCreatePopupVisibility(false);
                                        setSelectedLibraryIndex(idx);
                                        setEditPopupVisibility(true);
                                    }}
                                />}
                                <Button
                                    text="URL"
                                    id={`url-${item.id}`}
                                    type="normal"
                                    stylingMode="contained"
                                    elementAttr={
                                        {
                                            class: "btn-secondary"
                                        }
                                    }
                                    onClick={(e: ClickEvent) => {
                                        e.event?.stopPropagation();
                                        copyUrl(
                                            'library',
                                            item.name,
                                            item.id)
                                    }}
                                />
                                {!checkDisabledField(item) &&
                                    isDeleteLibraryEnable(item?.libraryMolecules) &&
                                    <Button
                                        text="Delete"
                                        type="normal"
                                        id={`delete-${item.id}`}
                                        stylingMode="contained"
                                        elementAttr={
                                            {
                                                class: "btn-secondary"
                                            }
                                        }
                                        onClick={(e: ClickEvent) => {
                                            e.event?.stopPropagation();
                                            handleDeleteLibrary(item.id, item.name)
                                        }}
                                    />}
                            </div>
                        </div>
                    ))}
                    {projectData.other_container?.length == 0 && (
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
    )
}