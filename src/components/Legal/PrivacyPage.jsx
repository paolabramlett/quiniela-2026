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
            <p className="mb-3"><strong className="text-white">Datos de autenticación (OAuth):</strong> nombre y apellido, dirección de correo electrónico, foto de perfil pública.</p>
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
            <h2 className="text-white font-bold text-base mb-2">6. Derechos ARCO</h2>
            <p>Conforme a la LFPDPPP, tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al tratamiento de tus datos personales. Para ejercer estos derechos, contáctanos en: <a href="mailto:paolabramlett@gmail.com" className="text-accent hover:underline">paolabramlett@gmail.com</a>. Responderemos en un plazo máximo de 20 días hábiles.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Seguridad</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado en tránsito (HTTPS/TLS) y en reposo, y control de acceso mediante Row Level Security en nuestra base de datos. Sin embargo, ningún sistema de transmisión por internet es 100% seguro.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Transferencias Internacionales</h2>
            <p>Al usar los proveedores mencionados en la sección 4, tus datos pueden ser procesados en servidores ubicados fuera de México. Estos proveedores cuentan con certificaciones y marcos de privacidad que garantizan niveles de protección adecuados.</p>
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
            <p>Para consultas sobre privacidad o para ejercer tus derechos de protección de datos: <a href="mailto:paolabramlett@gmail.com" className="text-accent hover:underline">paolabramlett@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
