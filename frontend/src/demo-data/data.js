class user {
    constructor(userID, username) {
        this.userID = userID
        this.username = username
    }
}

export const users = [
    new user(1, "Hello"),
    new user(2, "Anthony"),
    new user(3, "Gary"),
    new user(4, "David"),
]
