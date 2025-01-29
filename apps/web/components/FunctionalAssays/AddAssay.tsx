/*eslint max-len: ["error", { "code": 100 }]*/
import {
    AssayFieldList,
    AssayOptions,
    OrganizationDataFields,
    ShowEditPopupType,
    fetchDataType
} from "@/lib/definition";
import { DELAY, assayCreateOptions } from "@/utils/constants";
import { delay } from "@/utils/helpers";
import { Messages } from "@/utils/message";
import { LoadIndicator } from "devextreme-react";
import {
    Form,
    SimpleItem,
    RequiredRule,
    Label,
    GroupItem,
} from "devextreme-react/form";
import RadioGroup from "devextreme-react/radio-group";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { editOrganization } from "../Organization/service";
import { AppContext } from "@/app/AppState";
interface AssayFormType {
    commercial: boolean,
    SKU?: string,
}

interface AssayProps {
    setShowAddAssayForm: ShowEditPopupType,
    formRef: any,
    fetchOrganizations?: fetchDataType,
    data?: OrganizationDataFields,
}
const AddAssay = ({
    formRef,
    setShowAddAssayForm,
    data,
    fetchOrganizations,
}: AssayProps) => {
    const [formData, setFormData] = useState({ commercial: true });
    const [isLoading, setIsLoading] = useState(false);
    const context: any = useContext(AppContext);
    const appContext = context.state;

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
            const metadata = data?.metadata || {};
            if (data?.metadata && data.metadata.assay) {
                assayData = [...data.metadata.assay];
            }
            assayData.push({ ...values });
            const finalData = {
                ...data, metadata: {
                    ...metadata, assay: assayData
                }
            };
            const response = await editOrganization(finalData);
            if (!response.error) {
                if (fetchOrganizations) {
                    fetchOrganizations();
                } setShowAddAssayForm(false);
                context?.addToState({ ...appContext, refreshAssayTable: true })
                const toastId = toast.success(Messages.UPDATE_ASSAY);
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
                    editorOptions={{ placeholder: "Functional Assay Name" }}
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
                        placeholder: "Description"
                    }}
                    colSpan={2}
                >
                    <Label text="Description" />
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
