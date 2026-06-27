import { UserRole } from "@core/enums/user-role.enum";

export interface CurrentUser {
    id: string;
    fullName: string;
    email: string;
    roles: UserRole[];
    avatarUrl?: string | null;
}
