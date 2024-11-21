/*eslint max-len: ["error", { "code": 100 }]*/
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Accordion, { AccordionTypes } from 'devextreme-react/accordion';
import ProjectTitle from './ProjectTitle';
import ProjectAccordionDetail from './ProjectAccordionDetail';
import {
    ProjectDataFields,
    User,
    OrganizationDataFields,
    FetchUserType,
    UserData
} from '@/lib/definition';
import { getLibraries } from '../Libraries/service';
import { LoadIndicator } from 'devextreme-react';

type ProjectListProps = {
    data: ProjectDataFields[],
    users: User[],
    fetchOrganizations: FetchUserType,
    organizationData: OrganizationDataFields[],
    userData: UserData,
    actionsEnabled: string[],
    clickedOrg?: number,
}

export default function ListProjects({ data,
    users,
    fetchOrganizations,
    organizationData,
    userData,
    actionsEnabled,
    clickedOrg
}: ProjectListProps) {
    const [selectedItems, setSelectedItems] = useState<ProjectDataFields[]>([]);
    const [userList, setUsers] = useState<User[]>(users);
    const [loader, setLoader] = useState(false);
    const { myRoles } = userData;

    const fetchLibraryData = async (id: number) => {
        if (id) {
            const projectData = await getLibraries(['libraries', 'projects'], id.toString());
            setSelectedItems([projectData]);
            setLoader(false);
        }
    }

    useEffect(() => {
        if (data.length) {
            fetchLibraryData(data[0].id);
        }
    }, [data.length]);

    const selectionChanged = useCallback((e: AccordionTypes.SelectionChangedEvent) => {
        setLoader(true);
        let newItems = [...selectedItems];
        e.removedItems.forEach((item) => {
            const index = newItems.indexOf(item);
            if (index >= 0) {
                newItems.splice(index, 1);
            }
        });
        if (e.addedItems.length) {
            newItems = [...newItems, ...e.addedItems];
            fetchLibraryData(e.addedItems[0]?.id)
        }
        if (myRoles?.includes("admin")) {
            if (Array.isArray(organizationData)) {
                const filteredUsers = organizationData.filter(
                    (org: OrganizationDataFields) =>
                        org.id === newItems[0].organization_id)[0]?.orgUser;

                if (filteredUsers) {
                    setUsers(filteredUsers?.filter(
                        (user: User) =>
                            user.user_role[0]?.role?.type === 'library_manager' &&
                            user.id !== userData.id));
                }
            }
        }
    }, [selectedItems, setSelectedItems]);

    return (
        <div className='content'>
            {data.length > 0 ? (
                <div className='flex'>
                    <div className="accordion projects">
                        <Accordion
                            dataSource={data}
                            collapsible={false}
                            multiple={false}
                            selectedItems={selectedItems}
                            onSelectionChanged={selectionChanged}
                            itemTitleRender={ProjectTitle}
                            id="accordion-container"
                        />
                    </div>
                    {loader ?
                        <LoadIndicator
                            visible={loader}
                        /> : (
                            selectedItems[0]?.id && (
                                <ProjectAccordionDetail
                                    data={selectedItems[0]}
                                    users={userList}
                                    fetchOrganizations={fetchOrganizations}
                                    organizationData={organizationData}
                                    userData={userData}
                                    actionsEnabled={actionsEnabled}
                                    myRoles={myRoles}
                                    clickedOrg={clickedOrg} />
                            ))}
                </div>
            ) : <div className="nodata-project">No Data found</div>}
        </div >
    );
};