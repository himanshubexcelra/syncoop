"use client";
import Tabs from "@/ui/Tab/Tabs";
import UsersTable from "../User/UsersTable";
import { useState } from "react";
import { UserTableProps } from "@/lib/definition";

export default function TabUsersTable({ filteredRoles, myRoles, orgUser, userId, actionsEnabled }: UserTableProps) {
    const [externalCount, setExternalCount] = useState<number | null>(null);
    const [internalCount, setInternalCount] = useState<number | null>(null);
    const tabsDetails = [
        {
            title: internalCount === null ? `${orgUser?.name} Users` : `${orgUser?.name} Users (${internalCount})`,
            Component: UsersTable,
            props: { filteredRoles, myRoles, orgUser, userId, actionsEnabled, type: "Internal", setInternalCount, setExternalCount }
        },
        {
            title: externalCount === null ? `Client Users` : `Client Users(${externalCount})`,
            Component: UsersTable,
            props: { filteredRoles, myRoles, orgUser, userId, actionsEnabled, type: "External", setExternalCount, setInternalCount }
        },
    ]
    return (
        <Tabs tabsDetails={tabsDetails} />
    )
}