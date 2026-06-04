import { Head, Link } from '@inertiajs/react';
import { BarChart2, TrendingUp, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type GroupDist = { high?: number; medium?: number; at_risk?: number };

type NrcSummary = {
    id: number;
    code: string;
    subject: string;
    career: string;
    department: string;
    period: string;
    students: number;
    groups: GroupDist;
    practices: number;
    barriers: number;
};

type Props = { nrcs: NrcSummary[] };

const GROUP_COLORS = {
    high:   'bg-primary',
    medium: 'bg-secondary-foreground/30',
    at_risk: 'bg-destructive',
};

/** Mini barra de distribución de grupos */
function GroupBar({ groups, total }: { groups: GroupDist; total: number }) {
    if (total === 0) return <div className="h-2 rounded-full bg-muted w-full" />;
    const order: (keyof GroupDist)[] = ['high', 'medium', 'at_risk'];
    return (
        <div className="flex h-2 rounded-full overflow-hidden w-full gap-px">
            {order.map((g) => {
                const n = groups[g] ?? 0;
                if (n === 0) return null;
                const pct = (n / total) * 100;
                return (
                    <div
                        key={g}
                        className={`${GROUP_COLORS[g]} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${g}: ${n} (${pct.toFixed(0)}%)`}
                    />
                );
            })}
        </div>
    );
}

export default function ReportsIndex({ nrcs }: Props) {
    return (
        <>
            <Head title="Reportes" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Reportes"
                    description="NRCs con análisis de desviación positiva completado."
                />

                {nrcs.length === 0 && (
                    <Card>
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <BarChart2 className="mx-auto h-10 w-10 mb-3 opacity-30" />
                            <p className="font-medium">Sin reportes disponibles aún</p>
                            <p className="text-sm mt-1">
                                Los reportes aparecen cuando un NRC completa el análisis de desviación positiva.
                            </p>
                            <Button asChild className="mt-4" variant="outline">
                                <Link href="/nrcs">Ver NRCs</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {nrcs.map((nrc) => {
                        const total = nrc.students;
                        return (
                            <Card key={nrc.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <CardTitle className="text-base truncate">
                                                NRC {nrc.code}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground truncate mt-0.5">{nrc.subject}</p>
                                            <p className="text-xs text-muted-foreground truncate">{nrc.career} · {nrc.period}</p>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0">{nrc.period}</Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Distribución de grupos */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {total} estudiantes
                                            </span>
                                            <span className="flex gap-3">
                                                <span className="text-primary font-medium">{nrc.groups.high ?? 0} alto</span>
                                                <span className="text-muted-foreground">{nrc.groups.medium ?? 0} medio</span>
                                                <span className="text-destructive font-medium">{nrc.groups.at_risk ?? 0} riesgo</span>
                                            </span>
                                        </div>
                                        <GroupBar groups={nrc.groups} total={total} />
                                    </div>

                                    {/* Hallazgos */}
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="font-semibold text-green-700">{nrc.practices}</span>
                                            <span className="text-muted-foreground text-xs">prácticas</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="font-semibold text-orange-600">{nrc.barriers}</span>
                                            <span className="text-muted-foreground text-xs">barreras</span>
                                        </div>
                                    </div>

                                    <Button asChild size="sm" className="w-full gap-1" variant="outline">
                                        <Link href={`/reports/${nrc.id}`}>
                                            Ver reporte completo <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reportes', href: '/reports' },
    ],
};
