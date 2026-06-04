�import { Head, Link, useForm } from '@inertiajs/react';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Option = { value: string; label: string };

type FormData = {
    question_text: string;
    type: 'likert' | 'single_choice' | 'multiple_choice' | '';
    target_group: 'high' | 'medium' | 'at_risk' | '';
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

export default function QuestionBankCreate() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        question_text: '',
        type: '',
        target_group: '',
        options: [{ value: '', label: '' }, { value: '', label: '' }],
        order: 0,
        is_active: true,
    });

    const handleTypeChange = (type: FormData['type']) => {
        setData({
            ...data,
            type,
            options: type === 'likert' ? LIKERT_DEFAULT : [{ value: '', label: '' }, { value: '', label: '' }],
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
        post('/question-bank');
    };

    const isLikert = data.type === 'likert';

    return (
        <>
            <Head title="Nueva pregunta" />

            <div className="space-y-6 p-6 max-w-2xl">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/question-bank"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <Heading title="Nueva pregunta" description="Agrega una pregunta al banco para usarla en encuestas" />
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
                                    placeholder="¿Qué estrategias de estudio aplicas...?"
                                />
                                {errors.question_text && <p className="text-xs text-destructive">{errors.question_text}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Grupo objetivo</Label>
                                    <Select value={data.target_group} onValueChange={(v) => setData('target_group', v as FormData['target_group'])}>
                                        <SelectTrigger>
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
                                    <Label>Tipo de pregunta</Label>
                                    <Select value={data.type} onValueChange={(v) => handleTypeChange(v as FormData['type'])}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="likert">Escala Likert (1�5)</SelectItem>
                                            <SelectItem value="single_choice">Opción única</SelectItem>
                                            <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="order">Orden sugerido</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min={0}
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className="w-24"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                    Opciones de respuesta {isLikert && <span className="text-muted-foreground text-sm font-normal">(predefinidas para Likert)</span>}
                                </CardTitle>
                                {!isLikert && (
                                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Agregar opción
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
                                        placeholder="valor interno"
                                        disabled={isLikert}
                                        className="w-28 font-mono text-sm"
                                    />
                                    <Input
                                        value={opt.label}
                                        onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                        placeholder="Etiqueta visible"
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
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 justify-end">
                        <Button asChild variant="outline">
                            <Link href="/question-bank">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar pregunta'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

QuestionBankCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Banco de preguntas', href: '/question-bank' },
        { title: 'Nueva pregunta', href: '#' },
    ],
};
