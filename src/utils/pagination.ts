import mongoose from "mongoose"

// Define the AggregatePaginateResult interface since it's not exported
interface AggregatePaginateResult<T> {
    docs: T[]
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    pagingCounter: number
    nextPage: number | null
    prevPage: number | null
}

interface PaginationOptions {
    page?: number
    limit?: number
    sort?: Record<string, 1 | -1>
    populate?: string | string[] | Record<string, any> | Record<string, any>[]
    customLabels?: Record<string, string>
}

interface PaginatedResponse<T> {
    docs: T[]
    totalDocs: number
    totalPages: number
    page: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

/**
 * Creates a paginated aggregation query using mongoose-aggregate-paginate-v2
 *
 * @param model - The mongoose model that has the aggregatePaginate plugin applied
 * @param pipeline - MongoDB aggregation pipeline stages
 * @param options - Pagination options (page, limit, sort, populate)
 * @returns A promise that resolves to a paginated result
 */
export const paginateWithAggregate = async <T>(
    model: any,
    pipeline: mongoose.PipelineStage[] = [],
    options: PaginationOptions = {}
): Promise<PaginatedResponse<T>> => {
    // Set default options
    const paginationOptions = {
        page: options.page || 1,
        limit: options.limit || 10,
        sort: options.sort || { createdAt: -1 },
        populate: options.populate || "",
        customLabels: {
            docs: "docs",
            totalDocs: "totalDocs",
            limit: "limit",
            page: "page",
            totalPages: "totalPages",
            hasNextPage: "hasNextPage",
            hasPrevPage: "hasPrevPage",
            ...options.customLabels,
        },
    }

    // Create the aggregate
    const aggregate = model.aggregate(pipeline)

    // Execute the paginate function
    try {
        const result = (await model.aggregatePaginate(
            aggregate,
            paginationOptions
        )) as AggregatePaginateResult<T>

        return {
            docs: result.docs,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            page: result.page,
            limit: result.limit,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
        }
    } catch (error) {
        console.error("Pagination error:", error)
        throw error
    }
}

/**
 * Get a standard pagination pipeline for filtering and sorting
 *
 * @param filters - MongoDB filter conditions
 * @param sortOptions - Sorting options
 * @returns An array of aggregation pipeline stages for filtering and sorting
 */
export const getBasicPipeline = (
    filters: Record<string, any> = {},
    sortOptions: Record<string, 1 | -1> = { createdAt: -1 }
): mongoose.PipelineStage[] => {
    const pipeline: mongoose.PipelineStage[] = []

    // Add match stage if filters are provided
    if (Object.keys(filters).length > 0) {
        pipeline.push({ $match: filters })
    }

    // Add sort stage if sort options are provided
    if (Object.keys(sortOptions).length > 0) {
        pipeline.push({ $sort: sortOptions })
    }

    return pipeline
}

/**
 * Helper to convert string IDs to ObjectIds safely
 *
 * @param id - The ID to convert to ObjectId
 * @returns A mongoose ObjectId or null if invalid
 */
export const toObjectId = (id: string): mongoose.Types.ObjectId | null => {
    try {
        return new mongoose.Types.ObjectId(id)
    } catch (error) {
        return null
    }
}

/**
 * Prepare search filters for text search
 *
 * @param searchTerm - The search term
 * @param fields - An array of field names to search in
 * @returns A filter object for MongoDB aggregation
 */
export const createSearchFilter = (
    searchTerm: string,
    fields: string[]
): Record<string, any> => {
    if (!searchTerm || !fields.length) return {}

    // Create OR conditions for each field
    const searchConditions = fields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
    }))

    return { $or: searchConditions }
}
