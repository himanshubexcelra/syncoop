"use client";
import { StatusComponentProps } from "@/lib/definition"
import CountCards from "@/ui/CountCards";
import StatusCards from "@/ui/StatusCard";
import { getCountCardsDetails } from "@/utils/helpers";
import { stats } from "@/utils/constants";
import { useEffect, useState } from "react";
import { getProjectsCountById } from "../Projects/projectService";
import { getLibraryCountById, geMoleculeCountById } from "../Libraries/libraryService";

export default function StatusComponent({ myRoles, orgUser }: StatusComponentProps) {
    const { id } = orgUser
    const [projectNumber, setProjectNumber] = useState<number>(0);
    const [libraryNumber, setLibraryNumber] = useState<number>(0);
    const [moleculeNumber, setMoleculeNumber] = useState<number>(0);
    const countCardsDetails = getCountCardsDetails(projectNumber, libraryNumber, moleculeNumber);
    const fetchData = async () => {
        const projectCount = myRoles.includes('admin') ? await getProjectsCountById() : await getProjectsCountById(id)
        const libraryCount = myRoles.includes('admin') ? await getLibraryCountById() : await getLibraryCountById(id)
        const moleculeCount = myRoles.includes('admin') ? await geMoleculeCountById() : await geMoleculeCountById(id)
        setLibraryNumber(libraryCount)
        setProjectNumber(projectCount)
        setMoleculeNumber(moleculeCount)
    }

    useEffect(() => {
        fetchData();
    }, [id, myRoles])
    return (
        <div className="h-[177px] items-center flex justify-center gap-[47px]">
            <CountCards {... { countCardsDetails }} />
            <StatusCards {...{ stats }} />
        </div>
    )
}