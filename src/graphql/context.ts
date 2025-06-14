import { Response, Request } from "express"

export interface GraphQLContext {
    req: Request
    res: Response
    user?: {
        id: string
        email?: string
        username?: string
        fullName?: string
    }
}

export const createContext = ({
    req,
    res,
}: {
    req: Request
    res: Response
}): GraphQLContext => {
    return {
        req,
        res,
        user: req.user,
    }
}
