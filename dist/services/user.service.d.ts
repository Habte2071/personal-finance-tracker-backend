import { UserResponse } from '../types';
export declare class UserService {
    getProfile(userId: number): Promise<UserResponse>;
    updateProfile(userId: number, data: {
        first_name?: string;
        last_name?: string;
        currency?: string;
    }): Promise<UserResponse>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    private formatUserResponse;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map