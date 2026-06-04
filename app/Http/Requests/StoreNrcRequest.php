<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNrcRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'coordinator']);
    }

    public function rules(): array
    {
        return [
            'academic_period'        => ['required', 'string', 'max:255'],
            'uploads'                => ['required', 'array', 'min:1', 'max:20'],
            'uploads.*.code'         => ['required', 'string', 'max:20', 'distinct', 'unique:nrcs,code'],
            'uploads.*.subject_id'   => ['required', 'integer', 'exists:subjects,id'],
            'uploads.*.career_id'    => ['required', 'integer', 'exists:careers,id'],
            'files'                  => ['required', 'array', 'min:1'],
            'files.*'                => ['required', 'file', 'mimes:csv,txt,xlsx,xls', 'max:5120'],
        ];
    }

    public function attributes(): array
    {
        return [
            'academic_period'      => 'período académico',
            'uploads.*.code'       => 'código NRC',
            'uploads.*.subject_id' => 'materia',
            'uploads.*.career_id'  => 'carrera',
            'files.*'              => 'archivo',
        ];
    }
}
