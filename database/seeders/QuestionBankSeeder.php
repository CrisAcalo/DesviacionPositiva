<?php

namespace Database\Seeders;

use App\Models\QuestionBank;
use Illuminate\Database\Seeder;

class QuestionBankSeeder extends Seeder
{
    private const LIKERT_OPTIONS = [
        ['value' => '1', 'label' => 'Nunca'],
        ['value' => '2', 'label' => 'Raramente'],
        ['value' => '3', 'label' => 'A veces'],
        ['value' => '4', 'label' => 'Con frecuencia'],
        ['value' => '5', 'label' => 'Siempre'],
    ];

    private const HOURS_OPTIONS = [
        ['value' => 'less_2', 'label' => 'Menos de 2 horas'],
        ['value' => '2_to_4', 'label' => 'De 2 a 4 horas'],
        ['value' => '4_to_6', 'label' => 'De 4 a 6 horas'],
        ['value' => 'more_6', 'label' => 'Más de 6 horas'],
    ];

    public function run(): void
    {
        $questions = [
            // ─── Alto rendimiento ────────────────────────────────────────────
            [
                'question_text' => '¿Con qué frecuencia revisas el material de clase fuera del horario lectivo?',
                'type'          => 'likert',
                'options'       => self::LIKERT_OPTIONS,
                'target_group'  => 'high',
                'order'         => 1,
            ],
            [
                'question_text' => '¿Qué recursos académicos utilizas con mayor frecuencia para estudiar esta materia?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'textbook',  'label' => 'Libros de texto y bibliografía oficial'],
                    ['value' => 'videos',    'label' => 'Videos y tutoriales en línea'],
                    ['value' => 'notes',     'label' => 'Apuntes y resúmenes propios'],
                    ['value' => 'exercises', 'label' => 'Ejercicios de práctica y problemas resueltos'],
                    ['value' => 'teacher',   'label' => 'Consultas directas con el docente'],
                ],
                'target_group'  => 'high',
                'order'         => 2,
            ],
            [
                'question_text' => '¿Qué estrategias de estudio aplicas antes de los exámenes parciales?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'summaries', 'label' => 'Elaborar resúmenes y esquemas conceptuales'],
                    ['value' => 'practice',  'label' => 'Resolver ejercicios y exámenes anteriores'],
                    ['value' => 'group',     'label' => 'Estudiar en grupo con compañeros'],
                    ['value' => 'review',    'label' => 'Revisar apuntes de clase en orden cronológico'],
                    ['value' => 'teach',     'label' => 'Explicar el contenido a otra persona'],
                ],
                'target_group'  => 'high',
                'order'         => 3,
            ],
            [
                'question_text' => '¿Cuántas horas semanales dedicas al estudio de esta materia fuera de clases?',
                'type'          => 'single_choice',
                'options'       => self::HOURS_OPTIONS,
                'target_group'  => 'high',
                'order'         => 4,
            ],
            [
                'question_text' => '¿Participas activamente en clases haciendo preguntas o aportando en discusiones?',
                'type'          => 'likert',
                'options'       => self::LIKERT_OPTIONS,
                'target_group'  => 'high',
                'order'         => 5,
            ],

