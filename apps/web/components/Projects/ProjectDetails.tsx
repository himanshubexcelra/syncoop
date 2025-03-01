/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'devextreme-react/button';
import Image from "next/image";
import { Popup } from "devextreme-react/popup";
import { FormRef } from "devextreme-react/cjs/form";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import ListProjects from "@/components/Projects/ListProjects";
import {
    UserData,
    OrganizationDataFields,
    ProjectDataFields,
    OrganizationType,
    BreadCrumbsObj
} from '@/lib/definition';
import CreateProject from "./CreateProject";
import { getOrganizationById, getOrganization } from "@/components/Organization/service";
import { debounce, isLibraryManger } from '@/utils/helpers';
import Breadcrumb from '../Breadcrumbs/BreadCrumbs';
import { getProjectBreadCrumbs } from './breadCrumbs';

type ProjectDetailsProps = {
    userData: UserData,
    actionsEnabled: string[]
    organizationId: number,
}

export default function ProjectDetails({
    userData,
    actionsEnabled,
    organizationId,
}: ProjectDetailsProps) {
    const [filteredData, setFilteredData] = useState<ProjectDataFields[]>([]);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [organization, setOrganization] = useState<OrganizationDataFields[]>([]);
    const [users, setUsers] = useState([]);
    const formRef = useRef<FormRef>(null);
    const [loader, setLoader] = useState(true);
    const [sort, setSort] = useState(false);
    const [orgProj, setOrgProjects] = useState<ProjectDataFields[]>([]);

    const { myRoles } = userData;
    const createEnabled = actionsEnabled.includes('create_project')
    const breadcrumbs: BreadCrumbsObj[] = getProjectBreadCrumbs(
        organization,
        userData?.myRoles,
        Number(organizationId),
    )
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPopupPosition({
                my: 'top right',
                at: 'top right',
                of: window,
            });
        }
    }, []);
    // Fetching projects under organization OPT: 3
    const fetchOrganizations = async () => {
        let organization;
        let projectList;
        if (myRoles?.includes("admin")) {
            if (organizationId) {
                organization = await getOrganizationById({
                    withRelation: ['orgUser', 'user_role', 'projects'],
                    withCount: ['molecules'],
                    id: organizationId
                });
                projectList = organization?.other_container;
                setOrganization([organization]);
                setUsers(organization?.orgUser?.filter(
                    (user: UserData) => {
                        const roles = user.user_role
                            .map(role => role.role.type)
                            .filter(role => role !== undefined) as string[] || []
                        return isLibraryManger(roles) && user.id !== userData.id
                    }));
            } else {
                organization = await getOrganization({
                    withRelation: ['orgUser', 'user_role', 'projects'],
                    withCount: ['molecules'],
                });
                projectList = organization.map(
                    (org: OrganizationDataFields) => org.other_container).flat();
                setOrganization(organization);
                setUsers([])
            }
            setFilteredData(projectList);
            setOrgProjects(projectList);
        } else {
            const tempOrganization = [];
            organization = await getOrganizationById({
                withRelation: ['orgUser', 'user_role', 'projects'],
                withCount: ['molecules'],
                id: userData?.organization_id
            });
            const projects = organization?.other_container;
            setFilteredData(projects);
            setOrgProjects(projects);
            setUsers(organization?.orgUser?.filter(
                (user: UserData) => {
                    const roles = user.user_role
                        .map(role => role.role.type)
                        .filter(role => role !== undefined) as string[] || []
                    return isLibraryManger(roles) && user.id !== userData.id
                }));
            tempOrganization.push(organization);
            setOrganization(tempOrganization);
        }
        setLoader(false);
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleSearch = debounce((value: string) => {
        let filteredValue;
        if (value) {
            if (filteredData.length > 0) {
                filteredValue = filteredData.filter((item) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.metadata.type?.toLowerCase().includes(value.toLowerCase()) ||
                    item.metadata.target?.toLowerCase().includes(value.toLowerCase()) ||
                    item.userWhoCreated?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item.userWhoCreated?.last_name?.toLowerCase().includes(value.toLowerCase()));
            } else {
                filteredValue = orgProj.filter((item: ProjectDataFields) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.metadata.type?.toLowerCase().includes(value.toLowerCase()) ||
                    item.metadata.target?.toLowerCase().includes(value.toLowerCase()) ||
                    item.userWhoCreated?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item.userWhoCreated?.last_name?.toLowerCase().includes(value.toLowerCase()));
            }
        } else {
            filteredValue = orgProj || [];
        }
        setFilteredData(filteredValue);
    }, 500);

    const searchData = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleSearch(e.target.value);
    }

    const sortData = () => {
        if (!sort) {
            const tempData = [...filteredData];
            tempData.sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setFilteredData(tempData);
            setSort(true);
        } else {
            setFilteredData(orgProj || []);
            setSort(false);
        }
    }

    let projectIcon = "/icons/project-logo.svg";
    if (myRoles.includes("library_manager")) {
        projectIcon = "/icons/home-icon.svg";
    }

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className='p-[20px] projects'>
                {loader ?
                    <LoadIndicator
                        visible={loader} /> :
                    <div>
                        <div className="flex justify-between projects">
                            <main className="main padding-sub-heading">
                                <Image
                                    src={projectIcon}
                                    width={33}
                                    height={30}
                                    alt="Project logo" />
                                {userData.orgUser.type === OrganizationType.Internal
                                    || myRoles.includes('org_admin') ?
                                    <span>Projects</span>
                                    : <div>
                                        <span>Home: </span>
                                        <span className='lib-heading'>
                                            {userData?.orgUser?.name}
                                        </span>
                                    </div>}
                            </main>
                            <div className='flex'>
                                {createEnabled && <Button
                                    text="Filter"
                                    icon="filter"
                                    elementAttr={{ class: "btn-primary mr-[20px]" }}
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/plus-white.svg"
                                                width={24}
                                                height={24}
                                                alt="Add" />
                                            <span className='pl-[5px]'>Add Project</span>
                                        </>
                                    )}
                                    onClick={() => setCreatePopupVisibility(true)} />}
                                {actionsEnabled.includes('create_project')
                                    && createPopupVisible && (
                                        <Popup
                                            title="Add Project"
                                            visible={createPopupVisible}
                                            contentRender={() => (
                                                <CreateProject
                                                    formRef={formRef}
                                                    setCreatePopupVisibility
                                                    ={setCreatePopupVisibility}
                                                    fetchOrganizations={fetchOrganizations}
                                                    userData={{
                                                        ...userData,
                                                        owner: {
                                                            first_name: userData.first_name,
                                                            last_name: userData.last_name
                                                        }
                                                    }}
                                                    users={users}
                                                    organizationData={organization}
                                                    myRoles={myRoles}
                                                    clickedOrg={Number(organizationId)} />
                                            )}
                                            width={477}
                                            hideOnOutsideClick={false}
                                            height="100%"
                                            position={popupPosition}
                                            onHiding={() => {
                                                formRef.current?.instance().reset();
                                                setCreatePopupVisibility(false);
                                            }}
                                            showCloseButton={true}
                                            wrapperAttr={{ class: "create-popup mr-[15px]" }} />
                                    )}
                                <Button
                                    text="Filter"
                                    icon="filter"
                                    elementAttr={{ class: "btn-disable mr-[20px]" }}
                                    disabled={true}
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/filter-disable-icon.svg"
                                                width={14}
                                                height={14}
                                                alt="Filter" />
                                            <span
                                                className='ml-[10px] text-disabledTextButtonBlue'>
                                                Filter
                                            </span>
                                        </>
                                    )} />
                                <Button
                                    text="Sort"
                                    elementAttr={{ class: "btn-secondary mr-[20px]" }}
                                    onClick={sortData}
                                    render={() => (
                                        <>Sort</>
                                    )} />
                                <div className="search-box">
                                    <Image
                                        src="/icons/search.svg"
                                        width={24}
                                        height={24}
                                        alt="Sort"
                                        className='search-icon' />
                                    <input
                                        placeholder="Search"
                                        className="search-input"
                                        width={120}
                                        style={{ paddingLeft: '30px' }}
                                        onChange={searchData} />
                                </div>
                            </div>
                        </div>
                        <div className="content-wrapper">
                            <ListProjects
                                userData={{
                                    ...userData,
                                    owner: {
                                        first_name: userData?.first_name,
                                        last_name: userData?.last_name
                                    }
                                }}
                                data={filteredData}
                                fetchOrganizations={fetchOrganizations}
                                users={users}
                                organizationData={organization}
                                actionsEnabled={actionsEnabled}
                                clickedOrg={Number(organizationId)} />
                        </div>
                    </div>}
            </div>
        </>
    )
}