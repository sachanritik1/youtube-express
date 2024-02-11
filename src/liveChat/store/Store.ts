export type userId = string

export interface Chat {
    id: string
    sender: userId
    message: string
    upVotes: userId[]
}

export abstract class Store {
    constructor() {}
    initRoom(roomId: string) {}
    getChats(roomId: string, limit: number, offset: number) {}
    addChat(roomId: string, message: string, userId: userId) {}
    upVote(roomId: string, chatId: string, userId: userId) {}
}
