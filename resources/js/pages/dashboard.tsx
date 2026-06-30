import { Head, Link } from '@inertiajs/react';
import { BarChart3, Users, BookOpen, TrendingUp, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

type Props = {
    stats: {
        totalNrcs: number;
        totalStudents: number;
        activeSurveys: number;
        completedAnalyses: number;
        totalPractices: number;
        totalBarriers: number;
    };
    groupDistribution: Record<string, number>;
    validatedResultsPerNrc: Record<number, number>;
    nrcsByStatus: Record<string, number>;
};

export default function Dashboard({ stats, groupDistribution, nrcsByStatus }: Props) {
    const GROUP_CONFIG = {
        high: { label: 'Alto rendimiento', color: '#3b82f6' },
        medium: { label: 'Promedio', color: '#94a3b8' },
        at_risk: { label: 'En riesgo', color: '#ef4444' },
    };

    const donutData = (['high', 'medium', 'at_risk'] as const).map((g) => ({
        name: GROUP_CONFIG[g].label,
        value: groupDistribution[g] ?? 0,
        color: GROUP_CONFIG[g].color,
        g
    }));
    
    const totalStudents = donutData.reduce((acc, curr) => acc + curr.value, 0);

    const statusLabels: Record<string, string> = {
        created: 'Creado',
        segmented: 'Segmentado',
        surveying: 'En encuestas',
        analyzed: 'Analizado',
    };

    const statusData = Object.entries(nrcsByStatus).map(([status, count]) => ({
        name: statusLabels[status] || status,
        total: count
    }));

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            icon: BarChart3,
                            label: 'NRCs Cargados',
                            value: stats.totalNrcs,
                            color: 'text-blue-600',
                        },
                        {
                            icon: Users,
                            label: 'Estudiantes',
                            value: stats.totalStudents,
                            color: 'text-green-600',
                        },
                        {
                            icon: BookOpen,
                            label: 'Encuestas Activas',
                            value: stats.activeSurveys,
                            color: 'text-amber-600',
                        },
                        {
                            icon: TrendingUp,
                            label: 'Análisis Completados',
                            value: stats.completedAnalyses,
                            color: 'text-purple-600',
                        },
                    ].map((kpi, i) => (
                        <Card key={i} className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                                    {kpi.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Distribución de grupos */}
                    <Card className="transition-all duration-300 hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Distribución de Estudiantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="h-48 w-48 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => [`${value} estudiantes`, 'Total']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 flex-1 w-full">
                                {donutData.map((entry) => {
                                    const pct = totalStudents > 0 ? Math.round((entry.value / totalStudents) * 100) : 0;
                                    return (
                                        <div key={entry.name} className="flex items-center gap-3 text-sm">
                                            <span className="h-3 w-3 rounded-full shrink-0" style={{ background: entry.color }} />
                                            <span className="text-muted-foreground">{entry.name}</span>
                                            <span className="font-semibold ml-auto">{entry.value}</span>
                                            <span className="text-muted-foreground text-xs w-10 text-right">({pct}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estado de NRCs */}
                    <Card className="transition-all duration-300 hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Estado de NRCs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statusData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <RechartsTooltip cursor={{fill: 'var(--color-muted)'}} />
                                        <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hallazgos + Métricas */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Prácticas validadas */}
                    <Card className="border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Prácticas validadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold text-green-700">{stats.totalPractices}</span>
                            <p className="text-xs text-muted-foreground mt-1">
                                Estrategias de alto rendimiento (≥60%)
                            </p>
                            {stats.totalPractices > 0 && (
                                <Button asChild variant="outline" size="sm" className="mt-3 w-full border-green-200 text-green-700 hover:bg-green-50">
                                    <Link href="/reports">Ver reportes →</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Barreras detectadas */}
                    <Card className="border-orange-200 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-950/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Barreras detectadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold text-orange-600">{stats.totalBarriers}</span>
                            <p className="text-xs text-muted-foreground mt-1">
                                Obstáculos en grupo en riesgo (≥60%)
                            </p>
                            {stats.totalBarriers > 0 && (
                                <Button asChild variant="outline" size="sm" className="mt-3 w-full border-orange-200 text-orange-600 hover:bg-orange-50">
                                    <Link href="/reports">Ver reportes →</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Métricas operativas */}
                    <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Métricas operativas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tasa de análisis</span>
                                <span className="font-bold text-blue-600">
                                    {stats.totalNrcs > 0 ? Math.round((stats.completedAnalyses / stats.totalNrcs) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${stats.totalNrcs > 0 ? Math.round((stats.completedAnalyses / stats.totalNrcs) * 100) : 0}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-sm pt-1">
                                <span className="text-muted-foreground">Promedio est./NRC</span>
                                <span className="font-bold text-purple-600">
                                    {stats.totalNrcs > 0 ? Math.round(stats.totalStudents / stats.totalNrcs) : 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">NRCs analizados</span>
                                <span className="font-bold">{stats.completedAnalyses} / {stats.totalNrcs}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
    ],
};
