import { UserCreateInput, LoginInput, AuthResponse } from '../types';
export declare class AuthService {
    register(data: UserCreateInput): Promise<AuthResponse>;
    login(data: LoginInput): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private findUserById;
    private formatUserResponse;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map