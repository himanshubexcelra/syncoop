/*eslint max-len: ["error", { "code": 100 }]*/
import {
    AssayFieldList,
    AssayOptions,
    ContainerFields,
    ContainerType,
    ShowEditPopupType,
} from "@/lib/definition";
import { assayCreateOptions } from "@/utils/constants";
import { LoadIndicator } from "devextreme-react";
import {
    Form,
    SimpleItem,
    RequiredRule,
    Label,
    GroupItem,
} from "devextreme-react/form";
import RadioGroup from "devextreme-react/radio-group";
import { useState } from "react";
import { editOrganization } from "../Organization/service";
import { editProject } from "../Projects/projectService";
import { editLibrary } from "../Libraries/service";
interface AssayFormType {
    commercial: boolean,
    SKU?: string,
}

interface AssayProps {
    setShowAddAssayForm: ShowEditPopupType,
    formRef: any,
    cleanup?: (response: any, value: string, data?: AssayFieldList) => void,
    data?: ContainerFields,
    type: string,
    assayValue: AssayFieldList[],
    loggedInUser: number,
    organizationId: number,
}
const AddAssay = ({
    formRef,
    setShowAddAssayForm,
    data,
    cleanup,
    type,
    assayValue,
    loggedInUser,
    organizationId,
}: AssayProps) => {
    const [formData, setFormData] = useState({ commercial: true });
    const [isLoading, setIsLoading] = useState(false);

    const handleValueChange = (value: AssayOptions.AddCommercial | AssayOptions.AddCustom) => {
        setFormData((prevData: AssayFormType) => ({
            ...prevData,
            commercial: value === AssayOptions.AddCommercial,
            assay_detail: '',
            name: '',
        }));
    };

    const cancelSave = () => {
        formRef?.current!.instance().reset();
        setShowAddAssayForm(false);
    }

    const handleSubmit = async () => {
        const values = formRef.current!.instance().option("formData");
        if (formRef.current!.instance().validate().isValid) {
            setIsLoading(true);
            let assayData: AssayFieldList[] = [];
            let response;
            const metadata = data?.metadata || {};
            assayData = [...assayValue];
            assayData.push({ ...values });
            if (!type) {
                const finalData = {
                    ...data, metadata: {
                        ...metadata, assay: assayData
                    }
                };
                response = await editOrganization(finalData);
            } else if (!Array.isArray(data)) {
                const finalData = {
                    ...data, metadata: {
                        ...metadata, assay: assayData
                    },
                    inherits_bioassays: false,
                    user_id: loggedInUser,
                };
                if (type === ContainerType.PROJECT) {
                    response = await editProject(finalData);
                } else {
                    response = await editLibrary({
                        ...finalData,
                        organization_id: Number(organizationId),
                        project_id: Number(data?.parent_id)
                    });
                }
            }
            cleanup?.(response, 'added', values);
            if (response.error) {
                setIsLoading(false);
            }
        }
    };

    return (
        <Form ref={formRef} showValidationSummary={true} formData={formData}>
            <SimpleItem>
                <RadioGroup
                    items={assayCreateOptions}
                    value={formData.commercial ?
                        AssayOptions.AddCommercial : AssayOptions.AddCustom
                    }
                    onValueChange={handleValueChange} />
            </SimpleItem>

            <SimpleItem
                dataField="name"
                editorOptions={{ placeholder: "Functional Assay Name" }}
            >
                <Label text="Functional Assay Name" />
                <RequiredRule message="Functional assay name is required" />
            </SimpleItem>
            {formData.commercial ? (
                <SimpleItem
                    dataField="assay_detail"
                    editorOptions={{ placeholder: "Functional Assay Detail" }}
                >
                    <Label text="Please provide Name / URL / SKU of the assay" />
                </SimpleItem>
            ) : (
                <SimpleItem
                    dataField="assay_detail"
                    editorType="dxTextArea"
                    cssClass='textarea-field'
                    editorOptions={{
                        height: "90px",
                        placeholder: "Protocol"
                    }}
                    colSpan={2}
                >
                    <Label text="Protocol" />
                </SimpleItem>
            )}
            <GroupItem cssClass="buttons-group" colCount={2}>
                <button className={
                    isLoading
                        ? 'disableButton w-[65px] h-[37px]'
                        : 'primary-button'}
                    onClick={handleSubmit}
                    disabled={isLoading}>
                    <LoadIndicator className={
                        `button-indicator`
                    }
                        visible={isLoading}
                        height={20}
                        width={20}
                    />
                    {isLoading ? '' : 'Submit'}
                </button>
                <button className='secondary-button ml-[15px]' onClick={cancelSave}>
                    Cancel
                </button>
            </GroupItem>
        </Form>
    )
}

export default AddAssay
