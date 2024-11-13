/*eslint max-len: ["error", { "code": 100 }]*/
'use client'
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Accordion, { Item } from 'devextreme-react/accordion';
import { Popup, Position } from "devextreme-react/popup";
import { Button } from "devextreme-react/button";
import { LibraryFields, ProjectDataFields, UserData } from "@/lib/definition";
import { sortByDate, sortNumber, sortString } from '@/utils/sortString';
import {
    formatDatetime,
    formatDetailedDate,
    popupPositionValue,
    debounce,
    fetchMoleculeStatus
} from '@/utils/helpers';
import TextWithToggle from "@/ui/TextWithToggle";
import { Messages } from "@/utils/message";
import CreateLibrary from './CreateLibrary';
import { FormRef } from "devextreme-react/cjs/form";

const urlHost = process.env.NEXT_PUBLIC_UI_APP_HOST_URL;

type LibraryAccordionType = {
    projects: ProjectDataFields,
    setLoader: (value: boolean) => void,
    setSortBy: (value: string) => void,
    setProjects: (value: ProjectDataFields) => void,
    initProjects: ProjectDataFields,
    projectId: string,
    sortBy: string,
    actionsEnabled: string[],
    fetchLibraries: () => void,
    userData: UserData,
    selectedLibrary: number,
    getLibraryData: (value: LibraryFields) => void,
    setSelectedLibrary: (value: number) => void,
    setSelectedLibraryName: (value: string) => void,
    setExpanded: (value: boolean) => void,
}

export default function LibraryAccordion({
    projects,
    setLoader,
    setSortBy,
    setProjects,
    initProjects,
    projectId,
    sortBy,
    actionsEnabled,
    fetchLibraries,
    userData,
    selectedLibrary,
    getLibraryData,
    setSelectedLibrary,
    setSelectedLibraryName,
    setExpanded,
}: LibraryAccordionType) {
    const router = useRouter();
    const createEnabled = actionsEnabled.includes('create_library');
    const { myRoles } = userData;

    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [editPopupVisible, setEditPopupVisibility] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandMenu, setExpandedMenu] = useState(-1);
    const [isExpanded, setIsExpanded] = useState<number[]>([]);
    const [selectedLibraryIdx, setSelectedLibraryIndex] = useState(-1);
    const [isProjectExpanded, setProjectExpanded] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [editEnabled, setEditStatus] = useState<boolean>(false);

    const formRef = useRef<FormRef>(null);

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);

    const checkDisabled = (item: LibraryFields) => {
        setEditStatus(checkDisabledField(item));
    }

    const checkDisabledField = (item: LibraryFields) => {
        const owner = item.ownerId === userData.id;
        const admin = ['admin', 'org_admin'].some((role) => myRoles?.includes(role));
        return !(owner || admin);
    }

    const renderTitle = (title: string) => (
        <div className="header-text text-black">{title}</div>
    );

    const sortByFields = ['Name', 'Owner', 'Updation Time', 'Creation Time', 'Count of Molecules'];

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
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
            const tempProjects = {
                ...projects,
                libraries: tempLibraries,
            }
            setProjects(tempProjects);
        } else {
            setProjects(initProjects);
        }
        setLoader(false);
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
                const tempProjects = {
                    ...projects,
                    libraries: filteredLibraries,
                }
                setProjects(tempProjects);
            } else {
                const filteredLibraries = initProjects.libraries.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.owner.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    item.molecule.length.toString().includes(value.toLowerCase())
                );
                const tempProjects = {
                    ...projects,
                    libraries: filteredLibraries,
                }
                setProjects(tempProjects);
            }
        }
        else {
            setProjects(initProjects);
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

    return (
        <Accordion multiple={true} collapsible={true}>
            {/* Project Details Section */}
            <Item titleRender={
                () => renderTitle(`Project Details: ${projects.name}`)}>
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
                    <div className='library-name no-border text-normal'>
                        Target: <span>{projects.target}</span>
                    </div>
                    <div className='library-name no-border text-normal'>
                        Last Modified: <span>
                            {formatDetailedDate(projects.updated_at)}
                        </span>
                    </div>
                    <div className='library-name no-border text-normal'>
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
                            <span className={`text-normal mr-[5px]`}>
                                sort by:
                            </span>
                            <select
                                value={sortBy}
                                className=
                                {`w-[145px] bg-transparent cursor-pointer`}
                                onChange={(e) => handleSortChange(e)}>
                                {sortByFields.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
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
                                `text-normal
                                library
                                mb-[10px]
                                cursor-pointer
                                ${(selectedLibrary === item.id) ?
                                    'selected-accordion' : ''
                                }`
                            }
                            onClick={async () => {
                                getLibraryData(item);
                            }}>
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
                                        `mb-[20px] ${!editEnabled ?
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
                                text-normal
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
                                        text-normal
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
                                                            `text-normal badge ${type}`
                                                        }
                                                    >
                                                        <b
                                                            className="pr-[5px]"
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
                                            `/projects/${projectId}` +
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
    )
}