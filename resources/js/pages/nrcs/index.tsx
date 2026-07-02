import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type Nrc = {
    id: number;
    code: string;
    status: 'pending' | 'segmented' | 'surveying' | 'analyzed';
    created_at: string;
    subject: { name: string };
    career: { name: string; department: { name: string } };
    academic_period: { name: string };
    uploader: { name: string };
};

type PaginatedNrcs = {
    data: Nrc[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

const STATUS_LABELS: Record<Nrc['status'], string> = {
    pending:   'Pendiente',
    segmented: 'Segmentado',
    surveying: 'En encuesta',
    analyzed:  'Analizado',
};

const STATUS_VARIANTS: Record<Nrc['status'], 'secondary' | 'default' | 'outline' | 'destructive'> = {
    pending:   'secondary',
    segmented: 'outline',
    surveying: 'default',
    analyzed:  'default',
};

export default function NrcsIndex({ nrcs }: { nrcs: PaginatedNrcs }) {
    const [deletingNrc, setDeletingNrc] = useState<Nrc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = () => {
        if (!deletingNrc) return;
        setIsDeleting(true);
        router.delete(`/nrcs/${deletingNrc.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingNrc(null);
            }
        });
    };

    const groupedNrcs = nrcs.data.reduce((acc, nrc) => {
        const key = nrc.career.name;
        if (!acc[key]) {
            acc[key] = {
                career: nrc.career,
                items: []
            };
        }
        acc[key].items.push(nrc);
        return acc;
    }, {} as Record<string, { career: Nrc['career']; items: Nrc[] }>);

    return (
        <>
            <Head title="Gestión de NRCs" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Gestión de NRCs"
                        description="Historial de NRCs cargados y su estado de procesamiento."
                    />
                    <Button asChild>
                        <Link href="/nrcs/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Cargar NRC
                        </Link>
                    </Button>
                </div>

                {nrcs.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <ClipboardList className="mb-4 h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No hay NRCs cargados aún.</p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link href="/nrcs/create">Cargar el primero</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.values(groupedNrcs).map((group, index) => (
                            <div key={index} className="space-y-3">
                                <div>
                                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                        {group.career.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {group.career.department.name}
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código NRC</TableHead>
                                                <TableHead>Materia</TableHead>
                                                <TableHead>Período</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Cargado por</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.items.map((nrc) => (
                                                <TableRow key={nrc.id}>
                                                    <TableCell className="font-mono font-medium">{nrc.code}</TableCell>
                                                    <TableCell>{nrc.subject.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{nrc.academic_period.name}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={STATUS_VARIANTS[nrc.status]}>
                                                            {STATUS_LABELS[nrc.status]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{nrc.uploader.name}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button asChild variant="ghost" size="sm">
                                                                <Link href={`/nrcs/${nrc.id}`}>Ver detalle</Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => setDeletingNrc(nrc)}
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
                            </div>
                        ))}
                    </div>
                )}

                {nrcs.last_page > 1 && (
                    <div className="flex justify-end gap-2">
                        {nrcs.prev_page_url && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={nrcs.prev_page_url}>Anterior</Link>
                            </Button>
                        )}
                        <span className="flex items-center px-2 text-sm text-muted-foreground">
                            Página {nrcs.current_page} de {nrcs.last_page}
                        </span>
                        {nrcs.next_page_url && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={nrcs.next_page_url}>Siguiente</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <Dialog open={!!deletingNrc} onOpenChange={(open) => !open && setDeletingNrc(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar NRC</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el NRC <strong>{deletingNrc?.code}</strong>? Se borrarán todos los estudiantes, configuraciones de encuestas y calificaciones asociadas. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingNrc(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sí, eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

NrcsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gestión de NRCs', href: '/nrcs' },
    ],
};
