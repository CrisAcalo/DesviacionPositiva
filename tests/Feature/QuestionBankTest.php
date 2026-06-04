<?php

namespace Tests\Feature;

use App\Models\QuestionBank;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionBankTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    private function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function validQuestionData(array $overrides = []): array
    {
        return array_merge([
            'question_text' => '¿Con qué frecuencia estudias fuera de clase?',
            'type'          => 'likert',
            'target_group'  => 'high',
            'options'       => [
                ['value' => '1', 'label' => 'Nunca'],
                ['value' => '2', 'label' => 'A veces'],
                ['value' => '3', 'label' => 'Siempre'],
            ],
            'order'     => 1,
            'is_active' => true,
        ], $overrides);
    }

    public function test_admin_can_view_question_bank(): void
    {
        $this->actingAs($this->adminUser())
            ->get('/question-bank')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('question-bank/index'));
    }

    public function test_unauthenticated_user_cannot_view_question_bank(): void
    {
        $this->get('/question-bank')->assertRedirect('/login');
    }

    public function test_admin_can_create_question(): void
    {
        $response = $this->actingAs($this->adminUser())
            ->post('/question-bank', $this->validQuestionData());

        $response->assertRedirect('/question-bank');
        $this->assertDatabaseHas('question_bank', [
            'question_text' => '¿Con qué frecuencia estudias fuera de clase?',
            'target_group'  => 'high',
            'type'          => 'likert',
        ]);
    }

    public function test_create_question_requires_at_least_two_options(): void
    {
        $response = $this->actingAs($this->adminUser())
            ->post('/question-bank', $this->validQuestionData([
                'options' => [['value' => '1', 'label' => 'Solo una']],
            ]));

        $response->assertSessionHasErrors('options');
    }

    public function test_create_question_rejects_invalid_type(): void
    {
        $response = $this->actingAs($this->adminUser())
            ->post('/question-bank', $this->validQuestionData(['type' => 'open_text']));

        $response->assertSessionHasErrors('type');
    }

    public function test_admin_can_update_question(): void
    {
        $question = QuestionBank::factory()->create(['target_group' => 'high']);

        $this->actingAs($this->adminUser())
            ->put("/question-bank/{$question->id}", $this->validQuestionData([
                'question_text' => 'Pregunta actualizada',
            ]))
            ->assertRedirect('/question-bank');

        $this->assertDatabaseHas('question_bank', ['id' => $question->id, 'question_text' => 'Pregunta actualizada']);
    }

    public function test_admin_can_delete_question(): void
    {
        $question = QuestionBank::factory()->create();

        $this->actingAs($this->adminUser())
            ->delete("/question-bank/{$question->id}")
            ->assertRedirect('/question-bank');

        $this->assertDatabaseMissing('question_bank', ['id' => $question->id]);
    }

    public function test_coordinator_can_create_question(): void
    {
        $coordinator = User::factory()->create();
        $coordinator->assignRole('coordinator');

        $this->actingAs($coordinator)
            ->post('/question-bank', $this->validQuestionData())
            ->assertRedirect('/question-bank');

        $this->assertDatabaseCount('question_bank', 1);
    }

    public function test_teacher_cannot_access_question_bank(): void
    {
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');

        $this->actingAs($teacher)
            ->get('/question-bank')
            ->assertForbidden();
    }
}
