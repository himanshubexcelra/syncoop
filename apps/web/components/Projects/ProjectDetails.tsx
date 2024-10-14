'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'devextreme-react/button';
import Textbox, { TextBoxTypes } from 'devextreme-react/text-box';
import Image from "next/image";
import { Popup } from "devextreme-react/popup";
import { FormRef } from "devextreme-react/cjs/form";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import ListProjects from "@/components/Projects/ListProjects";
import { UserData, OrganizationDataFields, ProjectDataFields } from '@/lib/definition';
import CreateProject from "./CreateProject";
import { getOrganizationById, getOrganization } from "@/components/Organization/service";
import '../Organization/form.css';

export default function ProjectDescription({ data }: { data: UserData }) {
    const [filteredData, setFilteredData] = useState<ProjectDataFields[]>([]);
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [organization, setOrganization] = useState<OrganizationDataFields>({});
    const [users, setUsers] = useState([]);
    const formRef = useRef<FormRef>(null);
    const [loader, setLoader] = useState(true);

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
        if (data?.user_role?.[0]?.role.type === "admin") {
            organization = await getOrganization(['orgUser', 'user_role', 'projects']);
            setFilteredData(organization.map((org: OrganizationDataFields) => org.projects).flat());
            setUsers([]);
        } else {
            organization = await getOrganizationById(['orgUser', 'user_role', 'projects'], data?.organizationId);
            setFilteredData(organization?.projects);
            setUsers(organization?.orgUser?.filter((user: UserData) => user.user_role[0]?.role?.type === 'library_manager' && user.id !== data.id));
        }
        setLoader(false);
        setOrganization(organization);
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const searchData = (e: TextBoxTypes.ValueChangedEvent) => {
        const { value } = e;
        let filteredValue;
        if (value)
            filteredValue = filteredData?.filter((item) =>
                item.name.toLowerCase().includes(value.toLowerCase()) ||
                item.description?.toLowerCase().includes(value.toLowerCase()) ||
                item.type.toLowerCase().includes(value.toLowerCase()) ||
                item.target?.toLowerCase().includes(value.toLowerCase()) ||
                item.user?.firstName?.toLowerCase().includes(value.toLowerCase()) ||
                item.user?.lastName?.toLowerCase().includes(value.toLowerCase()));
        else filteredValue = organization.projects || [];

        setFilteredData(filteredValue);
    }

    const sortData = () => {
        const tempData = [...filteredData];
        tempData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setFilteredData(tempData);
    }


    return (
        <div className='p-[20px]'>
            <LoadIndicator
                visible={loader}
            />
            {!loader &&
                <div>
                    <div className="flex justify-between">
                        <main className="main main-title">
                            <Image
                                src="/icons/home-icon.svg"
                                width={33}
                                height={30}
                                alt="organization"
                            />
                            <span>{`Home: ${data.orgUser?.name}`}</span>
                        </main>
                        <div className='flex'>
                            <Button
                                text="Filter"
                                icon="filter"
                                elementAttr={{ class: "button_primary_toolbar mr-[20px]" }}
                                render={() => (
                                    <>
                                        <Image
                                            src="/icons/plus.svg"
                                            width={24}
                                            height={24}
                                            alt="Add"
                                        />
                                        <span>Add Project</span>
                                    </>
                                )}
                                onClick={() => setCreatePopupVisibility(true)}
                            />
                            {createPopupVisible && (
                                <Popup
                                    title="Add Project"
                                    visible={createPopupVisible}
                                    contentRender={() => (
                                        <CreateProject
                                            formRef={formRef}
                                            setCreatePopupVisibility={setCreatePopupVisibility}
                                            fetchOrganizations={fetchOrganizations}
                                            data={{ ...data, owner: { firstName: data.firstName, lastName: data.lastName } }}
                                            users={users}
                                            organizationData={organization}
                                            roleType={data?.user_role?.[0]?.role.type}
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
                                elementAttr={{ class: "button_primary_toolbar mr-[20px]" }}
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
                                elementAttr={{ class: "button_primary_toolbar mr-[20px]" }}
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
                                <Textbox
                                    placeholder="Search"
                                    className="search-input"
                                    inputAttr={{
                                        style: { paddingRight: '30px' }
                                    }}
                                    onValueChanged={searchData}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="content-wrapper">
                        <ListProjects
                            dataCreate={{ ...data, owner: { firstName: data.firstName, lastName: data.lastName } }}
                            data={filteredData}
                            fetchOrganizations={fetchOrganizations}
                            users={users}
                            organizationData={organization} />
                    </div>
                </div>
            }
        </div>
    )
}