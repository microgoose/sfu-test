export class UserService {
    private readonly id = crypto.randomUUID();

    getUser() {
        return {
            id: this.id,
            name: `user-${this.id.slice(0, 4)}`
        };
    }
}