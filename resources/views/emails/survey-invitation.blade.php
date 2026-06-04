<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encuesta de desviación positiva</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; padding: 0 16px; }
        .card { background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; }
        .header { background: #1d4ed8; padding: 28px 36px; }
        .header-title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
        .header-sub { color: #bfdbfe; font-size: 13px; margin: 4px 0 0; }
        .body { padding: 36px; color: #374151; font-size: 15px; line-height: 1.7; }
        .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;
                 padding: 5px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .info-row { margin-bottom: 6px; font-size: 14px; color: #6b7280; }
        .info-row strong { color: #374151; }
        .divider { height: 1px; background: #f3f4f6; margin: 24px 0; }
        .cta { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #1d4ed8; color: #ffffff !important; text-decoration: none;
               padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: .3px; }
        .notice { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px;
                  font-size: 13px; color: #6b7280; margin-top: 28px; }
        .notice strong { color: #374151; }
        .footer { padding: 20px 36px; text-align: center; font-size: 12px; color: #9ca3af;
                  border-top: 1px solid #f3f4f6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <p class="header-title">Desviación Positiva ESPE</p>
                <p class="header-sub">Plataforma de identificación de desviantes positivos</p>
            </div>

            <div class="body">
                <p>Hola,</p>
                <p>
                    Has sido invitado/a a participar en la encuesta de <strong>desviación positiva</strong>
                    correspondiente a la siguiente materia:
                </p>

                <div class="info-row"><strong>Materia:</strong> {{ $subjectName }}</div>
                <div class="info-row"><strong>NRC:</strong> {{ $nrcCode }}</div>
                <div class="badge">Grupo: {{ $groupLabel }}</div>

                <p>
                    Tu participación es <strong>anónima y confidencial</strong>. Las respuestas se utilizan
                    exclusivamente para identificar estrategias de estudio exitosas y apoyar a estudiantes
                    que lo necesitan.
                </p>

                <div class="cta">
                    <a href="{{ $surveyUrl }}" class="btn">Completar encuesta &rarr;</a>
                </div>

                <div class="divider"></div>

                <div class="notice">
                    <strong>Importante:</strong> Este enlace es de uso personal y único — no lo compartas
                    con otras personas.
                    @if($accessToken->expires_at)
                        Expira el <strong>{{ $accessToken->expires_at->format('d/m/Y H:i') }}</strong>.
                    @endif
                    Si ya respondiste la encuesta, puedes ignorar este mensaje.
                </div>
            </div>

            <div class="footer">
                Este correo fue enviado automáticamente por la plataforma Desviación Positiva ESPE.<br>
                No respondas a este mensaje.
            </div>
        </div>
    </div>
</body>
</html>
