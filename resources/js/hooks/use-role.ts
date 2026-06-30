import { usePage } from '@inertiajs/react';
import type { AppRole, Auth } from '@/types';

export function useRole() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const roles: string[] = auth?.roles ?? [];

    const hasRole = (...check: AppRole[]) => check.some((r) => roles.includes(r));

    const isAdmin = hasRole('admin');
    const isCoordinator = hasRole('coordinator');
    const isTeacher = hasRole('teacher');

    return { roles, hasRole, isAdmin, isCoordinator, isTeacher };
}
