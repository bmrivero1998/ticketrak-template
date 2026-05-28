import { Link } from 'react-router-dom'

export function LegalPage() {
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
              <h1 className="text-white mt-4 mb-2">Aviso Legal</h1>
              <p className="text-white-50 small">
                Versión 1.0 - Última actualización: {new Date().toLocaleDateString('es-MX')}
              </p>
              <div className="h-1 w-25 mx-auto" style={{ height: '2px', background: 'linear-gradient(90deg, #f97316, #00d2ff)' }}></div>
            </div>

            {/* Intro */}
            <div className="card bg-dark bg-opacity-50 border-secondary mb-4 rounded-4">
              <div className="card-body p-4">
                <p className="text-white-50 mb-0 small">
                  Este Aviso Legal regula el uso del sitio web ticketrak.com.mx y sus servicios asociados. 
                  Al acceder y utilizar nuestra plataforma, aceptas las condiciones aquí establecidas.
                </p>
              </div>
            </div>

            {/* 1. Titularidad del sitio */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">1. Titularidad del sitio web</h2>
                <p className="text-white-50 small mb-0">
                  <strong>Propietario:</strong> Brando Martin Rivero Perez<br />
                  <strong>Domicilio:</strong> Estado de México, México<br />
                  <strong>Correo electrónico:</strong> legal@ticketrak.com.mx<br />
                  <strong>Sitio web:</strong> www.ticketrak.com.mx
                </p>
              </div>
            </div>

            {/* 2. Condiciones de uso */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">2. Condiciones de uso del sitio</h2>
                <p className="text-white-50 small mb-3">
                  Al utilizar Ticketrak, te comprometes a:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">No utilizar la plataforma para fines ilegales o no autorizados</li>
                  <li className="mb-2">No intentar vulnerar la seguridad del sitio o acceder a áreas restringidas</li>
                  <li className="mb-2">No realizar compras fraudulentas o con datos falsos</li>
                  <li className="mb-2">No revender boletos a través de canales no autorizados</li>
                  <li className="mb-2">No utilizar robots, scrapers u otras herramientas automatizadas para extraer datos</li>
                  <li className="mb-2">Respetar los derechos de propiedad intelectual de Ticketrak y terceros</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  El incumplimiento de estas condiciones puede resultar en la suspensión de tu cuenta 
                  y acciones legales correspondientes.
                </p>
              </div>
            </div>

            {/* 3. Propiedad intelectual */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">3. Propiedad intelectual</h2>
                <p className="text-white-50 small mb-3">
                  Todo el contenido de Ticketrak está protegido por las leyes de propiedad intelectual:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">El nombre "Ticketrak" y su logotipo son marcas registradas</li>
                  <li className="mb-2">El código fuente, diseño y estructura de la plataforma son propiedad de Ticketrak</li>
                  <li className="mb-2">Las imágenes, textos y gráficos pertenecen a sus respectivos dueños (organizadores o Ticketrak)</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  Queda prohibida la reproducción, distribución, modificación o uso no autorizado de cualquier 
                  contenido de Ticketrak sin el consentimiento expreso por escrito del propietario.
                </p>
              </div>
            </div>

            {/* 4. Exención de responsabilidad */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">4. Exención de responsabilidad</h2>
                <p className="text-white-50 small mb-3">
                  Ticketrak actúa exclusivamente como intermediario tecnológico. Por lo tanto:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">
                    No garantizamos la disponibilidad, continuidad o funcionamiento ininterrumpido del sitio 
                    (puede haber mantenimiento o fallos técnicos)
                  </li>
                  <li className="mb-2">
                    No somos responsables por los contenidos, productos o servicios ofrecidos por los organizadores 
                    a través de nuestra plataforma
                  </li>
                  <li className="mb-2">
                    No nos hacemos responsables por daños o perjuicios derivados del uso de la plataforma, 
                    salvo en casos de dolo o negligencia grave comprobada
                  </li>
                  <li className="mb-2">
                    No garantizamos que el sitio esté libre de virus o elementos dañinos (aunque tomamos medidas de seguridad)
                  </li>
                </ul>
                <p className="text-white-50 small mb-0">
                  En cumplimiento con la <strong>Ley Federal de Protección al Consumidor</strong>, ponemos a tu disposición 
                  nuestros datos de contacto para cualquier reclamación.
                </p>
              </div>
            </div>

            {/* 5. Enlaces externos */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">5. Enlaces a sitios externos</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak puede contener enlaces a sitios web de terceros (redes sociales, procesadores de pago, 
                  organizadores). Estos enlaces se proporcionan solo como referencia. Ticketrak no controla, 
                  respalda ni asume responsabilidad por el contenido, políticas de privacidad o prácticas de dichos sitios. 
                  Te recomendamos leer los términos y avisos de privacidad de cada sitio que visites.
                </p>
              </div>
            </div>

            {/* 6. Suspensión de cuentas */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">6. Suspensión y cancelación de cuentas</h2>
                <p className="text-white-50 small mb-3">
                  Ticketrak se reserva el derecho de suspender o cancelar cuentas de usuario en los siguientes casos:
                </p>
                <ul className="text-white-50 small mb-3 ps-3">
                  <li className="mb-2">Violación de estos términos o de las condiciones de uso</li>
                  <li className="mb-2">Actividad fraudulenta o sospechosa</li>
                  <li className="mb-2">Solicitud de un organizador (por ejemplo, si un usuario fue expulsado de un evento)</li>
                  <li className="mb-2">Inactividad prolongada (más de 2 años sin uso)</li>
                </ul>
                <p className="text-white-50 small mb-0">
                  En caso de cancelación, los boletos ya adquiridos seguirán siendo válidos, 
                  pero no se podrán realizar nuevas compras.
                </p>
              </div>
            </div>

            {/* 7. Legislación aplicable */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">7. Legislación aplicable y jurisdicción</h2>
                <p className="text-white-50 small mb-0">
                  Este Aviso Legal se rige por las leyes de <strong>los Estados Unidos Mexicanos</strong>. 
                  Para cualquier controversia derivada del uso del sitio web, las partes se someten a la 
                  jurisdicción de los tribunales competentes del <strong>Estado de México</strong>, 
                  renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de 
                  su domicilio presente o futuro.
                </p>
              </div>
            </div>

            {/* 8. Modificaciones */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">8. Modificaciones al Aviso Legal</h2>
                <p className="text-white-50 small mb-0">
                  Ticketrak se reserva el derecho de modificar este Aviso Legal en cualquier momento. 
                  Los cambios entrarán en vigor a partir de su publicación en esta página. 
                  Te recomendamos revisar este aviso periódicamente. El uso continuado de la plataforma 
                  después de una modificación constituye tu aceptación de los nuevos términos.
                </p>
              </div>
            </div>

            {/* 9. Contacto para asuntos legales */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">9. Contacto para asuntos legales</h2>
                <p className="text-white-50 small mb-0">
                  Para comunicaciones de carácter legal (notificaciones, requerimientos, citatorios), 
                  por favor contacta a:
                  <br /><br />
                  <strong>Correo electrónico:</strong> legal@ticketrak.com.mx<br />
                  <strong>Responsable:</strong> Brando Martin Rivero Perez<br />
                  <strong>Asunto:</strong> Especificar "Asunto legal" en el correo
                  <br /><br />
                  Los avisos legales serán respondidos en un plazo máximo de 15 días hábiles.
                </p>
              </div>
            </div>

            {/* 10. Aceptación */}
            <div className="card bg-transparent border-secondary rounded-4 mb-4">
              <div className="card-body">
                <h2 className="h5 text-white fw-bold mb-3">10. Aceptación del Aviso Legal</h2>
                <p className="text-white-50 small mb-0">
                  Al utilizar Ticketrak, manifiestas que has leído, entendido y aceptado este Aviso Legal 
                  en su totalidad. Si no estás de acuerdo con alguna de sus disposiciones, por favor 
                  abstente de utilizar nuestra plataforma.
                </p>
              </div>
            </div>

            {/* Footer con documentos relacionados */}
            <div className="mt-4 pt-3 text-center">
              <div className="d-flex justify-content-center gap-3 flex-wrap mb-3">
                <Link to="/terms" className="text-primary text-decoration-none small">
                  Términos y Condiciones
                </Link>
                <span className="text-white-50">•</span>
                <Link to="/privacy" className="text-primary text-decoration-none small">
                  Aviso de Privacidad
                </Link>
                <span className="text-white-50">•</span>
                <Link to="/legal" className="text-primary text-decoration-none small">
                  Aviso Legal
                </Link>
              </div>
              <p className="text-white-50 small mb-0">
                © {new Date().getFullYear()} Ticketrak - Todos los derechos reservados
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