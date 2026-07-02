<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\SurveyAccessToken;

class SurveyTokenUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tokenData;
    private $nrcId;

    public function __construct(SurveyAccessToken $token)
    {
        $this->nrcId = $token->survey->nrc_id;
        
        $this->tokenData = [
            'id'            => $token->id,
            'group'         => $token->survey->group,
            'token'         => $token->token,
            'email'         => $token->student->email,
            'used'          => $token->isUsed(),
            'opened'        => !is_null($token->opened_at),
            'survey_open'   => $token->survey->isOpen(),
            'url'           => route('survey.respond', $token->token),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('nrc.' . $this->nrcId),
        ];
    }
}
