/*eslint max-len: ["error", { "code": 100 }]*/
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import Image from 'next/image';
import { Button, LoadIndicator } from 'devextreme-react';
import { ColumnConfig } from '@/lib/definition';

interface ToolbarButtonConfig {
    text: string;
    onClick: () => void;
    icon?: string;
    class?: string;
    disabled?: boolean;
    visible?: boolean;
    
}

interface CustomDataGridProps<T> {
    data: any[];
    columns: ColumnConfig<T>[];
    toolbarButtons?: ToolbarButtonConfig[];
    groupingColumn?: string;
    enableRowSelection?: boolean;
    enableGrouping?: boolean;
    enableInfiniteScroll?: boolean;
    enableAutoScroll?: boolean;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enableOptions?: boolean;
    loadMoreData?: () => void;
    buttonText?: string;
    onButtonClick?: () => void;
    loader: boolean;
    enableHeaderFiltering?: boolean;
    handleSelectionChange?: (selectedRowsData: any) => void;
    handleSelectedRows?: (e:any)=>void;

    enableSearchOption?: boolean;
    selectedRowKeys?: any[];
    onSelectionChanged?: (e: any) => void;
    onCellPrepared?: (e: DataGridTypes.CellPreparedEvent) => void;
}

const CustomDataGrid = <T extends Record<string, any>>({
    data,
    columns,
    toolbarButtons = [],
    groupingColumn,
    enableRowSelection = true,
    enableGrouping = true,
    enableInfiniteScroll = false,
    enableAutoScroll = false,
    enableSorting = true,
    enableFiltering = true,
    enableSearchOption = true,
    enableOptions = true,
    loadMoreData,
    loader = true,
    enableHeaderFiltering = true,
    selectedRowKeys,
    onSelectionChanged,
    onCellPrepared
}: CustomDataGridProps<T>) => {
    const [autoExpandAll, setAutoExpandAll] = useState<boolean>(true);
    const [groupingEnabled, setGroupingEnabled] = useState<boolean>(enableGrouping);
    const dataGridRef = useRef<any>(null);

    const handleScroll = useCallback(() => {
        if (dataGridRef.current) {
            const instance = dataGridRef.current.instance;
            const { scrollHeight, clientHeight, scrollTop } = instance.scrollable().scrollOffset();

            if (scrollTop + clientHeight >= scrollHeight - 50) {
                loadMoreData && loadMoreData();
            }
        }
    }, [loadMoreData]);

    const onAutoExpandAllChanged = useCallback(() => {
        setAutoExpandAll((prev) => !prev);
    }, []);

    const onGroupingEnabledChanged = useCallback(() => {
        setGroupingEnabled((prev) => !prev);
    }, []);


    useEffect(() => {
        if (enableAutoScroll && dataGridRef.current) {
            const instance = dataGridRef.current.instance;
            instance.scrollTo({ top: instance.totalItemsCount() * instance.rowHeight() });
        }
    }, [data, enableAutoScroll]);

    // Add the scroll event listener
    useEffect(() => {
        if (dataGridRef.current && enableInfiniteScroll) {
            const instance = dataGridRef.current.instance;
            const scrollable = instance.scrollable();

            if (scrollable) {
                scrollable.on('scroll', handleScroll);
            }

            return () => {
                if (scrollable) {
                    scrollable.off('scroll', handleScroll);
                }
            };
        }
    }, [enableInfiniteScroll, handleScroll]);

    // Custom render function for grouping cell to show only the value
    const groupCellRender = (e: any) => <span>{e.value}</span>;


    return (
        <div>
            {loader ?
                <LoadIndicator
                    visible={loader}
                /> :
                <DataGrid
                    ref={dataGridRef}
                    dataSource={data}
                    keyExpr="id"
                    allowColumnReordering={false}
                    showBorders={true}
                    height="600px"
                    width="100%"
                    onCellPrepared={onCellPrepared}
                    selectedRowKeys={selectedRowKeys}
                    onSelectionChanged={onSelectionChanged}
                >
                    {enableGrouping && <GroupPanel visible={true} />}

                    {enableHeaderFiltering && <HeaderFilter visible={true} />}
                    {groupingEnabled && <Grouping autoExpandAll={autoExpandAll} />}
                    {enableFiltering && <FilterRow visible={true} />}
                    {enableSorting && <Sorting mode="multiple" />}
                    <Scrolling mode={enableInfiniteScroll ? 'infinite' : 'standard'} />
                    <LoadPanel enabled={!data.length} />
                    {enableRowSelection && (
                        <Selection mode="multiple" selectAllMode={'allPages'}
                            showCheckBoxesMode={'always'} />
                    )}

                    {/* Render columns specified in the configuration passed from the parent */}
                    {columns.map((column) => (
                        <Column
                            key={String(column.dataField)}
                            dataField={String(column.dataField)}
                            visible={column.visible !== undefined ? column.visible : true}
                            headerCellRender={column.type === 'bookmark' ? () => (
                                <Image src="/icons/star.svg" width={24}
                                    height={24} alt="Bookmark" />) : undefined}
                            caption={typeof column.title === 'string' ? column.title : undefined}
                            width={column.width ? String(column.width) : undefined}
                            allowHeaderFiltering={column?.allowHeaderFiltering}
                            allowSorting={column?.allowSorting}
                            alignment={column.alignment !== undefined ? column.alignment : "left"}
                            cellRender={column.customRender ? ({ data }) =>
                                column.customRender!(data) : undefined}
                        />
                    ))}


                    {groupingColumn && (
                        <Column
                            dataField={String(groupingColumn)}
                            dataType="string"
                            groupIndex={0}
                            groupCellRender={groupCellRender}
                        />
                    )}
                    <Toolbar>
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
                    </Toolbar>
                    {enableSearchOption && <SearchPanel
                        visible={true}
                        highlightSearchText={true}
                    />}

                </DataGrid>}

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
                            value={groupingEnabled}
                            onValueChanged={onGroupingEnabledChanged}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDataGrid;
