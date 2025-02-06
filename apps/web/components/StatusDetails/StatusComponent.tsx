/*eslint max-len: ["error", { "code": 100 }]*/
"use client";
import { MoleculeStatusCode, Status, StatusComponentProps } from "@/lib/definition"
import CountCards from "@/ui/CountCards";
import { useEffect, useState } from "react";
import StatusCard from "@/ui/StatusCard";
import { getOverviewCounts } from "../Projects/projectService";
import { getCountCardsDetails, moleculeStatus } from "@/utils/constants";
import { isSystemAdmin } from "@/utils/helpers";
import { ArgumentAxis, Chart, Series, ValueAxis } from 'devextreme-react/chart';

export default function StatusComponent({ myRoles, orgUser, customerOrgId }: StatusComponentProps) {
    const { id } = orgUser;
    const [projectNumber, setProjectNumber] = useState<number>(0);
    const [libraryNumber, setLibraryNumber] = useState<number>(0);
    const [moleculeNumber, setMoleculeNumber] = useState<number>(0);
    const [headerStatusCount, setHeaderCount] = useState<Status[]>([]);
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
            <div className="flex items-center h-[177px]">
                <div className="flex w-1/2 justify-around">
                    <CountCards {... { countCardsDetails }} />
                </div>
                <div className="flex w-1/2 justify-end pr-100">
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
            <div className="w-[900px] ml-[80px]">
                <Chart id="chart"
                    dataSource={graphDataSource}
                    width={'auto'}
                    rotated={true}
                    legend={{ visible: false }}>

                    <ArgumentAxis
                        visible={false}
                        grid={{ visible: false }} // Hide grid lines on the argument axis
                        tick={{ visible: false }}
                        label={{ font: { color: '#000', size: 14 } }}
                    />

                    {/* Define the value axis */}
                    <ValueAxis
                        visible={false}
                        grid={{ visible: false }} // Hide grid lines on the value axis
                        tick={{ visible: false }}
                        label={{ visible: false }}
                    />
                    <Series
                        valueField="number"
                        argumentField="text"
                        type="bar"
                        color="#D8EAF8"
                        barWidth={18}
                        border={{ color: '#085897' }}
                        label={{
                            position: 'outside',
                            visible: true,  // Enable labels on bars
                            backgroundColor: '#fff',  // Set background color for bar labels
                            font: { color: '#000', size: 14 },  // Set font color and size
                            padding: 5  // Padding around the label
                        }} />
                </Chart>
            </div>
        </div>
    )
}