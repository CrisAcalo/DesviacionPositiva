<?php

namespace Tests\Unit;

use App\Models\AnalysisResult;
use App\Models\Nrc;
use App\Models\QuestionBank;
use App\Models\Recommendation;
use App\Models\Student;
use App\Models\StudentGroup;
use App\Models\Survey;
use App\Models\SurveyAccessToken;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Services\AnalysisEngine;
use App\Services\SurveyActivationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AnalysisEngineTest extends TestCase
{
    use RefreshDatabase;

    private AnalysisEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new AnalysisEngine();
    }

    /**
     * Helper: crea NRC + encuesta + pregunta + respuestas.
     * Las respuestas se guardan como arrays de un elemento, igual que en producción
     * (SurveyResponseController envuelve siempre: is_array($a) ? $a : [$a]).
     */
    private function makeNrcWithSurveyAndResponses(string $group, array $answers): array
    {
        $nrc = Nrc::factory()->create(['status' => 'surveying']);

        // Crear pregunta en banco
        $bankQ = QuestionBank::factory()->create([
            'target_group' => $group,
            'type'         => 'single_choice',
            'options'      => [
                ['value' => 'a', 'label' => 'Opción A'],
                ['value' => 'b', 'label' => 'Opción B'],
                ['value' => 'c', 'label' => 'Opción C'],
            ],
            'is_active' => true,
            'order'     => 1,
        ]);

        // Crear survey del grupo
        $survey = Survey::factory()->create([
            'nrc_id' => $nrc->id,
            'group'  => $group,
            'status' => 'active',
        ]);

        // Copiar pregunta al survey
        $surveyQ = SurveyQuestion::factory()->create([
            'survey_id'        => $survey->id,
            'question_bank_id' => $bankQ->id,
            'question_text'    => $bankQ->question_text,
            'type'             => $bankQ->type,
            'options'          => $bankQ->options,
            'order'            => 1,
        ]);

        // Crear estudiantes y grupos
        foreach ($answers as $answer) {
            $student = Student::factory()->create();
            StudentGroup::factory()->create([
                'nrc_id'     => $nrc->id,
                'student_id' => $student->id,
                'group'      => $group,
            ]);
            SurveyResponse::factory()->create([
                'survey_question_id' => $surveyQ->id,
                'student_id'         => $student->id,
                'nrc_id'             => $nrc->id,
                // Mismo formato que producción: siempre array
                'answer'             => [$answer],
            ]);
        }

        return [$nrc, $survey, $surveyQ];
    }

    #[Test]
    public function it_creates_analysis_results_for_each_question(): void
    {
        [$nrc, $survey, $surveyQ] = $this->makeNrcWithSurveyAndResponses(
            'high',
            ['a', 'a', 'a', 'b', 'c'] // a = 3/5 = 60%
        );

        $this->engine->analyze($nrc);

        $this->assertDatabaseHas('analysis_results', [
            'nrc_id'             => $nrc->id,
            'survey_question_id' => $surveyQ->id,
            'group'              => 'high',
            'top_answer_value'   => 'a',
            'top_count'          => 3,
            'total_responses'    => 5,
        ]);
    }

    #[Test]
    public function it_marks_result_as_validated_when_above_threshold(): void
    {
        [$nrc] = $this->makeNrcWithSurveyAndResponses(
            'high',
            ['a', 'a', 'a', 'a', 'b'] // a = 4/5 = 80% >= 60%
        );

        $this->engine->analyze($nrc);

        $result = AnalysisResult::where('nrc_id', $nrc->id)->first();
        $this->assertTrue($result->is_validated);
        $this->assertEquals(80.0, (float) $result->top_percentage);
    }

    #[Test]
    public function it_does_not_validate_when_below_threshold(): void
    {
        [$nrc] = $this->makeNrcWithSurveyAndResponses(
            'high',
            ['a', 'a', 'b', 'b', 'c'] // a = 2/5 = 40% < 60%
        );

        $this->engine->analyze($nrc);

        $result = AnalysisResult::where('nrc_id', $nrc->id)->first();
        $this->assertFalse($result->is_validated);
    }

    #[Test]
    public function it_generates_practice_recommendation_for_validated_high_group(): void
    {
        [$nrc] = $this->makeNrcWithSurveyAndResponses(
            'high',
            ['a', 'a', 'a', 'a', 'b'] // 80% → validada
        );

        $this->engine->analyze($nrc);

        $this->assertDatabaseHas('recommendations', [
            'nrc_id' => $nrc->id,
            'type'   => 'practice',
        ]);
    }

    #[Test]
    public function it_generates_barrier_recommendation_for_validated_at_risk_group(): void
    {
        [$nrc] = $this->makeNrcWithSurveyAndResponses(
            'at_risk',
            ['b', 'b', 'b', 'b', 'a'] // 80% → barrera
        );

        $this->engine->analyze($nrc);

        $this->assertDatabaseHas('recommendations', [
            'nrc_id' => $nrc->id,
            'type'   => 'barrier',
        ]);
    }

    #[Test]
    public function it_updates_nrc_status_to_analyzed(): void
    {
        [$nrc] = $this->makeNrcWithSurveyAndResponses('high', ['a', 'b']);

        $this->engine->analyze($nrc);

        $this->assertEquals('analyzed', $nrc->fresh()->status);
    }

    #[Test]
    public function it_clears_previous_results_on_rerun(): void
    {
        [$nrc] = $this->makeNrcWithSurveyAndResponses(
            'high',
            ['a', 'a', 'a', 'b', 'c']
        );

        $this->engine->analyze($nrc);
        $firstCount = AnalysisResult::where('nrc_id', $nrc->id)->count();

        $this->engine->analyze($nrc);
        $secondCount = AnalysisResult::where('nrc_id', $nrc->id)->count();

        $this->assertEquals($firstCount, $secondCount);
    }

    #[Test]
    public function it_skips_questions_with_no_responses(): void
    {
        $nrc = Nrc::factory()->create(['status' => 'surveying']);
        $survey = Survey::factory()->create([
            'nrc_id' => $nrc->id,
            'group'  => 'high',
            'status' => 'active',
        ]);
        // Pregunta sin respuestas
        SurveyQuestion::factory()->create(['survey_id' => $survey->id]);

        $this->engine->analyze($nrc);

        $this->assertEquals(0, AnalysisResult::where('nrc_id', $nrc->id)->count());
        $this->assertEquals('analyzed', $nrc->fresh()->status);
    }
}
