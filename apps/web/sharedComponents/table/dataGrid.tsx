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
    Toolbar as GridToolbar,
    ToolbarItem,
} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import Image from 'next/image';

interface ColumnConfig<T> {
    dataField: keyof T;
    title?: string | React.ReactNode;
    width?: number;
    customRender?: (data: T) => React.ReactNode;
}

interface CustomDataGridProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    groupingColumn?: string;
    enableRowSelection?: boolean;
    enableGrouping?: boolean;
    enableInfiniteScroll?: boolean;
    enableAutoScroll?: boolean;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enableOptions?: boolean;
    loadMoreData?: () => void;
}

const CustomDataGrid = <T extends Record<string, any>>({
    data,
    columns,
    groupingColumn,
    enableRowSelection = true,
    enableGrouping = true,
    enableInfiniteScroll = false,
    enableAutoScroll = false,
    enableSorting = true,
    enableFiltering = true,
    enableOptions = true,
    loadMoreData,
}: CustomDataGridProps<T>) => {
    const [autoExpandAll, setAutoExpandAll] = useState<boolean>(true);
    const [groupingEnabled, setGroupingEnabled] = useState<boolean>(enableGrouping);
    const dataGridRef = useRef<any>(null);

    const onScroll = useCallback(() => {
        if (dataGridRef.current) {
            const instance = dataGridRef.current.instance;
            const { scrollHeight, clientHeight, scrollTop } = instance.scrollable().scrollOffset();

            if (scrollTop + clientHeight >= scrollHeight - 50) {
                console.log('Infinite scroll triggered');
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

    // Custom render function for grouping cell to show only the value
    const groupCellRender = (e: any) => <span>{e.value}</span>;

    return (
        <div>
            <DataGrid
                ref={dataGridRef}
                dataSource={data}
                keyExpr="id"
                allowColumnReordering={false}
                showBorders={true}
                height="600px"
                width="100%"
                onScroll={onScroll}
            >

                {enableGrouping && <GroupPanel visible={true} />}

                <HeaderFilter visible={true} />
                {groupingEnabled && <Grouping autoExpandAll={autoExpandAll} />}
                {enableFiltering && <FilterRow visible={true} />}
                {enableSorting && <Sorting mode="multiple" />}
                <Scrolling mode={enableInfiniteScroll ? 'infinite' : 'standard'} />
                <LoadPanel enabled={true} />
                {enableRowSelection && (
                    <Selection mode="multiple" selectAllMode={'allPages'}
                        showCheckBoxesMode={'always'} />
                )}

                {/* Render columns specified in the configuration passed from the parent */}
                {columns.map((column) => (
                    <Column
                        key={String(column.dataField)}
                        dataField={String(column.dataField)}
                        caption={column.dataField !== 'bookmark' ? column.title : undefined}
                        headerCellRender={column.dataField === 'bookmark' ? () => (
                            <Image src="/icons/star.svg" width={24} height={24} alt="Bookmark" />
                        ) : undefined}
                        width={column.width ? String(column.width) : undefined}
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

                <GridToolbar>
                    <ToolbarItem location="after">
                        <Button
                            text="Send for Synthesis(8)"
                            icon="plus"
                            render={(buttonData: any) => (
                                <>
                                    <Image
                                        src="/icons/plus.svg"
                                        width={24}
                                        height={24}
                                        alt="Create"
                                    />
                                    <span className='ml-[5px]'>
                                        {buttonData.text}
                                    </span>
                                </>
                            )}
                        />
                    </ToolbarItem>
                    <ToolbarItem name="searchPanel" location="after" />
                </GridToolbar>

                <SearchPanel
                    visible={true}
                    highlightSearchText={true}
                />
            </DataGrid>

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
