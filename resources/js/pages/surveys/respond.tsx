import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Option = { value: string; label: string };

type Question = {
    id: number;
    text: string;
    type: 'likert' | 'single_choice' | 'multiple_choice';
    options: Option[];
    order: number;
};

type Survey = {
    title: string;
    group: 'high' | 'medium' | 'at_risk';
    questions: Question[];
};

type Props =
    | { state: 'open'; token: string; survey: Survey }
    | { state: 'used' }
    | { state: 'closed' };

const LIKERT_COLORS: Record<string, string> = {
    '1': 'border-destructive/60 data-[state=checked]:bg-destructive/80',
    '2': 'border-orange-400/60 data-[state=checked]:bg-orange-400/80',
    '3': 'border-yellow-400/60 data-[state=checked]:bg-yellow-400/80',
    '4': 'border-primary/60 data-[state=checked]:bg-primary/80',
    '5': 'border-green-500/60 data-[state=checked]:bg-green-500/80',
};

function StateMessage({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
            <Card className="w-full max-w-md text-center">
                <CardContent className="pt-10 pb-8">
                    <div className="mb-4 flex justify-center">{icon}</div>
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </CardContent>
            </Card>
        </div>
    );
}

function LikertQuestion({ question, value, onChange }: {
    question: Question;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 flex-wrap justify-between">
                {question.options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 min-w-[3rem] rounded-lg border-2 py-3 text-sm font-medium transition-all
                            ${value === opt.value
                                ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-md'
                                : 'border-border hover:border-primary/50 bg-background'}`}
                    >
                        {opt.value}
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>{question.options[0]?.label}</span>
                <span>{question.options[question.options.length - 1]?.label}</span>
            </div>
        </div>
    );
}

function SingleChoiceQuestion({ question, value, onChange }: {
    question: Question;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            {question.options.map((opt) => (
                <label
                    key={opt.value}
                    className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all
                        ${value === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                >
                    <input
                        type="radio"
                        name={`q_${question.id}`}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                        className="accent-primary"
                    />
                    <span className="text-sm">{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

function MultipleChoiceQuestion({ question, values, onChange }: {
    question: Question;
    values: string[];
    onChange: (v: string[]) => void;
}) {
    const toggle = (v: string) => {
        onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
    };

    return (
        <div className="flex flex-col gap-2">
            {question.options.map((opt) => {
                const checked = values.includes(opt.value);
                return (
                    <label
                        key={opt.value}
                        className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-all
                            ${checked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                    >
                        <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(opt.value)}
                            id={`q_${question.id}_${opt.value}`}
                        />
                        <Label htmlFor={`q_${question.id}_${opt.value}`} className="cursor-pointer text-sm font-normal">
                            {opt.label}
                        </Label>
                    </label>
                );
            })}
        </div>
    );
}

export default function SurveyRespond(props: Props) {
    if (props.state === 'used') {
        return (
            <StateMessage
                icon={<CheckCircle className="h-12 w-12 text-primary" />}
                title="Ya respondiste esta encuesta"
                message="Tu participación fue registrada. Gracias por tu tiempo."
            />
        );
    }

    if (props.state === 'closed') {
        return (
            <StateMessage
                icon={<Clock className="h-12 w-12 text-muted-foreground" />}
                title="Esta encuesta ya no está disponible"
                message="El período de respuesta ha finalizado."
            />
        );
    }

    const { token, survey } = props;

    const { data, setData, post, processing, errors } = useForm<{ responses: Record<number, string | string[]>; token?: string }>({
        responses: {},
    });

    const setAnswer = (questionId: number, value: string | string[]) => {
        setData('responses', { ...data.responses, [questionId]: value });
    };

    const allAnswered = survey.questions.every((q) => {
        const ans = data.responses[q.id];
        if (q.type === 'multiple_choice') return Array.isArray(ans) && ans.length > 0;
        return ans != null && ans !== '';
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/encuesta/${token}`);
    };

    return (
        <>
            <Head title={survey.title} />

            <div className="min-h-screen bg-muted/30 py-10 px-4">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold">{survey.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Responde con honestidad. Tus respuestas son anónimas y se usarán solo con fines académicos.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {survey.questions.map((q, idx) => (
                            <Card key={q.id}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-medium">
                                        <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                                        {q.text}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {q.type === 'likert' && (
                                        <LikertQuestion
                                            question={q}
                                            value={(data.responses[q.id] as string) ?? ''}
                                            onChange={(v) => setAnswer(q.id, v)}
                                        />
                                    )}
                                    {q.type === 'single_choice' && (
                                        <SingleChoiceQuestion
                                            question={q}
                                            value={(data.responses[q.id] as string) ?? ''}
                                            onChange={(v) => setAnswer(q.id, v)}
                                        />
                                    )}
                                    {q.type === 'multiple_choice' && (
                                        <MultipleChoiceQuestion
                                            question={q}
                                            values={(data.responses[q.id] as string[]) ?? []}
                                            onChange={(v) => setAnswer(q.id, v)}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {errors.token && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                <XCircle className="h-4 w-4 shrink-0" />
                                {errors.token}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing || !allAnswered}
                        >
                            {processing ? 'Enviando...' : 'Enviar respuestas'}
                        </Button>

                        {!allAnswered && (
                            <p className="text-center text-xs text-muted-foreground">
                                Responde todas las preguntas para poder enviar.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}
