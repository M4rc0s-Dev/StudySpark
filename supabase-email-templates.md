# Supabase Email Templates (HTML)

Configure these in **Supabase Dashboard → Authentication → Email Templates**.

---

## 1. Reset Password (Recuperar contraseña)

**Subject:** `Restablece tu contraseña - StudySpark`

**HTML Body:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablece tu contraseña</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Logo / Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:#f97316;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(249,115,22,0.3);">
                <span style="font-size:24px;font-weight:800;color:#ffffff;line-height:1;">S</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#1e293b;text-align:center;line-height:1.3;">
          Restablece tu contraseña
        </h1>

        <!-- Subtitle -->
        <p style="margin:0 0 28px;font-size:15px;color:#64748b;text-align:center;line-height:1.6;">
          Has solicitado restablecer la contraseña de tu cuenta StudySpark.
          Pulsa el botón de abajo para crear una nueva.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr>
            <td style="text-align:center;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(249,115,22,0.3);transition:background 0.2s;">
                Cambiar mi contraseña
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry notice -->
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
          Este enlace expira en <strong>1 hora</strong> por seguridad.
        </p>

        <!-- Divider -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

        <!-- Fallback link -->
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-align:center;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:
        </p>
        <p style="margin:0;font-size:12px;color:#f97316;text-align:center;word-break:break-all;">
          <a href="{{ .ConfirmationURL }}" style="color:#f97316;text-decoration:underline;">{{ .ConfirmationURL }}</a>
        </p>

        <!-- Footer -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
          Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
        </p>
      </td>
    </tr>

    <!-- Footer links -->
    <tr>
      <td style="padding-top:20px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">
          StudySpark &middot; <a href="https://studyspark.app" style="color:#f97316;text-decoration:none;">studyspark.app</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Change Email (Cambiar correo electrónico)

**Subject:** `Confirma tu nuevo correo - StudySpark`

**HTML Body:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu nuevo correo</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Logo / Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:#f97316;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(249,115,22,0.3);">
                <span style="font-size:24px;font-weight:800;color:#ffffff;line-height:1;">S</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#1e293b;text-align:center;line-height:1.3;">
          Confirma tu nuevo correo
        </h1>

        <!-- Subtitle -->
        <p style="margin:0 0 16px;font-size:15px;color:#64748b;text-align:center;line-height:1.6;">
          Has solicitado cambiar el correo de tu cuenta a:
        </p>
        <p style="margin:0 0 28px;font-size:16px;font-weight:600;color:#1e293b;text-align:center;">
          {{ .Email }}
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr>
            <td style="text-align:center;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(249,115,22,0.3);transition:background 0.2s;">
                Confirmar nuevo correo
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry notice -->
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
          Este enlace expira en <strong>1 hora</strong> por seguridad.
        </p>

        <!-- Divider -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

        <!-- Fallback link -->
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-align:center;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:
        </p>
        <p style="margin:0;font-size:12px;color:#f97316;text-align:center;word-break:break-all;">
          <a href="{{ .ConfirmationURL }}" style="color:#f97316;text-decoration:underline;">{{ .ConfirmationURL }}</a>
        </p>

        <!-- Footer -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
          Si no solicitaste esto, ignora este correo. Tu correo actual no cambiará.
        </p>
      </td>
    </tr>

    <!-- Footer links -->
    <tr>
      <td style="padding-top:20px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">
          StudySpark &middot; <a href="https://studyspark.app" style="color:#f97316;text-decoration:none;">studyspark.app</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Sign Up / Magic Link (Confirmar registro)

**Subject:** `Confirma tu cuenta - StudySpark`

**HTML Body:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Logo / Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <div style="display:inline-block;width:56px;height:56px;border-radius:14px;background:#f97316;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(249,115,22,0.3);">
                <span style="font-size:24px;font-weight:800;color:#ffffff;line-height:1;">S</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#1e293b;text-align:center;line-height:1.3;">
          Bienvenido a StudySpark
        </h1>

        <!-- Subtitle -->
        <p style="margin:0 0 28px;font-size:15px;color:#64748b;text-align:center;line-height:1.6;">
          Confirma tu correo para activar tu cuenta y empezar a crear flashcards.
        </p>

        <!-- CTA Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
          <tr>
            <td style="text-align:center;">
              <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:12px;box-shadow:0 4px 14px rgba(249,115,22,0.3);transition:background 0.2s;">
                Confirmar mi cuenta
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry notice -->
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
          Este enlace expira en <strong>1 hora</strong> por seguridad.
        </p>

        <!-- Divider -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

        <!-- Fallback link -->
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-align:center;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:
        </p>
        <p style="margin:0;font-size:12px;color:#f97316;text-align:center;word-break:break-all;">
          <a href="{{ .ConfirmationURL }}" style="color:#f97316;text-decoration:underline;">{{ .ConfirmationURL }}</a>
        </p>

        <!-- Footer -->
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
          Si no creaste esta cuenta, ignora este correo.
        </p>
      </td>
    </tr>

    <!-- Footer links -->
    <tr>
      <td style="padding-top:20px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">
          StudySpark &middot; <a href="https://studyspark.app" style="color:#f97316;text-decoration:none;">studyspark.app</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## ⚙️ Configuración en Supabase Dashboard

1. Ve a **Authentication → Email Templates**
2. Para cada tipo (Reset Password, Change Email, Confirm Signup):
   - Copia el HTML correspondiente
   - Asegúrate de que **Redirect URL** esté configurada correctamente:
     - Reset Password: `https://tudominio.com/reset-password`
     - Change Email: `https://tudominio.com/auth/confirm` (o tu ruta de confirmación)
     - Confirm Signup: `https://tudominio.com/auth/confirm?next=library` (o donde quieras que aterricen)
3. Guarda los cambios

---

## 🔧 Variables disponibles en Supabase

| Variable | Descripción |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Enlace completo con token/code |
| `{{ .Email }}` | Email del usuario (solo en Change Email) |
| `{{ .Token }}` | Token OTP (para magic links) |
| `{{ .TokenHash }}` | Hash del token (para recovery) |
| `{{ .SiteURL }}` | URL de tu sitio configurada en Supabase |