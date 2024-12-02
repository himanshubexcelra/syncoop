/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import Tabs from "@/ui/Tab/Tabs";
import UsersTable from "../User/UsersTable";
import { useState } from "react";
import { OrganizationType, UserTableProps } from "@/lib/definition";

export default function TabUsersTable({
    filteredRoles,
    myRoles,
    orgUser,
    user_id,
    actionsEnabled
}: UserTableProps) {
    const [externalCount, setExternalCount] = useState<number | null>(null);
    const [internalCount, setInternalCount] = useState<number | null>(null);
    const tabsDetails = [
        {
            title: (internalCount === null) ?
                `${orgUser?.name} Users` :
                `${orgUser?.name} Users (${internalCount})`,
            Component: UsersTable,
            props: {
                filteredRoles,
                myRoles, orgUser,
                user_id, actionsEnabled,
                type: OrganizationType.Internal,
                setInternalCount, setExternalCount
            }
        },
        {
            title: externalCount === null ? `Client Users` : `Client Users(${externalCount})`,
            Component: UsersTable,
            props: {
                filteredRoles,
                myRoles,
                orgUser,
                user_id,
                actionsEnabled,
                type: OrganizationType.External,
                setExternalCount, setInternalCount
            }
        },
    ]
    return (
        <div className="w-full shadow-lg shadow-[var(--tabBoxShadow)]">
            <Tabs tabsDetails={tabsDetails} />
        </div>
    )
}