<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class ValidEcuadorianCedula implements Rule
{
    public function passes($attribute, $value): bool
    {
        // Debe ser exactamente 10 dígitos
        if (!preg_match('/^\d{10}$/', $value)) {
            return false;
        }

        // Códigos de provincia (primeros 2 dígitos)
        $provincia = (int) substr($value, 0, 2);
        if ($provincia < 1 || $provincia > 24) {
            return false;
        }

        // El tercer dígito para cédulas de personas naturales debe ser < 6
        $tercerDigito = (int) substr($value, 2, 1);
        if ($tercerDigito >= 6) {
            return false;
        }

        // Algoritmo módulo 10
        $coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $sum = 0;

        for ($i = 0; $i < 9; $i++) {
            $digit = (int) substr($value, $i, 1);
            $product = $digit * $coef[$i];
            $sum += ($product >= 10) ? ($product - 9) : $product;
        }

        $verifier = (10 - ($sum % 10)) % 10;
        $cedula_verifier = (int) substr($value, 9, 1);

        return $verifier === $cedula_verifier;
    }

    public function message(): string
    {
        return 'La cédula ingresada no es válida. Por favor verifica el número.';
    }
}
