/*eslint max-len: ["error", { "code": 100 }]*/
import {
    AssayFieldList,
    OrganizationDataFields,
    ShowEditPopupType,
    fetchDataType
} from '@/lib/definition';
import { delay, toTitleCase } from '@/utils/helpers';
import { LoadIndicator } from 'devextreme-react';
import Image from 'next/image';
import React, { useCallback, useContext, useState } from 'react';
import { editOrganization } from '../Organization/service';
import { Messages } from '@/utils/message';
import toast from 'react-hot-toast';
import { DELAY } from '@/utils/constants';
import TextArea, { TextAreaTypes } from 'devextreme-react/cjs/text-area';
import { AppContext } from "@/app/AppState";

interface AssayFieldType {
    type?: string,
    assay: AssayFieldList,
    newForm?: boolean,
    removeAssay: (index: number) => void,
    setShowConfirmForm: ShowEditPopupType,
    data?: OrganizationDataFields,
    fetchOrganizations?: fetchDataType,
    updateComment?: (data: AssayFieldList) => void,
    index?: number,
}
function AssayFields({
    type,
    assay,
    newForm,
    removeAssay,
    setShowConfirmForm,
    data,
    fetchOrganizations,
    updateComment,
    index,
}: AssayFieldType) {
    const fields = assay.user_fields ? Object.entries(assay.user_fields) : [];
    const [isLoading, setIsLoading] = useState(false);
    const [comment, setComment] = useState('');
    const context: any = useContext(AppContext);
    const appContext = context.state;
    // Group fields into pairs of 2
    const fieldPairs = [];
    if (fields.length) {
        for (let i = 0; i < fields.length; i += 2) {
            fieldPairs.push(fields.slice(i, i + 2));
        }
    }

    const updateAssay = async () => {
        setIsLoading(true);
        let assayData: AssayFieldList[] = [];
        const metadata = data?.metadata || {};
        if (data?.metadata && data.metadata.assay) {
            assayData = [...data.metadata.assay];
        }
        assayData.push({ ...assay, comment });
        const finalData = {
            ...data, metadata: {
                ...metadata, assay: assayData
            }
        };
        const response = await editOrganization(finalData);
        if (!response.error) {
            if (fetchOrganizations) {
                fetchOrganizations();
            } setShowConfirmForm(false);
            context?.addToState({ ...appContext, refreshAssayTable: true })
            const toastId = toast.success(Messages.UPDATE_ORGANIZATION);
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

    const onTextAreaValueChanged = useCallback((e: TextAreaTypes.ValueChangedEvent) => {
        setComment(e.value);

        if (!newForm && updateComment) {
            updateComment({ ...assay, comment: e.value })
        }
    }, []);

    return (
        <div key={assay.SKU}>
            {newForm && (
                <div className="functional-assay-title">
                    {`Are you sure, you want add "${assay.name}"
                    to functional assay to your organizaiton?`}
                </div>
            )}
            <div
                className={`${type ? 'mb-[20px]' : ''} assay-card`}
            >
                <div className='flex justify-between align-center mb-[20px]'>
                    <span className='text-normal'>{assay.assay}</span>
                    {!newForm && (
                        <button className='secondary-button'
                            onClick={() => removeAssay(index || 0)}
                        >
                            <Image
                                src="/icons/delete.svg"
                                width={15}
                                height={13}
                                alt="remove"
                            />
                            Remove
                        </button>
                    )}
                </div>
                {!assay.hasOwnProperty('commercial') && (
                    <div className='text-assay-desc mb-[20px]'>
                        {assay.description}
                    </div>
                )}
                <div className={`${!assay.hasOwnProperty('commercial')
                    ? 'flex justify-around align-center'
                    : ''} mb-[20px]`}>
                    <div className='flex'>
                        <div className='text-normal'>
                            Name:
                        </div>
                        <span className='ml-[5px] text-assay-desc'>
                            {assay.name}
                        </span>
                    </div>
                    {!assay.hasOwnProperty('commercial') ?
                        <div className='flex'>
                            <div className='text-normal'>
                                Supplier:
                            </div>
                            <span className='ml-[5px] text-assay-desc'>
                                {assay.supplier}
                            </span>
                        </div>
                        :
                        <div className='flex mt-[20px]'>
                            <div className='text-normal'>
                                Assay Details:
                            </div>
                            <span className='ml-[5px] text-assay-desc'>
                                {assay.assay_detail}
                            </span>
                        </div>
                    }
                </div>
                {!assay.hasOwnProperty('commercial') && (
                    <div className='flex justify-around align-center mb-[20px]'>
                        <div className='flex'>
                            <div className='text-normal'>
                                SKU:
                            </div>
                            <span className='ml-[5px] text-assay-desc'>
                                {assay.SKU}
                            </span>
                        </div>
                        <div className='flex'>
                            <div className='text-normal'>
                                Test Molecule Name:
                            </div>
                            <span className='ml-[5px] text-assay-desc'>
                                {assay.testMoleculeName}
                            </span>
                        </div>
                    </div>
                )}
                {fieldPairs.map((pair, index) => (
                    <div key={index}
                        className='flex justify-around align-center mb-[20px]'>
                        {pair.map(([key, value]) => (
                            <div key={key} className='flex'>
                                <div className='text-normal'>
                                    {`${toTitleCase(key)}:`}
                                </div>
                                <span className='ml-[5px] text-assay-desc'>
                                    {value}
                                </span>
                            </div>

                        ))}
                    </div>
                ))}
                {!assay.hasOwnProperty('commercial') && (
                    <div>
                        <label htmlFor="textarea">Comments</label>
                        <TextArea
                            id="textarea"
                            height={90}
                            value={comment}
                            onValueChanged={onTextAreaValueChanged}
                        />
                    </div>
                )}
                {newForm && (
                    <div className='flex mt-[20px]'>
                        <button className={isLoading
                            ? 'disableButton w-[71px] h-[39px]'
                            : 'primary-button'}
                            onClick={updateAssay}
                        >
                            <LoadIndicator className="button-indicator"
                                visible={isLoading}
                                height={20}
                                width={20} />
                            {isLoading ? '' : 'Yes, Add'}
                        </button>
                        <button className="secondary-button ml-[20px]"
                            onClick={() => setShowConfirmForm(false)}
                        >
                            No, Cancel
                        </button>
                    </div>
                )}
            </div>
        </div >
    )
}

export default AssayFields
