/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    SearchPanel,
    Selection,
    Sorting,
    FilterRow,
    LoadPanel,
    HeaderFilter,
    Toolbar,
    Item,
    DataGridTypes,
    RowDragging,
    Export,
    ColumnChooser,
    DataGridRef,
    Editing,
    Scrolling,
} from 'devextreme-react/data-grid';

import CheckBox from 'devextreme-react/check-box';
import { Button, LoadIndicator, SelectBox } from 'devextreme-react';
import { ColumnConfig } from '@/lib/definition';
import './dataGrid.css';
import { ToolbarItem } from 'devextreme/ui/file_manager';
import Image from 'next/image';
import { SelectBoxTypes } from 'devextreme-react/cjs/select-box';
import { sortStringsConsideringNumeric } from '@/utils/helpers';

interface ToolbarButtonConfig {
    text: string;
    onClick: () => void;
    icon?: string;
    class?: string;
    disabled?: boolean;
    visible?: boolean;
    loader?: boolean;
}

interface CustomDataGridProps {
    data: any[];
    selectionEnabledRows?: any[];
    height?: string | number;
    maxHeight?: string;
    columns: ColumnConfig[];
    toolbarButtons?: ToolbarButtonConfig[];
    groupingColumn?: string;
    enableRowSelection?: boolean;
    showFooter?: boolean;
    enableGrouping?: boolean;
    paging?: boolean;
    enableAutoScroll?: boolean;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enableExport?: boolean,
    enableColumnChooser?: boolean,
    enableOptions?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
    loader?: boolean;
    enableHeaderFiltering?: boolean;
    handleSelectionChange?: (selectedRowsData: any) => void;
    handleSelectedRows?: (e: any) => void;
    enableSearchOption?: boolean;
    onSelectionUpdated?: (selectedRowsKeys: number[], selectionEnabledRows: any[]) => void;
    showDragIcons?: boolean;
    enableToolbar?: boolean;
    onReorderFunc?: (e: any) => void;
    onEditorPreparing?: (e: any) => void;
    onToolbarPreparing?: (e: any) => void;
    onRowPrepared?: (e: any) => void;
    onRowClick?: (e: any) => void;
    onCellClick?: (e: any) => void;
    onExporting?: (e: any) => void;
    cssClass?: string;
    hoverStateEnabled?: boolean;
    selectedRow?: any[];
    dropdownButtons?: any;
    onRowUpdated?: (e: DataGridTypes.RowUpdatingEvent) => void
}

