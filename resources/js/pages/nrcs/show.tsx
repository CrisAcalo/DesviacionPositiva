import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BarChart2, CalendarClock, CheckCircle2, Copy, Download, Info, Lock, Mail, Trash2, Users, AlertTriangle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type StudentEntry = {
    id: number;
    uuid: string;
    grade: { final_grade: string; partial_1: string | null; partial_2: string | null; partial_3: string | null } | null;
    group: { group: 'high' | 'medium' | 'at_risk' } | null;
};

type SurveyData = {
    id: number;
    group: 'high' | 'medium' | 'at_risk';
    status: 'draft' | 'active' | 'closed';
    closes_at: string | null;
    activated_at: string | null;
};

type ComplianceEntry = {
    total: number;
    responded: number;
    percent: number;
    survey: SurveyData | null;
};

type NrcDetail = {
    id: number;
    code: string;
    status: 'pending' | 'segmented' | 'surveying' | 'analyzed';
    uploader: { name: string };
    subject: { name: string };
    career: { name: string; department: { name: string } };
    academic_period: { name: string };
    students: StudentEntry[];
};

const GROUP_LABELS = { high: 'Alto rendimiento', medium: 'Promedio', at_risk: 'En riesgo' };
const GROUP_VARIANTS = { high: 'default', medium: 'secondary', at_risk: 'destructive' } as const;

const SEGMENTATION_RULES = [
    {
        group: 'high' as const,
        label: 'Alto rendimiento',
        criterion: 'Nota final > 17.0',
        description: 'Estudiantes con desempeño destacado. Candidatos a desviantes positivos.',
        color: 'bg-primary/8 border-primary/20 text-primary',
        dot: 'bg-primary',
    },
    {
        group: 'medium' as const,
        label: 'Promedio',
        criterion: '14.0 ≤ Nota final ≤ 17.0',
        description: 'Estudiantes con rendimiento dentro del rango esperado.',
        color: 'bg-secondary/50 border-border text-secondary-foreground',
        dot: 'bg-secondary-foreground/50',
    },
    {
        group: 'at_risk' as const,
        label: 'En riesgo',
        criterion: 'Nota final < 14.0',
        description: 'Estudiantes que requieren atención y acompañamiento académico.',
        color: 'bg-destructive/8 border-destructive/20 text-destructive',
        dot: 'bg-destructive',
    },
];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copiar enlace">
            {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
}

