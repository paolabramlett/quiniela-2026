import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* These pages are only reachable from /login — hardcoded back link is intentional */}
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
            <p>Ciertas funciones del Servicio, como la creación de grupos, requieren un pago único en pesos mexicanos (MXN) procesado por Stripe. El acceso a dichas funciones se activa de forma inmediata al completarse el pago. Al tratarse de contenido digital de acceso inmediato, <strong className="text-white">los pagos son definitivos y no reembolsables</strong>, conforme al artículo 76 Bis de la Ley Federal de Protección al Consumidor. No se realizan cargos recurrentes ni suscripciones automáticas.</p>
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
