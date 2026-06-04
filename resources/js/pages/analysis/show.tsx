import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, AlertTriangle, TrendingUp, BarChart2, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ProgressBar({ value }: { value: number }) {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
                className="h-full bg-primary transition-all"
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}

type NrcInfo = {
    id: number;
    code: string;
    subject: string;
    career: string;
    period: string;
};

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

type Totals = {
    practices: number;
    barriers: number;
    validated: number;
    total: number;
};

type Props = {
    nrc: NrcInfo;
    results: Record<string, AnalysisResult[]>;
    recommendations: Record<string, Recommendation[]>;
    totals: Totals;
};

const GROUP_LABELS = { high: 'Alto rendimiento', medium: 'Promedio', at_risk: 'En riesgo' };

function PercentageBadge({ pct, validated }: { pct: number; validated: boolean }) {
    const color = validated
        ? 'bg-green-100 text-green-800 border-green-200'
        : pct >= 40
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
          : 'bg-muted text-muted-foreground';
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
            {pct.toFixed(1)}%
            {validated && <CheckCircle2 className="ml-1 h-3 w-3" />}
        </span>
    );
}

function ResultCard({ result }: { result: AnalysisResult }) {
    const pct = parseFloat(result.top_percentage);

    return (
        <div className={`rounded-lg border p-4 space-y-3 ${result.is_validated ? 'border-green-200 bg-green-50/50' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{result.survey_question.question_text}</p>
                <PercentageBadge pct={pct} validated={result.is_validated} />
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Respuesta predominante: <strong className="text-foreground">{result.top_answer_label}</strong></span>
                    <span>{result.top_count}/{result.total_responses} respuestas</span>
                </div>
                <ProgressBar value={pct} />
            </div>

            {/* Desglose de frecuencias */}
            <div className="grid grid-cols-2 gap-1">
                {Object.entries(result.frequencies)
                    .sort(([, a], [, b]) => b - a)
                    .map(([val, count]) => {
                        const valPct = result.total_responses > 0
                            ? Math.round((count / result.total_responses) * 100)
                            : 0;
                        return (
                            <div key={val} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1">
                                <span className="truncate mr-1">{val}</span>
                                <span className="shrink-0 font-mono">{valPct}%</span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
    const pct = parseFloat(rec.percentage);
    const isPractice = rec.type === 'practice';

    return (
        <div className={`rounded-lg border p-4 space-y-2 ${isPractice ? 'border-green-200 bg-green-50/40' : 'border-orange-200 bg-orange-50/40'}`}>
            <div className="flex items-start gap-2">
                {isPractice
                    ? <TrendingUp className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />}
                <div className="space-y-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">{rec.question_snapshot}</p>
                    <p className="text-sm font-semibold">{rec.answer_snapshot}</p>
                </div>
                <span className={`ml-auto shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${isPractice ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'}`}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
                {rec.frequency} de {rec.total} estudiantes · {isPractice ? 'Grupo alto rendimiento' : 'Grupo en riesgo'}
            </p>
        </div>
    );
}

export default function AnalysisShow({ nrc, results, recommendations, totals }: Props) {
    const practices = recommendations['practice'] ?? [];
    const barriers = recommendations['barrier'] ?? [];

    return (
        <>
            <Head title={`Análisis NRC ${nrc.code}`} />

            <div className="space-y-6 p-6">
                {/* Encabezado */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/nrcs/${nrc.id}`}><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <Heading
                        title={`Análisis — NRC ${nrc.code}`}
                        description={`${nrc.subject} · ${nrc.career} · ${nrc.period}`}
                    />
                </div>

                {/* Tarjetas resumen */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <BarChart2 className="h-4 w-4" /> Preguntas analizadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent><span className="text-2xl font-bold">{totals.total}</span></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-green-600" /> Validadas (≥60%)
                            </CardTitle>
                        </CardHeader>
                        <CardContent><span className="text-2xl font-bold text-green-600">{totals.validated}</span></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="h-4 w-4 text-green-700" /> Prácticas validadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent><span className="text-2xl font-bold text-green-700">{totals.practices}</span></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-orange-500" /> Barreras detectadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent><span className="text-2xl font-bold text-orange-500">{totals.barriers}</span></CardContent>
                    </Card>
                </div>

                {/* Recomendaciones — vista de hallazgos clave */}
                {(practices.length > 0 || barriers.length > 0) && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {practices.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <h2 className="font-semibold">Prácticas validadas — Alto rendimiento</h2>
                                    <Badge className="bg-green-100 text-green-800 border-green-200">{practices.length}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Estrategias y recursos utilizados por ≥60% del grupo de alto rendimiento.
                                </p>
                                <div className="space-y-3">
                                    {practices.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
                                </div>
                            </div>
                        )}

                        {barriers.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <h2 className="font-semibold">Barreras detectadas — En riesgo</h2>
                                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">{barriers.length}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Dificultades reportadas por ≥60% del grupo en riesgo.
                                </p>
                                <div className="space-y-3">
                                    {barriers.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {practices.length === 0 && barriers.length === 0 && (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            <Users className="mx-auto h-8 w-8 mb-3 opacity-40" />
                            <p className="font-medium">Sin hallazgos validados aún</p>
                            <p className="text-sm mt-1">Ninguna pregunta alcanzó el umbral del 60%. Se necesitan más respuestas.</p>
                        </CardContent>
                    </Card>
                )}

                {/* Resultados detallados por grupo */}
                {(['high', 'medium', 'at_risk'] as const).map((group) => {
                    const groupResults = results[group];
                    if (!groupResults || groupResults.length === 0) return null;

                    return (
                        <div key={group} className="space-y-4">
                            <h2 className="font-semibold text-base border-b pb-2">
                                {GROUP_LABELS[group]}
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    — {groupResults.length} preguntas · {groupResults.filter(r => r.is_validated).length} validadas
                                </span>
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {groupResults.map(result => (
                                    <ResultCard key={result.id} result={result} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

AnalysisShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gestión de NRCs', href: '/nrcs' },
        { title: 'Detalle', href: '#' },
        { title: 'Análisis', href: '#' },
    ],
};
