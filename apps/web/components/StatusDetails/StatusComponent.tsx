/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { Status, StatusComponentProps } from "@/lib/definition"
import CountCards from "@/ui/CountCards";
import { useEffect, useState } from "react";
import StatusCard from "@/ui/StatusCard";
import { getOverviewCounts } from "../Projects/projectService";
import { DashboardStatuses, getCountCardsDetails, moleculeStatus } from "@/utils/constants";
import { isSystemAdmin } from "@/utils/helpers";

export default function StatusComponent({ myRoles, orgUser, customerOrgId }: StatusComponentProps) {
    const { id } = orgUser;
    const [projectNumber, setProjectNumber] = useState<number>(0);
    const [libraryNumber, setLibraryNumber] = useState<number>(0);
    const [moleculeNumber, setMoleculeNumber] = useState<number>(0);
    const [moleculeStatusCount, setMoleculeStatusCount] = useState<[]>([]);
    const countCardsDetails = getCountCardsDetails(
        projectNumber,
        libraryNumber,
        moleculeNumber,
        customerOrgId
    );

    const fetchData = async () => {

        const {
            molecule_status_count,
            projectCount,
            libraryCount,
            moleculeCount
        } = await getOverviewCounts(customerOrgId ??
            (!isSystemAdmin(myRoles) ? orgUser.id : undefined));

        setLibraryNumber(libraryCount)
        setProjectNumber(projectCount)
        setMoleculeNumber(moleculeCount)
        setMoleculeStatusCount(molecule_status_count);
    }

    useEffect(() => {
        fetchData();
    }, [id, myRoles]);

    return (
        <div className="flex items-center h-[177px]">
            <div className="flex w-1/2 justify-around">
                <CountCards {... { countCardsDetails }} />
            </div>
            <div className="flex w-1/2">
                {moleculeStatus.filter((stat: Status) =>
                    DashboardStatuses.includes(stat.text)
                ).map((stat: Status, index: number) => {
                    moleculeStatusCount.forEach(
                        (statCount: { status: number, _count: number }) => {
                            if (Array.isArray(stat.code) && stat.code.includes(statCount.status)) {
                                stat = {
                                    ...stat,
                                    number: stat.number + statCount._count
                                }
                            } else if (stat.code === statCount.status) {
                                stat = {
                                    ...stat,
                                    number: statCount._count
                                }
                            }
                        }
                    );
                    return (
                        <StatusCard
                            key={index}
                            id={index}
                            stat={stat}
                            hideCount={true}
                            customStyles={true}
                        />
                    );

                })}

            </div>
        </div>
    )
}