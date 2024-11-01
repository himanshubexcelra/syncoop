export const Messages = {
    FORGOT_PASSWORD_MESSAGE: `Please contact your organization admin to reset your password.`,
    userLoggedIn(firstName: string, lastName: string) {
        return `${firstName} ${lastName} logged in successfully`;
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
    LIBRARY_LIST_EMPTY:
        "Your library list is empty, add a library to import molecules",
    deleteMoleculeMessage(status: string) {
            return `${status} deleted successfully`;
        }, 
    REMOVE_ALL_MESSAGE: "All the molecules are deleted from your cart."       
}