"use client";
import DataGrid, { Column, Paging } from "devextreme-react/data-grid";
import { useState, useEffect, useContext } from 'react';
import { AssayTableProps, Assay } from "@/lib/definition";
import { getOrganizationById } from "../Organization/service";
import { LoadIndicator } from "devextreme-react";
import { AppContext } from "@/app/AppState";

export default function AssayTable({ orgUser }: AssayTableProps) {
    const [metaData, setMetaData] = useState<Assay[]>([]);;
    const [loader, setLoader] = useState(true);
    const orgId = orgUser?.id
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const fetchData = async () => {
        const orgData = await getOrganizationById({ withRelation: [], id: orgId })
        const processedData = orgData?.metadata && typeof orgData.metadata === 'object'
            ? Object.keys(orgData.metadata).map((key) => ({
                name: key,
                description: orgData.metadata[key]
            }))
            : [];

        setMetaData(processedData);
        setLoader(false);
        context?.addToState({ ...appContext, refreshAssayTable: false });
    }
    useEffect(() => {
        fetchData();
    }, [orgId, appContext?.refreshAssayTable])
    return (
        <div className="p-5">
            <LoadIndicator
                visible={loader}
            />
            {!loader && <DataGrid
                dataSource={metaData}
                showBorders={false}
                showColumnHeaders={false}
                className="custom-row-height"
                rowAlternationEnabled={false}
                columnAutoWidth={false}
            >
                <Column dataField="name" caption="Assay" width="30%" />
                <Column dataField="description" caption="Description" width="70%" />
                <Paging defaultPageSize={5} defaultPageIndex={0} />
            </DataGrid>}
        </div>
    );
};

