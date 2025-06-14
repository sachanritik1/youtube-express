import jwt from "jsonwebtoken"
import { GraphQLContext } from "./context"

// Use GraphQLContext from context.ts
export interface GraphQLResolverContext extends GraphQLContext {}

export interface ResolverParent {}

export interface ResolverArgs {
    [key: string]: any
}

export interface JwtPayload extends jwt.JwtPayload {
    id: string
}

export type Resolver<
    TResult = any,
    TParent = ResolverParent,
    TContext = GraphQLResolverContext,
    TArgs = ResolverArgs,
> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info?: any
) => Promise<TResult> | TResult

export interface ResolverMap {
    [key: string]: {
        [key: string]: Resolver
    }
}

export interface VideoFilterQuery {
    isPublished: boolean
    owner?: string
}

export interface LikeFilterQuery {
    likedBy: string
    video?: string
    comment?: string
    tweet?: string
}
