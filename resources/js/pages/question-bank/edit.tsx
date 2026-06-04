import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Option = { value: string; label: string };

type Question = {
    id: number;
    question_text: string;
    type: 'likert' | 'single_choice' | 'multiple_choice';
    target_group: 'high' | 'medium' | 'at_risk';
    options: Option[];
    order: number;
    is_active: boolean;
};

const LIKERT_DEFAULT: Option[] = [
    { value: '1', label: 'Nunca' },
    { value: '2', label: 'Raramente' },
    { value: '3', label: 'A veces' },
    { value: '4', label: 'Con frecuencia' },
    { value: '5', label: 'Siempre' },
];

export default function QuestionBankEdit({ question }: { question: Question }) {
    const { data, setData, put, processing, errors } = useForm({
        question_text: question.question_text,
        type: question.type,
        target_group: question.target_group,
        options: question.options,
        order: question.order,
        is_active: question.is_active,
    });

    const handleTypeChange = (type: typeof data.type) => {
        setData({
            ...data,
            type,
            options: type === 'likert' ? LIKERT_DEFAULT : data.options,
        });
    };

    const addOption = () => setData('options', [...data.options, { value: '', label: '' }]);

    const removeOption = (idx: number) =>
        setData('options', data.options.filter((_, i) => i !== idx));

    const updateOption = (idx: number, field: 'value' | 'label', val: string) => {
        const opts = [...data.options];
        opts[idx] = { ...opts[idx], [field]: val };
        setData('options', opts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/question-bank/${question.id}`);
    };

    const isLikert = data.type === 'likert';

    return (
        <>
            <Head title="Editar pregunta" />

            <div className="space-y-6 p-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/question-bank"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <Heading title="Editar pregunta" description="Los cambios solo afectan encuestas futuras" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Datos de la pregunta</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="question_text">Texto de la pregunta</Label>
                                <Input
                                    id="question_text"
                                    value={data.question_text}
                                    onChange={(e) => setData('question_text', e.target.value)}
                                />
                                {errors.question_text && <p className="text-xs text-destructive">{errors.question_text}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Grupo objetivo</Label>
                                    <Select value={data.target_group} onValueChange={(v) => setData('target_group', v as typeof data.target_group)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">Alto rendimiento</SelectItem>
                                            <SelectItem value="medium">Rendimiento promedio</SelectItem>
                                            <SelectItem value="at_risk">En riesgo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Tipo de pregunta</Label>
                                    <Select value={data.type} onValueChange={(v) => handleTypeChange(v as typeof data.type)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="likert">Escala Likert (1â€“5)</SelectItem>
                                            <SelectItem value="single_choice">OpciÃ³n Ãºnica</SelectItem>
                                            <SelectItem value="multiple_choice">OpciÃ³n mÃºltiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="order">Orden</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        min={0}
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                        className="w-24"
                                    />
                                </div>
                                <div className="flex items-end gap-2 pb-0.5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm">Pregunta activa</span>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    Opciones de respuesta
                                    {isLikert && <span className="text-muted-foreground text-sm font-normal ml-2">(predefinidas para Likert)</span>}
                                </CardTitle>
                                {!isLikert && (
                                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                        <PlusCircle className="mr-2 h-4 w-4" />Agregar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input
                                        value={opt.value}
                                        onChange={(e) => updateOption(idx, 'value', e.target.value)}
                                        placeholder="valor"
                                        disabled={isLikert}
                                        className="w-28 font-mono text-sm"
                                    />
                                    <Input
                                        value={opt.label}
                                        onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                        placeholder="Etiqueta"
                                        disabled={isLikert}
                                    />
                                    {!isLikert && data.options.length > 2 && (
                                        <Button type="button" variant="ghost" size="icon"
                                            className="text-destructive hover:text-destructive shrink-0"
                                            onClick={() => removeOption(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                        Los cambios solo se aplican a encuestas nuevas. Las encuestas ya activadas conservan las preguntas originales.
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button asChild variant="outline"><Link href="/question-bank">Cancelar</Link></Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar cambios'}</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

QuestionBankEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Banco de preguntas', href: '/question-bank' },
        { title: 'Editar', href: '#' },
    ],
};
