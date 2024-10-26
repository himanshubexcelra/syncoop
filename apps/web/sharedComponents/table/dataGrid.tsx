import React, { useCallback, useState } from 'react';
import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    SearchPanel,
    Selection,
    Scrolling,
    Sorting,
    FilterRow,
} from 'devextreme-react/data-grid';
import CheckBox from 'devextreme-react/check-box';
import Image from 'next/image';
import { Button } from "devextreme-react/button";
import StatusMark from '@/ui/StatusMark';
import { StatusCodeBg, StatusCodeType } from '@/utils/constants';

const CustomDataGrid = ({
    data,
    groupingColumn = "",
    enableRowSelection = true,
    enableGrouping = true,
    enableInfiniteScroll = false,
    enableSorting = true,
    enableFiltering = true,
}) => {
    const [autoExpandAll, setAutoExpandAll] = useState(true);
    const [groupingEnabled, setGroupingEnabled] = useState(enableGrouping);

    const onAutoExpandAllChanged = useCallback(() => {
        setAutoExpandAll((prev) => !prev);
    }, []);

    const onGroupingEnabledChanged = useCallback(() => {
        setGroupingEnabled((prev) => !prev);
    }, []);

    const bookMarkItem = (data: any) => {
        // Bookmark action logic here
        console.log(data, 'data-data');

    }

    // Function to render columns dynamically based on data fields
    const renderColumns = () => {
        return Object.keys(data[0] || {}).map((field) => {
            if (field === "id") return null; // Exclude 'id' column

            if (field === "bookmark") {
                return (
                    <Column
                        key={field}
                        dataField={field}
                        width={90}
                        alignment="center"
                        allowSorting={false}
                        headerCellRender={() => (
                            <Image src="/icons/star.svg" width={24} height={24} alt="Bookmark" />
                        )}
                        cellRender={() => (
                            <span className='flex justify-center cursor-pointer' onClick={bookMarkItem}>
                                <Image src="/icons/star-filled.svg" width={24} height={24} alt="Bookmarked" />
                            </span>
                        )}
                    />
                );
            }

            if (field === "structure") {
                return (
                    <Column
                        key={field}
                        dataField={field}
                        minWidth={330}
                        cellRender={({ data }) => (
                            <span className='flex justify-center items-center gap-[7.5px]'>
                                <Image
                                    src={data.structure || '/icons/molecule-order-structure.svg'}
                                    width={107.5}
                                    height={58}
                                    alt="Structure" onClick={() => bookMarkItem(data)}
                                />
                                <Button onClick={() => bookMarkItem(data)} render={() => (
                                    <Image src="/icons/edit.svg" width={24} height={24} alt="edit" />
                                )} />
                                <Button onClick={() => bookMarkItem(data)} render={() => (
                                    <Image src="/icons/zoom.svg" width={24} height={24} alt="zoom" />
                                )} />
                                <Button onClick={() => bookMarkItem(data)} render={() => (
                                    <Image src="/icons/delete.svg" width={24} height={24} alt="delete" />
                                )} />
                            </span>
                        )}
                    />
                );
            }

            if (field === "status") {
                return (
                    <Column
                        key={field}
                        dataField={field}
                        minWidth={150}
                        cellRender={({ data }) => (
                            <span className="flex items-center gap-[5px]">
                                {data.status}
                                <StatusMark status={data.status} />
                            </span>
                        )}
                    />
                );
            }

            if (field === "caco2" || field === "herg" || field === "clint" || field === "hepg2cytox" || field === "solubility") {
                return (
                    <Column
                        key={field}
                        dataField={field}
                        minWidth={150}
                        cellRender={({ data }) => {
                            let color: StatusCodeType = 'ready';
                            if (data.herg <= 0.5) color = 'failed';
                            else if (data.herg >= 0.5 && data.herg < 1) color = 'info';
                            else if (data.herg >= 1) color = 'done';
                            return (
                                <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                    {data.herg}
                                </span>
                            )
                        }}
                    />
                );
            }

            // Default rendering for other fields
            return <Column minWidth={150} key={field} dataField={field} />;
        });
    };

    return (
        <div>
            <DataGrid
                dataSource={data}
                keyExpr="id"
                allowColumnReordering={true}
                showBorders={true}
                height="600px"
                width="100%"
            >
                {enableGrouping && <GroupPanel visible={true} />}
                <SearchPanel visible={true} />
                {groupingEnabled && <Grouping autoExpandAll={autoExpandAll} />}
                {enableFiltering && <FilterRow visible={true} />}
                {enableSorting && <Sorting mode="multiple" />}
                {/* <Paging defaultPageSize={10} /> */}
                <Scrolling mode={enableInfiniteScroll ? 'infinite' : 'standard'} />
                {enableRowSelection && (
                    <Selection mode="multiple" selectAllMode={'allPages'} showCheckBoxesMode={'always'} />
                )}

                {/* Dynamically rendered columns based on data keys */}
                {renderColumns()}

                {/* Dynamic Grouping Column */}
                {groupingColumn && <Column dataField={groupingColumn} dataType="string" groupIndex={0} />}
            </DataGrid>

            {/* Options */}
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
        </div>
    );
};

export default CustomDataGrid;
