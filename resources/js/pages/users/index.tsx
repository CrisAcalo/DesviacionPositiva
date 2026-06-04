import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type User = {
    id: number;
    name: string;
    email: string;
    roles: Array<{ id: number; name: string }>;
    created_at: string;
};

type Props = {
    users: {
        data: User[];
        links: any;
    };
};

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
    admin:       { label: 'Administrador', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    coordinator: { label: 'Coordinador',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
    teacher:     { label: 'Docente',       className: 'bg-green-100 text-green-800 border-green-200' },
};

export default function UsersIndex({ users }: Props) {
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (userId: number, userName: string) => {
        if (confirm(`¿Eliminar a ${userName}? Esta acción no se puede deshacer.`)) {
            setDeleting(userId);
            router.delete(`/users/${userId}`, {
                onFinish: () => setDeleting(null),
            });
        }
    };

    return (
        <>
            <Head title="Usuarios" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Gestión de Usuarios"
                        description={`${users.data.length} usuario${users.data.length !== 1 ? 's' : ''} registrado${users.data.length !== 1 ? 's' : ''} en el sistema.`}
                    />
                    <Button asChild>
                        <Link href="/users/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo usuario
                        </Link>
                    </Button>
                </div>

                <Card>
                    {users.data.length === 0 ? (
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Edit2 className="h-6 w-6 opacity-40" />
                            </div>
                            <p className="font-medium">Sin usuarios registrados</p>
                            <p className="text-sm mt-1">Crea el primer usuario para comenzar.</p>
                            <Button asChild className="mt-4">
                                <Link href="/users/create">Crear usuario</Link>
                            </Button>
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Correo electrónico</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Registrado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => {
                                        const roleName = user.roles[0]?.name;
                                        const roleCfg = roleName ? ROLE_BADGE[roleName] : null;
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell>
                                                    {roleCfg ? (
                                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleCfg.className}`}>
                                                            {roleCfg.label}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground">
                                                            Sin rol
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(user.created_at).toLocaleDateString('es-EC')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                            <Link href={`/users/${user.id}/edit`}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            disabled={deleting === user.id}
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
    ],
};
