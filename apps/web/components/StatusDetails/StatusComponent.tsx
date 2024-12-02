/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { StatusComponentProps } from "@/lib/definition"
import CountCards from "@/ui/CountCards";
import { getCountCardsDetails } from "@/utils/helpers";
import { stats } from "@/utils/constants";
import { useEffect, useState } from "react";
import { getProjectsCountById } from "../Projects/projectService";
import { getLibraryCountById, geMoleculeCountById } from "../Libraries/service";
import StatusCard from "@/ui/StatusCard";

export default function StatusComponent({ myRoles, orgUser, customerOrgId }: StatusComponentProps) {
    const { id } = orgUser
    const [projectNumber, setProjectNumber] = useState<number>(0);
    const [libraryNumber, setLibraryNumber] = useState<number>(0);
    const [moleculeNumber, setMoleculeNumber] = useState<number>(0);
    const countCardsDetails = getCountCardsDetails(projectNumber, libraryNumber,
        moleculeNumber, customerOrgId);
        
    const fetchData = async () => {
        let projectCount, libraryCount, moleculeCount;

        if (myRoles.includes('admin') && !customerOrgId) {
            projectCount = await getProjectsCountById();
            libraryCount = await getLibraryCountById();
            moleculeCount = await geMoleculeCountById();
        } else {
            projectCount = await getProjectsCountById(id);
            libraryCount = await getLibraryCountById(id);
            moleculeCount = await geMoleculeCountById(id);
        }
        setLibraryNumber(libraryCount)
        setProjectNumber(projectCount)
        setMoleculeNumber(moleculeCount)
    }

    useEffect(() => {
        fetchData();
    }, [id, myRoles]);

    const validStatuses = ['New', 'Ready','In Progress', 'Failed', 'Done'];

    return (
        <div className="h-[177px] items-center flex justify-center gap-[47px]">
            <CountCards {... { countCardsDetails }} />
            <div className="flex">
                {stats.filter((stat: any) =>
                    validStatuses.includes(stat.text)).map((stat: any, index: number) => {
                        return (
                            <StatusCard
                                key={index}
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