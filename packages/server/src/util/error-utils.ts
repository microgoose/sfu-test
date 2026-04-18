export function getErrorMessage(ex: Error | unknown) {
    if (ex instanceof Error) {
        return ex.message;
    } else {
        return 'Internal error';
    }
}