<?php

namespace Tests\Feature;

use App\Models\Nrc;
use App\Models\Student;
use App\Models\Survey;
use App\Models\SurveyAccessToken;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyResponseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    private function createSurveyWithToken(array $surveyAttrs = [], array $tokenAttrs = []): array
    {
        $user    = User::factory()->create();
        $nrc     = Nrc::factory()->create(['uploaded_by' => $user->id, 'status' => 'surveying']);
        $survey  = Survey::factory()->create(array_merge(['nrc_id' => $nrc->id, 'status' => 'active'], $surveyAttrs));
        $q1      = SurveyQuestion::factory()->create(['survey_id' => $survey->id, 'type' => 'single_choice']);
        $q2      = SurveyQuestion::factory()->create(['survey_id' => $survey->id, 'type' => 'likert']);
        $student = Student::factory()->create(['nrc_id' => $nrc->id]);
        $token   = SurveyAccessToken::factory()->create(array_merge([
            'student_id' => $student->id,
            'survey_id'  => $survey->id,
        ], $tokenAttrs));

        return compact('nrc', 'survey', 'student', 'token', 'q1', 'q2');
    }

    public function test_student_can_view_survey_via_token(): void
    {
        ['token' => $token, 'survey' => $survey] = $this->createSurveyWithToken();

        $response = $this->get("/encuesta/{$token->token}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('surveys/respond')
            ->where('state', 'open')
        );
    }

    public function test_used_token_shows_used_state(): void
    {
        ['token' => $token] = $this->createSurveyWithToken([], ['used_at' => now()]);

        $response = $this->get("/encuesta/{$token->token}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('state', 'used')
        );
    }

    public function test_closed_survey_shows_closed_state(): void
    {
        ['token' => $token] = $this->createSurveyWithToken(['status' => 'closed']);

        $response = $this->get("/encuesta/{$token->token}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('state', 'closed')
        );
    }

    public function test_expired_token_shows_closed_state(): void
    {
        ['token' => $token] = $this->createSurveyWithToken([], ['expires_at' => now()->subHour()]);

        $response = $this->get("/encuesta/{$token->token}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('state', 'closed')
        );
    }

    public function test_student_can_submit_responses(): void
    {
        ['token' => $token, 'q1' => $q1, 'q2' => $q2] = $this->createSurveyWithToken();

        $response = $this->post("/encuesta/{$token->token}", [
            'responses' => [
                $q1->id => 'option_a',
                $q2->id => '4',
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('survey_responses', 2);
        $this->assertDatabaseHas('survey_access_tokens', ['id' => $token->id, 'used_at' => now()]);
    }

    public function test_second_submission_with_used_token_is_rejected(): void
    {
        ['token' => $token, 'q1' => $q1, 'q2' => $q2] = $this->createSurveyWithToken([], ['used_at' => now()]);

        $response = $this->post("/encuesta/{$token->token}", [
            'responses' => [$q1->id => 'x', $q2->id => '1'],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('token');
        $this->assertDatabaseCount('survey_responses', 0);
    }

    public function test_submission_to_closed_survey_is_rejected(): void
    {
        ['token' => $token, 'q1' => $q1] = $this->createSurveyWithToken(['status' => 'closed']);

        $response = $this->post("/encuesta/{$token->token}", [
            'responses' => [$q1->id => 'x'],
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('token');
    }

    public function test_responses_require_at_least_one_answer(): void
    {
        ['token' => $token] = $this->createSurveyWithToken();

        $response = $this->post("/encuesta/{$token->token}", [
            'responses' => [],
        ]);

        $response->assertSessionHasErrors('responses');
    }

    public function test_invalid_token_returns_404(): void
    {
        $response = $this->get('/encuesta/este-token-no-existe');
        $response->assertNotFound();
    }
}
