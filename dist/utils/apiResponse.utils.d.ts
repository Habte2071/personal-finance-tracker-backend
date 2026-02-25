import { Response } from 'express';
import { ApiResponse } from '../types';
export declare const successResponse: <T>(res: Response, data: T, message?: string, statusCode?: number, meta?: ApiResponse<T>["meta"]) => Response;
export declare const errorResponse: (res: Response, message?: string, statusCode?: number, errors?: ApiResponse["errors"]) => Response;
export declare const paginatedResponse: <T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string) => Response;
//# sourceMappingURL=apiResponse.utils.d.ts.map