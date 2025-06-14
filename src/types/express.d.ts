/// <reference types="express" />

// This extends the Express Request interface to include a user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                email?: string
                username?: string
                fullName?: string
            }
        }
    }
}

export {}