function RunAnalysisSection({ nrcId, rerun = false }: { nrcId: number; rerun?: boolean }) {
    const { post, processing } = useForm({});

    const handleRun = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/nrcs/${nrcId}/analysis/run`);
    };

    if (rerun) {
        return (
            <form onSubmit={handleRun} className="inline">
                <Button type="submit" variant="outline" size="sm" disabled={processing}>
                    {processing ? 'Analizando...' : 'Re-ejecutar análisis'}
                </Button>
            </form>
        );
    }

    return (
        <Card className="border-dashed border-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Motor de análisis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    Ejecuta el análisis de desviación positiva para identificar prácticas validadas del grupo de alto rendimiento
                    y barreras del grupo en riesgo (umbral ≥ 60%).
                </p>
                <form onSubmit={handleRun}>
                    <Button type="submit" disabled={processing} className="gap-2">
                        <BarChart2 className="h-4 w-4" />
                        {processing ? 'Analizando...' : 'Ejecutar análisis'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function ActivateSurveysSection({ nrcId, activeQuestionCounts }: { nrcId: number, activeQuestionCounts: Record<string, number> }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { data, setData, post, processing } = useForm({
        closes_at: '',
        question_limit: '',
        question_selection: 'random',
        questions_per_page: '1',
    });

    const maxQuestions = Math.max(
        activeQuestionCounts.high ?? 0,
        activeQuestionCounts.medium ?? 0,
        activeQuestionCounts.at_risk ?? 0
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const confirmActivate = () => {
        setIsConfirmOpen(false);
        post(`/nrcs/${nrcId}/surveys/activate`);
    };

    const limitParsed = parseInt(data.question_limit);
    const expectedQuestions = !isNaN(limitParsed) && limitParsed > 0 
        ? Math.min(limitParsed, maxQuestions) 
        : maxQuestions;
    const perPageParsed = parseInt(data.questions_per_page);
    const perPageMsg = !isNaN(perPageParsed) && perPageParsed > 0 
        ? `${perPageParsed} por página` 
        : 'todas en una página';

    return (
        <Card className="border-primary/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Activar encuestas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Al activar se crearán 3 encuestas (una por grupo) y se generarán los enlaces de acceso para cada estudiante.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="question_limit" className="text-sm">Límite de preguntas (opcional)</Label>
                            <Input
                                id="question_limit"
                                type="number"
                                min="1"
                                placeholder="Ej: 10"
                                value={data.question_limit}
                                onChange={(e) => setData('question_limit', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Deja en blanco para usar todas.</p>
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label htmlFor="question_selection" className="text-sm">Selección de preguntas</Label>
                            <select
                                id="question_selection"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.question_selection}
                                onChange={(e) => setData('question_selection', e.target.value)}
                            >
                                <option value="random">Aleatoria</option>
                                <option value="ordered">En orden (como en el banco)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="questions_per_page" className="text-sm">Preguntas por página</Label>
                            <Input
                                id="questions_per_page"
                                type="number"
                                min="0"
                                value={data.questions_per_page}
                                onChange={(e) => setData('questions_per_page', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">0 = Mostrar todas en una página.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="closes_at" className="text-sm">Fecha de cierre (opcional)</Label>
                            <Input
                                id="closes_at"
                                type="datetime-local"
                                value={data.closes_at}
                                onChange={(e) => setData('closes_at', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Activando...' : 'Activar encuestas'}
                        </Button>
                    </div>
                </form>
            </CardContent>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar activación de encuestas</DialogTitle>
                        <DialogDescription>
                            Al activar las encuestas, los estudiantes recibirán un enlace de acceso único.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm">
                            Los estudiantes recibirán <strong>{expectedQuestions} preguntas</strong> seleccionadas de forma <strong>{data.question_selection === 'random' ? 'aleatoria' : 'en orden'}</strong>, paginadas <strong>{perPageMsg}</strong>.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmActivate} disabled={processing}>
                            Confirmar y activar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

type TokenEntry = {
    id: number;
    token: string;
    email: string | null;
    used: boolean;
    opened: boolean;
    survey_open: boolean;
    url: string;
};

/** Estado visual de un token */
function TokenStatusBadge({ used, opened, surveyOpen }: { used: boolean; opened: boolean; surveyOpen: boolean }) {
    if (used) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" /> Completada
            </span>
        );
    }
    if (opened) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 text-xs font-medium">
                <Info className="h-3 w-3" /> En progreso
            </span>
        );
    }
    if (!surveyOpen) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs font-medium">
                <Lock className="h-3 w-3" /> Deshabilitada
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground border px-2 py-0.5 text-xs font-medium">
            Pendiente
        </span>
    );
}

function SurveyComplianceSection({
    nrcId,
    compliance,
    surveys,
}: {
    nrcId: number;
    compliance: Record<string, ComplianceEntry>;
    surveys: Record<string, SurveyData>;
}) {
    const [tokens, setTokens] = useState<Record<string, TokenEntry[]>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});

    // Carga tokens automáticamente al montar y cuando cambia surveys (tras cerrar/reabrir)
    const loadTokens = async (group: string, surveyId: number, force = false) => {
        if (tokens[group] && !force) return;
        setLoading((prev) => ({ ...prev, [group]: true }));
        const res = await fetch(`/api/surveys/${surveyId}/tokens`);
        if (res.ok) {
            const data = await res.json();
            setTokens((prev) => ({ ...prev, [group]: data }));
        }
        setLoading((prev) => ({ ...prev, [group]: false }));
    };

    // Auto-cargar tokens y configurar polling
    useEffect(() => {
        let isMounted = true;
        const fetchAll = () => {
            (['high', 'medium', 'at_risk'] as const).forEach((group) => {
                const survey = surveys[group];
                if (survey) loadTokens(group, survey.id);
            });
        };

        fetchAll();
        const interval = setInterval(() => {
            if (isMounted) fetchAll();
        }, 15000); // Polling cada 15 segundos para tiempo real

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surveys]);

    // Estado para cerrar encuesta
    const [closingSurvey, setClosingSurvey] = useState<{ id: number, group: string } | null>(null);

    const closeSurvey = () => {
        if (!closingSurvey) return;
        router.post(`/nrcs/${nrcId}/surveys/${closingSurvey.id}/close`, {}, {
            onSuccess: () => {
                loadTokens(closingSurvey.group, closingSurvey.id, true);
                setClosingSurvey(null);
            },
        });
    };

    const reopenSurvey = (surveyId: number, group: string) => {
        router.post(`/nrcs/${nrcId}/surveys/${surveyId}/reopen`, {}, {
            onSuccess: () => loadTokens(group, surveyId, true),
        });
    };

    const sendEmails = (surveyId: number, group: string) => {
        setSendingEmails((prev) => ({ ...prev, [group]: true }));
        router.post(`/nrcs/${nrcId}/surveys/${surveyId}/send-emails`, {}, {
            onFinish: () => setSendingEmails((prev) => ({ ...prev, [group]: false })),
        });
    };

    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const resetSurveys = () => {
        router.delete(`/nrcs/${nrcId}/surveys/reset`, {
            onSuccess: () => setIsResetConfirmOpen(false),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Encuestas</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:border-destructive" onClick={() => setIsResetConfirmOpen(true)}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Eliminar configuración
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <a href={`/nrcs/${nrcId}/surveys/tokens.csv`} download>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar CSV completo
                        </a>
                    </Button>
                </div>
            </div>

            <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar configuración de encuestas</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar todas las encuestas generadas para este NRC?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-destructive font-medium mb-2">¡Atención, acción destructiva!</p>
                        <p className="text-sm text-muted-foreground">
                            Se borrarán las respuestas que los estudiantes ya hayan enviado, así como los enlaces de acceso generados. 
                            El NRC regresará al estado de segmentación para poder ser reconfigurado.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetConfirmOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={resetSurveys}>Eliminar todo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {(['high', 'medium', 'at_risk'] as const).map((group) => {
                const c = compliance[group];
                const survey = surveys[group];
                if (!c || !survey) return null;

                const isActive = survey.status === 'active';
                const groupTokens = tokens[group] ?? [];
                const isLoading = loading[group] ?? false;
                const isSendingEmails = sendingEmails[group] ?? false;
                const emailCount = groupTokens.filter((t) => t.email && !t.used).length;

                return (
                    <Card key={group} className={!isActive ? 'opacity-80' : ''}>
                        <CardHeader className="pb-3">
                            {/* Cabecera: nombre + badges + botones */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-sm font-medium">{GROUP_LABELS[group]}</CardTitle>
                                    <Badge variant={GROUP_VARIANTS[group]}>{c.responded}/{c.total} respondidas</Badge>
                                    <Badge variant={isActive ? 'outline' : 'secondary'}>
                                        {isActive ? 'Activa' : 'Cerrada'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isActive && emailCount > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isSendingEmails}
                                            onClick={() => sendEmails(survey.id, group)}
                                        >
                                            <Mail className="mr-1.5 h-3 w-3" />
                                            {isSendingEmails
                                                ? 'Enviando…'
                                                : `Enviar correos (${emailCount})`}
                                        </Button>
                                    )}
                                    {isActive ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive border-destructive/30 hover:border-destructive"
                                            onClick={() => setClosingSurvey({ id: survey.id, group })}
                                        >
                                            <Lock className="mr-1.5 h-3 w-3" />
                                            Cerrar encuesta
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-primary border-primary/30 hover:border-primary"
                                            onClick={() => reopenSurvey(survey.id, group)}
                                        >
                                            <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                            Habilitar encuesta
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Barra de progreso con datos en tiempo real si están disponibles */}
                            {(() => {
                                const realResponded = groupTokens.length > 0 ? groupTokens.filter(t => t.used).length : c.responded;
                                const realTotal = groupTokens.length > 0 ? groupTokens.length : c.total;
                                const realPercent = realTotal > 0 ? Math.round((realResponded / realTotal) * 100) : 0;
                                return (
                                    <>
                                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${realPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{realPercent}% de respuestas recibidas ({realResponded}/{realTotal})</p>
                                    </>
                                );
                            })()}
                        </CardHeader>

                        {/* Lista de tokens — siempre visible */}
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="py-4 text-center text-xs text-muted-foreground">Cargando enlaces…</div>
                            ) : groupTokens.length === 0 ? (
                                <div className="py-4 text-center text-xs text-muted-foreground">Sin enlaces generados</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email / ID</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="w-16 text-right">Enlace</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupTokens.map((t) => (
                                            <TableRow
                                                key={t.id}
                                                className={t.used ? 'opacity-50' : ''}
                                            >
                                                <TableCell className="text-sm">
                                                    {t.email ?? (
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {t.token.substring(0, 12)}…
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TokenStatusBadge used={t.used} opened={t.opened} surveyOpen={t.survey_open} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <CopyButton text={t.url} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            <Dialog open={!!closingSurvey} onOpenChange={(open) => !open && setClosingSurvey(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cerrar encuesta</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas cerrar esta encuesta? Los enlaces generados dejarán de aceptar nuevas respuestas, pero la información actual se mantendrá visible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClosingSurvey(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={closeSurvey}>Sí, cerrar encuesta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function NrcShow({
    nrc,
    groupCounts,
    surveyCompliance,
    surveys,
    activeQuestionCounts,
}: {
    nrc: NrcDetail;
    groupCounts: Record<string, number>;
    surveyCompliance: Record<string, ComplianceEntry> | null;
    surveys: Record<string, SurveyData>;
    activeQuestionCounts: Record<string, number>;
}) {
    const total = nrc.students.length;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const confirmDeleteNrc = () => {
        setIsDeleting(true);
        router.delete(`/nrcs/${nrc.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
            }
        });
    };

    return (
        <>
            <Head title={`NRC ${nrc.code}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/nrcs"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <Heading
                            title={`NRC ${nrc.code} — ${nrc.subject.name}`}
                            description={`${nrc.career.name} · ${nrc.career.department.name} · ${nrc.academic_period.name}`}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar NRC
                    </Button>
                </div>

                {/* Tarjetas de conteo */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total estudiantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <span className="text-2xl font-bold">{total}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {(['high', 'medium', 'at_risk'] as const).map((g) => (
                        <Card key={g}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{GROUP_LABELS[g]}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">{groupCounts[g] ?? '—'}</span>
                                {total > 0 && groupCounts[g] != null && (
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        ({Math.round((groupCounts[g] / total) * 100)}%)
                                    </span>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Criterios de segmentación */}
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Info className="h-4 w-4" />
                        Criterios de segmentación (RN-01) — basados exclusivamente en la nota final promedio
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {SEGMENTATION_RULES.map((rule) => (
                            <div key={rule.group} className={`rounded-lg border px-4 py-3 text-sm ${rule.color}`}>
                                <div className="flex items-center gap-2 font-semibold mb-1">
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${rule.dot}`} />
                                    {rule.label}
                                </div>
                                <p className="font-mono text-xs mb-1 opacity-80">{rule.criterion}</p>
                                <p className="text-xs opacity-70">{rule.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Nota final = (Parcial 1 + Parcial 2 + Parcial 3) / 3 · Escala de 0 a 20
                    </p>
                </div>

                {/* Sección de encuestas */}
                {nrc.status === 'segmented' && (
                    <ActivateSurveysSection nrcId={nrc.id} activeQuestionCounts={activeQuestionCounts} />
                )}

                {(nrc.status === 'surveying' || nrc.status === 'analyzed') && surveyCompliance && (
                    <SurveyComplianceSection
                        nrcId={nrc.id}
                        compliance={surveyCompliance}
                        surveys={surveys}
                    />
                )}

                {/* Sección análisis */}
                {nrc.status === 'surveying' && (
                    <RunAnalysisSection nrcId={nrc.id} />
                )}

                {nrc.status === 'analyzed' && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="flex items-center justify-between py-4 gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <BarChart2 className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">Análisis completado</p>
                                    <p className="text-xs text-muted-foreground">
                                        Las encuestas activas siguen abiertas hasta que las cierres manualmente.
                                        Puedes re-ejecutar el análisis si llegan nuevas respuestas.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button asChild size="sm">
                                    <Link href={`/nrcs/${nrc.id}/analysis`}>Ver resultados</Link>
                                </Button>
                                <RunAnalysisSection nrcId={nrc.id} rerun />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de estudiantes */}
                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID anonimizado</TableHead>
                                <TableHead>Parcial 1</TableHead>
                                <TableHead>Parcial 2</TableHead>
                                <TableHead>Parcial 3</TableHead>
                                <TableHead>Nota final</TableHead>
                                <TableHead>Grupo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {nrc.students.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {s.uuid.substring(0, 8)}…
                                    </TableCell>
                                    <TableCell>{s.grade?.partial_1 ?? '—'}</TableCell>
                                    <TableCell>{s.grade?.partial_2 ?? '—'}</TableCell>
                                    <TableCell>{s.grade?.partial_3 ?? '—'}</TableCell>
                                    <TableCell>
                                        {s.grade?.final_grade != null ? (
                                            <span className={`font-bold tabular-nums ${
                                                s.group?.group === 'high'    ? 'text-primary' :
                                                s.group?.group === 'at_risk' ? 'text-destructive' :
                                                                               'text-foreground'
                                            }`}>
                                                {s.grade.final_grade}
                                            </span>
                                        ) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {s.group ? (
                                            <Badge variant={GROUP_VARIANTS[s.group.group]}>
                                                {GROUP_LABELS[s.group.group]}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Pendiente</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar NRC</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el NRC <strong>{nrc.code}</strong>? Se borrarán todos los estudiantes, configuraciones de encuestas y calificaciones asociadas. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDeleteNrc} disabled={isDeleting}>
                            Sí, eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

NrcShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gestión de NRCs', href: '/nrcs' },
        { title: 'Detalle', href: '#' },
    ],
};
