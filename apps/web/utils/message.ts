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
    LIBRARY_LIST_EMPTY:
        "Your library list is empty, add a library to import molecules",
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
    LAP_JOB_CONFIRMATION_TITLE: 'Synthesis order confirmation',
    displayLabJobMessage(count: number) {
        return `You are ordering the synthesis of ${count} Molecule.`;
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
    }
}
