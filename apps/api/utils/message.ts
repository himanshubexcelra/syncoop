export const MESSAGES = {
    ORGANIZATION_ALREADY_EXISTS: 'Organization name is already taken.',
    USER_BELONGS_TO_ANOTHER_ORG: 'User is already associated with another organization',
    INVALID_LOGIN_CREDENTIALS: 'Invalid credentials',
    PROJECT_EXISTS: 'Project name is already taken.',
    LIBRARY_EXISTS: 'Library name is already taken.',
    ORGANIZATION_ID_NEEDED: 'Organization id is required',
    EMAIL_ALREADY_EXIST: `Email already exists`,
    USER_NOT_FOUND: 'User does not exist',
    LIBRARY_NOT_FOUND: 'Library does not exist',
    MOLECULE_ORDER_NOT_FOUND: 'Molecule order does not exist',
}

export const STATUS_TYPE = {
    CONFLICT: 409,
    SUCCESS: 200,
    UNAUTORIZED: 401,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500
}

export enum StatusCode {
    READY = 'Ready',
    NEW = 'New',
    FAILED = 'Failed',
    INPROGRESS = 'In Progress',
    DONE = 'Done',
}