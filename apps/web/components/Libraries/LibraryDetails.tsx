/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import { useState, useEffect, useContext } from 'react';
import { AppContext } from "../../app/AppState";
import Image from "next/image";
import toast from "react-hot-toast";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {
    OrganizationDataFields,
    ProjectDataFields,
    userType,
    User,
    LibraryFields,
    UserData,
    MoleculeType,
    ContainerPermission,
    ContainerType,
    AssayFieldList,
} from '@/lib/definition';
import { useSearchParams, useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import {
    getLibraries,
    /* getLibraryById, */
} from './service';
import { Messages } from "@/utils/message";
import { DELAY } from "@/utils/constants";
import Accordion, { Item } from 'devextreme-react/accordion';
import ADMESelector from "../ADMEDetails/ADMESelector";
import {
    delay, getUTCTime, isAdmin,
    isContainerAccess, isCustomReactionCheck
} from "@/utils/helpers";
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import LibraryAccordion from './LibraryAccordion';
import MoleculeList from './MoleculeList';
import usePopupAndReset from '../usePopupandReset/usePopupAndReset';
import FunctionalAssay from '../FunctionalAssays/FunctionalAssay';

type breadCrumbParams = {
    projectTitle?: string,
    projectHref?: string,
    projectSvg?: string,
    projectState?: boolean,
    orgData?: OrganizationDataFields
    roles: string[],
}

const breadcrumbArr = ({
    projectTitle = '',
    projectHref = '',
    projectSvg = '',
    projectState = false,
    orgData,
    roles,
}: breadCrumbParams) => {
    const admin = isAdmin(roles)
    return [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        ...(orgData
            ? [{
                label: orgData?.name || '',
                svgPath: "/icons/org-icon-inactive.svg",
                svgWidth: 16,
                svgHeight: 16,
                href: `/organization/${orgData?.id}`,
                isActive: false,
            }]
            : []),
        ...(admin ? [{
            label: 'Projects',
            svgPath: '/icons/project-inactive.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: orgData ?
                `/organization/${orgData?.id}/projects/`
                : '/projects',
        }] : []),
        {
            label: `Project: ${projectTitle}`,
            svgPath: projectSvg || "/icons/project-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: orgData
                ? `/organization/${orgData?.id}/projects${projectHref}`
                : `/projects${projectHref}`,
            isActive: projectState
        },
    ];
}

const initialProjectData: ProjectDataFields = {
    name: '',
    id: 0,
    description: '',
    parent_id: undefined,
    container: {} as OrganizationDataFields, // Provide a default organization object
    user: {} as userType, // Provide a default user object
    container_access_permission: [],
    metadata: {
        target: '',
        type: ''
    },
    userWhoUpdated: {} as userType, // Provide a default user object
    userWhoCreated: {} as userType, // Provide a default user object
    updated_at: new Date(),
    owner: {} as User, // Provide a default owner object
    owner_id: 0,
    orgUser: undefined,
    created_at: getUTCTime(new Date().toISOString()),
    other_container: [] as LibraryFields[],
    inherits_configuration: true,
    inherits_bioassays: true,
};

type LibraryDetailsProps = {
    userData: UserData;
    actionsEnabled: string[];
    organizationId?: string;
    projectId?: string;
}

export default function LibraryDetails(props: LibraryDetailsProps) {
    const { userData, actionsEnabled, organizationId } = props;
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams<{ id?: string, projectId?: string }>();
    const [library_id, setLibraryId] = useState<number>(Number(searchParams.get('library_id')));
    const [assays, setShowAssays] = useState(searchParams.get('assays'));
    const [project_id, setProjectId] = useState(params.projectId || params.projectId!);
    const [organization_id, setOrganizationId] = useState(organizationId);
    const [tableData, setTableData] = useState<MoleculeType[]>([]);
    const [projectData, setProjects] = useState<ProjectDataFields>(initialProjectData);
    const [projectInitial, setInitProjects] = useState<ProjectDataFields>(initialProjectData);
    /* const [selectedLibrary, setSelectedLibrary] =
        useState(library_id ? Number(library_id) : -1); */
    const [selectedLibraryName, setSelectedLibraryName] = useState('');
    const [selectedLibraryData, setSelectedLibraryData] = useState<any>({});
    const [loader, setLoader] = useState(true);
    const [expanded, setExpanded] = useState(library_id && !assays ? false : true);
    const [expandedAssayIndex, setExpandedAssay] = useState(library_id && assays ? 1 : 0)
    const [adminAccess, setAdminAccess] = useState<boolean>(false);
    const [adminLibAccess, setAdminLibAccess] = useState<boolean>(false);
    const [editLibAccess, setEditLibAccess] = useState<boolean>(false);
    const [editEnabled, setEditAccess] = useState<boolean>(false);
    const [assayValue, setAssays] = useState<AssayFieldList[]>([]);
    const context: any = useContext(AppContext);
    const {
        reset,
        showPopup,
        childRef,
        popup,
        setShowPopup,
        isDirty,
        setReset,
        selectType,
        setDirtyField,
        onSelectedIndexChange,
    } = usePopupAndReset();
    const appContext = context.state;
    const [delayedExpand, setDelayedExpand] = useState(false);
    const [sortBy, setSortBy] = useState('Recent');
    const [breadcrumbValue, setBreadCrumbs] =
        useState(breadcrumbArr({ roles: userData.myRoles }));

    let toastShown = false;

    // OPT: 7
    /* const getLibraryData = async (item: LibraryFields) => {
        setLibraryId(item.id);
        setSelectedLibraryName(item.name);
        const libraryData =
            await getLibraryById(['molecule'],
                item.id.toString());
        setTableData(libraryData.libraryMolecules || []);
    } */

    const fetchLibraries = async (setSelectedLibrary: boolean = false) => {
        const params: object = {
            with: ['libraries', 'molecules'],
            project_id
        }
        const projectData = await getLibraries(params);
        // let selectedLib = null;
        /* let selectedLib = { name: '' }; */
        /* if (library_id && !projectData.error) {
            selectedLib = projectData.other_container.find(
                (library: LibraryFields) => Number(library.id) === Number(library_id));
        } */
        if (!projectData.error /* && !!selectedLib */) {
            /* const sortKey = 'created_at';
            const sortBy = 'desc';
            const tempLibraries = sortByDate(projectData.other_container, sortKey, sortBy); */
            // setProjects({ ...projectData, libraries: tempLibraries });
            // setInitProjects({ ...projectData, libraries: tempLibraries });
            // OPT: 8
            setProjects({ ...projectData });
            setInitProjects({ ...projectData });
            setOrganizationId(projectData.parent_id);
            setSortBy('Recent');
            if (setSelectedLibrary && projectData.other_container.length) {
                setLibraryId(projectData.other_container[0].id);
            }
            const breadcrumbTemp = breadcrumbArr({
                projectTitle: `${projectData.name}`,
                projectHref: `/${project_id}`,
                orgData: (organizationId) ? projectData.container : '',
                roles: userData.myRoles,
                projectState: true,
            });

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
        setDelayedExpand(false)
        const timer = setTimeout(() => {
            setDelayedExpand(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [expanded]);
    useEffect(() => {
        const sharedUser = isContainerAccess(projectData.container_access_permission,
            userData.id, ContainerPermission.Admin);
        const owner = projectData.owner_id === userData.id;
        const admin = isAdmin(userData.myRoles);
        setAdminAccess(actionsEnabled.includes('edit_project')
            && (!!sharedUser || owner || admin))
        const editUser = isContainerAccess(projectData.container_access_permission,
            userData.id, ContainerPermission.Edit);
        setEditAccess(actionsEnabled.includes('create_molecule') &&
            (!!editUser || owner || admin))
    }, [projectData?.id]);

    useEffect(() => {
        setProjectId(params.id || params.projectId!)
        fetchLibraries();
    }, [params.id, params.projectId, appContext?.cartDetail,
    projectData.other_container?.length, appContext?.refreshAssayTable]);

    useEffect(() => {
        if (searchParams.get('assays') && searchParams.get('library_id')) {
            setLibraryId(Number(searchParams.get('library_id')));
            setShowAssays('true');
            setExpandedAssay(1);
            setExpanded(true)
        }
    }, [searchParams]);

    useEffect(() => {
        if (projectData) {
            const libraries = projectData.other_container;
            if (libraries?.length) {
                const libraryData = library_id ? libraries.find((library: LibraryFields) => {
                    return Number(library.id) === Number(library_id)
                }) : null;
                setSelectedLibraryData(libraryData);
                if (libraryData) {
                    // if (library_id != libraryData.id) {
                    setLibraryId(libraryData.id);
                    setSelectedLibraryName(libraryData.name);
                    setAssayFieldValue(libraryData);
                    setAdminLibAccess(adminAccess ||
                        !!isContainerAccess(libraryData.container_access_permission,
                            userData.id, ContainerPermission.Admin));
                    setEditLibAccess(
                        !!isContainerAccess(libraryData.container_access_permission,
                            userData.id, ContainerPermission.Edit));
                    // }
                    let breadcrumbTemp = breadcrumbArr({
                        projectTitle: `${projectData.name}`,
                        projectHref: `/${project_id}`,
                        orgData: (organizationId) ? projectData.container : undefined,
                        roles: userData.myRoles,
                        projectSvg: "/icons/project-inactive.svg"
                    });
                    breadcrumbTemp = [
                        ...breadcrumbTemp,
                        {
                            label: libraryData.name,
                            svgPath: "/icons/library-active.svg",
                            svgWidth: 16,
                            svgHeight: 16,
                            href: organizationId
                                ? `/organization/${organizationId}`
                                + `/projects/${project_id}?library_id=${library_id}`
                                : `/projects/${project_id}?library_id=${library_id}`,
                            isActive: true,
                        }
                    ];
                    setBreadCrumbs(breadcrumbTemp);
                }
                else {
                    setEditLibAccess(false)
                    setAdminLibAccess(false)
                }
            }
        }
    }, [library_id, projectData]);

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
        setAssays(metaData || []);
    }

    useEffect(() => {
        setAssayFieldValue(selectedLibraryData);
    }, [appContext?.refreshAssayTable]);

    const selectLibrary = (libId: number) => {
        setLibraryId(libId);
    }
    const config = projectData.inherits_configuration ?
        projectData.container.config : projectData.config;

    const assay = projectData.inherits_bioassays ?
        projectData.container.metadata?.assay : projectData.metadata.assay

    const setAssayValue = (assay: AssayFieldList[]) => {
        setAssays(assay)
    }

    const isCustomReaction = isCustomReactionCheck(projectData.metadata);

    const expandAndRedirect = () => {
        if (expanded) {
            const url =
                `/projects/${project_id}` +
                `?library_id=${library_id}`;
            router.replace(url);
        }
        setExpanded(!expanded);
    }

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbValue} />
            <div className='px-[20px] library-page' id="containerElement">
                {loader ?
                    <LoadIndicator
                        visible={loader}
                    /> :
                    <div>
                        {showPopup && popup}
                        <div className='flex mt-[10px]'>
                            {expanded && (<div className='w-2/5 projects libraryBackgroundGrey'>
                                <div className="flex justify-between ">
                                    <main className="main padding-sub-heading flex 
                                    items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src="/icons/project-icon.svg"
                                                width={28}
                                                height={31}
                                                alt="project"
                                            />
                                            <span>{`${projectData.name}`}</span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className='project-type-highlight 
                                            flex items-center gap-2'>
                                                {isCustomReaction
                                                    ? <Image
                                                        src="/icons/custom-reaction-black.svg"
                                                        width={19}
                                                        height={18}
                                                        alt="Custom Reaction"
                                                    />
                                                    : <Image
                                                        src="/icons/retrosynthesis-black.svg"
                                                        width={21}
                                                        height={18}
                                                        alt="Retrosynthesis"
                                                    />}
                                                <div className='project-type-text'>
                                                    {projectData.metadata.type}
                                                </div>
                                            </div>
                                            <Image
                                                src={"/icons/collapse.svg"}
                                                width={33}
                                                height={30}
                                                alt="showDetailedView"
                                                className='cursor-pointer'
                                                onClick={expandAndRedirect}
                                            />
                                        </div>
                                    </main>
                                </div>
                                <LibraryAccordion
                                    projectData={projectData}
                                    setLoader={setLoader}
                                    setSortBy={setSortBy}
                                    setProjects={setProjects}
                                    projectInitial={projectInitial}
                                    projectId={project_id}
                                    sortBy={sortBy}
                                    actionsEnabled={actionsEnabled}
                                    fetchLibraries={fetchLibraries}
                                    userData={userData}
                                    selectedLibraryId={library_id}
                                    /* getLibraryData={getLibraryData} */
                                    setLibraryId={(library_id: number) => selectLibrary(library_id)}
                                    /* setSelectedLibraryName={setSelectedLibraryName} */
                                    setExpanded={setExpanded}
                                    isDirty={isDirty}
                                    setShowPopup={setShowPopup}
                                    adminAccess={adminAccess}
                                    organizationId={Number(organization_id)}
                                    clickOrgId={organizationId}
                                    childRef={childRef}
                                    setDirtyField={setDirtyField}
                                    onSelectedIndexChange={onSelectedIndexChange}
                                    reset={reset}
                                    setReset={setReset}
                                />
                            </div >
                            )}
                            <div className={`${expanded ? 'w-3/5 ml-[10px]' : 'w-full relative'}`}>
                                {expanded && library_id != 0 && (
                                    <>
                                        <main className="lib-heading padding-sub-heading">
                                            <Image
                                                src="/icons/library-icon-md.svg"
                                                width={28}
                                                height={31}
                                                alt="Library" />
                                            <span>{`${selectedLibraryName}`}</span>
                                        </main>
                                        <Accordion collapsible={true} multiple={false}
                                            className="adme-accordion accordion-item-gap">
                                            <Item visible={false} />
                                            <Item titleRender={() => 'Library Properties'}>
                                                <ADMESelector
                                                    type={ContainerType.LIBRARY}
                                                    organizationId={
                                                        userData.organization_id
                                                    }
                                                    childRef={childRef}
                                                    setDirtyField={setDirtyField}
                                                    isDirty={isDirty}
                                                    onSelectedIndexChange={onSelectedIndexChange}
                                                    reset={reset}
                                                    setReset={setReset}
                                                    data={{
                                                        ...selectedLibraryData,
                                                        container: {
                                                            config
                                                        }
                                                    }}
                                                    editAllowed={adminAccess || adminLibAccess}
                                                    fetchContainer={fetchLibraries}
                                                    loggedInUser={userData.id}
                                                />
                                            </Item>
                                        </Accordion>
                                        <Accordion
                                            onSelectionChanged={() =>
                                                setExpandedAssay(prevState => prevState ? 0 : 1)
                                            }
                                            collapsible={true}
                                            multiple={false}
                                            selectedIndex={expandedAssayIndex}
                                        >
                                            <Item visible={false} />
                                            <Item
                                                titleRender={() =>
                                                    `Functional Assay (${assayValue.length})`}>
                                                <FunctionalAssay
                                                    data={{
                                                        ...selectedLibraryData,
                                                        container: {
                                                            metadata: { assay },
                                                            id: organization_id
                                                        }
                                                    }}
                                                    type={ContainerType.LIBRARY}
                                                    childRef={childRef}
                                                    setDirtyField={setDirtyField}
                                                    isDirty={isDirty}
                                                    onSelectedIndexChange={onSelectedIndexChange}
                                                    reset={reset}
                                                    setParentAssay={setAssayValue}
                                                    fetchContainer={fetchLibraries}
                                                    loggedInUser={userData.id}
                                                    editAllowed={adminAccess || adminLibAccess}
                                                    selectType={selectType}
                                                    setReset={setReset}
                                                />
                                            </Item>
                                        </Accordion>
                                    </>
                                )}
                                {!expanded && <Image
                                    src={"/icons/expand.svg"}
                                    width={33}
                                    height={30}
                                    alt="showDetailedView"
                                    className='cursor-pointer absolute top-2.5 z-10'
                                    onClick={expandAndRedirect}
                                />}
                                {delayedExpand && <MoleculeList
                                    selectedLibraryName={selectedLibraryName}
                                    expanded={expanded}
                                    tableData={tableData}
                                    userData={userData}
                                    setTableData={setTableData}
                                    selectedLibraryId={library_id}
                                    projectData={projectData}
                                    projectId={project_id}
                                    fetchLibraries={fetchLibraries}
                                    organizationId={organization_id || ''}
                                    editEnabled={adminAccess || editEnabled
                                        || adminLibAccess || editLibAccess}
                                    projectPermission={
                                        adminAccess || editEnabled
                                    }
                                />}
                            </div>
                        </div>
                    </div>
                }
            </ div >
        </>
    )
}