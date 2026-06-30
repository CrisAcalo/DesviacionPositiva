<?php

namespace App\Policies;

use App\Models\Nrc;
use App\Models\User;

class NrcPolicy
{
    public function view(User $user, Nrc $nrc): bool
    {
        return $user->hasRole('admin')
            || $user->hasRole('coordinator')
            || $nrc->uploaded_by === $user->id;
    }

    public function delete(User $user, Nrc $nrc): bool
    {
        return $user->hasRole('admin')
            || $user->hasRole('coordinator')
            || $nrc->uploaded_by === $user->id;
    }
}
