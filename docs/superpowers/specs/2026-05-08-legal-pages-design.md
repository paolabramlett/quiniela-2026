# Legal Pages Design

## Goal

Add Términos y Condiciones and Política de Privacidad pages accessible from the login screen, before the user authenticates.

## Routes & Access

- `/terminos` — public, no auth required
- `/privacidad` — public, no auth required
- Both added as bare `<Route>` entries in `App.jsx` alongside `/login`
- Login page footer link: "Al continuar, aceptas nuestros **Términos y Condiciones** y **Política de Privacidad**"

## New Files

- `src/components/Legal/TermsPage.jsx`
- `src/components/Legal/PrivacyPage.jsx`

## Modified Files

- `src/App.jsx` — add `/terminos` and `/privacidad` routes
- `src/components/Auth/LoginPage.jsx` — add footer links below the sign-in button

## Page Layout

Dark themed, consistent with the rest of the app:
- Same `bg-bg` background
- Max-width container, centered, padded
- `font-display` heading, white body text, `text-gray-400` for secondary text
- Back link at the top: "← Volver" routes back to `/login`
- Last updated date shown below heading

---

## Términos y Condiciones — Content

**Last updated:** 8 de mayo de 2026

### 1. Aceptación de los Términos
Al acceder y usar Quiniela 26 ("el Servicio"), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al Servicio.

### 2. Descripción del Servicio
Quiniela 26 es una plataforma de predicciones deportivas para el FIFA World Cup 2026™. El Servicio permite a los usuarios registrar predicciones de partidos, unirse a grupos privados y competir en clasificaciones. **Quiniela 26 no es un servicio de apuestas ni de juegos de azar con dinero real.** Ningún premio en efectivo está garantizado ni ofrecido.

### 3. Elegibilidad
Debes tener al menos 18 años de edad para utilizar el Servicio. Al registrarte, declaras y garantizas que cumples con este requisito de edad.

### 4. Registro y Cuenta
El acceso al Servicio se realiza mediante autenticación con Google (OAuth 2.0). Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran bajo ella. Nos reservamos el derecho de cancelar cuentas que violen estos términos.

### 5. Pagos
Ciertas funciones del Servicio, como la creación de grupos, requieren un pago único en pesos mexicanos (MXN) procesado por Stripe. **Todos los pagos son definitivos y no reembolsables**, salvo lo dispuesto por la legislación mexicana aplicable. No se realizan cargos recurrentes ni suscripciones automáticas.

### 6. Propiedad Intelectual
El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de los operadores de Quiniela 26. No puedes reproducir, distribuir ni crear obras derivadas sin autorización expresa por escrito.

### 7. Conducta del Usuario
Al usar el Servicio, aceptas no: (a) usar el Servicio para fines ilegales; (b) intentar acceder a cuentas de otros usuarios; (c) interferir con el funcionamiento del Servicio; (d) publicar contenido ofensivo, difamatorio o que infrinja derechos de terceros.

### 8. Exactitud de la Información
Las predicciones, resultados y clasificaciones son de carácter informativo y recreativo. No garantizamos la exactitud, integridad o puntualidad de la información de partidos proveniente de fuentes de datos externas (football-data.org).

### 9. Limitación de Responsabilidad
En la máxima medida permitida por la ley mexicana aplicable, Quiniela 26 y sus operadores no serán responsables por: (a) pérdidas indirectas, incidentales o consecuentes; (b) interrupciones del servicio; (c) errores en datos de partidos o resultados; (d) decisiones tomadas con base en la información del Servicio. El Servicio se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo.

### 10. Modificaciones
Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al ser publicados en el Servicio. El uso continuado del Servicio tras la publicación de cambios constituye aceptación de los nuevos términos.

### 11. Terminación
Podemos suspender o cancelar tu acceso al Servicio de forma inmediata, sin previo aviso, por incumplimiento de estos Términos.

### 12. Legislación Aplicable
Estos Términos se regirán e interpretarán de conformidad con las leyes de los Estados Unidos Mexicanos. Cualquier disputa se someterá a la jurisdicción exclusiva de los tribunales competentes de la Ciudad de México.

### 13. Contacto
Para preguntas sobre estos Términos, contáctanos en: paolabramlett@gmail.com

---

## Política de Privacidad — Content

**Last updated:** 8 de mayo de 2026

### 1. Responsable del Tratamiento
Quiniela 26 es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.

### 2. Datos que Recopilamos
Al usar el Servicio, recopilamos:

**Datos proporcionados por Google (OAuth):**
- Nombre y apellido
- Dirección de correo electrónico
- Foto de perfil pública

**Datos generados por el uso del Servicio:**
- Predicciones de partidos y resultados
- Membresías a grupos
- Historial de pagos (referencia de transacción, producto comprado, fecha)

**Datos técnicos:**
- No recopilamos direcciones IP, cookies de seguimiento ni datos de comportamiento de navegación más allá de lo estrictamente necesario para el funcionamiento del Servicio.

### 3. Finalidad del Tratamiento
Tus datos son utilizados para: (a) autenticarte en el Servicio; (b) mostrar tu perfil y predicciones; (c) calcular clasificaciones; (d) procesar pagos; (e) enviarte comunicaciones relacionadas con el Servicio si das tu consentimiento.

### 4. Terceros con Acceso a tus Datos

| Proveedor | Propósito | Política de privacidad |
|-----------|-----------|----------------------|
| Google LLC | Autenticación OAuth | [policies.google.com](https://policies.google.com) |
| Supabase Inc. | Base de datos y autenticación | [supabase.com/privacy](https://supabase.com/privacy) |
| Stripe Inc. | Procesamiento de pagos | [stripe.com/privacy](https://stripe.com/privacy) |
| Netlify Inc. | Hospedaje de la aplicación | [netlify.com/privacy](https://www.netlify.com/privacy/) |

No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales o publicitarios.

### 5. Conservación de Datos
Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento escribiéndonos a paolabramlett@gmail.com. Los datos de transacciones de pago se conservan durante el plazo mínimo requerido por la legislación fiscal mexicana (5 años).

### 6. Tus Derechos (ARCO)
Conforme a la LFPDPPP, tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al tratamiento de tus datos personales (derechos ARCO). Para ejercer estos derechos, contáctanos en: paolabramlett@gmail.com. Responderemos en un plazo máximo de 20 días hábiles.

### 7. Seguridad
Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito (HTTPS/TLS) y en reposo, y control de acceso mediante Row Level Security en nuestra base de datos. Sin embargo, ningún sistema de transmisión por internet es 100% seguro.

### 8. Transferencias Internacionales
Al usar servicios de Google, Supabase, Stripe y Netlify, tus datos pueden ser procesados en servidores ubicados fuera de México. Estos proveedores cuentan con certificaciones y marcos de privacidad que garantizan niveles de protección adecuados.

### 9. Menores de Edad
El Servicio no está dirigido a personas menores de 18 años y no recopilamos intencionalmente datos de menores. Si detectamos que un menor ha proporcionado datos personales, los eliminaremos de inmediato.

### 10. Modificaciones
Podemos actualizar esta Política de Privacidad periódicamente. Notificaremos cambios significativos publicando la nueva versión en el Servicio con la fecha de actualización.

### 11. Contacto y Aviso de Privacidad
Para cualquier consulta sobre el tratamiento de tus datos personales o para ejercer tus derechos ARCO: **paolabramlett@gmail.com**
