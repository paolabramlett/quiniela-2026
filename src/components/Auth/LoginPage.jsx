import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">⚽</div>
        <h1 className="text-3xl font-bold text-gray-900">Quiniela <span className="text-primary">2026</span></h1>
        <p className="text-gray-500 mt-2">Predict. Compete. Win.</p>
      </div>
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Sign in with Google
      </button>
    </div>
  )
}
