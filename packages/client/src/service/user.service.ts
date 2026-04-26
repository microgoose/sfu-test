export type UserService = ReturnType<typeof createUserService>;

export function createUserService() {
    const id = crypto.randomUUID();
    return {
        getUser: () => ({ id, name: `user-${id.slice(0, 4)}` })
    };
}