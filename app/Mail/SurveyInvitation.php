<?php

namespace App\Mail;

use App\Models\SurveyAccessToken;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SurveyInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly SurveyAccessToken $accessToken,
        public readonly string $surveyUrl,
        public readonly string $nrcCode,
        public readonly string $subjectName,
        public readonly string $groupLabel,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Encuesta de desviación positiva — {$this->subjectName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.survey-invitation',
        );
    }
}
