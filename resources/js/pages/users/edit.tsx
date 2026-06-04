�import { Head, Link } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type Props = {
    user: User;
    roles: string[];
};

export default function UsersEdit({ user, roles }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/users/${user.id}`);
    };

    return (
        <>
            <Head title={`Editar usuario: ${user.name}`} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title="Editar Usuario"
                        description={`Modifica la información de ${user.name}.`}
                    />
                </div>

                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base">Información del usuario</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nombre + Email en grid */}
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre completo <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        type="text"
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
                            </div>

                            {/* Contraseña */}
                            <div className={`grid gap-5 ${data.password ? 'sm:grid-cols-2' : ''}`}>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        Nueva contraseña <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Vacío = mantiene la contraseña actual"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                    {data.password && <p className="text-xs text-muted-foreground">Debe incluir mayúsculas, números y símbolos.</p>}
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>

                                {data.password && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Confirmar contraseña <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            placeholder="Repite la nueva contraseña"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Rol */}
                            <div className="grid gap-2 max-w-xs">
                                <Label htmlFor="role">Rol <span className="text-destructive">*</span></Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role === 'admin' ? '�x:� Administrador � acceso total' : '�x9 Coordinador � gestión de NRCs'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-2 border-t">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar cambios
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/users">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Usuarios', href: '/users' },
        { title: 'Editar', href: '#' },
    ],
};
