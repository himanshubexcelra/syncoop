'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from 'devextreme-react/button';
import Image from "next/image";
import toast from "react-hot-toast";
import { Popup } from "devextreme-react/popup";
import { FormRef } from "devextreme-react/cjs/form";
import { ProjectDataFields, User, FetchUserType, OrganizationDataFields, UserData } from '@/lib/definition';
import { libraries } from "@/utils/constants";
import { formatDetailedDate } from "@/utils/helpers";
import CreateProject from "./CreateProject";
import { Messages } from "@/utils/message";

const urlHost = process.env.NEXT_PUBLIC_UI_APP_HOST_URL;

export default function ProjectAccordionDetail({ data, fetchOrganizations, users, organizationData, roleType, dataCreate }: { data: ProjectDataFields, users: User[], fetchOrganizations: FetchUserType, organizationData: OrganizationDataFields | OrganizationDataFields[], dataCreate: UserData, roleType: string | undefined }) {
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const formRef = useRef<FormRef>(null);
    const [editEnabled, setEditStatus] = useState<boolean>(false);

    useEffect(() => {
        const sharedUser = data.sharedUsers.find(u => u.userId === dataCreate.id);
        const owner = data.ownerId === dataCreate.id;
        const sysAdmin = roleType === "admin";

        setEditStatus(!!sharedUser || owner || sysAdmin)
    }, [data])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPopupPosition({
                my: 'top right',
                at: 'top right',
                of: window,
            });
        }
    }, []);

    const copyToClipboard = (type: string, name: string) => {
        const url = `${urlHost}/project/${data.id}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success(Messages.urlCopied(type, name)))
            .catch(() => toast.error(Messages.URL_COPY_ERROR));
    }

    return (
        <div className="accordion-content">
            <div className='flex justify-between'>
                <div>
                    <div className='project-target flex'>
                        Target: <span className='pl-[5px]'>{data.target}</span>
                    </div>
                    <div className='project-title mt-[21px] mb-[21px]'>{data.name}</div>
                </div>
                <div className='flex gap-[8px]'>
                    <Button className='btn-primary accordion-button' disabled={true}>Open</Button>
                    <Button
                        className='btn-secondary accordion-button'
                        disabled={!editEnabled}
                        onClick={() => setCreatePopupVisibility(true)}>
                        Edit
                    </Button>
                    <Button
                        className='btn-secondary accordion-button'
                        onClick={() => copyToClipboard('project', data.name)}>
                        URL
                    </Button>
                </div>
            </div>
            <div className='flex'>
                <Image
                    src="/icons/project-logo.svg"
                    width={15}
                    height={15}
                    alt="project"
                />
                <div className='pl-[10px] project-type'>{data.type}</div>
            </div>
            <div className='description'>{data.description}</div>
            <div className='row-details'>
                <div className='flex justify-between'>
                    <div>
                        <Image
                            src="/icons/polygon.svg"
                            alt="molecule"
                            width={15}
                            height={15}
                        />
                        22 <span>Molecules</span>
                    </div>
                    <div>
                        <span className="badge info">2 New</span>
                        <span className="badge info">3 Ready</span>
                        <span className="badge info">12 Progressing</span>
                        <span className="badge success">3 Done</span>
                        <span className="badge error">1 Failed</span>
                    </div>
                </div>
            </div>
            <div className='row-details'>
                <div>
                    <div className='flex-evenly'>
                        <Image
                            src="/icons/user.svg"
                            alt="molecule"
                            width={15}
                            height={15}
                        />
                        Owner: <span>{data?.owner?.firstName} {data?.owner?.lastName}</span>
                    </div>
                    <div className='flex-evenly'>
                        <Image
                            src="/icons/libraries.svg"
                            alt="molecule"
                            width={15}
                            height={15}
                        />
                        Libraries: <span>3</span>
                    </div>
                </div>
            </div>
            <div className='row-details'>
                <div>
                    <div className='flex-evenly'>
                        <Image
                            src="/icons/users.svg"
                            alt="molecule"
                            width={15}
                            height={15}
                        />
                        Shared: {data.sharedUsers?.map((val, idx) => {
                            const length = data.sharedUsers.length;
                            if (idx >= 4) return;
                            if (length - 1 !== idx && idx < 3)
                                return <span key={val.id}>{val.firstName},</span>
                            if (length - 1 === idx || idx < 3)
                                return <span key={val.id}>{val.firstName}</span>
                            return <span key={val.id}>and {length - idx} +</span>
                        })}
                    </div>
                    <div className='flex-evenly'>
                        <div>
                            <Image
                                src="/icons/create.svg"
                                alt="molecule"
                                width={15}
                                height={15}
                            />
                            Created on: <span>{formatDetailedDate(data.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row-details'>
                <div>
                    <Image
                        src="/icons/time.svg"
                        alt="molecule"
                        width={15}
                        height={15}
                    />
                    Last Updated by: <span>{data.updatedBy?.firstName} {data.updatedBy?.lastName}</span>
                </div>
            </div>
            <div className='libraries'>
                <div className="flex-container">
                    {libraries.map(item => (
                        <div key={item.id} className='box-item library'>
                            <div className='library-name'>Library: <span>{item.name}</span></div>
                            <div className='library-name'>Description: <span>{item.description}</span></div>
                            <div className='gap-[10px] flex mt-[8px] flex-wrap'>
                                {item.status.map(val => (
                                    <span key={val.name} className={`badge ${val.type}`}>{val.count} {val.name}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {createPopupVisible && (
                <Popup
                    title="Edit Project"
                    visible={createPopupVisible}
                    contentRender={() => (
                        <CreateProject
                            formRef={formRef}
                            setCreatePopupVisibility={setCreatePopupVisibility}
                            fetchOrganizations={fetchOrganizations}
                            data={dataCreate}
                            projectData={data}
                            users={users}
                            organizationData={organizationData}
                            roleType={roleType}
                            edit={true}
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
        </div>
    );
}
