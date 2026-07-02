<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('nrc.{nrcId}', function (\App\Models\User $user, int $nrcId) {
    $nrc = \App\Models\Nrc::find($nrcId);
    return $nrc && $user->can('view', $nrc);
});
