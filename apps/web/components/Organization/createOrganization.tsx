import toast from "react-hot-toast";
import {
  Form as CreateForm,
  SimpleItem,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule,
  Label,
} from "devextreme-react/form";
import { delay } from "@/utils/helpers";
import { createOrganizationApi } from "./service";
import "./table.css";

export default function RenderCreateOrganization({
  setCreatePopupVisibility,
  setTableData,
  formRef,
  tableData,
}: any) {

  const handleSubmit = async () => {
    const values = formRef.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      const response = await createOrganizationApi(values);
      if (!response.error) {
        const tempData = [...tableData, response];
        formRef.current!.instance().reset();
        setTableData(tempData);
        setCreatePopupVisibility(false);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(2000);
        toast.remove(toastId);
      }
    }
  };

  return (
    <CreateForm ref={formRef} showValidationSummary={true}>
      <SimpleItem
        dataField="name"
        editorOptions={{ placeholder: "Enter new organization name" }}
      >
        <Label text="Organization Name" />
        <RequiredRule message="Organization name is required" />
      </SimpleItem>
      <SimpleItem
        dataField="firstName"
        editorOptions={{ placeholder: "Organization Admin first name" }}
      >
        <Label text="Organization Admin First Name" />
      </SimpleItem>
      <SimpleItem
        dataField="lastName"
        editorOptions={{ placeholder: "Organization Admin last name" }}
      >
        <Label text="Organization Admin Last Name" />
      </SimpleItem>
      <SimpleItem
        dataField="email"
        editorOptions={{ placeholder: "Enter admin email address" }}
      >
        <Label text="Organization Admin Email Address" />
        <RequiredRule message="Email is required" />
        <EmailRule message="Invalid Email Address" />
      </SimpleItem>
      <ButtonItem horizontalAlignment="left" cssClass="btnform">
        <ButtonOptions
          text="Create Organization"
          useSubmitBehavior={true}
          onClick={handleSubmit}
        />
      </ButtonItem>
    </CreateForm>
  );
}
