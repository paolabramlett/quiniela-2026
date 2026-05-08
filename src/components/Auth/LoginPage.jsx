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
          {/* Legal consent footer */}
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
