import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, TrendingUp, Users, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Desviación Positiva ESPE" />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* Header */}
                <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Desviación Positiva</h1>
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" asChild>
                                        <Link href="/login">Iniciar sesión</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/login">Ingresar</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-6 py-20 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        Identifica a los Desviantes Positivos
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
                        Una plataforma integral para analizar y entender qué hacen diferente los estudiantes de alto rendimiento.
                        Reduce la deserción identificando y replicando sus estrategias de éxito.
                    </p>
                    {!auth.user && (
                        <Button size="lg" asChild>
                            <Link href="/login">
                                Comenzar análisis <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    )}
                </section>

                {/* Features Grid */}
                <section className="max-w-6xl mx-auto px-6 py-16">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                        Flujo de Trabajo Completo
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Users,
                                title: 'Ingesta de Datos',
                                description: 'Importa calificaciones desde archivos CSV o Excel de forma segura y anonimizada.',
                            },
                            {
                                icon: BarChart3,
                                title: 'Segmentación',
                                description: 'Clasificación automática de estudiantes en tres grupos por rendimiento académico.',
                            },
                            {
                                icon: BookOpen,
                                title: 'Encuestas',
                                description: 'Bancos de preguntas dinámicas con tokens de acceso único y cumplimiento en vivo.',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Análisis',
                                description: 'Motor de análisis que identifica prácticas validadas y barreras detectadas.',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
                                <feature.icon className="w-8 h-8 text-primary mb-4" />
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key Features */}
                <section className="max-w-4xl mx-auto px-6 py-16">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                        Características Principales
                    </h3>
                    <div className="space-y-4">
                        {[
                            'Cumplimiento LOPDP: Anonimización irreversible y cero almacenamiento de PII',
                            'Validación automática: Umbral del 60% para identificar patrones significativos',
                            'Reportes profesionales: Exportación a PDF, CSV e impresión directa',
                            'Gráficas interactivas: Donut charts, barras horizontales y distribuciones de grupos',
                            'Gestión completa de usuarios: Roles de administrador y coordinador',
                            'Dashboard ejecutivo: KPIs y visualizaciones de datos del sistema',
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-slate-700 dark:text-slate-300">{feature}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-primary/5 dark:bg-primary/10 border-y border-slate-200 dark:border-slate-800 py-16">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {[
                                { label: '5 Fases', value: 'Implementadas' },
                                { label: '100%', value: 'Funcionalidad' },
                                { label: 'LOPDP', value: 'Compliant' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-3xl font-bold text-primary mb-2">{stat.label}</p>
                                    <p className="text-slate-600 dark:text-slate-400">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        ¿Listo para comenzar?
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                        Inicia sesión para acceder al dashboard y comenzar a importar datos de desviación positiva.
                    </p>
                    {!auth.user && (
                        <Button size="lg" asChild>
                            <Link href="/login">
                                Iniciar sesión <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    )}
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    <p>Plataforma de Análisis de Desviación Positiva — ESPE</p>
                </footer>
            </div>
        </>
    );
}
