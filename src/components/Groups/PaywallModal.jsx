// src/components/Groups/PaywallModal.jsx
export default function PaywallModal({ onClose, onCheckout, slotsAvailable, loading, error }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-card border border-line rounded-2xl p-6 w-full max-w-sm">
        <h2 className="font-display text-2xl tracking-wider text-white mb-1">CREAR GRUPO</h2>
        <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-5">
          Elige tu plan para empezar
        </p>

        {/* Pack Inicial */}
        <div className="bg-surface border border-line rounded-xl p-4 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-0.5">Pack Inicial</p>
              <p className="text-2xl font-bold text-white">$299 <span className="text-sm text-gray-600 font-normal">MXN</span></p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-line rounded-lg px-2 py-1">Pago único</span>
          </div>
          <ul className="text-xs text-gray-400 space-y-1 mb-4">
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> 3 grupos para crear</li>
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> Miembros ilimitados por grupo</li>
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> Válido para siempre</li>
          </ul>
          <button
            onClick={() => onCheckout('pack')}
            disabled={loading === 'pack'}
            className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-red-600 transition-colors"
          >
            {loading === 'pack' ? '...' : 'Comprar — $299 MXN'}
          </button>
        </div>

        {/* Grupo Adicional */}
        <div className={`bg-surface border rounded-xl p-4 mb-4 ${slotsAvailable > 0 ? 'border-line' : 'border-line opacity-50'}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-0.5">Grupo Adicional</p>
              <p className="text-2xl font-bold text-white">$99 <span className="text-sm text-gray-600 font-normal">MXN</span></p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-line rounded-lg px-2 py-1">Por grupo</span>
          </div>
          <ul className="text-xs text-gray-400 space-y-1 mb-4">
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> 1 grupo adicional</li>
            <li className="flex items-center gap-2"><span className="text-accent">✓</span> Se acumula con tu pack</li>
          </ul>
          <button
            aria-label="addon"
            onClick={() => onCheckout('addon')}
            disabled={loading === 'addon' || slotsAvailable === 0}
            className="w-full py-2.5 border border-line text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:border-accent hover:text-white transition-colors"
          >
            {loading === 'addon' ? '...' : slotsAvailable === 0 ? 'Compra el pack primero' : 'Agregar grupo'}
          </button>
        </div>

        {error && (
          <p className="text-danger text-xs font-semibold mb-3">{error}</p>
        )}

        <p className="text-[11px] text-gray-600 leading-relaxed text-center mb-4">
          Al continuar, entiendes que <strong className="text-gray-400">el pago es definitivo y no reembolsable</strong>. El acceso se activa de inmediato al completar la compra.
        </p>

        <button
          onClick={onClose}
          className="w-full text-xs text-gray-600 hover:text-white transition-colors uppercase tracking-widest font-bold"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
