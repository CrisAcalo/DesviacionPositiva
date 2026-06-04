<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSurveyResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'responses'   => ['required', 'array', 'min:1'],
            'responses.*' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'responses.required' => 'Debes responder al menos una pregunta.',
            'responses.*.required' => 'Todas las preguntas son obligatorias.',
        ];
    }
}
