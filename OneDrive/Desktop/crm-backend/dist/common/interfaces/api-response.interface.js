"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginatedResponse = createPaginatedResponse;
exports.createApiResponse = createApiResponse;
function createPaginatedResponse(data, total, page, limit) {
    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
function createApiResponse(message, data, statusCode = 200) {
    return {
        success: true,
        message,
        data,
        statusCode,
    };
}
//# sourceMappingURL=api-response.interface.js.map