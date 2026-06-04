<?php

namespace App\Services;

use App\Jobs\ImportGradesJob;
use App\Models\Grade;
use App\Models\Nrc;
use App\Models\Student;
use App\Rules\ValidEcuadorianCedula;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\HeadingRowImport;

class GradeImportService
{
    private const LARGE_FILE_THRESHOLD = 100;

    // Columnas requeridas (nombre normalizado interno)
    private const REQUIRED_FIELDS = ['identifier', 'partial_1', 'partial_2', 'partial_3'];

    // Mapeo de nombres de columna del archivo → campo interno
    private const HEADER_MAP = [
        'cedula'    => 'identifier',
        'cédula'    => 'identifier',
        'email'     => 'email',
        'correo'    => 'email',
        'parcial_1' => 'partial_1',
        'parcial_2' => 'partial_2',
        'parcial_3' => 'partial_3',
    ];

    public function parseFile(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());

        return in_array($ext, ['xlsx', 'xls'])
            ? $this->parseExcel($file)
            : $this->parseCsv($file);
    }

    private function parseCsv(UploadedFile $file): array
    {
        $content = file_get_contents($file->getRealPath());
        $content = ltrim($content, "\xEF\xBB\xBF");
        $content = str_replace(["\r\n", "\r"], "\n", $content);
        $lines   = array_values(array_filter(explode("\n", trim($content))));

        if (empty($lines)) {
            return ['rows' => [], 'errors' => ['El archivo está vacío.']];
        }

        $headerLine = $lines[0];
        $delimiter  = substr_count($headerLine, ';') > substr_count($headerLine, ',') ? ';' : ',';
        $rawHeaders = array_map(fn ($h) => strtolower(trim($h)), str_getcsv($headerLine, $delimiter));
        $mapped     = array_map(fn ($h) => self::HEADER_MAP[$h] ?? $h, $rawHeaders);

        $missing = array_diff(self::REQUIRED_FIELDS, $mapped);
        if (! empty($missing)) {
            return [
                'rows'   => [],
                'errors' => ['Faltan columnas requeridas: '.implode(', ', $missing).'. El archivo debe tener: cedula, parcial_1, parcial_2, parcial_3.'],
            ];
        }

        $rows   = [];
        $errors = [];

        foreach (array_slice($lines, 1) as $i => $line) {
            $lineNumber = $i + 2;
            $values     = str_getcsv($line, $delimiter);

            if (count($values) !== count($rawHeaders)) {
                $errors[] = "Línea {$lineNumber}: columnas incorrectas (esperadas ".count($rawHeaders).', encontradas '.count($values).').';
                continue;
            }

            $row = [];
            foreach (array_flip($mapped) as $field => $idx) {
                $row[$field] = trim($values[$idx] ?? '');
            }

            $result = $this->validateRow($row, $lineNumber);
            isset($result['error']) ? $errors[] = $result['error'] : $rows[] = $result['row'];
        }

        return ['rows' => $rows, 'errors' => $errors];
    }

    private function parseExcel(UploadedFile $file): array
    {
        $rawData = Excel::toArray(new HeadingRowImport, $file)[0] ?? [];

        if (empty($rawData)) {
            return ['rows' => [], 'errors' => ['El archivo Excel está vacío.']];
        }

        // Verificar columnas requeridas
        $excelHeaders = array_keys($rawData[0] ?? []);
        $mapped       = array_map(fn ($h) => self::HEADER_MAP[strtolower(trim($h))] ?? strtolower(trim($h)), $excelHeaders);
        $missing      = array_diff(self::REQUIRED_FIELDS, $mapped);

        if (! empty($missing)) {
            return [
                'rows'   => [],
                'errors' => ['Faltan columnas requeridas: '.implode(', ', $missing).'. El archivo debe tener: cedula, parcial_1, parcial_2, parcial_3.'],
            ];
        }

        $rows   = [];
        $errors = [];

        foreach ($rawData as $i => $row) {
            $lineNumber = $i + 2;
            $normalized = [];

            foreach ($row as $key => $value) {
                $field               = self::HEADER_MAP[strtolower(trim($key))] ?? strtolower(trim($key));
                $normalized[$field]  = trim((string) ($value ?? ''));
            }

            $result = $this->validateRow($normalized, $lineNumber);
            isset($result['error']) ? $errors[] = $result['error'] : $rows[] = $result['row'];
        }

        return ['rows' => $rows, 'errors' => $errors];
    }

    private function validateRow(array $row, int $lineNumber): array
    {
        if (empty($row['identifier'])) {
            return ['error' => "Línea {$lineNumber}: la cédula no puede estar vacía."];
        }

        // Validar cédula ecuatoriana
        $validator = \Illuminate\Support\Facades\Validator::make(
            ['cedula' => $row['identifier']],
            ['cedula' => [new ValidEcuadorianCedula()]]
        );

        if ($validator->fails()) {
            return ['error' => "Línea {$lineNumber}: La cédula '{$row['identifier']}' no es válida."];
        }

        $rowErrors = [];
        $grades    = [];

        foreach (['partial_1', 'partial_2', 'partial_3'] as $field) {
            $raw = $row[$field] ?? '';

            if ($raw === '') {
                $rowErrors[] = "'{$field}' está vacío";
                continue;
            }

            if (! is_numeric($raw)) {
                $rowErrors[] = "'{$field}' no es numérico";
                continue;
            }

            $val = (float) $raw;

            if ($val < 0 || $val > 20) {
                $rowErrors[] = "'{$field}' debe estar entre 0 y 20";
                continue;
            }

            $grades[$field] = $val;
        }

        if (! empty($rowErrors)) {
            return ['error' => "Línea {$lineNumber}: ".implode(', ', $rowErrors).'.'];
        }

        $finalGrade = round(
            ($grades['partial_1'] + $grades['partial_2'] + $grades['partial_3']) / 3,
            2
        );

        $email = isset($row['email']) && $row['email'] !== '' ? $row['email'] : null;

        return [
            'row' => [
                'identifier'  => $row['identifier'],
                'email'       => $email,
                'partial_1'   => $grades['partial_1'],
                'partial_2'   => $grades['partial_2'],
                'partial_3'   => $grades['partial_3'],
                'final_grade' => $finalGrade,
            ],
        ];
    }

    public function import(Nrc $nrc, array $rows): void
    {
        DB::transaction(function () use ($nrc, $rows) {
            foreach ($rows as $row) {
                $hash = hash('sha3-256', $row['identifier'].config('app.key'));

                $student = Student::firstOrCreate(
                    ['identifier_hash' => $hash, 'nrc_id' => $nrc->id],
                    ['uuid' => Str::uuid()->toString(), 'email' => $row['email'] ?? null]
                );

                Grade::firstOrCreate(
                    ['student_id' => $student->id, 'nrc_id' => $nrc->id],
                    [
                        'partial_1'   => $row['partial_1'],
                        'partial_2'   => $row['partial_2'],
                        'partial_3'   => $row['partial_3'],
                        'final_grade' => $row['final_grade'],
                        'locked_at'   => now(),
                    ]
                );
            }
        });
    }

    public function importFromFile(Nrc $nrc, UploadedFile $file): array
    {
        $parsed = $this->parseFile($file);

        if (! empty($parsed['errors'])) {
            return $parsed;
        }

        if (count($parsed['rows']) > self::LARGE_FILE_THRESHOLD) {
            $path = "imports/nrc_{$nrc->id}_".time().'.json';
            Storage::put($path, json_encode($parsed['rows']));
            ImportGradesJob::dispatch($nrc, $path);

            return ['rows' => $parsed['rows'], 'errors' => [], 'queued' => true];
        }

        $this->import($nrc, $parsed['rows']);

        return ['rows' => $parsed['rows'], 'errors' => [], 'queued' => false];
    }
}
