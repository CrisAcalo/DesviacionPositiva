import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Printer, TrendingUp, AlertTriangle, CheckCircle2, Users, BarChart2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/* ─── Tipos ─────────────────────────────────────────────── */
type NrcInfo = { id: number; code: string; subject: string; career: string; department: string; period: string };
type GroupDist = Record<string, number>;

type AnalysisResult = {
    id: number;
    group: 'high' | 'medium' | 'at_risk';
    survey_question: { question_text: string };
    top_answer_label: string;
    top_percentage: string;
    top_count: number;
    total_responses: number;
    frequencies: Record<string, number>;
    is_validated: boolean;
};

type Recommendation = {
    id: number;
    type: 'practice' | 'barrier';
    question_snapshot: string;
    answer_snapshot: string;
    percentage: string;
    frequency: number;
    total: number;
};

type Totals = { practices: number; barriers: number; validated: number; total: number };

type Props = {
    nrc: NrcInfo;
    groupDistribution: GroupDist;
    totalStudents: number;
    results: Record<string, AnalysisResult[]>;
    recommendations: Record<string, Recommendation[]>;
    totals: Totals;
};

/* ─── Componentes de gráfico ────────────────────────────── */
const GROUP_CONFIG = {
    high:    { label: 'Alto rendimiento', color: '#3b82f6' },
    medium:  { label: 'Rendimiento promedio', color: '#94a3b8' },
    at_risk: { label: 'En riesgo', color: '#ef4444' },
};

