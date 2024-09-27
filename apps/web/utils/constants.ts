export const status = ["Enabled", "Disabled"];

export const tableFields = {
  columns: [
    "name",
    "projects",
    "molecules",
    "users",
    "status",
    "organizationAdmin",
    "createdAt",
    "updatedAt",
  ],
  editable: true,
  editingMode: "popup",
  editFields: [
    {
      dataField: "name",
      required: "Organization name is required",
    },
    { type: "radio", dataField: "status", items: status },
    // { dataField: "numberAndDateTimeFormat" },
    { type: "dxSelectBox", dataField: "timezone" },
    { dataField: "primaryContact" },
  ],
  toolbar: true,
  searchPanel: true,
  createFields: [
    { dataField: "name" },
    { dataField: "organizationAdminFirstName" },
    { dataField: "organizationAdminLastName" },
    { dataField: "organizationAdminEmailAddress" },
    { dataField: "numberAndDateTimeFormat" },
    { dataField: "timezone" },
    { dataField: "primaryContact" },
  ],
};
