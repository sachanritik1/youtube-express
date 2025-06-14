import { Response, Request } from "express"
import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4"

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

export const createContext = async ({
    req,
    res,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> => {
    return {
        req,
        res,
        user: req.user,
    }
}
