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
            // ── Nuevas preguntas: Factores que afectan el rendimiento (Adaptada) ──
            [
                'question_text' => '¿Qué factores impulsan principalmente tu alto rendimiento académico en esta materia?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'time_management', 'label' => 'Gestión eficiente del tiempo de estudio'],
                    ['value' => 'material_comp',   'label' => 'Facilidad para comprender el material de estudio'],
                    ['value' => 'motivation',      'label' => 'Alta motivación e interés por la materia'],
                    ['value' => 'methodology',     'label' => 'Adaptación exitosa a la metodología del docente'],
                    ['value' => 'family_support',  'label' => 'Apoyo del entorno personal y familiar'],
                ],
                'target_group'  => 'high',
                'order'         => 6,
            ],
            // ── Nuevas preguntas: Cultura de Estudio ──
            [
                'question_text' => '¿Cómo organizas tu entorno físico y digital al momento de estudiar?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'isolated',      'label' => 'Estudio en un lugar aislado y sin distracciones'],
                    ['value' => 'library',       'label' => 'Prefiero estudiar en la biblioteca o espacios compartidos'],
                    ['value' => 'digital_tools', 'label' => 'Utilizo herramientas digitales para bloquear distracciones'],
                    ['value' => 'flexible',      'label' => 'Me adapto a cualquier entorno disponible'],
                ],
                'target_group'  => 'high',
                'order'         => 7,
            ],
            [
                'question_text' => '¿Cuál es tu actitud frente a un tema que resulta muy difícil de comprender?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'research',    'label' => 'Investigo por mi cuenta hasta entenderlo (libros, internet)'],
                    ['value' => 'ask_teacher', 'label' => 'Acudo inmediatamente al docente para pedir aclaraciones'],
                    ['value' => 'ask_peers',   'label' => 'Consulto con compañeros que hayan entendido el tema'],
                    ['value' => 'skip_return', 'label' => 'Paso al siguiente tema y vuelvo más tarde con la mente fresca'],
                ],
                'target_group'  => 'high',
                'order'         => 8,
            ],
            [
                'question_text' => '¿Cómo planificas tus sesiones de estudio a lo largo de la semana?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'routine',      'label' => 'Mantengo una rutina estricta con horarios fijos todos los días'],
                    ['value' => 'goals',        'label' => 'Estudio basado en objetivos diarios (ej. terminar un capítulo)'],
                    ['value' => 'flexible',     'label' => 'Estudio cuando tengo tiempo libre sin un horario fijo'],
                    ['value' => 'before_exams', 'label' => 'Concentro mi estudio principalmente los días previos a las evaluaciones'],
                ],
                'target_group'  => 'high',
                'order'         => 9,
            ],
            // ── Nuevas preguntas: Factores Familiares ──
            [
                'question_text' => '¿De qué manera tu entorno familiar apoya tu proceso de aprendizaje universitario?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'emotional',   'label' => 'Me brindan apoyo emocional y motivación constante'],
                    ['value' => 'space',       'label' => 'Respetan mis horarios y me proveen un espacio silencioso para estudiar'],
                    ['value' => 'economic',    'label' => 'Me apoyan económicamente para que solo deba enfocarme en estudiar'],
                    ['value' => 'academic',    'label' => 'Me ayudan directamente con temas académicos o discusiones'],
                    ['value' => 'none',        'label' => 'Estudio de forma totalmente independiente sin involucrar a mi familia'],
                ],
                'target_group'  => 'high',
                'order'         => 10,
            ],
            [
                'question_text' => '¿Con quién vives actualmente durante el período académico?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'parents',   'label' => 'Con mis padres o familiares directos'],
                    ['value' => 'alone',     'label' => 'Vivo solo/a'],
                    ['value' => 'roommates', 'label' => 'Comparto vivienda con amigos o compañeros'],
                    ['value' => 'partner',   'label' => 'Con mi pareja o familia propia'],
                ],
                'target_group'  => 'high',
                'order'         => 11,
            ],
            [
                'question_text' => '¿Qué nivel de responsabilidad asumes en las tareas del hogar mientras estudias?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'minimal',     'label' => 'Mínima, mi familia me releva para que pueda estudiar'],
                    ['value' => 'shared',      'label' => 'Responsabilidades compartidas equitativamente'],
                    ['value' => 'high',        'label' => 'Alta, soy el/la principal responsable del hogar'],
                    ['value' => 'independent', 'label' => 'Vivo solo/a, me encargo de todo mi hogar'],
                ],
                'target_group'  => 'high',
                'order'         => 12,
            ],
            // ── Nuevas preguntas: Recursos Materiales/Tecnológicos ──
            [
                'question_text' => '¿Qué dispositivo tecnológico utilizas principalmente para tu estudio diario?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'laptop',  'label' => 'Computadora portátil propia'],
                    ['value' => 'desktop', 'label' => 'Computadora de escritorio'],
                    ['value' => 'tablet',  'label' => 'Tablet o dispositivo móvil avanzado'],
                    ['value' => 'shared',  'label' => 'Computadora compartida con la familia o de laboratorio'],
                ],
                'target_group'  => 'high',
                'order'         => 13,
            ],
            [
                'question_text' => '¿Cómo calificarías el acceso a internet que tienes en tu lugar de estudio habitual?',
                'type'          => 'single_choice',
                'options'       => [
                    ['value' => 'excellent', 'label' => 'Excelente, rápido y sin interrupciones'],
                    ['value' => 'good',      'label' => 'Bueno, suficiente para clases y consultas'],
                    ['value' => 'unstable',  'label' => 'Inestable, frecuentemente tengo problemas de conexión'],
                    ['value' => 'limited',   'label' => 'Limitado, uso datos móviles o acceso público'],
                ],
                'target_group'  => 'high',
                'order'         => 14,
            ],
            [
                'question_text' => '¿Qué tipo de herramientas de software utilizas para mejorar tu productividad académica?',
                'type'          => 'multiple_choice',
                'options'       => [
                    ['value' => 'ai',           'label' => 'Herramientas de Inteligencia Artificial (ChatGPT, Copilot, etc.)'],
                    ['value' => 'organization', 'label' => 'Aplicaciones de organización (Notion, Trello, calendarios)'],
                    ['value' => 'office',       'label' => 'Herramientas ofimáticas tradicionales (Word, Excel)'],
                    ['value' => 'specialized',  'label' => 'Software especializado de mi carrera (AutoCAD, IDEs, simuladores)'],
                ],
                'target_group'  => 'high',
                'order'         => 15,
            ],

            // ─── Rendimiento promedio ─────────────────────────────────────────
            [
                'question_text' => '¿Con qué frecuencia asistes puntualmente a las clases de esta materia?',
                'type'          => 'likert',
                'options'       => self::LIKERT_OPTIONS,
                'target_group'  => 'medium',
                'order'         => 1,
            ],
            // La antigua pregunta 2 del grupo medio se adaptó y movió a 'high'.
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
                'order'         => 2,
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
                'order'         => 3,
            ],
            [
                'question_text' => '¿Cuántas horas semanales dedicas al estudio de esta materia fuera de clases?',
                'type'          => 'single_choice',
                'options'       => self::HOURS_OPTIONS,
                'target_group'  => 'medium',
                'order'         => 4,
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

