# Legal Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public Términos y Condiciones and Política de Privacidad pages accessible from a footer link below the login button.

**Architecture:** Two static page components under `src/components/Legal/`, registered as public routes in `App.jsx`, and linked from a small footer added to `LoginPage.jsx`. No auth required, no DB interaction.

**Tech Stack:** React 18, React Router v6, Tailwind CSS dark theme.

---

## File Structure

**New files:**
- `src/components/Legal/TermsPage.jsx` — Términos y Condiciones static page
- `src/components/Legal/PrivacyPage.jsx` — Política de Privacidad static page
- `src/__tests__/LegalPages.test.jsx` — renders and link tests for both pages

**Modified files:**
- `src/App.jsx` — add `/terminos` and `/privacidad` public routes
- `src/components/Auth/LoginPage.jsx` — add legal footer links below sign-in button

---

## Task 1: TermsPage and PrivacyPage components

**Files:**
- Create: `src/components/Legal/TermsPage.jsx`
- Create: `src/components/Legal/PrivacyPage.jsx`
- Create: `src/__tests__/LegalPages.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/__tests__/LegalPages.test.jsx
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TermsPage from '../components/Legal/TermsPage'
import PrivacyPage from '../components/Legal/PrivacyPage'

describe('TermsPage', () => {
  it('renders the main heading', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /términos y condiciones/i })).toBeInTheDocument()
  })

  it('renders the back link to /login', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute('href', '/login')
  })

  it('renders key legal sections', () => {
    render(<MemoryRouter><TermsPage /></MemoryRouter>)
    expect(screen.getByText(/no es un servicio de apuestas/i)).toBeInTheDocument()
    expect(screen.getByText(/limitación de responsabilidad/i)).toBeInTheDocument()
  })
})

describe('PrivacyPage', () => {
  it('renders the main heading', () => {
    render(<MemoryRouter><PrivacyPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /política de privacidad/i })).toBeInTheDocument()
  })

  it('renders the back link to /login', () => {
    render(<MemoryRouter><PrivacyPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /volver/i })).toHaveAttribute('href', '/login')
  })

  it('renders key privacy sections', () => {
    render(<MemoryRouter><PrivacyPage /></MemoryRouter>)
    expect(screen.getByText(/derechos arco/i)).toBeInTheDocument()
    expect(screen.getByText(/google/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --run
```
Expected: FAIL — `TermsPage` and `PrivacyPage` not found.

- [ ] **Step 3: Create TermsPage**

