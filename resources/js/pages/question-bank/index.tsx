import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Question = {
    id: number;
    question_text: string;
    type: 'likert' | 'single_choice' | 'multiple_choice';
    options: { value: string; label: string }[];
    target_group: 'high' | 'medium' | 'at_risk';
    order: number;
    is_active: boolean;
};

const GROUP_LABELS = { high: 'Alto rendimiento', medium: 'Promedio', at_risk: 'En riesgo' };
const GROUP_VARIANTS = { high: 'default', medium: 'secondary', at_risk: 'destructive' } as const;
const TYPE_LABELS = { likert: 'Escala Likert', single_choice: 'Opción única', multiple_choice: 'Opción múltiple' };

function deleteQuestion(id: number) {
    if (!confirm('¿Eliminar esta pregunta del banco? Las encuestas ya activadas no se verán afectadas.')) return;
    router.delete(`/question-bank/${id}`);
}

export default function QuestionBankIndex({
    questions,
}: {
    questions: Record<string, Question[]>;
}) {
    const groups = ['high', 'medium', 'at_risk'] as const;
    const totalActive = Object.values(questions).flat().filter((q) => q.is_active).length;

    return (
        <>
            <Head title="Banco de preguntas" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Banco de preguntas"
                        description={`${totalActive} preguntas activas disponibles para encuestas`}
                    />
                    <Button asChild>
                        <Link href="/question-bank/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva pregunta
                        </Link>
                    </Button>
                </div>

                {groups.map((group) => {
                    const groupQuestions = questions[group] ?? [];
                    return (
                        <Card key={group}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-base">{GROUP_LABELS[group]}</CardTitle>
                                    <Badge variant={GROUP_VARIANTS[group]}>
                                        {groupQuestions.length} pregunta{groupQuestions.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {groupQuestions.length === 0 ? (
                                    <p className="px-6 py-4 text-sm text-muted-foreground">
                                        No hay preguntas para este grupo.{' '}
                                        <Link href="/question-bank/create" className="underline underline-offset-4">
                                            Agrega la primera
                                        </Link>
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-8">#</TableHead>
                                                <TableHead>Pregunta</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Opciones</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="w-24" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupQuestions.map((q) => (
                                                <TableRow key={q.id} className={!q.is_active ? 'opacity-50' : ''}>
                                                    <TableCell className="text-muted-foreground text-sm">{q.order}</TableCell>
                                                    <TableCell className="max-w-md">
                                                        <p className="text-sm">{q.question_text}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs text-muted-foreground">{TYPE_LABELS[q.type]}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs text-muted-foreground">{q.options.length} opciones</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={q.is_active ? 'outline' : 'secondary'}>
                                                            {q.is_active ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button asChild variant="ghost" size="icon">
                                                                <Link href={`/question-bank/${q.id}/edit`}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => deleteQuestion(q.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
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
            </div>
        </>
    );
}

QuestionBankIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Banco de preguntas', href: '/question-bank' },
    ],
};
