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
    OrganizationType
} from '@/lib/definition';
import CreateProject from "./CreateProject";
import { getOrganizationById, getOrganization } from "@/components/Organization/service";
import { debounce } from '@/utils/helpers';

type ProjectDetailsProps = {
    userData: UserData,
    actionsEnabled: string[]
}

export default function ProjectDetails({
    userData,
    actionsEnabled
}: ProjectDetailsProps) {
    const [filteredData, setFilteredData] = useState<ProjectDataFields[]>([]);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [organization, setOrganization] = useState<OrganizationDataFields[]>([]);
    const [users, setUsers] = useState([]);
    const formRef = useRef<FormRef>(null);
    const [loader, setLoader] = useState(true);
    const [sort, setSort] = useState(false);
    const [orgProj, setOrgProjects] = useState([]);

    const { myRoles } = userData;
    const createEnabled = actionsEnabled.includes('create_project')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPopupPosition({
                my: 'top right',
                at: 'top right',
                of: window,
            });
        }
    }, []);

    const fetchOrganizations = async () => {
        let organization;
        if (myRoles?.includes("admin")) {
            organization = await getOrganization({
                withRelation: ['orgUser', 'user_role', 'projects']
            });
            const projectList = organization.map(
                (org: OrganizationDataFields) => org.projects).flat() || [];
            setFilteredData(projectList);
            setOrgProjects(projectList);
            setUsers([]);
            setOrganization(organization);
        } else {
            const tempOrganization = [];
            organization = await getOrganizationById({
                withRelation: ['orgUser', 'user_role', 'projects'],
                id: userData?.organization_id
            });
            setFilteredData(organization?.projects);
            setOrgProjects(organization?.projects);
            setUsers(organization?.orgUser?.filter(
                (user: UserData) =>
                    user.user_role[0]?.role?.type === 'library_manager' &&
                    user.id !== userData.id));
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
                    item.type.toLowerCase().includes(value.toLowerCase()) ||
                    item.target?.toLowerCase().includes(value.toLowerCase()) ||
                    item.user?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item.user?.last_name?.toLowerCase().includes(value.toLowerCase()));
            } else {
                filteredValue = orgProj.filter((item: ProjectDataFields) =>
                    item.name.toLowerCase().includes(value.toLowerCase()) ||
                    item.description?.toLowerCase().includes(value.toLowerCase()) ||
                    item.type.toLowerCase().includes(value.toLowerCase()) ||
                    item.target?.toLowerCase().includes(value.toLowerCase()) ||
                    item.user?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item.user?.last_name?.toLowerCase().includes(value.toLowerCase()));
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

    return (
        <div className='p-[20px] projects'>
            {loader ?
                <LoadIndicator
                    visible={loader}
                /> :
                <div>
                    <div className="flex justify-between projects">
                        <main className="main">
                            <Image
                                src="/icons/project-logo.svg"
                                width={33}
                                height={30}
                                alt="Project logo"
                            />
                            {userData.orgUser.type === OrganizationType.Internal ?
                                <span>Projects</span>
                                : <span>{`Projects: ${userData?.orgUser?.name}`}</span>}
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
                                            alt="Add"
                                        />
                                        <span className='pl-[5px]'>Add Project</span>
                                    </>
                                )}
                                onClick={() => setCreatePopupVisibility(true)}
                            />}
                            {actionsEnabled.includes('create_project') && createPopupVisible && (
                                <Popup
                                    title="Add Project"
                                    visible={createPopupVisible}
                                    contentRender={() => (
                                        <CreateProject
                                            formRef={formRef}
                                            setCreatePopupVisibility={setCreatePopupVisibility}
                                            fetchOrganizations={fetchOrganizations}
                                            userData={
                                                {
                                                    ...userData,
                                                    owner: {
                                                        first_name: userData.first_name,
                                                        last_name: userData.last_name
                                                    }
                                                }}
                                            users={users}
                                            organizationData={organization}
                                            myRoles={myRoles}
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
                            <Button
                                text="Filter"
                                icon="filter"
                                elementAttr={{ class: "btn-secondary mr-[20px]" }}
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
                            <Button
                                text="Sort"
                                elementAttr={{ class: "btn-secondary mr-[20px]" }}
                                onClick={sortData}
                                render={() => (
                                    <>Sort</>
                                )}
                            />
                            <div className="search-box">
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
                                    onChange={searchData}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="content-wrapper">
                        <ListProjects
                            userData={
                                {
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
                            actionsEnabled={actionsEnabled} />
                    </div>
                </div>
            }
        </div>
    )
}