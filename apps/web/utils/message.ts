export const Messages = {
    FORGOT_PASSWORD_MESSAGE: `Please contact your organization admin to reset your password.`,
    userLoggedIn(firstName: string, lastName: string) {
        return `${firstName} ${lastName} logged in successfully`;
    },
    SOMETHING_WENT_WRONG: `Something went wrong`,
}