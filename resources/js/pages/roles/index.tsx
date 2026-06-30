import { Head, useForm } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type Props = {
    roles: Role[];
    permissions: Permission[];
};

const MODULE_LABELS: Record<string, string> = {
    nrc: 'Gestión de NRC',
    survey: 'Encuestas',
    analysis: 'Análisis de Datos',
    reports: 'Reportes',
    users: 'Usuarios',
};

const MODULE_COLORS: Record<string, string> = {
    nrc: 'bg-blue-500',
    survey: 'bg-emerald-500',
    analysis: 'bg-purple-500',
    reports: 'bg-amber-500',
    users: 'bg-rose-500',
};

const ACTION_LABELS: Record<string, string> = {
    upload: 'Cargar',
    view: 'Ver',
    manage: 'Administrar',
    respond: 'Responder',
    run: 'Ejecutar',
    download: 'Descargar',
};

function RoleCard({ role, permissions }: { role: Role; permissions: Permission[] }) {
    const { data, setData, put, processing } = useForm({
        permissions: role.permissions.map(p => p.name),
    });

    const handleCheckboxChange = (checked: boolean, permName: string) => {
        if (checked) {
            setData('permissions', [...data.permissions, permName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permName));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/roles/${role.id}`);
    };

    const isAdmin = role.name === 'admin';

    const groupedPermissions = permissions.reduce((acc, p) => {
        const [module] = p.name.split('.');
        if (!acc[module]) acc[module] = [];
        acc[module].push(p);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="capitalize">{role.name}</CardTitle>
                <CardDescription>
                    {isAdmin
                        ? 'El rol Administrador tiene acceso total al sistema de manera implícita.'
                        : 'Selecciona los permisos que aplican para este rol.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(groupedPermissions).map(([module, perms]) => {
                            const dotColor = MODULE_COLORS[module] || 'bg-slate-500';
                            return (
                                <div key={module} className="rounded-xl border bg-card p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                                        <h4 className="text-sm font-semibold">
                                            {MODULE_LABELS[module] || module.toUpperCase()}
                                        </h4>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {perms.map((p) => {
                                            const [, action] = p.name.split('.');
                                            const actionLabel = ACTION_LABELS[action] || action;
                                            return (
                                                <div key={p.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}-perm-${p.id}`}
                                                        checked={isAdmin || data.permissions.includes(p.name)}
                                                        onCheckedChange={(c) => handleCheckboxChange(c as boolean, p.name)}
                                                        disabled={isAdmin || processing}
                                                    />
                                                    <Label
                                                        htmlFor={`role-${role.id}-perm-${p.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {actionLabel}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                {!isAdmin && (
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar permisos'}
                        </Button>
                    </CardFooter>
                )}
            </form>
        </Card>
    );
}

export default function RolesIndex({ roles, permissions }: Props) {
    return (
        <>
            <Head title="Roles y Permisos" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Roles y Permisos"
                    description="Gestiona los niveles de acceso de los usuarios del sistema."
                />

                <div className="space-y-6 mt-8">
                    <h3 className="text-lg font-medium">Roles Existentes</h3>
                    {roles.map((role) => (
                        <RoleCard key={role.id} role={role} permissions={permissions} />
                    ))}
                </div>
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: 'Roles y Permisos', href: '/roles' },
    ],
};