```jsx
// src/components/Legal/TermsPage.jsx
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/login"
          className="inline-block text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-4xl tracking-wider text-white mb-1">
          TÉRMINOS Y CONDICIONES
        </h1>
        <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-10">
          Última actualización: 8 de mayo de 2026
        </p>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Aceptación de los Términos</h2>
            <p>Al acceder y usar Quiniela 26 ("el Servicio"), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al Servicio.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Descripción del Servicio</h2>
            <p>Quiniela 26 es una plataforma de predicciones deportivas para el FIFA World Cup 2026™. El Servicio permite a los usuarios registrar predicciones de partidos, unirse a grupos privados y competir en clasificaciones. <strong className="text-white">Quiniela 26 no es un servicio de apuestas ni de juegos de azar con dinero real.</strong> Ningún premio en efectivo está garantizado ni ofrecido.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Elegibilidad</h2>
            <p>Debes tener al menos 18 años de edad para utilizar el Servicio. Al registrarte, declaras y garantizas que cumples con este requisito de edad.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Registro y Cuenta</h2>
            <p>El acceso al Servicio se realiza mediante autenticación con Google (OAuth 2.0). Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran bajo ella. Nos reservamos el derecho de cancelar cuentas que violen estos términos.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Pagos</h2>
            <p>Ciertas funciones del Servicio, como la creación de grupos, requieren un pago único en pesos mexicanos (MXN) procesado por Stripe. <strong className="text-white">Todos los pagos son definitivos y no reembolsables</strong>, salvo lo dispuesto por la legislación mexicana aplicable. No se realizan cargos recurrentes ni suscripciones automáticas.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Propiedad Intelectual</h2>
            <p>El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de los operadores de Quiniela 26. No puedes reproducir, distribuir ni crear obras derivadas sin autorización expresa por escrito.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Conducta del Usuario</h2>
            <p>Al usar el Servicio, aceptas no: (a) usar el Servicio para fines ilegales; (b) intentar acceder a cuentas de otros usuarios; (c) interferir con el funcionamiento del Servicio; (d) publicar contenido ofensivo, difamatorio o que infrinja derechos de terceros.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Exactitud de la Información</h2>
            <p>Las predicciones, resultados y clasificaciones son de carácter informativo y recreativo. No garantizamos la exactitud, integridad o puntualidad de la información de partidos proveniente de fuentes de datos externas.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Limitación de Responsabilidad</h2>
            <p>En la máxima medida permitida por la ley mexicana aplicable, Quiniela 26 y sus operadores no serán responsables por: (a) pérdidas indirectas, incidentales o consecuentes; (b) interrupciones del servicio; (c) errores en datos de partidos o resultados; (d) decisiones tomadas con base en la información del Servicio. El Servicio se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">10. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor al ser publicados en el Servicio. El uso continuado del Servicio tras la publicación de cambios constituye aceptación de los nuevos términos.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">11. Terminación</h2>
            <p>Podemos suspender o cancelar tu acceso al Servicio de forma inmediata, sin previo aviso, por incumplimiento de estos Términos.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">12. Legislación Aplicable</h2>
            <p>Estos Términos se regirán e interpretarán de conformidad con las leyes de los Estados Unidos Mexicanos. Cualquier disputa se someterá a la jurisdicción exclusiva de los tribunales competentes de la Ciudad de México.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">13. Contacto</h2>
            <p>Para preguntas sobre estos Términos, contáctanos en: <a href="mailto:paolabramlett@gmail.com" className="text-accent hover:underline">paolabramlett@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create PrivacyPage**

```jsx
// src/components/Legal/PrivacyPage.jsx
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/login"
          className="inline-block text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-4xl tracking-wider text-white mb-1">
          POLÍTICA DE PRIVACIDAD
        </h1>
        <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-10">
          Última actualización: 8 de mayo de 2026
        </p>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Responsable del Tratamiento</h2>
            <p>Quiniela 26 es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Datos que Recopilamos</h2>
            <p className="mb-3"><strong className="text-white">Datos proporcionados por Google (OAuth):</strong> nombre y apellido, dirección de correo electrónico, foto de perfil pública.</p>
            <p className="mb-3"><strong className="text-white">Datos generados por el uso del Servicio:</strong> predicciones de partidos y resultados, membresías a grupos, historial de pagos (referencia de transacción, producto comprado, fecha).</p>
            <p><strong className="text-white">Datos técnicos:</strong> no recopilamos direcciones IP, cookies de seguimiento ni datos de comportamiento de navegación más allá de lo estrictamente necesario para el funcionamiento del Servicio.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Finalidad del Tratamiento</h2>
            <p>Tus datos son utilizados para: (a) autenticarte en el Servicio; (b) mostrar tu perfil y predicciones; (c) calcular clasificaciones; (d) procesar pagos; (e) enviarte comunicaciones relacionadas con el Servicio si das tu consentimiento.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Terceros con Acceso a tus Datos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mt-2">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold uppercase tracking-wider">Proveedor</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-semibold uppercase tracking-wider">Propósito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ['Google LLC', 'Autenticación OAuth'],
                    ['Supabase Inc.', 'Base de datos y autenticación'],
                    ['Stripe Inc.', 'Procesamiento de pagos'],
                    ['Netlify Inc.', 'Hospedaje de la aplicación'],
                  ].map(([provider, purpose]) => (
                    <tr key={provider}>
                      <td className="py-2 pr-4 text-white font-semibold">{provider}</td>
                      <td className="py-2 text-gray-400">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3">No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales o publicitarios.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Conservación de Datos</h2>
            <p>Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento escribiéndonos a <a href="mailto:paolabramlett@gmail.com" className="text-accent hover:underline">paolabramlett@gmail.com</a>. Los datos de transacciones de pago se conservan durante el plazo mínimo requerido por la legislación fiscal mexicana (5 años).</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Tus Derechos (ARCO)</h2>
            <p>Conforme a la LFPDPPP, tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al tratamiento de tus datos personales (<strong className="text-white">Derechos ARCO</strong>). Para ejercer estos derechos, contáctanos en: <a href="mailto:paolabramlett@gmail.com" className="text-accent hover:underline">paolabramlett@gmail.com</a>. Responderemos en un plazo máximo de 20 días hábiles.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Seguridad</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito (HTTPS/TLS) y en reposo, y control de acceso mediante Row Level Security en nuestra base de datos. Sin embargo, ningún sistema de transmisión por internet es 100% seguro.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Transferencias Internacionales</h2>
            <p>Al usar servicios de Google, Supabase, Stripe y Netlify, tus datos pueden ser procesados en servidores ubicados fuera de México. Estos proveedores cuentan con certificaciones y marcos de privacidad que garantizan niveles de protección adecuados.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Menores de Edad</h2>
            <p>El Servicio no está dirigido a personas menores de 18 años y no recopilamos intencionalmente datos de menores. Si detectamos que un menor ha proporcionado datos personales, los eliminaremos de inmediato.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">10. Modificaciones</h2>
            <p>Podemos actualizar esta Política de Privacidad periódicamente. Notificaremos cambios significativos publicando la nueva versión en el Servicio con la fecha de actualización.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">11. Contacto</h2>
            <p>Para cualquier consulta sobre el tratamiento de tus datos personales o para ejercer tus derechos ARCO: <a href="mailto:paolabramlett@gmail.com" className="text-accent hover:underline">paolabramlett@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --run
```
Expected: all tests pass including 6 new LegalPages tests.

- [ ] **Step 6: Commit**

```bash
git add src/components/Legal/TermsPage.jsx src/components/Legal/PrivacyPage.jsx src/__tests__/LegalPages.test.jsx
git commit -m "feat: add TermsPage and PrivacyPage legal components"
```

---

## Task 2: Register public routes and add login footer

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Auth/LoginPage.jsx`

- [ ] **Step 1: Write the failing test**

Add to `src/__tests__/LegalPages.test.jsx`:

```jsx
import LoginPage from '../components/Auth/LoginPage'
import { vi } from 'vitest'

// Mock useAuth for LoginPage
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ signInWithGoogle: vi.fn() }),
}))

describe('LoginPage legal links', () => {
  it('renders Terms link pointing to /terminos', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toHaveAttribute('href', '/terminos')
  })

  it('renders Privacy link pointing to /privacidad', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /política de privacidad/i })).toHaveAttribute('href', '/privacidad')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run
```
Expected: FAIL — links not found in LoginPage.

- [ ] **Step 3: Add routes to App.jsx**

Replace the content of `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import AppLayout from './components/Layout/AppLayout'
import LoginPage from './components/Auth/LoginPage'
import Dashboard from './components/Dashboard/Dashboard'
import PredictionsPage from './components/Predictions/PredictionsPage'
import LeaderboardPage from './components/Leaderboard/LeaderboardPage'
import GroupsPage from './components/Groups/GroupsPage'
import AdminPage from './components/Admin/AdminPage'
import TermsPage from './components/Legal/TermsPage'
import PrivacyPage from './components/Legal/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Add legal footer to LoginPage.jsx**

Replace the closing `</div>` of the sign-in section and the outer div in `src/components/Auth/LoginPage.jsx`. The full file after edit:

```jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Geometric color blocks — WC2026 Together Graphic style */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary" />
        <div className="absolute top-0 right-32 w-32 h-32 bg-gold" />
        <div className="absolute top-32 right-0 w-32 h-32 bg-accent" />
        <div className="absolute top-32 right-32 w-32 h-32 bg-primary opacity-50" />
      </div>
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-15 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent" />
        <div className="absolute bottom-24 left-0 w-24 h-24 bg-gold" />
        <div className="absolute bottom-0 left-24 w-24 h-24 bg-primary opacity-60" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center animate-fade-up">
        {/* Brand */}
        <div className="mb-8">
          <h1 className="font-display text-7xl md:text-9xl tracking-wider text-white leading-none">
            QUINIELA
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="h-px flex-1 max-w-20 bg-line" />
            <span className="font-display text-4xl md:text-6xl text-primary tracking-widest">26</span>
            <div className="h-px flex-1 max-w-20 bg-line" />
          </div>
          <p className="mt-4 text-gray-500 text-sm font-semibold uppercase tracking-[0.2em]">
            Predice · Compite · Gana
          </p>
        </div>

        {/* World Cup label */}
        <div className="mb-10 inline-block border border-line rounded px-4 py-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
            FIFA World Cup 2026™
          </span>
        </div>

        {/* Sign in */}
        <div>
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-3 bg-white text-gray-900 rounded-lg px-6 py-3.5 font-bold text-sm mx-auto hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          {/* Legal footer */}
          <p className="mt-6 text-[11px] text-gray-600 leading-relaxed max-w-xs mx-auto">
            Al continuar, aceptas nuestros{' '}
            <Link to="/terminos" className="text-gray-500 hover:text-white underline underline-offset-2 transition-colors">
              Términos y Condiciones
            </Link>
            {' '}y{' '}
            <Link to="/privacidad" className="text-gray-500 hover:text-white underline underline-offset-2 transition-colors">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --run
```
Expected: all tests pass including 2 new LoginPage legal link tests.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/Auth/LoginPage.jsx src/__tests__/LegalPages.test.jsx
git commit -m "feat: add legal page routes and login footer links"
```
