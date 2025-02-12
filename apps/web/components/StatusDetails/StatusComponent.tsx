/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { MoleculeStatusCode, Status, StatusComponentProps } from "@/lib/definition"
import CountCards from "@/ui/CountCards";
import { useEffect, useState } from "react";
import StatusCard from "@/ui/StatusCard";
import { getOverviewCounts } from "../Projects/projectService";
import { getCountCardsDetails, moleculeStatus } from "@/utils/constants";
import { isSystemAdmin } from "@/utils/helpers";
import {
    ArgumentAxis,
    Border,
    Chart,
    Font,
    Grid,
    Label,
    Legend,
    Series,
    Tick,
    ValueAxis
} from 'devextreme-react/chart';

export default function StatusComponent({ myRoles, orgUser, customerOrgId }: StatusComponentProps) {
    const { id } = orgUser;
    const [projectNumber, setProjectNumber] = useState<number>(0);
    const [libraryNumber, setLibraryNumber] = useState<number>(0);
    const [moleculeNumber, setMoleculeNumber] = useState<number>(0);
    const headerStatus = moleculeStatus.filter((status: Status) =>
        [MoleculeStatusCode.New, MoleculeStatusCode.Done].includes(status.code))
    const [headerStatusCount, setHeaderCount] = useState<Status[]>(headerStatus);
    const [graphDataSource, setGraphDataSource] = useState<object[]>([]);
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
        setMoleculeNumber(moleculeCount);

        let headerStatusCount: Status[] = [];
        let graphDataSource: object[] = [];
        moleculeStatus.forEach((stat: Status) => {
            const statFound = molecule_status_count.find(
                (statCount: { status: number, _count: number }) =>
                    stat.code === statCount.status);

            if ([MoleculeStatusCode.New, MoleculeStatusCode.Done].includes(stat.code)) {
                headerStatusCount = [
                    ...headerStatusCount,
                    {
                        ...stat,
                        number: statFound?._count ?? 0
                    }
                ]
            } else {
                graphDataSource = [
                    ...graphDataSource,
                    {
                        ...stat,
                        number: statFound?._count ?? 0
                    }
                ]
            }
        });

        setHeaderCount(headerStatusCount);
        setGraphDataSource(graphDataSource);
    }

    useEffect(() => {
        fetchData();
    }, [id, myRoles]);

    return (
        <div >
            <div className="flex items-center h-[120px]">
                <div className="flex w-1/2 justify-around">
                    <CountCards {... { countCardsDetails }} />
                </div>
                <div className="flex w-1/2 justify-end mr-[100px]">
                    {headerStatusCount.map((stat: Status, index: number) => {
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
            <div className="w-[900px] ml-[80px] pb-[20px]">
                <Chart
                    id="chart"
                    dataSource={graphDataSource}
                    width={'auto'}
                    rotated={true}
                    height={340}>

                    <Legend visible={false}></Legend>

                    <ArgumentAxis visible={false}>
                        <Grid visible={false}></Grid>
                        <Tick visible={false}></Tick>
                        <Label visible={true}>
                            <Font color="#000000" size="14"></Font>
                        </Label>
                    </ArgumentAxis>

                    <ValueAxis visible={false}>
                        <Grid visible={false}></Grid>
                        <Tick visible={false}></Tick>
                        <Label visible={false}></Label>
                    </ValueAxis>

                    <Series
                        valueField="number"
                        argumentField="text"
                        type="bar"
                        color="#D8EAF8"
                        barWidth={18}>
                        <Border color='#085897' dashStyle="solid" visible={true}></Border>
                        <Label
                            position="outside"
                            visible={true}
                            backgroundColor="#ffffff">
                            <Font color="#000000" size="14"></Font>
                        </Label>
                    </Series>

                </Chart>
            </div>
        </div>
    )
}