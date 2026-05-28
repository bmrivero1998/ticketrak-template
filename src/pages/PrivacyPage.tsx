import { Link } from 'react-router-dom'

export function PrivacyPage() {
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
              <h1 className="text-white mt-4 mb-2">Aviso de Privacidad</h1>
              <p className="text-white-50 small">
                Versión 1.0 - Última actualización: {new Date().toLocaleDateString('es-MX')}
              </p>
              <div className="h-1 w-25 mx-auto" style={{ height: '2px', background: 'linear-gradient(90deg, #f97316, #00d2ff)' }}></div>
            </div>

            {/* Intro */}
            <div className="card bg-dark bg-opacity-50 border-secondary mb-4 rounded-4">
              <div className="card-body p-4">
                <p className="text-white-50 mb-0 small">
                  En Ticketrak nos importa tu privacidad. Este aviso explica qué datos recogemos, 
                  para qué los usamos y cómo los protegemos. Todo conforme a la ley mexicana.
                </p>
              </div>
            </div>

            {/* 1. Responsable */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">1. ¿Quién es responsable de tus datos?</h2>
                <p className="text-white-50 small mb-0">
                  <strong>Responsable:</strong> Brando Martin Rivero Perez<br />
                  <strong>Domicilio:</strong> Estado de México, México<br />
                  <strong>Correo electrónico:</strong> privacidad@ticketrak.com.mx<br />
                  <strong>Plataforma:</strong> Ticketrak (www.ticketrak.com.mx)
                </p>
              </div>
            </div>

            {/* 2. Datos que recogemos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">2. ¿Qué datos personales recogemos?</h2>
                <p className="text-white-50 small mb-2">Para usar Ticketrak, necesitamos los siguientes datos:</p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2"><strong>Nombre completo</strong> (para identificar al comprador)</li>
                  <li className="mb-2"><strong>Correo electrónico</strong> (para enviar confirmaciones y boletos)</li>
                  <li className="mb-2"><strong>Teléfono</strong> (opcional, para contacto en caso de cambios)</li>
                  <li className="mb-2"><strong>Datos de pago</strong> (a través de Stripe, Ticketrak no los almacena)</li>
                  <li className="mb-2"><strong>Historial de compras</strong> (boletos adquiridos)</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  <strong className="text-warning">No recogemos datos sensibles</strong> como ideología, religión, salud u orientación sexual.
                </p>
              </div>
            </div>

            {/* 3. Finalidades */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">3. ¿Para qué usamos tus datos?</h2>
                <p className="text-white-50 small mb-2"><strong>Finalidades principales (necesarias):</strong></p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">Procesar tu compra de boletos</li>
                  <li className="mb-2">Enviarte tus boletos y comprobantes por correo</li>
                  <li className="mb-2">Verificar tu identidad en la entrada del evento</li>
                  <li className="mb-2">Comunicarnos contigo sobre cambios o cancelaciones</li>
                  <li className="mb-2">Cumplir con obligaciones legales y fiscales</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  <strong>Finalidades secundarias (opcionales):</strong>
                </p>
                <ul className="text-white-50 small ps-3">
                  <li className="mb-2">Enviarte información sobre eventos similares</li>
                  <li className="mb-2">Mejorar nuestra plataforma con análisis de uso</li>
                  <li className="mb-2">Enviarte encuestas de satisfacción</li>
                </ul>
                <p className="text-white-50 small mt-2 mb-0">
                  Puedes oponerte a las finalidades secundarias enviando un correo a <strong>privacidad@ticketrak.com.mx</strong>
                </p>
              </div>
            </div>

            {/* 4. Transferencia de datos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">4. ¿Compartimos tus datos con alguien más?</h2>
                <p className="text-white-50 small mb-3">
                  Sí, pero solo cuando es necesario para que funcione el servicio:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">
                    <strong>Organizadores del evento:</strong> Compartimos tu nombre y correo para que te reconozcan en la puerta.
                  </li>
                  <li className="mb-2">
                    <strong>Stripe (procesador de pagos):</strong> Tus datos de pago van directamente a Stripe. Nosotros no vemos tu tarjeta.
                  </li>
                  <li className="mb-2">
                    <strong>Autoridades competentes:</strong> Si una ley nos obliga (por ejemplo, una orden judicial).
                  </li>
                </ul>
                <p className="text-white-50 small mb-0">
                  <strong className="text-success">No vendemos, rentamos ni compartimos tus datos con terceros para marketing.</strong>
                </p>
              </div>
            </div>

            {/* 5. Cookies */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">5. Uso de cookies y tecnologías similares</h2>
                <p className="text-white-50 small mb-3">
                  Usamos cookies para:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">Recordar tu carrito de compras</li>
                  <li className="mb-2">Mantener tu sesión iniciada</li>
                  <li className="mb-2">Analizar cómo usas la plataforma (Google Analytics)</li>
                  <li className="mb-2">Prevenir fraudes y proteger tu cuenta</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  Puedes deshabilitar las cookies en tu navegador, pero algunas funciones de Ticketrak podrían no funcionar correctamente.
                </p>
              </div>
            </div>

            {/* 6. Derechos ARCO */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">6. Tus derechos ARCO</h2>
                <p className="text-white-50 small mb-3">
                  La ley mexicana te otorga los siguientes derechos sobre tus datos personales:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2"><strong>Acceso:</strong> Saber qué datos tenemos de ti</li>
                  <li className="mb-2"><strong>Rectificación:</strong> Corregir datos incorrectos</li>
                  <li className="mb-2"><strong>Cancelación:</strong> Pedir que eliminemos tus datos</li>
                  <li className="mb-2"><strong>Oposición:</strong> Oponerte al uso de tus datos para fines específicos</li>
                </ul>
                <p className="text-white-50 small mb-3">
                  Para ejercer estos derechos, envía un correo a <strong>privacidad@ticketrak.com.mx</strong> con:
                </p>
                <ul className="text-white-50 small mb-0 ps-3">
                  <li className="mb-1">Tu nombre completo</li>
                  <li className="mb-1">Correo electrónico registrado en Ticketrak</li>
                  <li className="mb-1">Descripción clara de lo que quieres (acceso, rectificación, etc.)</li>
                </ul>
              </div>
            </div>

            {/* 7. Limitación de responsabilidad */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">7. Limitación de responsabilidad</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak no es responsable por la privacidad de los datos que compartas directamente con los 
                  organizadores de eventos a través de canales externos a la plataforma (correo directo, formularios externos, etc.). 
                  Cada organizador es responsable de su propio aviso de privacidad.
                </p>
              </div>
            </div>

            {/* 8. Seguridad */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">8. Seguridad de tus datos</h2>
                <p className="text-white-50 small mb-0">
                  Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tus datos:
                  cifrado SSL/TLS, acceso restringido a bases de datos, monitoreo constante y copias de seguridad seguras. 
                  Sin embargo, ningún sistema es 100% seguro. Si detectas una vulnerabilidad, repórtala a 
                  <strong> seguridad@ticketrak.com.mx</strong>
                </p>
              </div>
            </div>

            {/* 9. Menores de edad */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">9. Menores de edad</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak no recopila conscientemente datos de menores de 18 años. Si eres padre o tutor y crees que 
                  tu hijo nos ha proporcionado datos sin tu consentimiento, contáctanos para eliminarlos.
                </p>
              </div>
            </div>

            {/* 10. Cambios al aviso */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">10. Cambios a este aviso</h2>
                <p className="text-white-50 small mb-0">
                  Podemos actualizar este Aviso de Privacidad en cualquier momento. Los cambios entrarán en vigor 
                  al publicarse en esta página. Te avisaremos por correo si hay cambios importantes. 
                  La fecha de la última actualización está al inicio de este documento.
                </p>
              </div>
            </div>

            {/* 11. Consentimiento */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">11. Consentimiento</h2>
                <p className="text-white-50 small mb-0">
                  Al usar Ticketrak y proporcionar tus datos personales, manifiestas tu consentimiento expreso para el 
                  tratamiento de los mismos conforme a este Aviso de Privacidad.
                </p>
              </div>
            </div>

            {/* 12. Contacto */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">12. ¿Dudas o quejas?</h2>
                <p className="text-white-50 small mb-0">
                  Si tienes preguntas sobre este aviso o quieres reportar algo, escríbenos a:<br />
                  <strong>privacidad@ticketrak.com.mx</strong>
                  <br /><br />
                  También puedes acudir al <strong>INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales)</strong> 
                  si consideras que tus derechos han sido vulnerados.
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