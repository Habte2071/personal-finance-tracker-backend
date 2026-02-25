export declare const generateAccessToken: (payload: {
    userId: number;
    email: string;
}) => string;
export declare const generateRefreshToken: (payload: {
    userId: number;
    email: string;
}) => string;
export declare const verifyAccessToken: (token: string) => {
    userId: number;
    email: string;
};
export declare const verifyRefreshToken: (token: string) => {
    userId: number;
    email: string;
};
//# sourceMappingURL=jwt.utils.d.ts.map