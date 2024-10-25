'use client'
import toast from "react-hot-toast";
import {
  Form,
  SimpleItem,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  Label,
  GroupItem,
} from "devextreme-react/form";
import { delay } from "@/utils/helpers";
import { createLibrary, editLibrary } from "./libraryService";
import { LibraryCreateFields } from "@/lib/definition";
import { DELAY } from "@/utils/constants";
import TextArea from "devextreme/ui/text_area";
import { Messages } from "@/utils/message";

export default function CreateLibrary({
  setCreatePopupVisibility,
  fetchLibraries,
  formRef,
  userData,
  projectData,
  libraryIdx,
}: LibraryCreateFields) {

  const handleSubmit = async () => {
    const values = formRef?.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      let response;
      if (libraryIdx !== -1) response = await editLibrary({ ...values, userId: userData.id, projectId: projectData.id })
      else response = await createLibrary({ ...values, userId: userData.id, projectId: projectData.id });
      if (!response.error) {
        formRef?.current!.instance().reset();
        fetchLibraries();
        setCreatePopupVisibility(false);
        const status = `${libraryIdx !== -1 ? 'updated' : 'created'}`;
        const message = Messages.libraryAddedUpdated(status);
        const toastId = toast.success(message);
        await delay(DELAY);
        toast.remove(toastId);
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
      }
    }
  };

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    setCreatePopupVisibility(false);
  }

  return (
    <Form ref={formRef} showValidationSummary={true} formData={libraryIdx !== undefined ? projectData.libraries[libraryIdx] : {}}>
      <SimpleItem
        dataField="organization"
        editorOptions={{ placeholder: "Organization name", disabled: true, value: projectData.organization?.name }}
      >
        <Label text="Organization Name*" />
      </SimpleItem>
      <SimpleItem
        dataField="owner"
        editorOptions={{ placeholder: "Library Owner", disabled: true, value: `${userData.firstName} ${userData.lastName}` }}
      >
        <Label text="Library Owner*" />
      </SimpleItem>

      <SimpleItem
        dataField="projectName"
        editorOptions={{ placeholder: "New Project", value: projectData.name, disabled: true }}
      >
        <Label text="Project name*" />
        <RequiredRule message="Project name is required" />
      </SimpleItem>
      <SimpleItem
        dataField="name"
        editorOptions={{ placeholder: "New Library" }}
      >
        <Label text="Library name*" />
        <RequiredRule message="Library name is required" />
      </SimpleItem>
      <SimpleItem
        dataField="target"
        editorOptions={{ placeholder: "Target" }}
      >
        <Label text="Target" />
      </SimpleItem>
      <SimpleItem
        dataField="description"
        // @ts-expect-error: TypeScript is not recognizing TextArea as a valid component type.
        editorType={TextArea}
        cssClass='textarea-field'
        editorOptions={{
          height: "90px",
          placeholder: "Description"
        }}
        colSpan={2}
      >
        <Label text="Description" />
      </SimpleItem>
      <GroupItem cssClass="buttons-group" colCount={2}>
        <ButtonItem horizontalAlignment="left" cssClass="form_btn_primary">
          <ButtonOptions
            text={libraryIdx !== -1 ? 'Update' : "Create Library"}
            useSubmitBehavior={true}
            onClick={handleSubmit}
          />
        </ButtonItem>
        <ButtonItem horizontalAlignment="left" cssClass="form_btn_secondary">
          <ButtonOptions text="Discard" onClick={cancelSave} />
        </ButtonItem>
      </GroupItem>
    </Form>
  );
}