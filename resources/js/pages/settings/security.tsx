import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
};

export default function Security({ passwordRules }: Props) {
    'use no memo';
    const passwordRef = useRef<HTMLInputElement>(null);
    const currentPasswordRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordRef.current?.focus();
                }
                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordRef.current?.focus();
                }
            },
        });
    }

    return (
        <>
            <Head title="Seguridad" />

            <h1 className="sr-only">Configuración de seguridad</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Cambiar contraseña"
                    description="Asegúrate de usar una contraseña larga y segura para proteger tu cuenta."
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Contraseña actual</Label>
                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordRef}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            placeholder="Contraseña actual"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                        />
                        <InputError message={errors.current_password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Nueva contraseña</Label>
                        <PasswordInput
                            id="password"
                            ref={passwordRef}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                            passwordrules={passwordRules}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Debe incluir mayúsculas, números y símbolos.</p>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>
                        <PasswordInput
                            id="password_confirmation"
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="Repite la nueva contraseña"
                            passwordrules={passwordRules}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} data-test="update-password-button">
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Actualizar contraseña
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Seguridad',
            href: edit(),
        },
    ],
};
