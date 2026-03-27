export interface UserListItem {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    status: string;
    assignedAdminId?: number | null;
    overallStatus: string;
    registrationStatus: string;
    onboardingStatus: string;
    company?: {
        id: number;
        name: string;
        country?: string;
        isHaulier: boolean;
        isBuyer: boolean;
        isSeller: boolean;
    } | null;
}