            // ─── Rendimiento promedio ─────────────────────────────────────────
            [
                'question_text' => '¿Con qué frecuencia asistes puntualmente a las clases de esta materia?',
                'type'          => 'likert',
                'options'       => self::LIKERT_OPTIONS,
                'target_group'  => 'medium',
                'order'         => 1,
            ],
            [
                'question_text' => '¿Qué factores afectan tu rendimiento académico en esta materia?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'time',        'label' => 'Falta de tiempo para estudiar'],
                    ['value' => 'material',    'label' => 'Dificultad para entender el material'],
                    ['value' => 'motivation',  'label' => 'Falta de motivación'],
                    ['value' => 'methodology', 'label' => 'Metodología de enseñanza del docente'],
                    ['value' => 'personal',    'label' => 'Factores personales o familiares'],
                ],
                'target_group'  => 'medium',
                'order'         => 2,
            ],
            [
                'question_text' => '¿Aprovechas las horas de tutoría o consultas disponibles con el docente?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'always',    'label' => 'Siempre que las necesito'],
                    ['value' => 'sometimes', 'label' => 'Ocasionalmente'],
                    ['value' => 'rarely',    'label' => 'Raramente'],
                    ['value' => 'never',     'label' => 'Nunca las he utilizado'],
                ],
                'target_group'  => 'medium',
                'order'         => 3,
            ],
            [
                'question_text' => '¿Qué tipo de apoyo adicional te ayudaría a mejorar tu rendimiento en esta materia?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'tutoring',   'label' => 'Más horas de tutoría personalizada'],
                    ['value' => 'materials',  'label' => 'Más materiales y ejercicios de práctica'],
                    ['value' => 'groups',     'label' => 'Grupos de estudio organizados'],
                    ['value' => 'workshops',  'label' => 'Talleres de refuerzo de contenidos'],
                    ['value' => 'digital',    'label' => 'Recursos digitales y plataformas en línea'],
                ],
                'target_group'  => 'medium',
                'order'         => 4,
            ],
            [
                'question_text' => '¿Cuántas horas semanales dedicas al estudio de esta materia fuera de clases?',
                'type'          => 'single_choice',
                'options'       => self::HOURS_OPTIONS,
                'target_group'  => 'medium',
                'order'         => 5,
            ],

            // ─── En riesgo ───────────────────────────────────────────────────
            [
                'question_text' => '¿Qué dificultades encuentras con mayor frecuencia en esta materia?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'concepts',      'label' => 'Dificultad para entender los conceptos teóricos'],
                    ['value' => 'prerequisites', 'label' => 'Faltan conocimientos previos de materias anteriores'],
                    ['value' => 'time',          'label' => 'No tengo tiempo suficiente para estudiar'],
                    ['value' => 'methodology',   'label' => 'No me adapto a la metodología del docente'],
                    ['value' => 'personal',      'label' => 'Problemas personales, económicos o de salud'],
                ],
                'target_group'  => 'at_risk',
                'order'         => 1,
            ],
            [
                'question_text' => '¿Con qué frecuencia asistes a tutorías o consultas con el docente?',
                'type'          => 'likert',
                'options'       => self::LIKERT_OPTIONS,
                'target_group'  => 'at_risk',
                'order'         => 2,
            ],
            [
                'question_text' => '¿Qué factores académicos dificultan principalmente tu rendimiento en esta materia?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'schedule',    'label' => 'Horario incompatible con otras obligaciones'],
                    ['value' => 'workload',    'label' => 'Carga académica excesiva en el semestre'],
                    ['value' => 'resources',   'label' => 'Falta de recursos de estudio (libros, internet)'],
                    ['value' => 'environment', 'label' => 'Ambiente de estudio poco adecuado'],
                    ['value' => 'other',       'label' => 'Otros factores no listados aquí'],
                ],
                'target_group'  => 'at_risk',
                'order'         => 3,
            ],
            [
                'question_text' => '¿Cuántas horas semanales dedicas al estudio de esta materia fuera de clases?',
                'type'          => 'single_choice',
                'options'       => self::HOURS_OPTIONS,
                'target_group'  => 'at_risk',
                'order'         => 4,
            ],
            [
                'question_text' => '¿Has considerado retirarte de esta materia o de la carrera?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'no',               'label' => 'No, nunca lo he considerado'],
                    ['value' => 'thought_subject',  'label' => 'He pensado retirarme de la materia'],
                    ['value' => 'thought_career',   'label' => 'He pensado abandonar la carrera'],
                    ['value' => 'already_withdrew', 'label' => 'Ya me retiré de una materia anteriormente'],
                ],
                'target_group'  => 'at_risk',
                'order'         => 5,
            ],
        ];

        foreach ($questions as $q) {
            QuestionBank::firstOrCreate(
                ['question_text' => $q['question_text'], 'target_group' => $q['target_group']],
                array_merge($q, ['is_active' => true])
            );
        }
    }
}
