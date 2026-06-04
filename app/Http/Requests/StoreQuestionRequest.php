<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_text'          => ['required', 'string', 'max:500'],
            'type'                   => ['required', 'in:likert,single_choice,multiple_choice'],
            'target_group'           => ['required', 'in:high,medium,at_risk'],
            'options'                => ['required', 'array', 'min:2', 'max:10'],
            'options.*.value'        => ['required', 'string', 'max:50'],
            'options.*.label'        => ['required', 'string', 'max:150'],
            'order'                  => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active'              => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'options.min' => 'Una pregunta debe tener al menos 2 opciones de respuesta.',
            'options.max' => 'Una pregunta no puede tener más de 10 opciones de respuesta.',
        ];
    }
}
