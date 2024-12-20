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
import MoleculeList from './MoleculeList';
import LibraryAccordion from './LibraryAccordion';


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
    organization_id: undefined,
    organization: {} as OrganizationDataFields, // Provide a default organization object
    user: {} as userType, // Provide a default user object
    sharedUsers: [],
    target: '',
    type: '',
    userWhoUpdated: {} as userType, // Provide a default user object
    userWhoCreated: {} as userType, // Provide a default user object
    updated_at: new Date(),
    user_id: undefined,
    owner: {} as User, // Provide a default owner object
    ownerId: 0,
    orgUser: undefined,
    created_at: getUTCTime(new Date().toISOString()),
    libraries: [] as LibraryFields[],
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
    const [library_id, setLibraryId] = useState(searchParams.get('library_id') || '');
    const [project_id, setProjectId] = useState(params.id || params.projectId!);
    const [organization_id, setOrganizationId] = useState(organizationId);
    const [tableData, setTableData] = useState<MoleculeType[]>([]);
    const [projects, setProjects] = useState<ProjectDataFields>(initialProjectData);
    const [initProjects, setInitProjects] = useState<ProjectDataFields>(initialProjectData);
    const [selectedLibrary, setSelectedLibrary] =
        useState(library_id ? Number(library_id) : -1);
    const [selectedLibraryName, setSelectedLibraryName] = useState('untitled');
    const [loader, setLoader] = useState(true);
    const [moleculeLoader, setMoleculeLoader] = useState(false);
    const [expanded, setExpanded] = useState(library_id ? false : true);


    const [sortBy, setSortBy] = useState('Recent');
    const [breadcrumbValue, setBreadCrumbs] = useState(breadcrumbArr({}));

    let toastShown = false;

    const getLibraryData = async (item: LibraryFields) => {
        setMoleculeLoader(true)
        setSelectedLibrary(item.id);
        setSelectedLibraryName(item.name);
        const libraryData =
            await getLibraryById(['molecule'],
                item.id.toString());
        setTableData(libraryData.molecule || []);
        setMoleculeLoader(false)
    }
    const fetchLibraries = async () => {
        const projectData = await getLibraries(['libraries', 'organization'], project_id);

        // let selectedLib = null;
        let selectedLib = { name: '' };
        if (library_id && projectData) {
            selectedLib = projectData.libraries.find(
                (library: LibraryFields) => Number(library.id) === Number(library_id));
        }
        if (projectData && !!selectedLib) {
            const sortKey = 'created_at';
            const sortBy = 'desc';
            const tempLibraries = sortByDate(projectData.libraries, sortKey, sortBy);
            setProjects({ ...projectData, libraries: tempLibraries });
            setInitProjects({ ...projectData, libraries: tempLibraries });
            setOrganizationId(projectData.organization_id);
            let breadcrumbTemp = breadcrumbArr({
                projectTitle: `${projectData.name}`,
                projectHref: `/${project_id}`,
                orgData: projectData.organization,
            });
            if (library_id) {
                const libraryData = await getLibraryById(['molecule'], library_id);
                setTableData(libraryData.molecule || []);
                const libName = libraryData.name;
                setSelectedLibraryName(libName);
                setSelectedLibrary(parseInt(library_id));
                breadcrumbTemp = breadcrumbArr({
                    projectTitle: `${projectData.name}`,
                    projectHref: `/${project_id}`, projectSvg: "/icons/project-inactive.svg",
                    orgData: projectData.organization,
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
                            + `/projects/${project_id}/library_id/${library_id}`
                            : `/projects/${project_id}?library_id/${library_id}`,
                        isActive: true,
                    }];
            } else {
                if (tempLibraries.length) {
                    const libraryData = await getLibraryById(['molecule'], tempLibraries[0]?.id);
                    if (libraryData) {
                        setTableData(libraryData.molecule || []);
                        setLibraryId(libraryData.id);
                    }
                } const libName = tempLibraries[0]?.name || 'untitled';
                setSelectedLibraryName(libName);
                setSelectedLibrary(tempLibraries[0]?.id);
                setSortBy('Recent');
                setExpanded(true);
                breadcrumbTemp = breadcrumbArr({
                    projectTitle: `${projectData.name}`,
                    projectHref: `/${project_id}`,
                    projectSvg: '/icons/project-icon.svg', projectState: true,
                    orgData: projectData.organization,
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
                        <div className='flex gap-[20px]'>
                            {expanded && (<div className='w-2/5 projects'>
                                <LibraryAccordion
                                    projects={projects}
                                    setLoader={setLoader}
                                    setSortBy={setSortBy}
                                    setProjects={setProjects}
                                    initProjects={initProjects}
                                    projectId={project_id}
                                    sortBy={sortBy}
                                    actionsEnabled={actionsEnabled}
                                    fetchLibraries={fetchLibraries}
                                    userData={userData}
                                    selectedLibrary={selectedLibrary}
                                    getLibraryData={getLibraryData}
                                    setSelectedLibrary={setSelectedLibrary}
                                    setSelectedLibraryName={setSelectedLibraryName}
                                    setExpanded={setExpanded}
                                />
                            </div >
                            )}
                            <MoleculeList
                                moleculeLoader={moleculeLoader}
                                expanded={expanded}
                                tableData={tableData}
                                userData={userData}
                                setMoleculeLoader={setMoleculeLoader}
                                setTableData={setTableData}
                                actionsEnabled={actionsEnabled}
                                selectedLibrary={selectedLibrary}
                                library_id={library_id}
                                projects={projects}
                                projectId={project_id}
                                organizationId={organization_id || ''}
                            />
                        </div >
                    </div >
                }
            </ div >
        </>
    )
}