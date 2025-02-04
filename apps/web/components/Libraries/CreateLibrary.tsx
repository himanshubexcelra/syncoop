/*eslint max-len: ["error", { "code": 100 }]*/
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
import { delay, isCustomReactionCheck, isDeleteLibraryEnable } from "@/utils/helpers";
import { createLibrary, deleteLibrary, editLibrary } from "./service";
import { LibraryCreateFields } from "@/lib/definition";
import { DELAY } from "@/utils/constants";
import { Messages } from "@/utils/message";
import { AppContext } from "@/app/AppState";
import { useContext, useEffect, useState } from "react";
import DeleteConfirmation from "@/ui/DeleteConfirmation";
import { LoadIndicator } from "devextreme-react";


export default function CreateLibrary({
  setCreatePopupVisibility,
  fetchLibraries,
  formRef,
  userData,
  projectData,
  library_idx,
  setLibraryId
}: LibraryCreateFields) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleteLibraryData, setDeleteLibraryData] = useState({ id: 0, name: '' });
  const context: any = useContext(AppContext);
  const appContext = context.state;
  const [deleteLibraryEnabled, setDeleteLibraryEnabled] = useState(false);
  const [loadIndicatorVisible, setLoadIndicatorVisible] = useState(false);
  const isCustomReaction = isCustomReactionCheck(projectData.metadata)
  const entityLabel = isCustomReaction
    ? 'reactions'
    : 'molecules'
  const handleSubmit = async () => {
    const values = formRef?.current!.instance().option("formData");
    if (formRef.current!.instance().validate().isValid) {
      setLoadIndicatorVisible(true)
      let response;
      if (library_idx !== -1) {
        response = await editLibrary(
          {
            ...values,
            user_id: userData.id,
            project_id: projectData.id,
            organization_id: projectData.container.id
          });
      } else {
        response = await createLibrary(
          {
            ...values,
            user_id: userData.id,
            project_id: projectData.id,
            organization_id: projectData.container.id,
            config: { ...projectData.config },
          });
      }
      if (!response.error) {
        formRef?.current!.instance().reset();
        setCreatePopupVisibility(false);
        if (library_idx !== -1) {
          setLibraryId(values.id)
          fetchLibraries();
        }
        else {
          fetchLibraries(true)
        }
        const status = `${library_idx !== -1 ? 'updated' : 'created'}`;
        const message = Messages.libraryAddedUpdated(status);
        const toastId = toast.success(message);
        await delay(DELAY);
        context?.addToState({ ...appContext, refreshCart: true })
        toast.remove(toastId);
        setLoadIndicatorVisible(false)
      } else {
        const toastId = toast.error(`${response.error}`);
        await delay(DELAY);
        toast.remove(toastId);
        setLoadIndicatorVisible(false)
      }
    }
  };

  const cancelSave = () => {
    formRef?.current!.instance().reset();
    setCreatePopupVisibility(false);
  }

  const handleDeleteLibrary = (library_id: number, library_name: string) => {
    setConfirm(true);
    setDeleteLibraryData({ id: library_id, name: library_name });
  }
  const deleteLibraryDetail = async () => {
    setIsLoading(true);
    const result = await deleteLibrary(deleteLibraryData.id);
    if (result.length === 0) {
      toast.success(Messages.LIBRARY_NOT_DELETE_MESSAGE(entityLabel));
      setIsLoading(false);
      setCreatePopupVisibility(false);
    }
    else {
      if (result.error) {
        toast.error(Messages.DELETE_LIBRARY_ERROR_MESSAGE);
        setIsLoading(false);
      }
      else {
        toast.success(Messages.DELETE_LIBRARY_MESSAGE);
        setCreatePopupVisibility(false);
        fetchLibraries(true);
        setIsLoading(false);
      }
    }
  }
  const handleCancel = () => {
    setConfirm(false)
  };

  useEffect(() => {
    const libraryMolecules = projectData.other_container?.[library_idx]?.libraryMolecules;
    if (libraryMolecules) {
      setDeleteLibraryEnabled(isDeleteLibraryEnable(libraryMolecules))
    }
  }, [library_idx])

  return (
    <>
      <Form
        ref={formRef}
        showValidationSummary={true}
        formData={library_idx !== -1 ? projectData.other_container?.[library_idx] : {}
        }>
        {deleteLibraryEnabled
          && <ButtonItem cssClass="delete-button">
            <ButtonOptions
              stylingMode="text"
              text={`Delete Library`}
              onClick={() => handleDeleteLibrary(
                Number(projectData.other_container?.[library_idx]?.id),
                String(projectData.other_container?.[library_idx]?.name)
              )}
              elementAttr={{ class: 'lowercase-button' }} />
          </ButtonItem>
        }
        <SimpleItem
          dataField="organization"
          editorOptions={
            {
              placeholder: "Organization name",
              disabled: true,
              value: projectData?.container?.name
            }}
        >
          <Label text="Organization Name*" />
        </SimpleItem>

        <SimpleItem
          dataField="owner"
          editorOptions={
            {
              placeholder: "Library Owner",
              disabled: true, value: `${userData.first_name} ${userData.last_name}`
            }
          }
        >
          <Label text="Library Owner*" />
        </SimpleItem>

        <SimpleItem
          dataField="projectName"
          editorOptions={{ placeholder: "New Project", value: projectData.name, disabled: true }}
        >
          <Label text="Project name*" />
        </SimpleItem>
        <SimpleItem
          dataField="name"
          editorOptions={{
            placeholder: `${(library_idx !== -1 ? 'Edit' : 'New')} Library`,
            value: library_idx !== -1 ?
              projectData.other_container?.[library_idx].name : ''
          }}
        >
          <Label text="Library name" />
          <RequiredRule message="Library name is required" />
        </SimpleItem>
        <SimpleItem
          dataField="target"
          editorOptions={{
            placeholder: "Target", value: library_idx !== -1 ?
              projectData.other_container?.[library_idx].metadata.target : ''
          }}
        >
          <Label text="Target" />
        </SimpleItem>
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
        <GroupItem cssClass="buttons-group" colCount={2}>
          <div className="flex items-center">
            <button className={
              loadIndicatorVisible
                ? `disableButton ${library_idx !== -1 ? 'w-[65px]' : 'w-[108px]'} h-[37px]`
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
              {loadIndicatorVisible ? '' : library_idx !== -1 ? 'Update' : 'Create Library'}
            </button>
            <button className='secondary-button ml-[15px]' onClick={cancelSave}>
              Discard
            </button>
          </div>
        </GroupItem>
      </Form>
      {confirm && (
        <DeleteConfirmation
          onSave={() => deleteLibraryDetail()}
          openConfirmation={confirm}
          isLoader={isLoading}
          setConfirm={() => handleCancel()}
          msg={Messages.deleteLibraryMsg(deleteLibraryData.name, entityLabel)}
          title={Messages.DELETE_LIBRARY_TITLE}
        />
      )}
    </>
  );
}