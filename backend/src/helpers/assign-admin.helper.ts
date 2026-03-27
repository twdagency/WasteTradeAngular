import { Entity } from '@loopback/repository';
import { UserRepository } from '../repositories';
import { AssignAdmin } from '../models';

interface EntityWithAssignAdmin extends Entity {
    assignAdmin?: AssignAdmin | null;
}

interface AssignedAdminUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    globalRole: string;
}

export namespace AssignAdminHelper {
    export async function enrichWithAssignedAdmin<T extends EntityWithAssignAdmin>(
        results: T[],
        userRepository: UserRepository,
    ): Promise<T[]> {
        // Get unique assigned admin IDs in one pass
        const assignedAdminIdsSet = new Set<number>();
        results.forEach((r) => {
            if (r.assignAdmin?.assignedAdminId) {
                assignedAdminIdsSet.add(r.assignAdmin.assignedAdminId);
            }
        });

        // Batch fetch all admin users
        const adminUsersMap = new Map<number, AssignedAdminUser>();
        if (assignedAdminIdsSet.size > 0) {
            const adminUsers = await userRepository.find({
                where: { id: { inq: Array.from(assignedAdminIdsSet) } },
            });
            adminUsers.forEach((user) => {
                if (user.id) {
                    adminUsersMap.set(user.id, {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        globalRole: user.globalRole,
                    });
                }
            });
        }

        // Map results once with assignedAdmin inside assignAdmin
        return results.map((result) => {
            if (result.assignAdmin?.assignedAdminId) {
                const assignedAdmin = adminUsersMap.get(result.assignAdmin.assignedAdminId);
                return {
                    ...result,
                    assignAdmin: {
                        ...result.assignAdmin,
                        assignedAdmin: assignedAdmin ?? null,
                    },
                } as T;
            }
            return result;
        });
    }
}
