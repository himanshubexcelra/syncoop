
"use client";

import React from "react";
import style from "./table.module.css";
import styles from "../LoginForm/LoginForm.module.css";

export default function EditOrganization({
  data,
  showEditPopup,
  showDeletePopup,
}: any) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="editForm">
        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="organizationName" className={styles.customEmailLabel}>
            Organization Name
          </label>
          <input
            id="organizationName"
            name="organizationName"
            className={`border border-gray-300 rounded-[4px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor text-themeDarkGreyColor ${styles.customEmailInput}`}
            placeholder="Enter new organization name"
            required
            defaultValue={data.name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="mt-3 flex">
            <span className="flex items-center gap-x-2.5 mr-2">
              <input
                type="radio"
                name="role"
                className="form-radio border-gray-400 text-indigo-600 focus:ring-indigo-600 duration-150"
                defaultChecked={data.status === 'Enabled'}
              />
              <label className="text-sm text-gray-700 font-medium">
                Enabled
              </label>
            </span>
          </div>
          <div className="mt-3 flex">
            <span className="flex items-center gap-x-2.5 mr-2">
              <input
                type="radio"
                name="role"
                className="form-radio border-gray-400 text-indigo-600 focus:ring-indigo-600 duration-150"
                defaultChecked={data.status === 'Disabled'}
              />
              <label className="text-sm text-gray-700 font-medium">
                Disabled
              </label>
            </span>
          </div>
        </div>
        <h3 className={`${style.functional_assay} mt-[27px]`}>
          Functional Assay
        </h3>
        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="organizationName" className={styles.customEmailLabel}>
            Functional Assay 1
          </label>
          <input
            id="organizationName"
            name="organizationName"
            className={`border border-gray-300 rounded-[4px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor text-themeDarkGreyColor ${styles.customEmailInput}`}
            placeholder="First name"
            required
            defaultValue={data.name}
          />
        </div>
        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="organizationName" className={styles.customEmailLabel}>
            Functional Assay 2
          </label>
          <input
            id="organizationName"
            name="organizationName"
            className={`border border-gray-300 rounded-[4px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor text-themeDarkGreyColor ${styles.customEmailInput}`}
            placeholder="First name"
            required
            defaultValue={data.name}
          />
        </div>
        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="organizationName" className={styles.customEmailLabel}>
            Functional Assay 3
          </label>
          <input
            id="organizationName"
            name="organizationName"
            className={`border border-gray-300 rounded-[4px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor text-themeDarkGreyColor ${styles.customEmailInput}`}
            placeholder="First name"
            required
            defaultValue={data.name}
          />
        </div>
        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="organizationName" className={styles.customEmailLabel}>
            Functional Assay 4
          </label>
          <input
            id="organizationName"
            name="organizationName"
            className={`border border-gray-300 rounded-[4px] h-[40px] flex-shrink-0 p-3 bg-themeSilverGreyColor text-themeDarkGreyColor ${styles.customEmailInput}`}
            placeholder="First name"
            required
            defaultValue={data.name}
          />
        </div>

        <div className="mb-6 mt-[17px] flex gap-2 justify-between">
          <div className="mb-6 flex gap-2">
            <button type="submit" className="btn_primary">
              Save
            </button>
            <button
              onClick={() => showEditPopup(false)}
              className="btn_secondary"
            >
              Cancel
            </button>
          </div>
          <div>
            <button
              type="submit"
              className="btn_primary"
              onClick={() => showDeletePopup(true)}
            >
              {`Delete ${data.name}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
