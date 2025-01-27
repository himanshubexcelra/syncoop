/*eslint max-len: ["error", { "code": 100 }]*/
import { AssayFieldList, ShowEditPopupType } from '@/lib/definition';
import { toTitleCase } from '@/utils/helpers';
import { LoadIndicator } from 'devextreme-react';
import { Form, SimpleItem, Label, GroupItem } from 'devextreme-react/form';
import Image from 'next/image';
import React, { useState } from 'react'

interface AssayFieldType {
    type?: string,
    assay: AssayFieldList,
    newForm?: boolean,
    cancelUpdate: () => void,
    formRef: any,
    setShowConfirmForm: ShowEditPopupType
}
function AssayFields({
    type,
    assay,
    newForm,
    cancelUpdate,
    formRef,
    setShowConfirmForm
}: AssayFieldType) {
    const fields = Object.entries(assay.user_fields);
    const [isLoading, setIsLoading] = useState(false);

    // Group fields into pairs of 2
    const fieldPairs = [];
    for (let i = 0; i < fields.length; i += 2) {
        fieldPairs.push(fields.slice(i, i + 2));
    }

    const updateAssay = () => {
        setIsLoading(true);
        setIsLoading(true);
    }
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
                            onClick={cancelUpdate}
                        >
                            <Image
                                src="/icons/delete.svg"
                                width={15}
                                height={13}
                                alt="remove" />
                            Remove
                        </button>
                    )}
                </div>
                <div className='text-assay-desc mb-[20px]'>
                    {assay.description}
                </div>
                <div className='flex justify-around align-center mb-[20px]'>
                    <div className='flex'>
                        <div className='text-normal'>
                            Name:
                        </div>
                        <span className='ml-[5px] text-assay-desc'>
                            {assay.name}
                        </span>
                    </div>
                    <div className='flex'>
                        <div className='text-normal'>
                            Supplier:
                        </div>
                        <span className='ml-[5px] text-assay-desc'>
                            {assay.supplier}
                        </span>
                    </div>
                </div>
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
                <Form ref={formRef}>
                    <SimpleItem
                        dataField="comment"
                        editorType="dxTextArea"
                        cssClass='textarea-field'
                        editorOptions={{
                            height: "90px",
                            placeholder: "Comments"
                        }}
                        colSpan={2}
                    >
                        <Label text="Comments" />
                    </SimpleItem>
                    {newForm && (
                        <GroupItem cssClass="buttons-group" colCount={2}>
                            <button className={isLoading
                                ? 'disableButton w-[68px]'
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
                        </GroupItem>
                    )}
                </Form>
            </div>
        </div>
    )
}

export default AssayFields
