import { UserRole } from "@core/enums/user-role.enum";

export interface CurrentUser {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl?: string | null;
}