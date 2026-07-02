<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ActivateSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'closes_at' => ['nullable', 'date', 'after:now'],
            'question_limit' => ['nullable', 'integer', 'min:1'],
            'question_selection' => ['required', 'string', 'in:ordered,random'],
            'questions_per_page' => ['required', 'integer', 'min:0'],
            'groups' => ['required', 'array', 'min:1'],
            'groups.*' => ['string', 'in:high,medium,at_risk'],
        ];
    }

    public function messages(): array
    {
        return [
            'closes_at.after' => 'La fecha de cierre debe ser posterior al momento actual.',
            'question_limit.min' => 'El límite de preguntas debe ser al menos 1.',
            'questions_per_page.min' => 'Las preguntas por página no pueden ser negativas.',
        ];
    }
}
