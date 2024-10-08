"use client";
import DataGrid, { Column, Pager, Paging } from "devextreme-react/data-grid";
import "./assayTable.css"
import { AssayTableProps } from "@/lib/definition";


export default function AssayTable({ dataSource }: AssayTableProps) {
    return (
        <div className="p-5">
            <DataGrid
                dataSource={dataSource}
                showBorders={false}
                showColumnHeaders={false}
                className="custom-row-height bordered-rows"
                rowAlternationEnabled={false}
                columnAutoWidth={false}
            >
                <Column dataField="name" caption="Assay" width="30%" />
                <Column dataField="description" caption="Description" width="70%" />
                <Pager allowedPageSizes={[4, 8, 12]} showPageSizeSelector={true} />
                <Paging defaultPageSize={4} />
            </DataGrid>
        </div>
    );
};

