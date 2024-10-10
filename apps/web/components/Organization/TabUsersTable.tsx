"use client";
import Tabs from "@/ui/Tab/Tabs";
import UsersTable from "../User/UsersTable";
import { useState } from "react";
import { UserTableProps } from "@/lib/definition";

export default function TabUsersTable({ roles, roleType, orgUser, }: UserTableProps) {
    const [externalCount, setExternalCount] = useState<number | null>(null);
    const [internalCount, setInternalCount] = useState<number | null>(null);
    const tabsDetails = [
        {
            title: internalCount === null ? `${orgUser?.name} Users` : `${orgUser?.name} Users (${internalCount})`,
            Component: UsersTable,
            props: { roles, roleType, orgUser, type: "Internal", setInternalCount: setInternalCount, setExternalCount: setExternalCount }
        },
        {
            title: externalCount === null ? `Client Users` : `Client Users(${externalCount})`,
            Component: UsersTable,
            props: { roles, roleType, orgUser, type: "External", setExternalCount: setExternalCount, setInternalCount: setInternalCount }
        },
    ]
    return (
        <Tabs tabsDetails={tabsDetails} />
    )
}