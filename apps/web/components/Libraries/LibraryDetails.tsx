'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
// import toast from "react-hot-toast";
import { LoadIndicator } from 'devextreme-react/load-indicator';
import {
    OrganizationDataFields,
} from '@/lib/definition';
import DataGrid, {
    Item as ToolbarItem,
    Column,
    Toolbar as GridToolbar,
    DataGridRef,
    Paging,
    Sorting,
    Selection,
    DataGridTypes,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react/button";
import { SelectBox } from 'devextreme-react/select-box';
import toast from "react-hot-toast";
import '../Organization/form.css';
import { MOLECULES, StatusCodeBg } from '@/utils/constants';
import { useCart } from '../../app/Provider/CartProvider';
const selectAllFieldLabel = { 'aria-label': 'Select All Mode' };
const showCheckboxesFieldLabel = { 'aria-label': 'Show Checkboxes Mode' };

const showCheckBoxesModes = ['none', 'onClick', 'onLongTap', 'always'];
const selectAllModes = ['allPages', 'page'];

type ProductModel = {
    id: number;
    moleculeId: number;
    molecularWeight: number;
};
interface CartItem {
    id: number;
};


export default function LibraryDetails() {
    const cartDetails = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart') ?? '[]') : [];
    const preselectedValue: number[] = cartDetails.length > 0 ? cartDetails.map((item: CartItem) => item.id) : [];
    const { addToCart, clearCart } = useCart();
    const [tableData, setTableData] = useState<OrganizationDataFields[]>([]);
    const [loader, setLoader] = useState(true);
    const [allMode, setAllMode] = useState<DataGridTypes.SelectAllMode>('allPages');
    const [checkBoxesMode, setCheckBoxesMode] = useState<DataGridTypes.SelectionColumnDisplayMode>('always');
    // const [moleculeData, setMoleculeData] = useState<any>([]);
    const [moleculeData, setMoleculeData] = useState<ProductModel[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>(preselectedValue); // Store selected item IDs

    const [isCartUpdate, updateCart] = useState(false)
    const grid = useRef<DataGridRef>(null);
    const fetchLibraries = async () => {
        setTableData(MOLECULES);
        setLoader(false);
    }

    useEffect(() => {
        fetchLibraries();
    }, []);
    
    const onCheckBoxesModeChanged = useCallback(({ value }: any) => {
        setCheckBoxesMode(value);
    }, []);

    const onAllModeChanged = useCallback(({ value }: any) => {
        setAllMode(value);
    }, []);

    const bookMarkItem = () => {
    }

    const onSelectionChanged = (e: any) => {
        updateCart(true);
        setSelectedRowKeys(e.selectedRowKeys);
        const checkedMolecule = e.selectedRowsData;
        // If the check box is unchecked
        if (e.currentDeselectedRowKeys.length > 0) {
            const newmoleculeData: ProductModel[] = checkedMolecule.filter((item) => item.id !== e.currentDeselectedRowKeys[0].id);
            setMoleculeData(newmoleculeData);
        }
        else {
            const newItem: ProductModel[] = checkedMolecule.map((data: ProductModel) => {
                return { id: data.id, moleculeId: data.moleculeId, molecularWeight: data.molecularWeight }
                    ;
            }
            );
            setMoleculeData(newItem);
        }
    };

    const addProductToCart = () => {
        clearCart();
        moleculeData.forEach((product) => addToCart(product));
        localStorage.setItem("cart", JSON.stringify(moleculeData))
        toast.success('Molecule is updated in your cart.');
    }


    return (
        <div className='p-[20px]'>
            <LoadIndicator
                visible={loader}
            />
            {!loader &&
                <DataGrid
                    dataSource={tableData}
                    showBorders={true}
                    ref={grid}
                    keyExpr="id"
                    selectedRowKeys={selectedRowKeys}
                    onSelectionChanged={onSelectionChanged}
                >
                    <Selection
                        mode="multiple"

                    />
                    <Paging defaultPageSize={10} defaultPageIndex={0} />
                    <Sorting mode="single" />
                    <Column
                        dataField="bookmark"
                        width={90}
                        alignment="center"
                        allowSorting={false}
                        headerCellRender={() =>
                            <Image
                                src="/icons/star.svg"
                                width={24}
                                height={24}
                                alt="Create"
                            />
                        }
                        cellRender={() => (
                            <span className='flex justify-center cursor-pointer' onClick={bookMarkItem}>
                                <Image
                                    src="/icons/star-filled.svg"
                                    width={24}
                                    height={24}
                                    alt="Create"
                                />
                            </span>
                        )}
                    />
                    <Column dataField="Structure"
                        minWidth={150}
                        cellRender={() => (
                            <span className='flex justify-center gap-[7.5px]' onClick={bookMarkItem}>
                                <Image
                                    src="/icons/libraries.svg"
                                    width={24}
                                    height={24}
                                    alt="Create"
                                />
                                <Button
                                    disabled={true}
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/edit.svg"
                                                width={24}
                                                height={24}
                                                alt="edit"
                                            />
                                        </>
                                    )}
                                />
                                <Button
                                    disabled={true}
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/zoom.svg"
                                                width={24}
                                                height={24}
                                                alt="zoom"
                                            />
                                        </>
                                    )}
                                />
                                <Button
                                    disabled={true}
                                    render={() => (
                                        <>
                                            <Image
                                                src="/icons/delete.svg"
                                                width={24}
                                                height={24}
                                                alt="delete"
                                            />
                                        </>
                                    )}
                                />

                            </span>
                        )} />
                    <Column dataField="moleculeId" caption="Molecule ID" />
                    <Column dataField="molecularWeight" caption="Molecular Weight" />
                    <Column dataField="analyse" />
                    <Column dataField="herg" caption="HERG" cellRender={({ data }) => {
                        let color = ''
                        if (data.herg <= 0.5) color = 'failed';
                        else if (data.herg >= 0.5 && data.herg < 1) color = 'info';
                        else if (data.herg >= 1) color = 'done';
                        return (
                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                {data.herg}
                            </span>
                        )
                    }} />
                    <Column dataField="caco2" caption="CACO-2" cellRender={({ data }) => {
                        let color = ''
                        if (data.caco2 <= 0.5) color = 'failed';
                        else if (data.caco2 >= 0.5 && data.caco2 < 1) color = 'info';
                        else if (data.caco2 >= 1) color = 'done';
                        return (
                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                {data.caco2}
                            </span>
                        )
                    }} />
                    <Column dataField="clint" caption="cLint" cellRender={({ data }) => {
                        let color = ''
                        if (data.clint <= 0.5) color = 'failed';
                        else if (data.clint >= 0.5 && data.clint < 1) color = 'info';
                        else if (data.clint >= 1) color = 'done';
                        return (
                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                {data.clint}
                            </span>
                        )
                    }} />
                    <Column dataField="hepg2cytox" caption="HepG2-cytox" cellRender={({ data }) => {
                        let color = ''
                        if (data.hepg2cytox <= 0.5) color = 'failed';
                        else if (data.hepg2cytox >= 0.5 && data.hepg2cytox < 1) color = 'info';
                        else if (data.hepg2cytox >= 1) color = 'done';
                        return (
                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                {data.hepg2cytox}
                            </span>
                        )
                    }} />
                    <Column dataField="solubility" cellRender={({ data }) => {
                        let color = ''
                        if (data.solubility <= 0.5) color = 'failed';
                        else if (data.solubility >= 0.5 && data.solubility < 1) color = 'info';
                        else if (data.solubility >= 1) color = 'done';
                        return (
                            <span className={`flex items-center gap-[5px] ${StatusCodeBg[color]}`}>
                                {data.solubility}
                            </span>
                        )
                    }} />

                    <GridToolbar>
                        <ToolbarItem location="after">
                            <Button
                                text="Add Molecule"
                                icon="plus"
                                disabled={true}
                                render={(buttonData: any) => (
                                    <>
                                        <Image
                                            src="/icons/plus.svg"
                                            width={24}
                                            height={24}
                                            alt="Create"
                                        />
                                        <span>{buttonData.text}</span>
                                    </>
                                )}
                            />
                        </ToolbarItem>
                        <ToolbarItem location="after">
                            <Button
                                text="Filter"
                                icon="filter"
                                elementAttr={{ class: "btn_primary btn-toolbar" }}
                                disabled={true}
                                render={() => (
                                    <>
                                        <Image
                                            src="/icons/filter.svg"
                                            width={24}
                                            height={24}
                                            alt="Filter"
                                        />
                                        <span>Filter</span>
                                    </>
                                )}
                            />
                        </ToolbarItem>
                        <ToolbarItem location="after">
                            <Button
                                elementAttr={{ class: "btn_primary btn-toolbar" }}
                                render={() => (
                                    <>
                                        <span>Add to cart</span>
                                    </>
                                )}
                                onClick={addProductToCart}
                                disabled={!isCartUpdate}
                            />
                        </ToolbarItem>
                    </GridToolbar>
                    <div>
                        <div>
                            <SelectBox
                                id="select-all-mode"
                                inputAttr={selectAllFieldLabel}
                                dataSource={selectAllModes}
                                value={allMode}
                                disabled={checkBoxesMode === 'none'}
                                onValueChanged={onAllModeChanged}
                            />
                        </div>
                        <div className="option checkboxes-mode">
                            <SelectBox
                                id="show-checkboxes-mode"
                                inputAttr={showCheckboxesFieldLabel}
                                dataSource={showCheckBoxesModes}
                                value={checkBoxesMode}
                                onValueChanged={onCheckBoxesModeChanged}
                            />
                        </div>
                    </div>
                </DataGrid>
            }
        </div >
    )
}