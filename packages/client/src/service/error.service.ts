export function getMessage(error: Error | unknown) {
    return error instanceof Error ? error : String(error);
}