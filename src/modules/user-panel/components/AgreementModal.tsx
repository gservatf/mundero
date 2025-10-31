import React, { useState } from 'react';
import { X, FileText, Check, AlertTriangle } from 'lucide-react';
import { useAgreement } from '../hooks/useAgreement';

interface AgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    agreementType?: 'terms_of_service' | 'privacy_policy' | 'data_processing' | 'marketing';
}

const AGREEMENT_CONTENT = {
    terms_of_service: {
        title: 'Términos y Condiciones de Uso',
        content: `
# TÉRMINOS Y CONDICIONES DE USO - MUNDERO

**Última actualización: Octubre 2025**

## 1. ACEPTACIÓN DE LOS TÉRMINOS

Al acceder y utilizar la plataforma MUNDERO, usted acepta estar sujeto a estos términos y condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de cualquier ley local aplicable.

## 2. DESCRIPCIÓN DEL SERVICIO

MUNDERO es una plataforma integral que ofrece:
- Gestión empresarial avanzada
- Herramientas de análisis y reporting
- Integración con sistemas terceros
- Panel de administración centralizado

## 3. REGISTRO Y CUENTA DE USUARIO

- Debe proporcionar información precisa y actualizada
- Es responsable de mantener la confidencialidad de sus credenciales
- Debe notificar inmediatamente cualquier uso no autorizado de su cuenta

## 4. USO PERMITIDO

Usted se compromete a:
- Utilizar el servicio solo para fines legítimos
- No interferir con el funcionamiento del servicio
- Respetar los derechos de propiedad intelectual
- Cumplir con todas las leyes aplicables

## 5. PRIVACIDAD Y PROTECCIÓN DE DATOS

Sus datos personales serán tratados conforme a nuestra Política de Privacidad, que forma parte integral de estos términos.

## 6. LIMITACIÓN DE RESPONSABILIDAD

MUNDERO no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos.

## 7. MODIFICACIONES

Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente tras su publicación.

## 8. CONTACTO

Para cualquier consulta sobre estos términos, contacte a: legal@mundero.com
    `,
    },
    privacy_policy: {
        title: 'Política de Privacidad',
        content: `
# POLÍTICA DE PRIVACIDAD - MUNDERO

**Última actualización: Octubre 2025**

## 1. INFORMACIÓN QUE RECOPILAMOS

### Información que usted proporciona:
- Datos de registro (nombre, email, empresa)
- Información de perfil
- Contenido que publica en la plataforma

### Información recopilada automáticamente:
- Datos de uso y actividad
- Información del dispositivo
- Dirección IP y ubicación aproximada

## 2. CÓMO UTILIZAMOS SU INFORMACIÓN

- Proporcionar y mejorar nuestros servicios
- Comunicarnos con usted
- Personalizar su experiencia
- Cumplir con obligaciones legales

## 3. COMPARTIR INFORMACIÓN

No vendemos ni alquilamos su información personal. Podemos compartir información en casos limitados:
- Con su consentimiento
- Para cumplir con la ley
- Con proveedores de servicios bajo confidencialidad

## 4. SEGURIDAD

Implementamos medidas de seguridad técnicas y administrativas para proteger su información.

## 5. SUS DERECHOS

Usted tiene derecho a:
- Acceder a su información
- Corregir datos inexactos
- Solicitar eliminación
- Portabilidad de datos

## 6. COOKIES

Utilizamos cookies para mejorar la funcionalidad y analizar el uso del servicio.

## 7. CONTACTO

Para consultas sobre privacidad: privacy@mundero.com
    `,
    },
    data_processing: {
        title: 'Consentimiento para Procesamiento de Datos',
        content: `
# CONSENTIMIENTO PARA PROCESAMIENTO DE DATOS

## FINALIDADES DEL PROCESAMIENTO

Mediante este consentimiento, autoriza a MUNDERO para procesar sus datos personales con las siguientes finalidades:

### 1. FINALIDADES PRINCIPALES
- Prestación del servicio contratado
- Gestión de su cuenta de usuario
- Soporte técnico y atención al cliente
- Facturación y cobros

### 2. FINALIDADES SECUNDARIAS (OPCIONALES)
- Análisis de uso para mejora del servicio
- Investigación y desarrollo
- Comunicaciones comerciales personalizadas

## BASE LEGAL

El procesamiento se basa en:
- Ejecución del contrato de servicios
- Su consentimiento explícito
- Interés legítimo de MUNDERO
- Cumplimiento de obligaciones legales

## DESTINATARIOS

Sus datos pueden ser comunicados a:
- Proveedores de servicios tecnológicos
- Entidades financieras para pagos
- Autoridades competentes cuando sea requerido por ley

## TRANSFERENCIAS INTERNACIONALES

Algunos datos pueden ser transferidos fuera del país con garantías adecuadas de protección.

## CONSERVACIÓN

Sus datos se conservarán mientras mantenga su cuenta activa y posteriormente durante los plazos legalmente establecidos.

## DERECHOS

Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición contactando a: privacy@mundero.com
    `,
    },
    marketing: {
        title: 'Consentimiento para Comunicaciones de Marketing',
        content: `
# CONSENTIMIENTO PARA COMUNICACIONES DE MARKETING

## AUTORIZACIÓN

Al aceptar este consentimiento, autoriza a MUNDERO para enviarle comunicaciones comerciales a través de:

- Correo electrónico
- SMS/WhatsApp
- Notificaciones push
- Correo postal

## TIPO DE COMUNICACIONES

Recibirá información sobre:
- Nuevas funcionalidades y servicios
- Ofertas y promociones especiales
- Eventos y webinars
- Contenido educativo relevante
- Encuestas de satisfacción

## PERSONALIZACIÓN

Las comunicaciones serán personalizadas basándose en:
- Su actividad en la plataforma
- Preferencias indicadas
- Servicios utilizados
- Perfil empresarial

## FRECUENCIA

- Máximo 2 emails por semana
- SMS solo para ofertas especiales
- Notificaciones según configuración

## REVOCACIÓN

Puede revocar este consentimiento en cualquier momento:
- Haciendo clic en "darse de baja" en cualquier email
- Desde la configuración de su cuenta
- Contactando a: unsubscribe@mundero.com

## LEGALIDAD

Este consentimiento cumple con la normativa de protección de datos y comunicaciones comerciales aplicable.
    `,
    },
};

