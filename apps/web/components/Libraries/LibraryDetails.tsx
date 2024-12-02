/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import { useState, useEffect } from 'react';
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
} from '@/lib/definition';
import { useSearchParams, useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import {
    getLibraries,
    getLibraryById,
} from './service';
import { sortByDate } from '@/utils/sortString';
import { Messages } from "@/utils/message";
import { DELAY } from "@/utils/constants";
import { delay, getUTCTime } from "@/utils/helpers";
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import LibraryAccordion from './LibraryAccordion';
import dynamic from 'next/dynamic';

const MoleculeList = dynamic(
    () => import("./MoleculeList"),
    {
        ssr: false,
        loading: () => <LoadIndicator visible={true}></LoadIndicator>
    }
);

type breadCrumbParams = {
    projectTitle?: string,
    projectHref?: string,
    projectSvg?: string,
    projectState?: boolean,
    orgData?: OrganizationDataFields
}

const breadcrumbArr = ({
    projectTitle = '',
    projectHref = '',
    projectSvg = '',
    projectState = false,
    orgData,
}: breadCrumbParams) => {
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
        {
            label: 'Projects',
            svgPath: '/icons/project-inactive.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: orgData ?
                `/organization/${orgData?.id}/projects/`
                : '/projects',
        },
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
    sharedUsers: [],
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
    ownerId: 0,
    orgUser: undefined,
    created_at: getUTCTime(new Date().toISOString()),
    other_container: [] as LibraryFields[],
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
    const [loader, setLoader] = useState(true);
    const [expanded, setExpanded] = useState(library_id ? false : true);


    const [sortBy, setSortBy] = useState('recent');
    const [breadcrumbValue, setBreadCrumbs] = useState(breadcrumbArr({}));

    let toastShown = false;

    // OPT: 7
    const getLibraryData = async (item: LibraryFields) => {
        setLibraryId(item.id);
        setSelectedLibraryName(item.name);
        const libraryData =
            await getLibraryById(['molecule'],
                item.id.toString());
        setTableData(libraryData.libraryMolecules || []);
    }
    const fetchLibraries = async () => {
        const projectData = await getLibraries(['libraries'/* , 'organization' */], project_id);

        // let selectedLib = null;
        let selectedLib = { name: '' };
        if (library_id && projectData) {
            selectedLib = projectData.other_container.find(
                (library: LibraryFields) => Number(library.id) === Number(library_id));
        }
        if (projectData && !!selectedLib) {
            const sortKey = 'created_at';
            const sortBy = 'desc';
            const tempLibraries = sortByDate(projectData.other_container, sortKey, sortBy);
            setProjects({ ...projectData, libraries: tempLibraries });
            setInitProjects({ ...projectData, libraries: tempLibraries });
            setOrganizationId(projectData.parent_id);
            let breadcrumbTemp = breadcrumbArr({
                projectTitle: `${projectData.name}`,
                projectHref: `/${project_id}`,
                orgData: (organizationId) ? projectData.container: '',
            });
            if (library_id) {
                const libraryData = await getLibraryById(['molecule'], library_id.toString());
                setTableData(libraryData.libraryMolecules || []);
                const libName = libraryData.name;
                setSelectedLibraryName(libName);
                setLibraryId(library_id);
                breadcrumbTemp = breadcrumbArr({
                    projectTitle: `${projectData.name}`,
                    projectHref: `/${project_id}`, projectSvg: "/icons/project-inactive.svg",
                    orgData: (organizationId) ? projectData.container: ''
                });
                breadcrumbTemp = [
                    ...breadcrumbTemp,
                    {
                        label: libName,
                        svgPath: "/icons/library-active.svg",
                        svgWidth: 16,
                        svgHeight: 16,
                        href: projectData.organization
                            ? `/organization/${projectData.organization?.id}`
                            + `/projects/${project_id}?library_id=${library_id}`
                            : `/projects/${project_id}?library_id=${library_id}`,
                        isActive: true,
                    }];
            } else {
                if (tempLibraries.length) {
                    const libraryData = await getLibraryById(['molecule'], tempLibraries[0]?.id);
                    if (libraryData) {
                        setTableData(libraryData.molecule || []);
                        setLibraryId(libraryData.id);
                    }
                } 
                const libName = tempLibraries[0]?.name || 'untitled';
                setSelectedLibraryName(libName);
                setLibraryId(tempLibraries[0]?.id);
                setSortBy('recent');
                setExpanded(true);
                breadcrumbTemp = breadcrumbArr({
                    projectTitle: `${projectData.name}`,
                    projectHref: `/${project_id}`,
                    projectSvg: '/icons/project-icon.svg', projectState: true,
                    orgData: projectData.organization,
                });
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
        setProjectId(params.id || params.projectId!)
        fetchLibraries();
    }, [params.id, params.projectId, library_id]);


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
                                    getLibraryData={getLibraryData}
                                    setLibraryId={setLibraryId}
                                    setSelectedLibraryName={setSelectedLibraryName}
                                    setExpanded={setExpanded}
                                />
                            </div >
                            )}
                            <MoleculeList
                                expanded={expanded}
                                tableData={tableData}
                                userData={userData}
                                setTableData={setTableData}
                                actionsEnabled={actionsEnabled}
                                selectedLibrary={library_id}
                                library_id={library_id}
                                projectData={projectData}
                                projectId={project_id}
                                fetchLibraries={fetchLibraries}
                                organizationId={organization_id || ''}
                            />
                        </div >
                    </div >
                }
            </ div >
        </>
    )
}