/** Donut SVG para distribución de grupos */
function DonutChart({ dist, total }: { dist: GroupDist; total: number }) {
    if (total === 0) return null;

    const r = 45;
    const cx = 60;
    const cy = 60;
    const circumference = 2 * Math.PI * r;

    let offset = 0;
    const slices = (['high', 'medium', 'at_risk'] as const).map((g) => {
        const n = dist[g] ?? 0;
        const pct = n / total;
        const dash = pct * circumference;
        const slice = { g, n, pct, dash, offset };
        offset += dash;
        return slice;
    });

    return (
        <div className="flex items-center gap-6">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
                {slices.map(({ g, dash, offset: off }) => (
                    <circle
                        key={g}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={GROUP_CONFIG[g].color}
                        strokeWidth="18"
                        strokeDasharray={`${dash} ${circumference}`}
                        strokeDashoffset={-off + circumference / 4}
                        strokeLinecap="butt"
                    />
                ))}
                <text x={cx} y={cy - 6} textAnchor="middle" className="text-xs" fontSize="14" fontWeight="700" fill="#0f172a">{total}</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#64748b">estudiantes</text>
            </svg>
            <div className="space-y-2">
                {(['high', 'medium', 'at_risk'] as const).map((g) => {
                    const n = dist[g] ?? 0;
                    const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                    return (
                        <div key={g} className="flex items-center gap-2 text-sm">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ background: GROUP_CONFIG[g].color }} />
                            <span className="text-muted-foreground">{GROUP_CONFIG[g].label}</span>
                            <span className="font-semibold ml-auto">{n}</span>
                            <span className="text-muted-foreground text-xs w-10 text-right">({pct}%)</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/** Barra horizontal para una pregunta */
function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-40 truncate text-xs text-muted-foreground shrink-0">{label}</span>
            <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                <div
                    className="h-full rounded transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="w-10 text-right text-xs font-mono shrink-0">{value.toFixed(0)}%</span>
        </div>
    );
}

/** Tarjeta de recomendación */
function RecCard({ rec }: { rec: Recommendation }) {
    const pct = parseFloat(rec.percentage);
    const isPractice = rec.type === 'practice';
    return (
        <div className={`rounded-lg border p-4 space-y-2 print:break-inside-avoid ${isPractice ? 'border-green-200 bg-green-50/40' : 'border-orange-200 bg-orange-50/40'}`}>
            <div className="flex items-start gap-2">
                {isPractice
                    ? <TrendingUp className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />}
                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{rec.question_snapshot}</p>
                    <p className="font-semibold text-sm mt-0.5">{rec.answer_snapshot}</p>
                </div>
                <span className={`shrink-0 text-sm font-bold ${isPractice ? 'text-green-700' : 'text-orange-600'}`}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
                {rec.frequency}/{rec.total} estudiantes · {isPractice ? 'Alto rendimiento' : 'En riesgo'}
            </p>
        </div>
    );
}

/* ─── Página principal ──────────────────────────────────── */
export default function ReportShow({ nrc, groupDistribution, totalStudents, results, recommendations, totals }: Props) {
    const practices = recommendations['practice'] ?? [];
    const barriers  = recommendations['barrier'] ?? [];

    // Datos para el gráfico de barras de prácticas
    const maxPct = practices.length > 0
        ? Math.max(...practices.map(r => parseFloat(r.percentage)))
        : 100;

    return (
        <>
            <Head title={`Reporte NRC ${nrc.code}`} />

            {/* Estilos de impresión */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print\\:break-inside-avoid { break-inside: avoid; }
                    body { font-size: 12px; }
                }
            `}</style>

            <div className="space-y-6 p-6 max-w-5xl mx-auto">
                {/* Encabezado */}
                <div className="flex items-center justify-between no-print">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <Heading
                            title={`Reporte — NRC ${nrc.code}`}
                            description={`${nrc.subject} · ${nrc.career} · ${nrc.period}`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <a href={`/reports/${nrc.id}/recommendations.csv`} download>
                                <Download className="mr-1.5 h-4 w-4" />
                                CSV
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-1.5 h-4 w-4" />
                            Imprimir / PDF
                        </Button>
                    </div>
                </div>

                {/* Encabezado para impresión */}
                <div className="hidden print:block border-b pb-4 mb-4">
                    <h1 className="text-xl font-bold">Reporte de Desviación Positiva</h1>
                    <p className="text-sm text-muted-foreground">NRC {nrc.code} · {nrc.subject} · {nrc.career} · {nrc.period}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Generado: {new Date().toLocaleDateString('es-EC')} · Sistema ESPE — solo para uso académico
                    </p>
                </div>

                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-4">
                    {[
                        { icon: Users, label: 'Estudiantes', value: totalStudents, color: '' },
                        { icon: BarChart2, label: 'Preguntas analizadas', value: totals.total, color: '' },
                        { icon: TrendingUp, label: 'Prácticas validadas', value: totals.practices, color: 'text-green-700' },
                        { icon: AlertTriangle, label: 'Barreras detectadas', value: totals.barriers, color: 'text-orange-600' },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <Card key={label}>
                            <CardHeader className="pb-1">
                                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Icon className="h-3.5 w-3.5" /> {label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className={`text-2xl font-bold ${color}`}>{value}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Distribución de grupos */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" /> Distribución de grupos de rendimiento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DonutChart dist={groupDistribution} total={totalStudents} />
                    </CardContent>
                </Card>

                {/* Prácticas validadas */}
                {practices.length > 0 && (
                    <Card className="print:break-inside-avoid">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Prácticas validadas — Alto rendimiento
                                <Badge className="bg-green-100 text-green-800 border-green-200 ml-1">{practices.length}</Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Estrategias y recursos con ≥ 60% de respaldo en el grupo de alto rendimiento.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Gráfico de barras */}
                            <div className="space-y-2">
                                {practices.map(rec => (
                                    <HorizontalBar
                                        key={rec.id}
                                        label={rec.answer_snapshot}
                                        value={parseFloat(rec.percentage)}
                                        max={maxPct}
                                        color="#22c55e"
                                    />
                                ))}
                            </div>
                            {/* Tarjetas */}
                            <div className="grid gap-3 sm:grid-cols-2 mt-4">
                                {practices.map(rec => <RecCard key={rec.id} rec={rec} />)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Barreras detectadas */}
                {barriers.length > 0 && (
                    <Card className="print:break-inside-avoid">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Barreras detectadas — En riesgo
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 ml-1">{barriers.length}</Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Dificultades predominantes reportadas por ≥ 60% del grupo en riesgo.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {barriers.map(rec => <RecCard key={rec.id} rec={rec} />)}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detalle por pregunta */}
                {(['high', 'medium', 'at_risk'] as const).map((group) => {
                    const groupResults = results[group];
                    if (!groupResults || groupResults.length === 0) return null;
                    const validated = groupResults.filter(r => r.is_validated).length;
                    return (
                        <div key={group} className="space-y-3 print:break-inside-avoid">
                            <h3 className="font-semibold border-b pb-1.5 flex items-center gap-2">
                                {GROUP_CONFIG[group].label}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {groupResults.length} preguntas · {validated} validadas
                                </span>
                                {validated > 0 && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {groupResults.map(result => {
                                    const pct = parseFloat(result.top_percentage);
                                    return (
                                        <div key={result.id} className={`rounded-lg border p-3 space-y-2 text-sm ${result.is_validated ? 'border-green-200 bg-green-50/30' : ''}`}>
                                            <p className="font-medium text-xs leading-snug">{result.survey_question.question_text}</p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>↳ <strong className="text-foreground">{result.top_answer_label}</strong></span>
                                                <span className={`font-bold ${result.is_validated ? 'text-green-700' : ''}`}>{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${pct}%`, backgroundColor: result.is_validated ? '#22c55e' : '#94a3b8' }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{result.top_count}/{result.total_responses} respondentes</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Nota LOPDP */}
                <div className="rounded-lg border border-muted bg-muted/30 p-4 text-xs text-muted-foreground">
                    <strong>Nota de privacidad:</strong> Este reporte contiene únicamente patrones estadísticos agregados.
                    No incluye nombres, cédulas, correos ni identificadores individuales. Los datos son anonimizados
                    conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP).
                </div>
            </div>
        </>
    );
}

ReportShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reportes', href: '/reports' },
        { title: 'Reporte', href: '#' },
    ],
};
