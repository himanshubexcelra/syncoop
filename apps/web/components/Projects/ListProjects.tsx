'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Accordion, { AccordionTypes } from 'devextreme-react/accordion';
import ProjectTitle from './ProjectTitle';
import ProjectAccordionDetail from './ProjectAccordionDetail';
import './projects.css';
import { ProjectDataFields, User, ProjectListProps, OrganizationDataFields } from '@/lib/definition';

export default function ListProjects({ data, users, fetchOrganizations, organizationData, dataCreate }: ProjectListProps) {
    const [selectedItems, setSelectedItems] = useState<ProjectDataFields[]>([]);
    const [userList, setUsers] = useState<User[]>(users);

    useEffect(() => {
        setSelectedItems([data[0]]);
    }, [data.length]);

    const selectionChanged = useCallback((e: AccordionTypes.SelectionChangedEvent) => {
        let newItems = [...selectedItems];
        e.removedItems.forEach((item) => {
            const index = newItems.indexOf(item);
            if (index >= 0) {
                newItems.splice(index, 1);
            }
        });
        if (e.addedItems.length) {
            newItems = [...newItems, ...e.addedItems];
        }
        setSelectedItems(newItems);
        if (dataCreate?.user_role?.[0]?.role.type === "admin") {
            if (Array.isArray(organizationData)) {
                const filteredUsers = organizationData.filter((org: OrganizationDataFields) => org.id === newItems[0].organizationId)[0]?.orgUser;

                if (filteredUsers) {
                    setUsers(filteredUsers?.filter((user: User) => user.user_role[0]?.role?.type === 'library_manager' && user.id !== dataCreate.id));
                }
            }
        }
    }, [selectedItems, setSelectedItems]);

    return (
        <div className='content'>
            {data.length > 0 ? (

                <div className='flex'>
                    <div className="accordion">
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
                    {selectedItems[0]?.id && (
                        <ProjectAccordionDetail
                            data={selectedItems[0]}
                            users={userList}
                            fetchOrganizations={fetchOrganizations}
                            organizationData={organizationData}
                            dataCreate={dataCreate}
                            roleType={dataCreate?.user_role?.[0]?.role.type} />
                    )}
                </div>
            ) : <div className="accordion-no-data">No Data found</div>}
        </div >
    );
};