import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    roles: string[];
};

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
    admin:       { label: 'Administrador', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    coordinator: { label: 'Coordinador',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
    teacher:     { label: 'Docente',       className: 'bg-green-100 text-green-800 border-green-200' },
};

export default function UsersIndex({ users, roles }: Props) {
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal state for Create/Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'coordinator',
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.roles[0]?.name || 'coordinator',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            patch(`/users/${editingUser.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/users', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const confirmDelete = () => {
        if (!deletingUser) return;
        setIsDeleting(true);
        router.delete(`/users/${deletingUser.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingUser(null);
            },
        });
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
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo usuario
                    </Button>
                </div>

                <Card>
                    {users.data.length === 0 ? (
                        <CardContent className="p-6">
                            <EmptyState
                                icon={Edit2}
                                title="Sin usuarios registrados"
                                description="Crea el primer usuario para comenzar a gestionar los accesos."
                                action={<Button onClick={openCreateModal}><Plus className="mr-2 h-4 w-4" />Crear usuario</Button>}
                            />
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
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(user)}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            disabled={isDeleting}
                                                            onClick={() => setDeletingUser(user)}
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

            {/* Modal de Crear/Editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                        <DialogDescription>
                            {editingUser 
                                ? 'Actualiza los datos del usuario. Deja la contraseña en blanco si no deseas cambiarla.' 
                                : 'Ingresa los datos para registrar un nuevo usuario en el sistema.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre completo <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Contraseña {editingUser ? <span className="font-normal text-xs text-muted-foreground">(opcional)</span> : <span className="text-destructive">*</span>}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={errors.password ? 'border-destructive' : ''}
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Rol <span className="text-destructive">*</span></Label>
                            <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r} value={r} className="capitalize">
                                            {r === 'admin' ? 'Administrador' : r === 'coordinator' ? 'Coordinador' : 'Docente'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingUser ? 'Guardar cambios' : 'Crear usuario'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmación de Eliminación */}
            <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás seguro?</DialogTitle>
                        <DialogDescription>
                            Estás a punto de eliminar al usuario <strong>{deletingUser?.name}</strong>. Esta acción no se puede deshacer y el usuario perderá acceso al sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar usuario'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
    ],
};
