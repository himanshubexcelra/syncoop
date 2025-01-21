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
import { delay, getUTCTime, isAdmin } from "@/utils/helpers";
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import LibraryAccordion from './LibraryAccordion';
import MoleculeList from './MoleculeList';
import usePopupAndReset from '../usePopupandReset/usePopupAndReset';

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
    target: '',
    metadata: {
        target: '',
        type: ''
    },
    userWhoUpdated: {} as userType, // Provide a default user object
    userWhoCreated: {} as userType, // Provide a default user object
    updated_at: new Date(),
    user_id: undefined,
    owner: {} as User, // Provide a default owner object
    owner_id: 0,
    orgUser: undefined,
    created_at: getUTCTime(new Date().toISOString()),
    other_container: [] as LibraryFields[],
    inherits_configuration: true,
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
    const [project_id, setProjectId] = useState(params.projectId || params.projectId!);
    const [organization_id, setOrganizationId] = useState(organizationId);
    const [tableData, setTableData] = useState<MoleculeType[]>([]);
    const [projectData, setProjects] = useState<ProjectDataFields>(initialProjectData);
    const [projectInitial, setInitProjects] = useState<ProjectDataFields>(initialProjectData);
    /* const [selectedLibrary, setSelectedLibrary] =
        useState(library_id ? Number(library_id) : -1); */
    const [selectedLibraryName, setSelectedLibraryName] = useState('untitled');
    const [selectedLibraryData, setSelectedLibraryData] = useState<any>({});
    const [loader, setLoader] = useState(true);
    const [expanded, setExpanded] = useState(library_id ? false : true);
    const [adminAccess, setAdminAccess] = useState<boolean>(false);
    const [editEnabled, setEditAccess] = useState<boolean>(false);

    const context: any = useContext(AppContext);
    const {
        reset,
        showPopup,
        setIsDirty,
        childRef,
        popup,
        setShowPopup,
        isDirty,
        setReset
    } = usePopupAndReset();
    const appContext = context.state;

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

    const fetchLibraries = async () => {
        const projectData = await getLibraries(['libraries'/* , 'organization' */], project_id);
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
            const breadcrumbTemp = breadcrumbArr({
                projectTitle: `${projectData.name}`,
                projectHref: `/${project_id}`,
                orgData: (organizationId) ? projectData.container : '',
                roles: userData.myRoles
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
        const sharedUser = projectData.container_access_permission?.find(u =>
            u.user_id === userData.id &&
            u.access_type === ContainerPermission.Admin);
        const owner = projectData.owner_id === userData.id;
        const admin = isAdmin(userData.myRoles);

        setAdminAccess(actionsEnabled.includes('create_library') &&
            (!!sharedUser || owner || admin));
        const editUser = projectData.container_access_permission?.find(u =>
            u.user_id === userData.id &&
            u.access_type === ContainerPermission.Edit);
        setEditAccess(actionsEnabled.includes('create_molecule') &&
            (!!editUser || owner || admin))
    }, [projectData?.id]);

    useEffect(() => {
        setProjectId(params.id || params.projectId!)
        fetchLibraries();
    }, [params.id, params.projectId, appContext?.cartDetail]);

    useEffect(() => {
        if (projectData) {
            const libraries = projectData.other_container;
            if (libraries?.length) {
                const libraryData = library_id ? libraries.find((library: LibraryFields) => {
                    return Number(library.id) === Number(library_id)
                }) : libraries[0];
                setSelectedLibraryData(libraryData);
                if (libraryData) {
                    // if (library_id != libraryData.id) {
                    setLibraryId(libraryData.id);
                    setSelectedLibraryName(libraryData.name);
                    // }
                    let breadcrumbTemp = breadcrumbArr({
                        projectTitle: `${projectData.name}`,
                        projectHref: `/${project_id}`,
                        orgData: (organizationId) ? projectData.container : undefined,
                        roles: userData.myRoles
                    });
                    breadcrumbTemp = [
                        ...breadcrumbTemp,
                        {
                            label: libraryData.name,
                            svgPath: "/icons/library-active.svg",
                            svgWidth: 16,
                            svgHeight: 16,
                            href: projectData.container
                                ? `/organization/${projectData.container.id}`
                                + `/projects/${project_id}?library_id=${library_id}`
                                : `/projects/${project_id}?library_id=${library_id}`,
                            isActive: true,
                        }
                    ];
                    setBreadCrumbs(breadcrumbTemp);
                }
            }
        }
    }, [library_id, projectData]);

    const selectLibrary = (libId: number) => {
        setLibraryId(libId);
    }
    const config = projectData.inherits_configuration ?
        projectData.container.config : projectData.config;

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbValue} />
            <div className='p-[20px]'>
                {loader ?
                    <LoadIndicator
                        visible={loader}
                    /> :
                    <div>
                        {showPopup && popup}
                        <div className="flex justify-between">
                            <main className="main padding-sub-heading">
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
                        <div className='flex'>
                            {expanded && (<div className='w-2/5 projects'>
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
                                />
                            </div >
                            )}
                            <div className={`${expanded ? 'w-3/5' : 'w-full'}`}>
                                {expanded && library_id != 0 && (
                                    <Accordion collapsible={true} multiple={false}
                                        className="adme-accordion">
                                        <Item visible={false} />
                                        <Item titleRender={() => 'ADME Properties'}>
                                            <ADMESelector
                                                type="L"
                                                organizationId={
                                                    userData.organization_id
                                                }
                                                childRef={childRef}
                                                isDirty={isDirty}
                                                setIsDirty={setIsDirty}
                                                reset={reset}
                                                data={{
                                                    ...selectedLibraryData,
                                                    container: {
                                                        config
                                                    }
                                                }}
                                                editAllowed={adminAccess}
                                                fetchContainer={fetchLibraries}
                                                setReset={setReset}
                                            />
                                        </Item>
                                    </Accordion>
                                )}
                                <MoleculeList
                                    selectedLibraryName={selectedLibraryName}
                                    expanded={expanded}
                                    tableData={tableData}
                                    userData={userData}
                                    setTableData={setTableData}
                                    selectedLibrary={library_id}
                                    library_id={library_id}
                                    projectData={projectData}
                                    projectId={project_id}
                                    fetchLibraries={fetchLibraries}
                                    organizationId={organization_id || ''}
                                    editEnabled={adminAccess || editEnabled}
                                />
                            </div>
                        </div>
                    </div>
                }
            </ div >
        </>
    )
}