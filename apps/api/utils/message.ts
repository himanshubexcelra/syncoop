export const MESSAGES = {
    ORGANIZATION_ALREADY_EXISTS: 'Organization name is already taken.',
    USER_BELONGS_TO_ANOTHER_ORG: 'User is already associated with another organization',
    USER_NOT_EXISTS: 'User does not exist',
    EMAIL_ALREADY_EXIST: `Email already exists`,
}

export const STATUS_TYPE = {
    CONFLICT: 409,
    SUCCESS: 200,
    UNAUTORIZED: 401,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500
}