export const Messages = {
    FORGOT_PASSWORD_MESSAGE: `Please contact your organization admin to reset your password.`,
    userLoggedIn(first_name: string, last_name: string) {
        return `${first_name} ${last_name} logged in successfully`;
    },
    SOMETHING_WENT_WRONG: `Something went wrong`,
    ROLE_REQUIRED: 'At least one role is required',
    EMAIL_INVALID: 'Invalid Email Address',
    requiredMessage(field: string) {
        return (`${field} is required`)
    },
    PASSWORD_COPY_FAIL: 'Failed to copy password',
    PASSWORD_COPY: 'Password copied to clipboard',
    PASSWORD_EMPTY: 'Password cannot be empty',
    PASSWORD_CRITERIA: "Password should be at least 8 characters long and contain at least one lowercase letter, one capital letter, one number, and one special character.",
    urlCopied(type: string, name: string) {
        return `URL for ${type} '${name}' copied to clipboard`;
    },
    URL_COPY_ERROR: 'failed to copy url',
    FETCH_ERROR: 'Error fetching data: ',
    USER_FETCH_ERROR: 'Error fetching user: ',
    PASSWORD_CHANGE: "Password changed",
    INVALID_URL: "Invalid URL. No such library or project found.",
    libraryAddedUpdated(status: string) {
        return `Library ${status} successfully`;
    },
    projectAddedUpdated(status: string) {
        return `Project ${status} successfully`;
    },
    admeConfigUpdated(type: string) {
        return `ADME config details for ${type} updated successfully`;
    },
    assayUpdated(type: string) {
        return `Assay details for ${type} updated successfully`;
    },
    LIBRARY_LIST_EMPTY(label: string) {
        return `Your library list is empty, add a library to import ${label}`
    },
    ADD_MOLECULE_SUCCESS: 'Molecule added successfully',
    ADD_MOLECULE_ERROR: 'Failed to add molecule for reason : ',
    deleteMoleculeMessage(moleculeId: number) {
        return `Molecule ${moleculeId} deleted from cart successfully`;
    },
    addMoleculeCartMessage(totalItem: number) {
        const response = totalItem === 1 ? 'Molecule is added to cart' : 'Molecules are added to cart';
        return response;
    },
    REMOVE_ALL_MESSAGE: "All the molecules are deleted from your cart.",
    SUBMIT_ORDER: "Molecules order submitted successfully.",
    USER_ROLE_CHECK: "User role not supported or missing required parameters.",
    sentForSynthesis(count: number) {
        return `${count} molecule(s) sent for retro synthesis!`;
    },
    UPDATE_MOLECULE_SUCCESS: "Molecules updated successfully",
    CREATE_LAB_JOB_ORDER: "Pathway has been added to synthesis lab job cart",
    LAP_JOB_CONFIRMATION_TITLE: 'Order confirmation',
    displayLabJobMessage(labJobStateCount: number, analysisStateCount: number) {
        if (!labJobStateCount && !analysisStateCount) {
            return ''; // No message if both counts are zero
        }
        const parts: Array<string> = [];
        if (labJobStateCount) {
            parts.push(`synthesis of ${labJobStateCount} molecule `);
        }
        if (analysisStateCount) {
            parts.push(`analysis of ${analysisStateCount} molecule`);
        }
        return `You are ordering the ${parts.join(' and ')}.`;
    },
    MOLECULES_VALIDATE_MSG: "Molecule have been validate successfully.",
    ADD_USER: 'User created successfully',
    ADD_ORGANIZATION: 'Organization Created successfully',
    ORGANIZATION_NAME_REQUIRED: 'Organization name is required',
    ORGANIZATION_ADMIN_FIRST_NAME_REQUIRED: 'Organization Admin First Name is required',
    ORGANIZATION_ADMIN_LAST_NAME_REQUIRED: 'Organization Admin Last Name is required',
    EMAIL_REQUIRED: 'Email is required',
    UPDATE_USER: 'User details updated successfully',
    UPDATE_ORGANIZATION: 'Organization updated successfully',
    UPDATE_ASSAY: 'New bioassay added successfully',
    UPDATE_PATHWAY_REACTION: 'Pathway has been updated successfully and sent for validation',
    UPDATE_PATHWAY_REACTION_VALIDATE: 'Pathway has been updated successfully and sent for validated',
    REACTION_VALIDATE_MSG(reactionNo: number, pathwayId: number) {
        return `Reaction ${reactionNo} for pathway ${pathwayId} validated successfully`;
    },
    REACTION_SAVE_MSG(reactionNo: number, pathwayId: number) {
        return `Reaction ${reactionNo} for pathway ${pathwayId} saved successfully`;
    },
    DELETE_MOLECULE_TITLE: 'Delete Molecule',
    DELETE_MOLECULE: 'Are you sure you want to delete ?',
    TYPE_DELETE: `Type 'delete' in the field below`,
    deleteMoleculeMsg(molecule_name: string) {
        return `Molecule ${molecule_name} deleted successfully`;
    },
    deleteUserMsg(user_name: string) {
        return `User ${user_name} deleted successfully`;
    },
    deleteLibraryMsg(library_name: string, label: string) {
        return `You are about to delete all the ${label} in Library ${library_name}. Are you sure you want to delete?`;
    },
    deleteAssayMsg(assay: string) {
        return `You are about to delete assay "${assay}". Are you sure you want to delete?`;
    },
    deleteAssayMsgConfirm(assay: string) {
        return `Assay "${assay}" deleted successfully.`;
    },
    REMOVE_ASSAY: 'Bioassay removed successfully',

    DELETE_LIBRARY_TITLE: `Delete Libraries`,
    LIBRARY_NOT_DELETE_MESSAGE(label: string) {
        return `Library can not be deleted because some of the ${label} of this library are in stage other than NEW.`
    },
    DELETE_LIBRARY_MESSAGE: 'Library Deleted Successfully.',
    DELETE_LIBRARY_ERROR_MESSAGE: 'Can not delete library. Some error occured while deleting the library',

    displayMoleculeSucessMsg(upload_molecule_count: number, rejected_molecule_count: number) {
        let messages: string[] = [];
        if (upload_molecule_count > 0) {
            const uploadedMoleculeTxt = upload_molecule_count > 1 ? 'molecules' : 'molecule';
            messages = [
                ...messages,
                `Valid ${uploadedMoleculeTxt} (${upload_molecule_count}) uploaded successfully.`
            ];
        }
        if (rejected_molecule_count > 0) {
            const rejectedMoleculeText = rejected_molecule_count > 1 ? 'molecules' : 'molecule';
            messages = [
                ...messages,
                `Invalid ${rejectedMoleculeText} (${rejected_molecule_count}) 
            ${rejected_molecule_count > 1 ? 'are' : 'is'} rejected and can be downloaded.`
            ]
        }
        return messages;
    },
    SAVE_CHANGES: 'Save the changes?',
    DISCARD_CHANGES: 'Discard the changes?',
    deleteOrgMsg(org_name: string) {
        return `You are about to delete all molecules and user in ${org_name}.`;
    },
    DELETE_ORGANIZATION_TITLE: 'Delete Organization',
    DELETE_ORGANIZATION_SUCCESS: 'Organization Deleted Successfully',
    DELETE_ORGANIZATION_ERROR: 'Some Error Occured while deleting organization',
    ADD_ASSAY: 'Functional assay added successfully',
    DELETE_PROJECT_TITLE: `Delete Project`,
    getProjectTitle(msg: string) {
        return `You are about to delete all the molecules in Project ${msg}`;
    },
    DELETE_PROJECT_MESSAGE: 'Project Deleted Successfully.',
    DELETE_PROJECT_ERROR_MESSAGE: 'Can not delete project. Some error occured while deleting the library',
    ANALYSIS_ORDER: "Molecule has been added to analysis cart",
    PROCESSING_LABJOB_ERROR: "Error processing lab job order",
}
