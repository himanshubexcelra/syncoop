/*eslint max-len: ["error", { "code": 100 }]*/
import { AssayOptions, ShowEditPopupType } from "@/lib/definition";
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
import { useState } from "react";
import toast from "react-hot-toast";

interface AssayFormType {
    commercial?: AssayOptions.AddCommercial | AssayOptions.AddCustom,
    SKU?: string,
}

interface AssayProps {
    setShowAddAssayForm: ShowEditPopupType,
    formRef: any,
    selectedData: AssayFormType
}
const AddAssay = ({
    formRef,
    selectedData,
    setShowAddAssayForm,
}: AssayProps) => {
    const [formData, setFormData] = useState({
        ...selectedData, commercial: selectedData?.SKU ?
            AssayOptions.AddCommercial : AssayOptions.AddCustom
    });
    const [commercial, setCommercial] = useState(true);
    const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);

    const handleValueChange = (value: AssayOptions.AddCommercial | AssayOptions.AddCustom) => {
        setCommercial(value === AssayOptions.AddCommercial);
        setFormData((prevData: AssayFormType) => ({
            ...prevData,
            commercial: value,
        }));
    };

    const cancelSave = () => {
        formRef?.current!.instance().reset();
        setShowAddAssayForm(false);
    }

    const handleSubmit = async () => {
        setLoadIndicatorVisible(true);
        const values = formRef.current!.instance().option("formData");
        console.log(values, formData)
        if (formRef.current!.instance().validate().isValid) {
            //   const response = await createOrganization(values);
            const response = { error: false };
            if (!response.error) {
                formRef.current!.instance().reset();
                // fetchOrganizations();
                // setCreatePopupVisibility(false);
                const toastId = toast.success(Messages.ADD_ASSAY);
                await delay(DELAY);
                toast.remove(toastId);
                setLoadIndicatorVisible(false);
            } else {
                const toastId = toast.error(`${response.error}`);
                await delay(DELAY);
                toast.remove(toastId);
                setLoadIndicatorVisible(false);
            }
        }
    };

    return (
        <Form ref={formRef} showValidationSummary={true} formData={selectedData}>
            <SimpleItem>
                <RadioGroup
                    items={assayCreateOptions}
                    defaultValue={selectedData?.SKU ?
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
            {commercial ? (
                <SimpleItem
                    dataField="sku"
                    editorOptions={{ placeholder: "Functional Assay Name" }}
                >
                    <Label text="Please provide Name / URL / SKU of the assay" />
                </SimpleItem>
            ) : (
                <SimpleItem
                    dataField="description"
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
                    loadIndicatorVisible
                        ? 'disableButton w-[65px] h-[37px]'
                        : 'primary-button'}
                    onClick={handleSubmit}
                    disabled={loadIndicatorVisible}>
                    <LoadIndicator className={
                        `button-indicator`
                    }
                        visible={loadIndicatorVisible}
                        height={20}
                        width={20}
                    />
                    {loadIndicatorVisible ? '' : 'Submit'}
                </button>
                <button className='secondary-button ml-[15px]' onClick={cancelSave}>
                    Cancel
                </button>
            </GroupItem>
        </Form>
    )
}

export default AddAssay