export const AgreementModal: React.FC<AgreementModalProps> = ({
    isOpen,
    onClose,
    agreementType = 'terms_of_service'
}) => {
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const { signAgreement, loading, error } = useAgreement();

    const agreement = AGREEMENT_CONTENT[agreementType];

    if (!isOpen) return null;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isScrolled = element.scrollTop + element.clientHeight >= element.scrollHeight - 10;
        setIsScrolledToBottom(isScrolled);
    };

    const handleSign = async () => {
        try {
            setIsSigning(true);

            // Get client information for the signature
            const clientData = {
                ipAddress: await getClientIP(),
                userAgent: navigator.userAgent,
            };

            await signAgreement(agreementType, clientData);

            // Close modal after successful signing
            onClose();
        } catch (error) {
            console.error('Error signing agreement:', error);
            // Error is handled by the hook
        } finally {
            setIsSigning(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            {agreement.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading || isSigning}
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div
                    className="flex-1 p-6 overflow-y-auto text-sm leading-relaxed"
                    onScroll={handleScroll}
                >
                    <div className="prose prose-sm max-w-none">
                        {agreement.content.split('\n').map((line, index) => {
                            if (line.startsWith('# ')) {
                                return (
                                    <h1 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                                        {line.replace('# ', '')}
                                    </h1>
                                );
                            }
                            if (line.startsWith('## ')) {
                                return (
                                    <h2 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                                        {line.replace('## ', '')}
                                    </h2>
                                );
                            }
                            if (line.startsWith('### ')) {
                                return (
                                    <h3 key={index} className="text-md font-medium text-gray-700 mt-4 mb-2">
                                        {line.replace('### ', '')}
                                    </h3>
                                );
                            }
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return (
                                    <p key={index} className="font-semibold text-gray-800 mb-2">
                                        {line.replace(/\*\*/g, '')}
                                    </p>
                                );
                            }
                            if (line.startsWith('- ')) {
                                return (
                                    <li key={index} className="ml-4 mb-1 text-gray-700">
                                        {line.replace('- ', '')}
                                    </li>
                                );
                            }
                            if (line.trim() === '') {
                                return <br key={index} />;
                            }
                            return (
                                <p key={index} className="mb-3 text-gray-700">
                                    {line}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* Scroll indicator */}
                {!isScrolledToBottom && (
                    <div className="bg-yellow-50 border-t border-yellow-200 p-3">
                        <div className="flex items-center space-x-2 text-yellow-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">
                                Por favor, desplácese hasta el final del documento para poder firmarlo
                            </span>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border-t border-red-200 p-3">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="h-4 w-4" />
                            <span>Firma electrónica mediante aceptación digital</span>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                disabled={loading || isSigning}
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleSign}
                                disabled={!isScrolledToBottom || loading || isSigning}
                                className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${!isScrolledToBottom || loading || isSigning
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {(loading || isSigning) && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                <Check className="h-4 w-4" />
                                <span>
                                    {isSigning ? 'Firmando...' : 'Acepto y firmo electrónicamente'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to get client IP (simplified version)
async function getClientIP(): Promise<string> {
    try {
        // In a real application, you might use a service to get the IP
        // For now, we'll return a placeholder
        return 'unknown';
    } catch (error) {
        console.warn('Failed to get client IP:', error);
        return 'unknown';
    }
}

export default AgreementModal;