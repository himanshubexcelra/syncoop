import { ColumnConfig } from "@/lib/definition";
import { Button, CheckBox } from "devextreme-react"
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    SearchPanel,
    Selection,
    Scrolling,
    Sorting,
    FilterRow,
    LoadPanel,
    HeaderFilter,
    Toolbar,
    Item,
    DataGridTypes,
    RowDragging,
} from 'devextreme-react/data-grid';
import { useState } from "react";
import './dataGrid.css'

interface ToolbarButtonConfig {
    text: string;
    onClick: () => void;
    icon?: string;
    class?: string;
    disabled?: boolean;
    visible?: boolean;
}

export type TestGridProps = {
    tableData: any[],
    onSelectionUpdated: (e: any) => void,
    columns: ColumnConfig[],
    enabledData: any[]
    toolbarButtons?: ToolbarButtonConfig[],
    enableToolbar?: boolean,
    groupingColumn?: string,
    enableSearchOption?: boolean;
    scrollMode?: any,
}

export default function TestGrid(props: TestGridProps) {
    const {
        tableData,
        onSelectionUpdated,
        columns,
        enabledData,
        toolbarButtons = [],
        enableToolbar = true,
        groupingColumn,
        enableSearchOption = true,
        scrollMode = 'infinite',
    } = props;
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
    console.log(toolbarButtons);

    const onSelectionChanged = (e: any) => {
        console.log(2);
        setSelectedRowKeys(e.selectedRowKeys);
        onSelectionUpdated(e.selectedRowKeys);
    };

    // Function to check if a row can be selected
    const rowSelected = (rowData: any) => {
        // Disable selection if the 'disabled' field is true
        return !rowData.disabled;
    };

    // onCellPrepared to disable the checkbox
    const onCellPrepared = (e: any) => {
        if (e.rowType === 'data' && e.column.type === 'selection') {
            const rowData = e.row.data;

            // Disable the checkbox for rows where 'disabled' is true
            if (rowData.disabled) {
                // Set pointer-events to 'none' to disable interaction with the checkbox
                e.cellElement.style.pointerEvents = 'none';

                // Optional: Add some visual feedback like reducing opacity
                e.cellElement.style.opacity = 0.2;
            }
        }
    };

    // Handle the 'Select All' logic in the header checkbox
    const handleSelectAll = (args: any) => {
        if (args.value) {
            setSelectedRowKeys(enabledData);
            
        } else if (args.value !== null) {
            setSelectedRowKeys([]);
            onSelectionUpdated([]);
        }
    }

    // Determine if the header checkbox should be checked or not

    let isHeaderCheckboxChecked: any = false;
    if (selectedRowKeys.length === enabledData.length) {
        isHeaderCheckboxChecked = true;
    } else if (selectedRowKeys.length && selectedRowKeys.length < enabledData.length) {
        isHeaderCheckboxChecked = null;
    }
    return (
        <DataGrid
            dataSource={tableData}
            selectedRowKeys={selectedRowKeys}
            onSelectionChanged={onSelectionChanged}
            onCellPrepared={onCellPrepared}
            className="custom-data-grid"
        /* scrolling={{ mode: scrollMode }} */
        // Passing the columns configuration as a prop
        >
            <Selection mode="multiple" showCheckBoxesMode="always" /> {/* Multiple selection mode */}

            {/* Custom Select All Checkbox Header */}
            <Column
                dataField="id"
                caption="Select All"
                width={60}
                cellRender={() => null} // Empty cell renderer for this column
                allowSorting={false}
                allowFiltering={false}
                headerCellRender={() => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CheckBox
                            value={isHeaderCheckboxChecked}
                            onValueChanged={handleSelectAll}
                        />
                    </div>
                )}
                alignment="center"
            />
            <Column
                    dataField="source_molecule_name"
                    caption="Name"
                    width={180}
                    allowSorting={false}
                    alignment="center"
                />

            {/* Render dynamic columns */}
            {columns.map((column) => {
                return (<Column
                    key={column.dataField}
                    dataField={column.dataField}
                    visible={column.visible !== undefined ? column.visible : true}
                    headerCellRender={column.headerCellRenderer}
                    caption={typeof column.title === 'string' ? column.title : undefined}
                    width={column.width}
                    allowHeaderFiltering={column?.allowHeaderFiltering}
                    allowSorting={column?.allowSorting}
                    /* allowFiltering={column?.allowFiltering} */
                    alignment={column.alignment !== undefined ? column.alignment : "left"}
                    cellRender={column.customRender ? ({ data }) =>
                        column.customRender!(data) : undefined}
                    headerFilter={column.headerFilter}
                    cssClass={column.cssClass}
                    defaultSortOrder={column.defaultSortOrder} />
                )
            })}

            {enableToolbar && <Toolbar>
                {groupingColumn &&
                    <Item location="before" name="groupPanel" />
                }
                {toolbarButtons.map((button, index) => (
                    <Item key={index} location="after">
                        <Button
                            text={button.text}
                            onClick={() => button.onClick()}
                            icon={button.icon}
                            disabled={button.disabled}
                            className={button.class || "btn-primary"}
                            visible={button.visible !== undefined ? button.visible : true}
                        />
                    </Item>
                ))}
                <Item name="searchPanel" location="after" />
            </Toolbar>}
            {enableSearchOption && <SearchPanel
                visible={true}
                highlightSearchText={true}
            />}
        </DataGrid>
    )
}