const CustomDataGrid = ({
    data,
    selectionEnabledRows = data,
    height,
    maxHeight,
    columns,
    toolbarButtons = [],
    groupingColumn,
    enableRowSelection = true,
    showFooter = false,
    enableGrouping = true,
    paging = false,
    enableSorting = true,
    enableFiltering = true,
    enableExport = false,
    enableColumnChooser = false,
    enableSearchOption = true,
    enableOptions = true,
    enableHeaderFiltering = true,
    cssClass,
    onSelectionUpdated,
    onExporting,
    showDragIcons = false,
    enableToolbar = true,
    onReorderFunc,
    onEditorPreparing,
    onRowClick,
    onRowPrepared,
    selectedRow,
    onCellClick,
    dropdownButtons,
    onRowUpdated
}: CustomDataGridProps) => {
    const [autoExpandAll, setAutoExpandAll] = useState<boolean>(true);
    // const [groupingEnabled, setGroupingEnabled] = useState<boolean>(enableGrouping);
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
    // const [data, setData] = useState(tableData);
    useEffect(() => {
        setSelectedRowKeys(selectedRow ? selectedRow : []);
    }, [selectedRow]);
    /* const [gridHeight, setGridHeight] = useState(typeof window !== 'undefined' ?
        window.innerHeight - 100 : height); // Default height */
    const [gridHeight,] = useState(height); // Default height
    const grid = useRef<DataGridRef>(null);
    const [currentSort, setCurrentSort] = useState<{
        field: string | null;
        order: 'asc' | 'desc' | null
    }>({ field: null, order: null });

    const onContentReady = (e: any) => {
        const sortedColInfo = e.component
            .getVisibleColumns()
            .find((column: any) => column.sortOrder);

        if (sortedColInfo) {
            const field = sortedColInfo?.dataField;
            const order = sortedColInfo?.sortOrder;
            setCurrentSort({ field, order });
        }
    };

    const handleSortChanged = (e: any) => {
        // Only handle sorting-related changes
        if (e.name !== 'columns' || !e.fullName?.includes('sortOrder')) return;
        const dataGrid = grid.current?.instance();
        if (!dataGrid) return;
        const sortedColInfo = e.component.getVisibleColumns()?.
            filter((column: any) => column.sortOrder)?.[0]
        const newField = sortedColInfo?.dataField;
        // Get current sorting state
        const currentField = currentSort.field;
        const previousOrder = e.previousValue;
        const newOrder = e.value;

        if (currentField === newField) {
            if (newOrder === 'desc' && previousOrder === 'asc') {
                // Second click - already handled by DevExtreme
                setCurrentSort({ field: newField, order: 'desc' });
            } else if (previousOrder === 'desc') {
                // Third click - clear sorting
                dataGrid.clearSorting();
                setCurrentSort({ field: null, order: null });
            }
        } else {
            // New column clicked - DevExtreme handles the ascending sort
            setCurrentSort({ field: newField, order: 'asc' });
        }
    };

    // Function to adjust grid height dynamically
    /* const adjustGridHeight = () => {
        const newHeight = window.innerHeight; // Subtract any offset if needed
        setGridHeight(newHeight);
    }; */

    useEffect(() => {
        // Adjust height when the window is resized
        /* window.addEventListener('resize', adjustGridHeight); */

        // Cleanup the event listener on component unmount
        /* return () => {
            window.removeEventListener('resize', adjustGridHeight);
        }; */
    }, []);

    const onAutoExpandAllChanged = useCallback(() => {
        setAutoExpandAll((prev) => !prev);
    }, []);

    const onGroupingEnabledChanged = useCallback(() => {
        // setGroupingEnabled((prev) => !prev);
    }, []);

    // Custom render function for grouping cell to show only the value
    const groupCellRender = useCallback((e: any) => <span>{e.value}</span>, []);

    const onReorder = useCallback((event: any) => {
        if (onReorderFunc) {
            onReorderFunc(event)
        }
    }, []);

    const onToolbarPreparing = useCallback((e: any) => {
        if (enableExport) {
            e?.toolbarOptions?.items.map((d: ToolbarItem, index: number) => {
                if (d.name === "exportButton") {
                    const customConfiguration = e?.toolbarOptions?.items[index].options.items;
                    if (customConfiguration && customConfiguration.length) {
                        customConfiguration[0].text = "Export all data to CSV";
                        customConfiguration[0].icon = "export";
                    }
                }
            });
        }
    }, [])

    const exportFormatCSV = ['csv'];
    // const exportFormatExcel = ['xlsx'];

    const onSelectionChanged = (e: any) => {
        setSelectedRowKeys([...e.selectedRowKeys]);
        if (onSelectionUpdated) {
            onSelectionUpdated(e.selectedRowKeys, e.selectedRowsData);
        }
    }

    const disableCheckBox = (rowData: any) => {
        if (grid.current) {
            const dataGrid = grid.current?.instance();
            dataGrid.deselectRows([rowData.id]);
        }
    }

    // onCellPrepared to disable the checkbox
    const onCellPrepared = useCallback((e: DataGridTypes.CellPreparedEvent) => {
        if (e.rowType === 'data') {
            if (e.column.type === 'selection') {
                const rowData = e.row.data;
                // Disable the checkbox for rows where 'disabled' is true
                if (rowData.disabled) {
                    // Set pointer-events to 'none' to disable interaction with the checkbox
                    e.cellElement.style.pointerEvents = 'none';

                    // Optional: Add some visual feedback like reducing opacity
                    e.cellElement.style.opacity = '0.2';
                    disableCheckBox(rowData);
                }
            }
        }
    }, [])

    // Handle the 'Select All' logic in the header checkbox
    const handleSelectAll = (args: any) => {
        let selectedRowsKeys: number[] = [];
        if (args.value) {
            selectedRowsKeys = selectionEnabledRows.map(
                (row: object) => (row as any).id);
            setSelectedRowKeys(selectedRowsKeys);
        } else if (args.value !== null) {
            setSelectedRowKeys([]);
        }
        if (onSelectionUpdated) {
            onSelectionUpdated(selectedRowsKeys, selectionEnabledRows);
        }
    }

    // Determine if the header checkbox should be checked or not
    let isHeaderCheckboxChecked: any = false;
    if (selectedRowKeys.length === selectionEnabledRows.length
        && selectionEnabledRows.length !== 0) {
        isHeaderCheckboxChecked = true;
    } else if (selectedRowKeys.length && selectedRowKeys.length < selectionEnabledRows.length) {
        isHeaderCheckboxChecked = null;
    }

    const [groupByColumn, setGroupingColumn] = useState(groupingColumn);

    const onDropDownValueChanged = useCallback((e: SelectBoxTypes.ValueChangedEvent) => {
        setGroupingColumn(e.value);
    }, [])

    const onRowUpdating = (e: DataGridTypes.RowUpdatingEvent) => {
        if (onRowUpdated)
            onRowUpdated(e);
    };

    return (
        <div>
            <DataGrid
                ref={grid}
                paging={{ enabled: paging }}
                dataSource={data}
                keyExpr="id"
                height={gridHeight}
                allowColumnReordering={false}
                showBorders={true}
                width="100%"
                onOptionChanged={handleSortChanged}
                onCellPrepared={onCellPrepared}
                onRowClick={onRowClick}
                onCellClick={onCellClick}
                selectedRowKeys={selectedRowKeys}
                onSelectionChanged={onSelectionChanged}
                onEditorPreparing={onEditorPreparing}
                onRowPrepared={onRowPrepared}
                onExporting={onExporting}
                onToolbarPreparing={onToolbarPreparing}
                style={{ maxHeight }}
                className={cssClass}
                onContentReady={onContentReady}
                onRowUpdating={onRowUpdating}
            >
                <Scrolling
                    rowRenderingMode='virtual'
                    columnRenderingMode='virtual'>
                </Scrolling>
                {enableColumnChooser &&
                    <ColumnChooser
                        enabled={true}
                        mode="select"
                        height={800}
                        width={290}
                        title='Choose Columns'
                    />
                }
                {enableExport &&
                    <Export enabled={true} allowExportSelectedData={!!selectedRowKeys.length}
                        formats={exportFormatCSV} />}

                {showDragIcons && <RowDragging
                    allowReordering={true}
                    onReorder={onReorder}
                    showDragIcons={showDragIcons}
                />}
                {enableGrouping && <GroupPanel visible={true} />}

                {enableHeaderFiltering && <HeaderFilter visible={true} />}
                {enableGrouping && <Grouping autoExpandAll={autoExpandAll} />}
                {enableFiltering && <FilterRow visible={true} />}
                {enableSorting && <Sorting mode="multiple" />}
                <LoadPanel enabled={!data?.length} />
                {enableRowSelection && (
                    <Selection mode="multiple" />
                )}

                {enableRowSelection && <Column
                    dataField="id"
                    caption="Select All"
                    width={'auto'}
                    cellRender={() => null} // Empty cell renderer for this column
                    allowSorting={false}
                    allowFiltering={false}
                    defaultFilterValue={false}
                    allowEditing={false}
                    showInColumnChooser={false}
                    allowExporting={false}
                    headerCellRender={() => (
                        <div>
                            <CheckBox
                                value={isHeaderCheckboxChecked}
                                onValueChanged={handleSelectAll}
                            />
                        </div>
                    )}
                    alignment="center"
                />}

                {columns.map((column) => {
                    const props = {
                        allowEditing: column.editingEnabled || false,
                        dataField: String(column.dataField),
                        visible: (column.visible !== undefined ? column.visible : true),
                        headerCellRender: column.headerCellRenderer,
                        caption: (typeof column.title === 'string' ? column.title : undefined),
                        width: (column.width ? String(column.width) : undefined),
                        allowHeaderFiltering: column?.allowHeaderFiltering,
                        allowSorting: column?.allowSorting,
                        alignment: (column.alignment !== undefined ? column.alignment : "left"),
                        cellRender: (column.customRender ? ({ data }: any) =>
                            column.customRender!(data) : undefined),
                        headerFilter: column.headerFilter,
                        cssClass: column.cssClass,
                        defaultSortOrder: column.defaultSortOrder,
                        ...(() => {
                            if (column.dataType === 'numeric') {
                                return {
                                    sortingMethod: sortStringsConsideringNumeric
                                }
                            }
                            return {};
                        })()
                    };
                    return (<Column
                        key={column.dataField}
                        {...props}
                    />)
                })}

                <Editing mode="cell" allowUpdating={true}></Editing>

                {enableGrouping && groupByColumn && (
                    <Column
                        dataField={groupByColumn}
                        dataType="string"
                        groupIndex={0}
                        groupCellRender={groupCellRender}
                        allowHeaderFiltering={false}
                        allowSorting={true}
                    />
                )}

                {enableToolbar && <Toolbar>
                    {enableGrouping && groupByColumn && dropdownButtons &&
                        dropdownButtons.map((dropdown: any, index: number) => <Item key={index}>
                            <div className='w-[240px] float-right'>
                                <div className="flex items-center justify-evenly">
                                    <div className="text-themeBlueColor">{dropdown.text}</div>
                                    <div className="dx-field-value">
                                        <SelectBox
                                            width={'auto'}
                                            dataSource={dropdown.options}
                                            defaultValue={dropdown.options[0].id}
                                            valueExpr="id"
                                            displayExpr="category"
                                            value={groupByColumn}
                                            onValueChanged={onDropDownValueChanged}
                                            dropDownButtonRender={() =>
                                                <Image alt="" width={18}
                                                    height={18}
                                                    src="/images/custom-dropbutton-icon.svg">
                                                </Image>}
                                        />
                                    </div>
                                </div>
                            </div></Item>)}
                    {enableGrouping && groupByColumn &&
                        <Item location="before" name="groupPanel" />
                    }
                    {toolbarButtons.map((button, index) => (
                        <Item key={index} location="after">
                            {!button.loader ? <Button
                                text={button.text}
                                onClick={() => button.onClick()}
                                icon={button.icon}
                                disabled={button.disabled}
                                className={button.class || "btn-primary"}
                                visible={button.visible !== undefined ? button.visible : true}>
                            </Button> :
                                <Button
                                    onClick={() => button.onClick()}
                                    icon={button.icon}
                                    disabled={button.disabled}
                                    className={`${button.class || 'btn-primary'} w-40`}
                                    visible={button.visible !== undefined ? button.visible : true}>
                                    <LoadIndicator width={20} height={20}
                                        className="button-indicator" visible={button.loader} />
                                </Button>}
                        </Item>
                    ))}
                    {enableExport && <Item name="exportButton" location="after" />}
                    {enableColumnChooser &&
                        <Item name='columnChooserButton' widget='dxButton' location="after" />}
                    <Item name="searchPanel" location="after" />
                </Toolbar>}
                {enableSearchOption && <SearchPanel
                    visible={true}
                    highlightSearchText={true}
                />}

            </DataGrid>

            {showFooter && <div className='flex justify-center'>
                <span className='text-themeGreyColor'>
                    {data.length}
                    <span className='pl-[3px]'>
                        {data.length > 1 ? 'records' : 'record'}
                    </span>
                    <span className='pl-[2px]'> found</span>
                </span>

                {!!data.length && enableRowSelection &&
                    <>
                        <span>&nbsp;|&nbsp;</span>
                        <a onClick={() =>
                            handleSelectAll({ value: !selectedRowKeys.length })}
                            className={
                                `text-themeSecondayBlue pl-[5px] font-bold pb-[10px] cursor-pointer`
                            }>{(selectedRowKeys.length === selectionEnabledRows.length) ?
                                'Un-Select' : 'Select'} All {selectionEnabledRows.length}
                        </a>
                    </>}
            </div>}

            {enableOptions && (
                <div className="options">
                    <div className="caption">Options</div>
                    <div className="option">
                        <CheckBox
                            text="Expand All Groups"
                            id="autoExpand"
                            value={autoExpandAll}
                            onValueChanged={onAutoExpandAllChanged}
                        />
                    </div>
                    <div className="option">
                        <CheckBox
                            text="Enable Row Grouping"
                            id="enableGrouping"
                            value={enableGrouping}
                            onValueChanged={onGroupingEnabledChanged}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDataGrid;
