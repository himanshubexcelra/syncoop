/*eslint max-len: ["error", { "code": 100 }]*/
'use client';
import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import toast from "react-hot-toast";
import { Popup, Position } from "devextreme-react/popup";
import { FormRef } from "devextreme-react/cjs/form";
import { useRouter } from 'next/navigation';
import { fetchMoleculeStatus, formatDetailedDate, popupPositionValue } from "@/utils/helpers";
import {
    FetchUserType,
    OrganizationDataFields,
    ProjectDataFields,
    User,
    UserData
} from '@/lib/definition';
import CreateProject from "./CreateProject";
import { Messages } from "@/utils/message";
import TextWithToggle from '@/ui/TextWithToggle';

const urlHost = process.env.NEXT_PUBLIC_UI_APP_HOST_URL;

type ProjectAccordionDetailProps = {
    data: ProjectDataFields,
    users: User[],
    fetchOrganizations: FetchUserType,
    organizationData: OrganizationDataFields[],
    userData: UserData,
    actionsEnabled: string[],
    myRoles?: string[],
    clickedOrg?: number,
}

export default function ProjectAccordionDetail({
    data,
    fetchOrganizations,
    users,
    organizationData,
    myRoles,
    userData,
    actionsEnabled,
    clickedOrg,
}: ProjectAccordionDetailProps) {
    const router = useRouter();
    const [createPopupVisible, setCreatePopupVisibility] = useState(false);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const formRef = useRef<FormRef>(null);
    const [editEnabled, setEditStatus] = useState<boolean>(false);
    const [expandMenu, setExpandedMenu] = useState(-1);
    const [isExpanded, setIsExpanded] = useState<number[]>([]);
    const [isProjectExpanded, setProjectExpanded] = useState<number[]>([]);
    const moleculeCount = data.libraries.reduce((count, library) => {
        return count + library.molecule.length; // Add the count of molecules in each library
    }, 0);

    const combinedLibrary = data.libraries.reduce((acc, lib) => {
        acc.molecule.push(...lib.molecule);
        return acc;
    }, { molecule: [] });

    useEffect(() => {
        const sharedUser = data.sharedUsers.find(u => u.user_id === userData.id);
        const owner = data.ownerId === userData.id;
        const admin = ['admin', 'org_admin'].some(
            (role) => myRoles?.includes(role));

        setEditStatus(actionsEnabled.includes('edit_project') && (!!sharedUser || owner || admin))
    }, [data])

    useEffect(() => {
        setPopupPosition(popupPositionValue());
    }, []);

    const copyUrl = (url: string, type: string, name: string) => {
        navigator.clipboard.writeText(url)
            .then(() => toast.success(Messages.urlCopied(type, name)))
            .catch(() => toast.error(Messages.URL_COPY_ERROR));
    }

    const toggleExpanded = (id: number, type: string) => {
        let expandedDescription = (type === 'library') ?
            [...isExpanded] : [...isProjectExpanded];
        if (expandedDescription.includes(id)) {
            expandedDescription = expandedDescription.filter(
                (descriptionId: number) => descriptionId !== id);
        } else expandedDescription.push(id);
        if (type === 'library') setIsExpanded(expandedDescription);
        else setProjectExpanded(expandedDescription);
    }

    return (
        <div className="accordion-content">
            <div className='flex justify-between'>
                <div>
                    <div className='project-target flex'>
                        Target: <span className='pl-[5px]'>{data.target}</span>
                    </div>
                    <div className='project-title mt-[21px] mb-[21px]'>
                        {data.name}
                    </div>
                </div>
                <div className='flex gap-[8px]'>
                    <button
                        className='primary-button accordion-button'
                        onClick={() => clickedOrg ?
                            router.push(`/organization/${clickedOrg}/projects/${data.id}`)
                            : router.push(`/projects/${data.id}`)}
                    >
                        Open
                    </button>
                    {editEnabled &&
                        <button
                            className='secondary-button accordion-button'
                            disabled={!editEnabled}
                            onClick={() => setCreatePopupVisibility(true)}>
                            Edit
                        </button>
                    }
                    <button
                        className='secondary-button accordion-button'
                        onClick={
                            () => copyUrl(
                                `${urlHost}/projects/${data.id}`,
                                'project',
                                data.name)
                        }
                    >
                        URL
                    </button>
                </div >
            </div >
            <div className='flex'>
                <Image
                    src="/icons/project-logo.svg"
                    width={15}
                    height={15}
                    alt="project"
                />
                <div className='pl-[10px] project-type'>{data.type}</div>
            </div>
            <div className='description'>
                {data.description &&
                    <TextWithToggle
                        text={data.description}
                        isExpanded={isProjectExpanded.includes(data.id)}
                        toggleExpanded={toggleExpanded}
                        id={data.id}
                        component="project"
                        clamp={12}
                    />
                }
            </div>
            <div className='row-details'>
                <div className='flex justify-between'>
                    <div>
                        <Image
                            src="/icons/polygon.svg"
                            alt="molecule"
                            width={15}
                            height={15}
                        />
                        {moleculeCount}
                        <span className='pl-[5px]'>
                            {moleculeCount !== 1 ? 'Molecules' : 'Molecule'}
                        </span>
                    </div>
                    <div>
                        {moleculeCount > 0 && (
                            <div className='gap-[10px] flex mt-[8px] flex-wrap'>
                                {Object.entries(fetchMoleculeStatus(combinedLibrary))
                                    .map(([status, count]) => {
                                        let type = 'info';
                                        if (status === 'Failed') {
                                            type = 'error';
                                        } else if (status === 'Done') {
                                            type = 'success';
                                        }
                                        return (
                                            <span key={status} className={`badge ${type}`}>
                                                <b>{count}</b> {status}
                                            </span>
                                        )
                                    })}
                            </div>
                        )}
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
                        Owner: <span>
                            {data?.owner?.first_name} {data?.owner?.last_name}
                        </span>
                    </div>
                    <div className='flex-evenly'>
                        <Image
                            src="/icons/libraries.svg"
                            alt="molecule"
                            width={15}
                            height={15}
                        />
                        Libraries: <span>{data.libraries?.length}</span>
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
                                return <span key={val.id}>
                                    {val.first_name},
                                </span>
                            if (length - 1 === idx || idx < 3)
                                return <span key={val.id}>
                                    {val.first_name}
                                </span>
                            return <span key={val.id}>
                                and {length - idx} +
                            </span>
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
                            Created on: <span>
                                {formatDetailedDate(data.created_at)}
                            </span>
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
                    Last Updated by: <span>
                        {data.userWhoUpdated?.first_name} {data.userWhoUpdated?.last_name}
                    </span>
                </div>
            </div>
            <div className='libraries'>
                <div className="flex-container">
                    {data.libraries.map(item => (
                        <div key={item.id} className='box-item library'>
                            <div className='flex library-name text-normal justify-between'>
                                <div>Library: <span>{item.name}</span></div>
                                <Image
                                    src="/icons/more.svg"
                                    alt="molecule"
                                    width={5}
                                    height={3}
                                    className='cursor-pointer'
                                    id={`image${item.id}`}
                                    onClick={() => setExpandedMenu(item.id)}
                                />
                            </div>
                            <Popup
                                visible={expandMenu === item.id}
                                onHiding={() => setExpandedMenu(-1)}
                                dragEnabled={false}
                                hideOnOutsideClick={true}
                                showCloseButton={false}
                                showTitle={false}
                                width={80}
                                height={110}
                            >
                                <Position
                                    at="left bottom"
                                    my="right top"
                                    of={`#image${item.id}`}
                                    collision="fit" />
                                <p
                                    className='mb-[20px] cursor-pointer'
                                    onClick={
                                        () => router.push(
                                            `/projects/${data.id}?library_id=${item.id}`
                                        )
                                    }
                                >
                                    Open
                                </p>
                                <p
                                    className='cursor-pointer'
                                    onClick={() => {
                                        copyUrl(
                                            `${urlHost}/projects/${data.id}?library_id=${item.id}`,
                                            'library',
                                            item.name)
                                    }}
                                >
                                    URL
                                </p>
                            </Popup>
                            <div className='library-name text-normal'>
                                {item.description ?
                                    <TextWithToggle
                                        text={item.description}
                                        isExpanded={
                                            isExpanded.includes(item.id)
                                        }
                                        toggleExpanded={toggleExpanded}
                                        id={item.id}
                                        heading='Description:'
                                        clamp={3}
                                        component="library"
                                    /> :
                                    <>Description: </>
                                }
                            </div>
                            <div className='gap-[10px] flex mt-[8px] flex-wrap'>
                                {Object.entries(fetchMoleculeStatus(item))
                                    .map(([status, count]) => {
                                        let type = 'info';
                                        if (status === 'Failed') {
                                            type = 'error';
                                        } else if (status === 'Done') {
                                            type = 'success';
                                        }
                                        return (
                                            <span key={status} className={`badge ${type}`}>
                                                <b>{count}</b> {status}
                                            </span>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                    {data.libraries.length === 0 && (
                        <div
                            className={`flex justify-center items-center 
                            p-[40px] h-[70px] nodata-project`}
                        >
                            Your library list is empty, add a library to import molecules
                        </div>
                    )}
                </div>
            </div>
            {
                actionsEnabled.includes('edit_project') && createPopupVisible && (
                    <Popup
                        title="Edit Project"
                        visible={createPopupVisible}
                        contentRender={() => (
                            <CreateProject
                                formRef={formRef}
                                setCreatePopupVisibility={setCreatePopupVisibility}
                                fetchOrganizations={fetchOrganizations}
                                userData={userData}
                                projectData={data}
                                users={users}
                                organizationData={organizationData}
                                myRoles={myRoles}
                                edit={true}
                                clickedOrg={clickedOrg}
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
                )
            }
        </div >
    );
}
