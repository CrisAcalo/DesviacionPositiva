<?php

namespace Tests\Unit;

use App\Models\Nrc;
use App\Models\QuestionBank;
use App\Models\Student;
use App\Models\StudentGroup;
use App\Models\Survey;
use App\Models\SurveyAccessToken;
use App\Models\User;
use App\Services\SurveyActivationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyActivationServiceTest extends TestCase
{
    use RefreshDatabase;

    private SurveyActivationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SurveyActivationService::class);
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    private function createNrcWithStudents(): array
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $nrc = Nrc::factory()->create(['status' => 'segmented', 'uploaded_by' => $user->id]);

        $students = [];
        foreach (['high' => 2, 'medium' => 3, 'at_risk' => 2] as $group => $count) {
            for ($i = 0; $i < $count; $i++) {
                $student = Student::factory()->create(['nrc_id' => $nrc->id]);
                StudentGroup::factory()->create(['student_id' => $student->id, 'nrc_id' => $nrc->id, 'group' => $group]);
                $students[] = $student;
            }
        }

        return [$nrc, $user, $students];
    }

    public function test_activate_creates_three_surveys_for_nrc(): void
    {
        QuestionBank::factory()->count(2)->create(['target_group' => 'high', 'is_active' => true]);
        QuestionBank::factory()->count(2)->create(['target_group' => 'medium', 'is_active' => true]);
        QuestionBank::factory()->count(2)->create(['target_group' => 'at_risk', 'is_active' => true]);

        [$nrc, $user] = $this->createNrcWithStudents();

        $this->service->activate($nrc, $user);

        $this->assertDatabaseCount('surveys', 3);
        $this->assertDatabaseHas('surveys', ['nrc_id' => $nrc->id, 'group' => 'high', 'status' => 'active']);
        $this->assertDatabaseHas('surveys', ['nrc_id' => $nrc->id, 'group' => 'medium', 'status' => 'active']);
        $this->assertDatabaseHas('surveys', ['nrc_id' => $nrc->id, 'group' => 'at_risk', 'status' => 'active']);
    }

    public function test_activate_copies_questions_from_bank_into_each_survey(): void
    {
        QuestionBank::factory()->count(3)->create(['target_group' => 'high', 'is_active' => true]);
        QuestionBank::factory()->count(3)->create(['target_group' => 'medium', 'is_active' => true]);
        QuestionBank::factory()->count(3)->create(['target_group' => 'at_risk', 'is_active' => true]);

        [$nrc, $user] = $this->createNrcWithStudents();

        $this->service->activate($nrc, $user);

        // 3 groups × 3 questions = 9 survey_questions total
        $this->assertDatabaseCount('survey_questions', 9);
    }

    public function test_activate_generates_one_token_per_student_per_survey(): void
    {
        QuestionBank::factory()->count(1)->create(['target_group' => 'high', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'medium', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'at_risk', 'is_active' => true]);

        [$nrc, $user] = $this->createNrcWithStudents();
        // 2 high + 3 medium + 2 at_risk = 7 students → 7 tokens
        $this->service->activate($nrc, $user);

        $this->assertDatabaseCount('survey_access_tokens', 7);
    }

    public function test_activate_updates_nrc_status_to_surveying(): void
    {
        QuestionBank::factory()->count(1)->create(['target_group' => 'high', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'medium', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'at_risk', 'is_active' => true]);

        [$nrc, $user] = $this->createNrcWithStudents();

        $this->service->activate($nrc, $user);

        $this->assertDatabaseHas('nrcs', ['id' => $nrc->id, 'status' => 'surveying']);
    }

    public function test_close_survey_sets_status_to_closed(): void
    {
        $user = User::factory()->create();
        $nrc  = Nrc::factory()->create(['uploaded_by' => $user->id]);

        $survey = Survey::factory()->create(['nrc_id' => $nrc->id, 'status' => 'active']);

        $this->service->closeSurvey($survey);

        $this->assertDatabaseHas('surveys', ['id' => $survey->id, 'status' => 'closed']);
    }

    public function test_inactive_questions_are_not_copied_to_survey(): void
    {
        QuestionBank::factory()->count(2)->create(['target_group' => 'high', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'high', 'is_active' => false]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'medium', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'at_risk', 'is_active' => true]);

        [$nrc, $user] = $this->createNrcWithStudents();

        $this->service->activate($nrc, $user);

        // high: 2 active (inactive one ignored), medium: 1, at_risk: 1 = 4 total
        $this->assertDatabaseCount('survey_questions', 4);
    }

    public function test_tokens_are_unique_per_student_survey(): void
    {
        QuestionBank::factory()->count(1)->create(['target_group' => 'high', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'medium', 'is_active' => true]);
        QuestionBank::factory()->count(1)->create(['target_group' => 'at_risk', 'is_active' => true]);

        [$nrc, $user] = $this->createNrcWithStudents();
        $this->service->activate($nrc, $user);

        $tokens = SurveyAccessToken::pluck('token');
        $this->assertEquals($tokens->count(), $tokens->unique()->count());
    }
}
