import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="bg-black min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="mb-5 text-center">
              <Link to="/" className="text-decoration-none">
                <span className="fs-2 fw-black" style={{ letterSpacing: '-1px' }}>
                  <span style={{ color: '#ffffff' }}>Ticke</span>
                  <span style={{ color: '#f97316' }}>Trak</span>
                </span>
              </Link>
              <h1 className="text-white mt-4 mb-2">Términos y Condiciones</h1>
              <p className="text-white-50 small">
                Versión 1.0 - Última actualización: 27/5/2026
              </p>
              <div className="h-1 w-25 mx-auto" style={{ height: '2px', background: 'linear-gradient(90deg, #f97316, #00d2ff)' }}></div>
            </div>

            {/* Aceptación */}
            <div className="card bg-dark bg-opacity-50 border-secondary mb-4 rounded-4">
              <div className="card-body p-4">
                <p className="text-white-50 mb-0 small">
                  Al utilizar Ticketrak, aceptas estos Términos y Condiciones. Si no estás de acuerdo, 
                  por favor no uses nuestra plataforma.
                </p>
              </div>
            </div>

            {/* 1. Identidad del responsable */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">1. Identidad del responsable</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak es una plataforma tecnológica operada por <strong>Brando Martin Rivero Perez</strong>, 
                  con domicilio en el Estado de México, México. Somos un facilitador tecnológico independiente 
                  y no formamos parte de los eventos ni de los organizadores.
                </p>
              </div>
            </div>

            {/* 2. Naturaleza de la plataforma */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">2. Naturaleza de la plataforma</h2>
                <p className="text-white-50 small mb-3">
                  Ticketrak actúa exclusivamente como un <strong>intermediario tecnológico</strong> que conecta:
                </p>
                <ul className="text-white-50 small mb-0 ps-3">
                  <li className="mb-2">Por un lado, a <strong>organizadores de eventos</strong> (personas físicas o morales que ofrecen boletos)</li>
                  <li className="mb-2">Por otro lado, a <strong>compradores</strong> (personas que adquieren boletos)</li>
                </ul>
              </div>
            </div>

            {/* 3. Responsabilidad limitada */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">3. Responsabilidad limitada de Ticketrak</h2>
                <p className="text-white-50 small mb-3">
                  <strong className="text-danger">Ticketrak NO es responsable por:</strong>
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">La cancelación, reprogramación o modificación de cualquier evento</li>
                  <li className="mb-2">La calidad, seguridad o contenido del evento</li>
                  <li className="mb-2">Reembolsos, devoluciones o cualquier transacción económica entre organizador y comprador</li>
                  <li className="mb-2">Incumplimiento del organizador en la entrega de servicios o boletos</li>
                  <li className="mb-2">Daños o perjuicios derivados de la asistencia al evento</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  <strong className="text-warning">Ticketrak solo se responsabiliza del correcto funcionamiento tecnológico de su plataforma.</strong>
                </p>
              </div>
            </div>

            {/* 4. Facturación */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">4. Facturación (CFDI)</h2>
                <p className="text-white-50 small mb-0">
                  La emisión de facturas (Comprobante Fiscal Digital por Internet) es <strong>responsabilidad exclusiva del organizador del evento</strong>. 
                  Ticketrak no emite facturas por la compra de boletos. Para solicitar una factura, deberás contactar directamente al organizador.
                </p>
              </div>
            </div>

            {/* 5. Procesamiento de pagos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">5. Procesamiento de pagos</h2>
                <p className="text-white-50 small mb-0">
                  Los pagos realizados a través de Ticketrak son procesados por <strong>Stripe</strong> u otros proveedores de pago 
                  que cada organizador tenga registrados. Ticketrak no almacena, procesa ni tiene acceso a los datos bancarios o 
                  de tarjetas de crédito/débito de los compradores. Cada organizador es responsable de su propia cuenta de Stripe 
                  y del manejo de las transacciones.
                </p>
              </div>
            </div>

            {/* 6. Comisiones y donaciones */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">6. Comisiones y donaciones</h2>
                <p className="text-white-50 small mb-3">
                  Ticketrak <strong>no cobra comisiones</strong> por la venta de boletos. La plataforma se mantiene gracias a:
                </p>
                <ul className="text-white-50 small mb-0 ps-3">
                  <li className="mb-2">Donaciones voluntarias de los usuarios (fans como tú)</li>
                  <li className="mb-2">Apoyo de la comunidad</li>
                </ul>
              </div>
            </div>

            {/* 7. Cancelaciones y reembolsos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">7. Cancelaciones y reembolsos</h2>
                <p className="text-white-50 small mb-3">
                  Ticketrak <strong>no gestiona ni procesa reembolsos</strong>. Cualquier solicitud de cancelación o reembolso 
                  deberá ser gestionada directamente con el organizador del evento. Ticketrak se limita a proporcionar los 
                  datos de contacto del organizador para facilitar la comunicación.
                </p>
                <p className="text-white-50 small mb-0">
                  El organizador es el único responsable de determinar su política de reembolsos, así como de aplicarla 
                  conforme a la ley aplicable.
                </p>
              </div>
            </div>

            {/* 8. Transferencia de boletos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">8. Transferencia de boletos</h2>
                <p className="text-white-50 small mb-0">
                  Actualmente, los boletos adquiridos a través de Ticketrak son <strong>personales e intransferibles</strong>. 
                  Cada boleto está vinculado a la persona que realizó la compra y no podrá ser revendido, cedido o transferido 
                  a terceros, salvo que el organizador del evento establezca expresamente lo contrario.
                </p>
              </div>
            </div>

            {/* 9. Límite de boletos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">9. Límite de boletos</h2>
                <p className="text-white-50 small mb-0">
                  Cada organizador puede establecer su propio límite de boletos por persona. Ticketrak aplica 
                  automáticamente las reglas definidas por el organizador. Es responsabilidad del comprador respetar 
                  dichos límites.
                </p>
              </div>
            </div>

            {/* 10. Edad mínima */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">10. Edad mínima</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak no establece una edad mínima para la compra de boletos. Sin embargo, cada evento puede 
                  tener sus propias restricciones de edad. Es responsabilidad del comprador verificar los requisitos 
                  del evento antes de adquirir un boleto. En caso de que un menor de edad realice una compra sin 
                  autorización de sus padres o tutores, estos últimos serán responsables.
                </p>
              </div>
            </div>

            {/* 11. Propiedad intelectual */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">11. Propiedad intelectual</h2>
                <p className="text-white-50 small mb-0">
                  El código, diseño, logotipos, nombres comerciales y demás elementos de Ticketrak están protegidos 
                  por las leyes de propiedad intelectual. Queda prohibida la copia, reproducción o uso no autorizado 
                  de estos elementos sin el consentimiento expreso de Ticketrak.
                </p>
              </div>
            </div>

            {/* 12. Ley aplicable y jurisdicción */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">12. Ley aplicable y jurisdicción</h2>
                <p className="text-white-50 small mb-0">
                  Estos Términos y Condiciones se rigen por las leyes de <strong>los Estados Unidos Mexicanos</strong>. 
                  Para cualquier controversia derivada del uso de la plataforma, las partes se someten a la jurisdicción 
                  de los tribunales competentes del <strong>Estado de México</strong>, renunciando a cualquier otro fuero 
                  que pudiera corresponderles.
                </p>
              </div>
            </div>

            {/* 13. Modificaciones */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">13. Modificaciones a los Términos</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
                  Las modificaciones entrarán en vigor a partir de su publicación en la plataforma. Te recomendamos 
                  revisarlos periódicamente. El uso continuado de Ticketrak después de una modificación constituye 
                  tu aceptación de los nuevos términos.
                </p>
              </div>
            </div>
            {/* 14. Mediación y arbitraje */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
            <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">14. Mediación y arbitraje (para evitar broncas legales)</h2>
                <p className="text-white-50 small mb-3">
                Si hay algún pedo entre tú y Ticketrak, antes de ir a los abogados hacemos esto:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                <li className="mb-2">
                    <strong>Paso 1 - Háblanos:</strong> Escríbenos a <strong>soporte@ticketrak.com.mx</strong> y tratamos de arreglarlo directamente.
                </li>
                <li className="mb-2">
                    <strong>Paso 2 - Mediación:</strong> Si no nos ponemos de acuerdo en 30 días, vamos con un mediador neutral 
                    (alguien que no es juez pero ayuda a conversar). La mediación es en el <strong>Estado de México</strong> y 
                    los gastos se dividen 50/50.
                </li>
                <li className="mb-2">
                    <strong>Paso 3 - Arbitraje (solo si es necesario):</strong> Si la mediación no funciona, vamos a arbitraje. 
                    Esto es como un juicio pero más rápido y barato. El árbitro decide y ambas partes aceptamos lo que diga. 
                    No se puede ir a juicio normal después.
                </li>
                </ul>
                <p className="text-white-50 small mb-0">
                <strong className="text-warning">¿Por qué hacemos esto?</strong> Porque los juicios son caros, lentos y solo 
                benefician a los abogados. Preferimos resolver como adultos, sin tanto pedo.
                </p>
            </div>
            </div>

            {/* 14. Contacto */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">14. Contacto</h2>
                <p className="text-white-50 small mb-0">
                  Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos en:
                  <br />
                  <strong className="text-white">Correo electrónico:</strong> soporte@ticketrak.com.mx
                  <br />
                  <strong className="text-white">Responsable:</strong> Brando Martin Rivero Perez
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 text-center">
              <p className="text-white-50 small mb-0">
                © {new Date().getFullYear()} Ticketrak - Hecho por fans, para fans
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .card {
          transition: all 0.2s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          border-color: rgba(249, 115, 22, 0.3) !important;
        }
      `}</style>
    </div>
  )
}