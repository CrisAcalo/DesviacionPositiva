import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/* ─── Types ─────────────────────────────────────────────────────────── */

type Department = { id: number; name: string; code: string | null; careers_count: number };
type Career     = { id: number; name: string; code: string | null; department_id: number; department: { id: number; name: string }; nrcs_count: number };
type Subject    = { id: number; name: string; code: string | null; nrcs_count: number };

type Props = {
    departments: Department[];
    careers:     Career[];
    subjects:    Subject[];
};

/* ─── Shared confirm‑delete dialog ──────────────────────────────────── */

function DeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    warningText,
    onConfirm,
    processing,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    description: string;
    warningText?: string;
    onConfirm: () => void;
    processing: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {warningText && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                        {warningText}
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={processing}>
                        {processing ? 'Eliminando…' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ─── SECTION: Departamentos ─────────────────────────────────────────── */

function DepartmentsSection({ departments }: { departments: Department[] }) {
    const [editOpen, setEditOpen]   = useState(false);
    const [editItem, setEditItem]   = useState<Department | null>(null);
    const [deleteItem, setDeleteItem] = useState<Department | null>(null);
    const [deleting, setDeleting]   = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
    });

    const openCreate = () => {
        reset(); clearErrors();
        setEditItem(null);
        setEditOpen(true);
    };

    const openEdit = (dept: Department) => {
        clearErrors();
        setData({ name: dept.name, code: dept.code ?? '' });
        setEditItem(dept);
        setEditOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            put(`/departments/${editItem.id}`, { onSuccess: () => setEditOpen(false) });
        } else {
            post('/departments', { onSuccess: () => { setEditOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        setDeleting(true);
        router.delete(`/departments/${deleteItem.id}`, {
            onFinish: () => { setDeleting(false); setDeleteItem(null); },
        });
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-base">Departamentos</h3>
                        <p className="text-xs text-muted-foreground">{departments.length} registrado{departments.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Nuevo
                    </Button>
                </div>

                <Card>
                    {departments.length === 0 ? (
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No hay departamentos registrados.
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Carreras</TableHead>
                                        <TableHead className="w-20 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium">{dept.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{dept.code ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{dept.careers_count}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dept)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteItem(dept)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create / Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Editar departamento' : 'Nuevo departamento'}</DialogTitle>
                        <DialogDescription>
                            {editItem ? `Editando: ${editItem.name}` : 'Completa los datos del nuevo departamento.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="dept-name">Nombre *</Label>
                            <Input
                                id="dept-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Ciencias de la Computación"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="dept-code">Código <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <Input
                                id="dept-code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="Ej: DCCO"
                                className={errors.code ? 'border-destructive' : ''}
                            />
                            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando…' : editItem ? 'Guardar cambios' : 'Crear departamento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <DeleteDialog
                open={!!deleteItem}
                onOpenChange={(v) => { if (!v) setDeleteItem(null); }}
                title="Eliminar departamento"
                description={`¿Estás seguro de que deseas eliminar "${deleteItem?.name}"? Esta acción no se puede deshacer.`}
                warningText={deleteItem && deleteItem.careers_count > 0
                    ? `Este departamento tiene ${deleteItem.careers_count} carrera(s) asociada(s). Elimina primero las carreras antes de eliminar el departamento.`
                    : undefined}
                onConfirm={handleDelete}
                processing={deleting}
            />
        </>
    );
}

/* ─── SECTION: Carreras ──────────────────────────────────────────────── */

function CareersSection({ careers, departments }: { careers: Career[]; departments: Department[] }) {
    const [editOpen, setEditOpen]     = useState(false);
    const [editItem, setEditItem]     = useState<Career | null>(null);
    const [deleteItem, setDeleteItem] = useState<Career | null>(null);
    const [deleting, setDeleting]     = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<{
        name: string;
        code: string;
        department_id: string;
    }>({
        name:          '',
        code:          '',
        department_id: '',
    });

    const openCreate = () => {
        reset(); clearErrors();
        setEditItem(null);
        setEditOpen(true);
    };

    const openEdit = (career: Career) => {
        clearErrors();
        setData({ name: career.name, code: career.code ?? '', department_id: String(career.department_id) });
        setEditItem(career);
        setEditOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            put(`/careers/${editItem.id}`, { onSuccess: () => setEditOpen(false) });
        } else {
            post('/careers', { onSuccess: () => { setEditOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        setDeleting(true);
        router.delete(`/careers/${deleteItem.id}`, {
            onFinish: () => { setDeleting(false); setDeleteItem(null); },
        });
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-base">Carreras</h3>
                        <p className="text-xs text-muted-foreground">{careers.length} registrada{careers.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" onClick={openCreate} disabled={departments.length === 0}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Nueva
                    </Button>
                </div>

                {departments.length === 0 && (
                    <p className="text-xs text-amber-600">Crea al menos un departamento antes de agregar carreras.</p>
                )}

                <Card>
                    {careers.length === 0 ? (
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No hay carreras registradas.
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>NRCs</TableHead>
                                        <TableHead className="w-20 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {careers.map((career) => (
                                        <TableRow key={career.id}>
                                            <TableCell className="font-medium">{career.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{career.code ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{career.department.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{career.nrcs_count}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(career)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteItem(career)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create / Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Editar carrera' : 'Nueva carrera'}</DialogTitle>
                        <DialogDescription>
                            {editItem ? `Editando: ${editItem.name}` : 'Completa los datos de la nueva carrera.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Nombre *</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Ingeniería de Software"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Código <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <Input
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="Ej: ISING"
                                className={errors.code ? 'border-destructive' : ''}
                            />
                            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Departamento *</Label>
                            <Select
                                value={data.department_id}
                                onValueChange={(v) => setData('department_id', v)}
                            >
                                <SelectTrigger className={errors.department_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Seleccionar departamento…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department_id && <p className="text-xs text-destructive">{errors.department_id}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando…' : editItem ? 'Guardar cambios' : 'Crear carrera'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <DeleteDialog
                open={!!deleteItem}
                onOpenChange={(v) => { if (!v) setDeleteItem(null); }}
                title="Eliminar carrera"
                description={`¿Estás seguro de que deseas eliminar "${deleteItem?.name}"? Esta acción no se puede deshacer.`}
                warningText={deleteItem && deleteItem.nrcs_count > 0
                    ? `Esta carrera tiene ${deleteItem.nrcs_count} NRC(s) asociado(s). No se puede eliminar mientras existan NRCs que la referencien.`
                    : undefined}
                onConfirm={handleDelete}
                processing={deleting}
            />
        </>
    );
}

/* ─── SECTION: Materias ──────────────────────────────────────────────── */

function SubjectsSection({ subjects }: { subjects: Subject[] }) {
    const [editOpen, setEditOpen]     = useState(false);
    const [editItem, setEditItem]     = useState<Subject | null>(null);
    const [deleteItem, setDeleteItem] = useState<Subject | null>(null);
    const [deleting, setDeleting]     = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
    });

    const openCreate = () => {
        reset(); clearErrors();
        setEditItem(null);
        setEditOpen(true);
    };

    const openEdit = (subject: Subject) => {
        clearErrors();
        setData({ name: subject.name, code: subject.code ?? '' });
        setEditItem(subject);
        setEditOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            put(`/subjects/${editItem.id}`, { onSuccess: () => setEditOpen(false) });
        } else {
            post('/subjects', { onSuccess: () => { setEditOpen(false); reset(); } });
        }
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        setDeleting(true);
        router.delete(`/subjects/${deleteItem.id}`, {
            onFinish: () => { setDeleting(false); setDeleteItem(null); },
        });
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-base">Materias</h3>
                        <p className="text-xs text-muted-foreground">{subjects.length} registrada{subjects.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Nueva
                    </Button>
                </div>

                <Card>
                    {subjects.length === 0 ? (
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            No hay materias registradas.
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>NRCs</TableHead>
                                        <TableHead className="w-20 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.map((subject) => (
                                        <TableRow key={subject.id}>
                                            <TableCell className="font-medium">{subject.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{subject.code ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{subject.nrcs_count}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(subject)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteItem(subject)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create / Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
                        <DialogDescription>
                            {editItem ? `Editando: ${editItem.name}` : 'Completa los datos de la nueva materia.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Nombre *</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Algoritmos y Programación"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Código <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                            <Input
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="Ej: ALP001"
                                className={errors.code ? 'border-destructive' : ''}
                            />
                            {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando…' : editItem ? 'Guardar cambios' : 'Crear materia'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <DeleteDialog
                open={!!deleteItem}
                onOpenChange={(v) => { if (!v) setDeleteItem(null); }}
                title="Eliminar materia"
                description={`¿Estás seguro de que deseas eliminar "${deleteItem?.name}"? Esta acción no se puede deshacer.`}
                warningText={deleteItem && deleteItem.nrcs_count > 0
                    ? `Esta materia tiene ${deleteItem.nrcs_count} NRC(s) asociado(s). No se puede eliminar mientras existan NRCs que la referencien.`
                    : undefined}
                onConfirm={handleDelete}
                processing={deleting}
            />
        </>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function CatalogsIndex({ departments, careers, subjects }: Props) {
    return (
        <>
            <Head title="Catálogos" />

            <div className="space-y-8 p-6">
                <Heading
                    title="Catálogos"
                    description="Gestiona los departamentos, carreras y materias disponibles en el sistema."
                />

                <div className="h-px bg-border" />

                <DepartmentsSection departments={departments} />

                <div className="h-px bg-border" />

                <CareersSection careers={careers} departments={departments} />

                <div className="h-px bg-border" />

                <SubjectsSection subjects={subjects} />
            </div>
        </>
    );
}

CatalogsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Catálogos', href: '/catalogs' },
    ],
};
