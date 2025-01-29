/*eslint max-len: ["error", { "code": 100 }]*/
import { AssayFieldList, FunctionalAssayProps, OrganizationDataFields } from '@/lib/definition'
import { debounce, popupPositionValue, popupPositionCentered, delay } from '@/utils/helpers';
import { Button, DropDownBox, LoadIndicator, Popup, Switch } from 'devextreme-react';
import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react'
import AddAssay from './AddAssay';
import { AssayData, DELAY } from '@/utils/constants';
import { getBioAssays } from './service';
import AssayFields from './AssayFields';
import { DropDownBoxRef } from 'devextreme-react/cjs/drop-down-box';
import { getOrganizationById } from '../Organization/service';
import { AppContext } from '@/app/AppState';
import { editOrganization } from "../Organization/service";
import toast from 'react-hot-toast';
import { Messages } from '@/utils/message';

function FunctionalAssay({ data, type, orgUser, fetchOrganizations }: FunctionalAssayProps) {
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
    const dropDownBoxRef = useRef<DropDownBoxRef>(null);
    const listRef = useRef(null);
    const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
    const [assayValue, setAssays] = useState(data);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [organizaitonData, setOrganizationData] = useState<OrganizationDataFields>();
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const context: any = useContext(AppContext);
    const appContext = context.state;
    const formRef = useRef<any>(null);
    const orgId = orgUser?.id;

    const fetchData = async () => {
        if (!type) {
            const orgData = await getOrganizationById({ withRelation: [], id: orgId });
            const processedData = orgData?.metadata?.assay || [];
            setAssays(processedData);
            setOrganizationData(orgData);
        }
    }

    useEffect(() => {
        fetchData();
    }, [orgId, appContext?.refreshAssayTable])

    useEffect(() => {
        setContainerElement(document.getElementById('containerElement'));
    }, []);

    useEffect(() => {
        setEditEnabled(true);
        setPopupPosition(popupPositionValue());
        setPopupPositionCenter(popupPositionCentered());
    }, []);

    // Scroll the selected item into view
    useEffect(() => {
        if (selectedIndex !== null && itemRefs.current[selectedIndex]) {
            const selectedItem = itemRefs.current[selectedIndex];

            if (selectedItem) {
                // Scroll the selected item into view
                selectedItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });

                // Focus on the selected item
                selectedItem.focus();
            }
        }
    }, [selectedIndex]);

    const performCleanup = () => {
        if (dropDownBoxRef.current) {
            dropDownBoxRef.current.instance().close();
        }
        setSearchValue('');
        setFilteredItems([]);
        setSelectedIndex(-1);
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
        setSelectedIndex(-1);
    }

    const updateComment = (data: AssayFieldList) => {
        const fieldIndex = assayValue.findIndex(val => val.id === data.id);
        const values = [...assayValue];
        values[fieldIndex].comment = data.comment;
        setAssays(values);
    }

    const updateAssay = () => {
        // console.log('update', assayValue);
        setIsLoading(true);
    }

    const cancelUpdate = () => {
        // console.log('cancel')
    }

    const removeAssay = async (index: number) => {
        const values = [...assayValue];
        const deleted = values.splice(index, 1)[0];
        const metadata = organizaitonData?.metadata || {};
        const finalData = {
            ...organizaitonData, metadata: {
                ...metadata, assay: values
            }
        };
        const response = await editOrganization(finalData);
        if (!response.error) {
            if (fetchOrganizations) {
                fetchOrganizations();
            } setShowAddAssayForm(false);
            context?.addToState({ ...appContext, refreshAssayTable: true })
            const toastId = toast.success(Messages.deleteAssayMsgConfirm(deleted.name));
            await delay(DELAY);
            toast.remove(toastId);
            setIsLoading(false);
        } else {
            const toastId = toast.error(`${response.error}`);
            await delay(DELAY);
            toast.remove(toastId);
            setIsLoading(false);
        }
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

    const handleKeyDown = (e: any) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent page scroll
            setSelectedIndex((prevIndex) => {
                const nextIndex = prevIndex === null ? 0 :
                    Math.min(filteredItems.length - 1, prevIndex + 1);
                return nextIndex;
            });
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent page scroll
            setSelectedIndex((prevIndex) => {
                const prevIndexUpdated = prevIndex === null ?
                    filteredItems.length - 1 : Math.max(0, prevIndex - 1);
                return prevIndexUpdated;
            });
        }

        // Select the item on 'Enter' key press
        if (e.key === 'Enter' && selectedIndex !== null) {
            handleValueChange(filteredItems[selectedIndex]);
        }
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
                    onClosed={performCleanup}
                    valueExpr="SKU"
                    displayExpr="target"
                    className='assay-dropdown'
                    dropDownOptions={{
                        container: containerElement || undefined
                    }}
                    contentRender={() => (
                        <div className='assay-dropdown'>
                            <div className="search-box" style={{ visibility: 'hidden' }}>
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
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <ul className='assay-list' ref={listRef} onKeyDown={handleKeyDown}>
                                {filteredItems
                                    .map((item, index) => (
                                        <li key={item.target}
                                            className={`text-normal 
                                                list-assay cursor-pointer dropdown-item 
                                                ${selectedIndex === index ? 'selected' : ''
                                                }`}
                                            onClick={() => handleValueChange(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            ref={(el) => {
                                                itemRefs.current[index] = el
                                            }}
                                            tabIndex={selectedIndex === index ? 0 : -1}
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
                {assayValue.length !== 0 && type && (
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
                assayValue.length === 0 ?
                    <div className='no-assay flex'>
                        Your functional assay list is empty, search and add functional assay
                        from the above search bar
                    </div> :
                    <div className={`${type ? 'mt-[25px]' : 'grid-container'}`}>
                        {assayValue.map((assay: AssayFieldList, index: number) => (
                            <div
                                key={assay.SKU}
                            >
                                <AssayFields
                                    setShowConfirmForm={
                                        setShowConfirmForm}
                                    assay={assay}
                                    removeAssay={removeAssay}
                                    index={index}
                                    fetchOrganizations={fetchOrganizations}
                                    updateComment={updateComment}
                                />
                            </div>
                        ))}
                    </div>
            }
            {
                showAddAssayForm && (
                    <Popup
                        title="Add Functional Assay"
                        showCloseButton={true}
                        visible={showAddAssayForm}
                        dragEnabled={false}
                        contentRender={() => (
                            <AddAssay
                                formRef={formRef}
                                setShowAddAssayForm={
                                    setShowAddAssayForm}
                                data={organizaitonData}
                                fetchOrganizations={fetchOrganizations}
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
                                setShowConfirmForm={
                                    setShowConfirmForm}
                                assay={selectedValue}
                                newForm={true}
                                removeAssay={removeAssay}
                                data={organizaitonData}
                                fetchOrganizations={fetchOrganizations}
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
