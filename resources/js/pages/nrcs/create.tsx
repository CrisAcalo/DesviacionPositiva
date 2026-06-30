import { router, usePage } from '@inertiajs/react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useCallback, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    FileSpreadsheet,
    FileText,
    Info,
    Loader2,
    Trash2,
    Upload,
    XCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

/* ─── Types ─────────────────────────────────────────────────────── */

type Department = { id: number; name: string; careers: Career[] };
type Career = { id: number; name: string; department_id: number };
type Subject = { id: number; name: string; code: string | null };
type AcademicPeriod = { id: number; name: string; is_active: boolean };

type PageProps = {
    departments: Department[];
    careers: Career[];
    subjects: Subject[];
    academicPeriods: AcademicPeriod[];
};

type FileEntry = {
    file: File;
    preview: Record<string, string>[];
    headers: string[];
    parseErrors: string[];
    meta: {
        code: string;
        subject_id: string;
        career_id: string;
    };
};

type FormErrors = Record<string, string>;

type ImportFileResult = {
    file: string;
    success: boolean;
    count?: number;
    queued?: boolean;
    errors?: string[];
};

/* ─── Import results panel ───────────────────────────────────────── */

function ImportResultsPanel({ results }: { results: ImportFileResult[] }) {
    const hasErrors = results.some((r) => !r.success);
    const hasSuccess = results.some((r) => r.success);

    return (
        <div
            className={`space-y-3 rounded-xl border p-4 ${
                hasErrors && !hasSuccess
                    ? 'border-destructive/40 bg-destructive/5'
                    : hasErrors
                      ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
                      : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
            }`}
        >
            <div className="flex items-center gap-2 text-sm font-medium">
                {hasErrors ? (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                )}
                <span>
                    {hasErrors &&
                        !hasSuccess &&
                        'La importación falló — revisa los errores antes de volver a intentar.'}
                    {hasErrors &&
                        hasSuccess &&
                        'Importación parcial: algunos archivos fallaron.'}
                    {!hasErrors &&
                        'Todos los archivos se importaron correctamente.'}
                </span>
            </div>

            <div className="space-y-2">
                {results.map((r, i) => (
                    <div
                        key={i}
                        className={`rounded-lg border px-3 py-2.5 text-sm ${
                            r.success
                                ? 'border-green-200 bg-white dark:bg-background'
                                : 'border-destructive/30 bg-white dark:bg-background'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {r.success ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                            ) : (
                                <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                            )}
                            <span className="truncate font-medium">
                                {r.file}
                            </span>
                            {r.success && (
                                <Badge
                                    variant="secondary"
                                    className="ml-auto shrink-0 text-xs"
                                >
                                    {r.queued
                                        ? 'En cola'
                                        : `${r.count} estudiantes`}
                                </Badge>
                            )}
                            {!r.success && (
                                <Badge
                                    variant="destructive"
                                    className="ml-auto shrink-0 text-xs"
                                >
                                    {r.errors?.length ?? 0} error
                                    {(r.errors?.length ?? 0) !== 1 ? 'es' : ''}
                                </Badge>
                            )}
                        </div>
                        {!r.success && r.errors && r.errors.length > 0 && (
                            <ul className="mt-2 ml-5 space-y-0.5 text-xs text-destructive">
                                {r.errors.map((err, j) => (
                                    <li key={j} className="list-disc">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Format guide ───────────────────────────────────────────────── */

function FormatGuide() {
    return (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                    <Info className="h-4 w-4" />
                    Formato requerido del archivo
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                    Se aceptan archivos <strong>CSV</strong> y{' '}
                    <strong>Excel (.xlsx, .xls)</strong>. La primera fila debe
                    ser el encabezado.
                </p>
                <div className="overflow-x-auto rounded border bg-white dark:bg-background">
                    <table className="w-full text-xs">
                        <thead className="bg-muted">
                            <tr>
                                {[
                                    { col: 'cedula *', req: true },
                                    { col: 'parcial_1 *', req: true },
                                    { col: 'parcial_2 *', req: true },
                                    { col: 'parcial_3 *', req: true },
                                    { col: 'email', req: false },
                                ].map(({ col, req }) => (
                                    <th
                                        key={col}
                                        className={`px-3 py-2 text-left font-mono font-medium ${!req ? 'text-muted-foreground' : ''}`}
                                    >
                                        {col}
                                        {!req && (
                                            <span className="ml-1 font-sans text-[10px] font-normal text-muted-foreground">
                                                (opcional)
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                {[
                                    '0912345678',
                                    '17.50',
                                    '14.00',
                                    '18.00',
                                    'est01@espe.edu.ec',
                                ].map((v, i) => (
                                    <td
                                        key={i}
                                        className="px-3 py-2 font-mono text-muted-foreground"
                                    >
                                        {v}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ul className="space-y-1 text-muted-foreground">
                    <li>
                        • Las columnas marcadas con <strong>*</strong> son
                        obligatorias.
                    </li>
                    <li>
                        • La columna <strong>email</strong> es opcional, pero
                        necesaria para enviar las invitaciones por correo.
                    </li>
                    <li>
                        • La <strong>nota final</strong> se calcula
                        automáticamente como el promedio de los 3 parciales.
                    </li>
                    <li>
                        • La <strong>cédula</strong> se anonimiza
                        irreversiblemente al importar — nunca se almacena.
                    </li>
                    <li>
                        • Las notas deben estar en escala de{' '}
                        <strong>0 a 20</strong>.
                    </li>
                    <li>
                        • En CSV se acepta coma (<code>,</code>) o punto y coma
                        (<code>;</code>) como delimitador.
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
}

/* ─── Main component ─────────────────────────────────────────────── */

export default function NrcCreate({
    departments,
    careers,
    subjects,
    academicPeriods,
}: PageProps) {
    const { props } = usePage<{
        flash: { importResults?: ImportFileResult[] };
    }>();
    const importResults = props.flash?.importResults ?? null;

    const [academicPeriod, setAcademicPeriod] = useState<string>('');
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* Filtered careers per entry */
    const careersForEntry = (entry: FileEntry) => {
        if (!entry.meta.career_id) return careers;
        return careers;
    };

    /* Parse a single file */
    const parseFile = useCallback((file: File): Promise<FileEntry> => {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

        if (['xlsx', 'xls'].includes(ext)) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const wb = XLSX.read(e.target?.result, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json<
                        Record<string, string>
                    >(ws, { defval: '' });
                    const headers = data.length > 0 ? Object.keys(data[0]) : [];
                    resolve({
                        file,
                        preview: data.slice(0, 8),
                        headers,
                        parseErrors: validateHeaders(headers),
                        meta: { code: '', subject_id: '', career_id: '' },
                    });
                };
                reader.readAsArrayBuffer(file);
            });
        }

        return new Promise((resolve) => {
            Papa.parse<Record<string, string>>(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const headers = result.meta.fields ?? [];
                    resolve({
                        file,
                        preview: result.data.slice(0, 8) as Record<
                            string,
                            string
                        >[],
                        headers,
                        parseErrors:
                            result.errors.length > 0
                                ? result.errors.map((e) => e.message)
                                : validateHeaders(headers),
                        meta: { code: '', subject_id: '', career_id: '' },
                    });
                },
                error: (err) =>
                    resolve({
                        file,
                        preview: [],
                        headers: [],
                        parseErrors: [err.message],
                        meta: { code: '', subject_id: '', career_id: '' },
                    }),
            });
        });
    }, []);

    const validateHeaders = (headers: string[]): string[] => {
        const norm = headers.map((h) => h.toLowerCase().trim());
        const required = ['cedula', 'parcial_1', 'parcial_2', 'parcial_3'];
        const missing = required.filter((r) => !norm.includes(r));
        return missing.length > 0
            ? [
                  `Faltan columnas: ${missing.join(', ')}. El archivo debe tener: cedula, parcial_1, parcial_2, parcial_3.`,
              ]
            : [];
    };

    const addFiles = useCallback(
        async (files: FileList | File[]) => {
            const arr = Array.from(files).filter(
                (f) =>
                    !entries.some(
                        (e) => e.file.name === f.name && e.file.size === f.size,
                    ),
            );
            const parsed = await Promise.all(arr.map(parseFile));
            setEntries((prev) => [...prev, ...parsed]);
        },
        [entries, parseFile],
    );

    const removeEntry = (index: number) =>
        setEntries((prev) => prev.filter((_, i) => i !== index));

    const updateMeta = (
        index: number,
        field: keyof FileEntry['meta'],
        value: string,
    ) => {
        setEntries((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                meta: { ...next[index].meta, [field]: value },
            };
            return next;
        });
    };

    /* Validate and submit */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: FormErrors = {};

        if (!academicPeriod)
            errors.academic_period = 'El período académico es obligatorio.';
        if (entries.length === 0) errors.files = 'Agrega al menos un archivo.';

        entries.forEach((entry, i) => {
            if (!entry.meta.code) errors[`uploads.${i}.code`] = 'Requerido.';
            if (!entry.meta.subject_id)
                errors[`uploads.${i}.subject_id`] = 'Requerido.';
            if (!entry.meta.career_id)
                errors[`uploads.${i}.career_id`] = 'Requerido.';
            if (entry.parseErrors.length > 0)
                errors[`uploads.${i}.file`] =
                    'El archivo tiene errores de formato.';
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setSubmitting(true);

        const fd = new FormData();
        fd.append('academic_period', academicPeriod);

        entries.forEach((entry, i) => {
            fd.append(`files[${i}]`, entry.file);
            fd.append(`uploads[${i}][code]`, entry.meta.code);
            fd.append(`uploads[${i}][subject_id]`, entry.meta.subject_id);
            fd.append(`uploads[${i}][career_id]`, entry.meta.career_id);
        });

        router.post('/nrcs', fd, {
            forceFormData: true,
            onError: (errs) => {
                setFormErrors(errs as FormErrors);
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const allValid =
        entries.length > 0 && entries.every((e) => e.parseErrors.length === 0);

    return (
        <>
            <Head title="Cargar NRC" />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Heading
                    title="Cargar NRCs"
                    description="Sube uno o varios archivos de calificaciones. Cada archivo corresponde a un NRC."
                />

                {importResults && importResults.length > 0 && (
                    <ImportResultsPanel results={importResults} />
                )}

                <FormatGuide />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── Período académico ── */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Período académico
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Se aplicará a todos los archivos cargados.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid max-w-xs gap-1.5">
                                <Input
                                    placeholder="Ej: 2024-2025, 2024 Período 1"
                                    value={academicPeriod}
                                    onChange={(e) =>
                                        setAcademicPeriod(e.target.value)
                                    }
                                    className={
                                        formErrors.academic_period
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Puedes usar cualquier formato. Ejemplos:
                                    "2024-2025", "2024 P1", "Semestre 2024-2"
                                </p>
                                {formErrors.academic_period && (
                                    <p className="text-xs text-destructive">
                                        {formErrors.academic_period}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Drop zone ── */}
                    <div
                        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            addFiles(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                            <p className="font-medium">
                                Arrastra archivos CSV o Excel aquí
                            </p>
                            <p className="text-sm text-muted-foreground">
                                o haz clic para seleccionar — puedes subir
                                varios a la vez
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls,text/csv"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                                e.target.files && addFiles(e.target.files)
                            }
                        />
                    </div>
                    {formErrors.files && (
                        <p className="text-sm text-destructive">
                            {formErrors.files}
                        </p>
                    )}

                    {/* ── File cards ── */}
                    {entries.map((entry, index) => (
                        <Card
                            key={`${entry.file.name}-${index}`}
                            className={
                                entry.parseErrors.length > 0
                                    ? 'border-destructive'
                                    : ''
                            }
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-2">
                                        {entry.file.name.endsWith('.csv') ? (
                                            <FileText className="h-5 w-5 shrink-0 text-green-600" />
                                        ) : (
                                            <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-600" />
                                        )}
                                        <span className="truncate text-sm font-medium">
                                            {entry.file.name}
                                        </span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            (
                                            {(entry.file.size / 1024).toFixed(
                                                1,
                                            )}{' '}
                                            KB)
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeEntry(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {entry.parseErrors.length > 0 ? (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <ul className="list-disc pl-4 text-sm">
                                                {entry.parseErrors.map(
                                                    (err, i) => (
                                                        <li key={i}>{err}</li>
                                                    ),
                                                )}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <>
                                        {/* Metadata form */}
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs">
                                                    Código NRC *
                                                </Label>
                                                <Input
                                                    placeholder="Ej: 12345"
                                                    value={entry.meta.code}
                                                    onChange={(e) =>
                                                        updateMeta(
                                                            index,
                                                            'code',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-8 text-sm"
                                                />
                                                {formErrors[
                                                    `uploads.${index}.code`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            formErrors[
                                                                `uploads.${index}.code`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label className="text-xs">
                                                    Materia *
                                                </Label>
                                                <Select
                                                    value={
                                                        entry.meta.subject_id
                                                    }
                                                    onValueChange={(v) =>
                                                        updateMeta(
                                                            index,
                                                            'subject_id',
                                                            v,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue placeholder="Seleccionar…" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjects.map((s) => (
                                                            <SelectItem
                                                                key={s.id}
                                                                value={String(
                                                                    s.id,
                                                                )}
                                                            >
                                                                {s.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors[
                                                    `uploads.${index}.subject_id`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            formErrors[
                                                                `uploads.${index}.subject_id`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label className="text-xs">
                                                    Carrera *
                                                </Label>
                                                <Select
                                                    value={entry.meta.career_id}
                                                    onValueChange={(v) =>
                                                        updateMeta(
                                                            index,
                                                            'career_id',
                                                            v,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue placeholder="Seleccionar…" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map(
                                                            (dept) => (
                                                                <div
                                                                    key={
                                                                        dept.id
                                                                    }
                                                                >
                                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                                        {
                                                                            dept.name
                                                                        }
                                                                    </div>
                                                                    {dept.careers.map(
                                                                        (c) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    c.id
                                                                                }
                                                                                value={String(
                                                                                    c.id,
                                                                                )}
                                                                            >
                                                                                {
                                                                                    c.name
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {formErrors[
                                                    `uploads.${index}.career_id`
                                                ] && (
                                                    <p className="text-xs text-destructive">
                                                        {
                                                            formErrors[
                                                                `uploads.${index}.career_id`
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Preview table */}
                                        {entry.preview.length > 0 && (
                                            <div>
                                                <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                    Vista previa — primeras{' '}
                                                    {entry.preview.length} filas
                                                </p>
                                                <div className="overflow-x-auto rounded-lg border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {entry.headers.map(
                                                                    (h) => (
                                                                        <TableHead
                                                                            key={
                                                                                h
                                                                            }
                                                                            className="py-2 text-xs whitespace-nowrap"
                                                                        >
                                                                            {h}
                                                                        </TableHead>
                                                                    ),
                                                                )}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {entry.preview.map(
                                                                (row, i) => (
                                                                    <TableRow
                                                                        key={i}
                                                                    >
                                                                        {entry.headers.map(
                                                                            (
                                                                                h,
                                                                            ) => (
                                                                                <TableCell
                                                                                    key={
                                                                                        h
                                                                                    }
                                                                                    className="py-1.5 font-mono text-xs"
                                                                                >
                                                                                    {String(
                                                                                        row[
                                                                                            h
                                                                                        ] ??
                                                                                            '',
                                                                                    )}
                                                                                </TableCell>
                                                                            ),
                                                                        )}
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* ── Submit ── */}
                    {entries.length > 0 && (
                        <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
                            <span className="text-sm text-muted-foreground">
                                {entries.length} archivo
                                {entries.length !== 1 ? 's' : ''} listo
                                {entries.length !== 1 ? 's' : ''} para importar
                            </span>
                            <Button
                                type="submit"
                                disabled={
                                    submitting || !allValid || !academicPeriod
                                }
                            >
                                {submitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Importar{' '}
                                {entries.length > 1
                                    ? `${entries.length} NRCs`
                                    : 'NRC'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}

NrcCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gestión de NRCs', href: '/nrcs' },
        { title: 'Cargar NRC', href: '/nrcs/create' },
    ],
};
