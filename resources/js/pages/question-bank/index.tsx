import { Head, router, useForm } from '@inertiajs/react';
import { PlusCircle, Pencil, Trash2, Loader2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Option = { value: string; label: string };

type Question = {
    id: number;
    question_text: string;
    type: 'likert' | 'single_choice' | 'multiple_choice' | '';
    options: Option[];
    target_group: 'high' | 'medium' | 'at_risk' | '';
    order: number;
    is_active: boolean;
};

const GROUP_LABELS = { high: 'Alto rendimiento', medium: 'Promedio', at_risk: 'En riesgo' };
const GROUP_VARIANTS = { high: 'default', medium: 'secondary', at_risk: 'destructive' } as const;
const TYPE_LABELS = { likert: 'Escala Likert', single_choice: 'Opción única', multiple_choice: 'Opción múltiple' };

const LIKERT_DEFAULT: Option[] = [
    { value: '1', label: 'Nunca' },
    { value: '2', label: 'Raramente' },
    { value: '3', label: 'A veces' },
    { value: '4', label: 'Con frecuencia' },
    { value: '5', label: 'Siempre' },
];

export default function QuestionBankIndex({
    questions,
}: {
    questions: Record<string, Question[]>;
}) {
    const groups = ['high', 'medium', 'at_risk'] as const;
    const totalActive = Object.values(questions).flat().filter((q) => q.is_active).length;

    // Expanded Options State
    const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
    
    const allQuestionIds = Object.values(questions).flat().map(q => q.id);
    const allExpanded = expandedQuestions.length === allQuestionIds.length && allQuestionIds.length > 0;

    const toggleExpand = (id: number) => {
        setExpandedQuestions(prev => 
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    const toggleAllExpand = () => {
        if (allExpanded) {
            setExpandedQuestions([]);
        } else {
            setExpandedQuestions(allQuestionIds);
        }
    };

    // Delete Modal State
    const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm<Omit<Question, 'id'>>({
        question_text: '',
        type: '',
        target_group: '',
        options: [{ value: '', label: '' }, { value: '', label: '' }],
        order: 0,
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingQuestion(null);
        reset();
        clearErrors();
        setIsFormOpen(true);
    };

    const openEditModal = (q: Question) => {
        setEditingQuestion(q);
        setData({
            question_text: q.question_text,
            type: q.type,
            target_group: q.target_group,
            options: q.options || [],
            order: q.order,
            is_active: q.is_active,
        });
        clearErrors();
        setIsFormOpen(true);
    };

    const closeFormModal = () => {
        setIsFormOpen(false);
        reset();
        clearErrors();
    };

    const handleTypeChange = (type: Question['type']) => {
        setData({
            ...data,
            type,
            options: type === 'likert' ? LIKERT_DEFAULT : [{ value: '', label: '' }, { value: '', label: '' }],
        });
    };

    const addOption = () => setData('options', [...data.options, { value: '', label: '' }]);
    const removeOption = (idx: number) => setData('options', data.options.filter((_, i) => i !== idx));
    const updateOption = (idx: number, field: 'value' | 'label', val: string) => {
        const opts = [...data.options];
        opts[idx] = { ...opts[idx], [field]: val };
        setData('options', opts);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingQuestion) {
            patch(`/question-bank/${editingQuestion.id}`, { onSuccess: () => closeFormModal() });
        } else {
            post('/question-bank', { onSuccess: () => closeFormModal() });
        }
    };

    const confirmDelete = () => {
        if (!deletingQuestion) return;
        setIsDeleting(true);
        router.delete(`/question-bank/${deletingQuestion.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingQuestion(null);
            }
        });
    };

    const isLikert = data.type === 'likert';

    return (
        <>
            <Head title="Banco de preguntas" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Banco de preguntas"
                        description={`${totalActive} preguntas activas disponibles para encuestas`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={toggleAllExpand}>
                            {allExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                            {allExpanded ? 'Contraer todo' : 'Expandir todo'}
                        </Button>
                        <Button asChild variant="outline">
                            <a href="/question-bank/export" download>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar CSV
                            </a>
                        </Button>
                        <Button onClick={openCreateModal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva pregunta
                        </Button>
                    </div>
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
                                    <div className="p-6">
                                        <EmptyState
                                            icon={PlusCircle}
                                            title={`Sin preguntas para ${GROUP_LABELS[group]}`}
                                            description="No hay preguntas registradas para este segmento. Agrega la primera para empezar."
                                            action={<Button onClick={openCreateModal}><PlusCircle className="mr-2 h-4 w-4" />Agrega la primera</Button>}
                                        />
                                    </div>
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
                                                        <span className="text-xs text-muted-foreground">{TYPE_LABELS[q.type as keyof typeof TYPE_LABELS]}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => toggleExpand(q.id)}
                                                                className="h-7 px-2 text-xs text-muted-foreground self-start hover:text-foreground"
                                                            >
                                                                {q.options.length} opciones
                                                                {expandedQuestions.includes(q.id) ? (
                                                                    <ChevronUp className="ml-1 h-3 w-3" />
                                                                ) : (
                                                                    <ChevronDown className="ml-1 h-3 w-3" />
                                                                )}
                                                            </Button>
                                                            {expandedQuestions.includes(q.id) && (
                                                                <ul className="pl-2 space-y-1 text-xs text-muted-foreground border-l-2 border-muted">
                                                                    {q.options.map((opt, i) => (
                                                                        <li key={i}><span className="font-mono opacity-50 mr-1">{opt.value}:</span> {opt.label}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={q.is_active ? 'outline' : 'secondary'}>
                                                            {q.is_active ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(q)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => setDeletingQuestion(q)}
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

            {/* Modal de Crear/Editar Pregunta */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
                        <DialogDescription>
                            {editingQuestion ? 'Modifica los detalles de la pregunta en el banco.' : 'Agrega una nueva pregunta al banco para usarla en futuras encuestas.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="question_text">Texto de la pregunta <span className="text-destructive">*</span></Label>
                                <Input
                                    id="question_text"
                                    value={data.question_text}
                                    onChange={(e) => setData('question_text', e.target.value)}
                                    placeholder="¿Qué estrategias de estudio aplicas...?"
                                    className={errors.question_text ? 'border-destructive' : ''}
                                />
                                {errors.question_text && <p className="text-xs text-destructive">{errors.question_text}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Grupo objetivo <span className="text-destructive">*</span></Label>
                                    <Select value={data.target_group} onValueChange={(v) => setData('target_group', v as Question['target_group'])}>
                                        <SelectTrigger className={errors.target_group ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Selecciona un grupo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">Alto rendimiento</SelectItem>
                                            <SelectItem value="medium">Rendimiento promedio</SelectItem>
                                            <SelectItem value="at_risk">En riesgo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.target_group && <p className="text-xs text-destructive">{errors.target_group}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Tipo de pregunta <span className="text-destructive">*</span></Label>
                                    <Select value={data.type} onValueChange={(v) => handleTypeChange(v as Question['type'])}>
                                        <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="likert">Escala Likert (1–5)</SelectItem>
                                            <SelectItem value="single_choice">Opción única</SelectItem>
                                            <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="order">Orden sugerido</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        min={0}
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                {editingQuestion && (
                                    <div className="space-y-1.5">
                                        <Label>Estado</Label>
                                        <Select value={data.is_active ? '1' : '0'} onValueChange={(v) => setData('is_active', v === '1')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Activa</SelectItem>
                                                <SelectItem value="0">Inactiva</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">
                                    Opciones de respuesta {isLikert && <span className="text-muted-foreground text-sm font-normal">(predefinidas)</span>}
                                </Label>
                                {!isLikert && (
                                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Agregar opción
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {data.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={opt.value}
                                            onChange={(e) => updateOption(idx, 'value', e.target.value)}
                                            placeholder="valor interno (ej: 'si')"
                                            disabled={isLikert}
                                            className="w-28 font-mono text-sm"
                                        />
                                        <Input
                                            value={opt.label}
                                            onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                            placeholder="Etiqueta visible (ej: 'Sí')"
                                            disabled={isLikert}
                                        />
                                        {!isLikert && data.options.length > 2 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}
                                                className="text-destructive hover:text-destructive shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {errors.options && <p className="text-xs text-destructive">{errors.options}</p>}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={closeFormModal}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingQuestion ? 'Guardar cambios' : 'Guardar pregunta'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmación de Eliminación */}
            <Dialog open={!!deletingQuestion} onOpenChange={(open) => !open && setDeletingQuestion(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar pregunta</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar esta pregunta del banco? Las encuestas que ya han sido activadas no se verán afectadas, pero ya no estará disponible para futuras encuestas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingQuestion(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sí, eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

QuestionBankIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Banco de preguntas', href: '/question-bank' },
    ],
};
