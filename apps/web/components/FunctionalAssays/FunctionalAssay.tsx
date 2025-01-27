/*eslint max-len: ["error", { "code": 100 }]*/
import { AssayFieldList, FunctionalAssayProps } from '@/lib/definition'
import { debounce, popupPositionValue, popupPositionCentered } from '@/utils/helpers';
import { Button, DropDownBox, LoadIndicator, Popup, Switch } from 'devextreme-react';
import Image from 'next/image';
import { FormRef } from "devextreme-react/cjs/form";
import React, { useEffect, useRef, useState } from 'react'
import AddAssay from './AddAssay';
import { AssayData } from '@/utils/constants';
import { getBioAssays } from './service';
import AssayFields from './AssayFields';
import { DropDownBoxRef } from 'devextreme-react/cjs/drop-down-box';

function FunctionalAssay({ data, type }: FunctionalAssayProps) {
    const [inherited, setInherited] = useState(type ? true : false);
    const [searchValue, setSearchValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAddAssayForm, setShowAddAssayForm] = useState(false);
    const [showConfirmForm, setShowConfirmForm] = useState(false);
    const [filteredItems, setFilteredItems] = useState<AssayFieldList[]>([]);
    const [popupPosition, setPopupPosition] = useState({} as any);
    const [popupPositionCenter, setPopupPositionCenter] = useState({} as any);
    const [selectedValue, setSelectedValue] = useState<AssayFieldList | null>(null);
    const [editEnabled, setEditEnabled] = useState(true);
    const formRef = useRef<FormRef>(null);
    const dropDownBoxRef = useRef<DropDownBoxRef>(null);
    const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setContainerElement(document.getElementById('containerElement'));
    }, []);

    useEffect(() => {
        setEditEnabled(true);
        setPopupPosition(popupPositionValue());
        setPopupPositionCenter(popupPositionCentered());
    }, []);

    const performCleanup = () => {
        if (dropDownBoxRef.current) {
            dropDownBoxRef.current.instance().close();
        }
        setSearchValue('');
        setFilteredItems([]);
    }

    const handleAddNew = () => {
        setShowAddAssayForm(true);
        performCleanup();
    };

    const handleSearch = debounce(async (value: string) => {
        const response = await getBioAssays(value, 'target');
        setFilteredItems(response);
    }, 500);

    const searchData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        if (value && value.length) {
            handleSearch(value);
        } else {
            setFilteredItems([]); // Show all items if no search term
        }
    }

    const updateAssay = () => {
        setIsLoading(true);
    }

    const cancelUpdate = () => {
    }

    const handleValueChange = (e: any) => {
        setSelectedValue(e);
        setShowConfirmForm(true);
        performCleanup();
    };

    const inheritedModification = () => {
        if (!inherited) {
            // do something
        }
        setInherited(!inherited);
    };

    return (
        <div className={`
        ${type ? 'main-div-assay-other' : 'main-div-assay'} 
        ${type === 'L' ? 'main-div-assay-lib' : ''}
        `}>
            <div className='flex justify-between items-center'>
                <DropDownBox
                    value={selectedValue}
                    ref={dropDownBoxRef}
                    dataSource={AssayData}
                    valueExpr="SKU"
                    displayExpr="target"
                    className='assay-dropdown'
                    dropDownOptions={{
                        container: containerElement || undefined
                    }}
                    contentRender={() => (
                        <div className='assay-dropdown'>
                            <div className="search-box">
                                <Image
                                    src="/icons/search.svg"
                                    width={24}
                                    height={24}
                                    alt="Sort"
                                    className='search-icon' />
                                <input
                                    placeholder="Search"
                                    className="search-input"
                                    width={120}
                                    style={{ paddingLeft: '30px' }}
                                    onChange={searchData}
                                    value={searchValue}
                                />
                            </div>

                            <ul className='assay-list'>
                                {filteredItems
                                    .map((item) => (
                                        <li key={item.target}
                                            className={`text-normal 
                                                list-assay cursor-pointer
                                                `}
                                            onClick={() => handleValueChange(item)}
                                        >
                                            {item.target}
                                        </li>
                                    ))}
                            </ul>

                            <div style={{ marginTop: 10 }}>
                                <Button
                                    text={`+ Add New Kit for ${searchValue}`}
                                    stylingMode='text'
                                    type="normal"
                                    className='text-themeBlueColor text-normal'
                                    onClick={handleAddNew}
                                    render={() => (
                                        <>
                                            <span className="pl-2 pt-[1px] text-themeBlueColor
                                            text-normal">
                                                {`+ Add New Kit ${searchValue ?
                                                    `for ${searchValue}` : ''}`}
                                            </span>
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                />
                {data.length !== 0 && (
                    <div className="flex gap-[20px]">
                        {type && (
                            <div className="dx-field flex items-center">
                                <div className='pr-[10px] text-normal'>
                                    Inherit Values
                                </div>
                                <div className='h-[18px]'>
                                    <Switch
                                        value={inherited}
                                        onValueChanged={inheritedModification}
                                        disabled={!editEnabled}
                                    />
                                </div>
                            </div>
                        )}
                        <button className={isLoading
                            ? 'disableButton w-[68px]'
                            : 'primary-button'}
                            onClick={updateAssay}
                        >
                            <LoadIndicator className="button-indicator"
                                visible={isLoading}
                                height={20}
                                width={20} />
                            {isLoading ? '' : 'Update'}
                        </button>

                        <button className={isLoading
                            ? 'disableButton w-[68px]'
                            : 'secondary-button'}
                            onClick={cancelUpdate}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            {
                data.length === 0 ?
                    <div className='no-assay flex'>
                        Your functional assay list is empty, search and add functional assay
                        from the above search bar
                    </div> :
                    <div className={`${type ? 'mt-[25px]' : 'grid-container'}`}>
                        {data.map((assay: AssayFieldList) => (
                            <div
                                key={assay.SKU}
                            >
                                <AssayFields
                                    formRef={formRef}
                                    setShowConfirmForm={
                                        setShowConfirmForm}
                                    assay={assay}
                                    cancelUpdate={cancelUpdate}
                                />
                            </div>
                        ))}
                    </div>
            }
            {
                showAddAssayForm && (
                    <Popup
                        title="Add Functional Assay"
                        visible={showAddAssayForm}
                        dragEnabled={false}
                        contentRender={() => (
                            <AddAssay
                                formRef={formRef}
                                setShowAddAssayForm={
                                    setShowAddAssayForm}
                                selectedData={{}}
                            />
                        )}
                        width={477}
                        hideOnOutsideClick={true}
                        height="100%"
                        position={popupPosition}
                        onHiding={() => {
                            formRef.current?.instance().reset();
                            setShowAddAssayForm(false);
                        }}
                        wrapperAttr={
                            {
                                class: "create-popup mr-[15px]"
                            }
                        }
                    />
                )
            }

            {
                showConfirmForm && selectedValue && (
                    <Popup
                        title=''
                        showCloseButton={true}
                        visible={showConfirmForm}
                        dragEnabled={false}
                        contentRender={() => (
                            <AssayFields
                                formRef={formRef}
                                setShowConfirmForm={
                                    setShowConfirmForm}
                                assay={selectedValue}
                                newForm={true}
                                cancelUpdate={cancelUpdate}
                            />
                        )}
                        width="40%"
                        hideOnOutsideClick={true}
                        height="90%"
                        position={popupPositionCenter}
                        onHiding={() => {
                            formRef.current?.instance().reset();
                            setShowConfirmForm(false);
                        }}
                        wrapperAttr={
                            {
                                class: "create-popup mr-[15px]"
                            }
                        }
                    />
                )
            }
        </div >
    )
}

export default FunctionalAssay
