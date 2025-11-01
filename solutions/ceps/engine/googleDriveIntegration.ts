export interface CorpPayload {
  user: {
    name: string;
    email: string;
  };
  org: {
    id: string;
    name: string;
    area?: string;
    position?: string;
  };
  pdfBlob: Blob;
  scores: Record<string, number>;
  overallLevel: string;
}

export interface DriveIntegrationResult {
  success: boolean;
  driveUrl?: string;
  sheetRowUrl?: string;
  error?: string;
}

/**
 * STUB: Integración con Google Drive y Sheets para modo corporativo
 *
 * TODO: Implementar con Google Drive API / Apps Script webhook
 *
 * Funcionalidad planificada:
 * 1. Crear carpeta: "WC RG 4.01.06 Informe de entrada de Postulantes/{empresa}/{area}/{nombre}"
 * 2. Subir PDF con logo WeC (287×72)
 * 3. Insertar fila en "WC RG 4.01.05 Registro de Fase 2" con:
 *    - Nombre, Correo, Empresa, Área, Puesto, Enlace, Estado
 *
 * @param payload Datos del usuario y PDF para envío corporativo
 * @returns Resultado con URLs de Drive y Sheet (stub actual)
 */
export async function pushReportToDriveAndSheet(
  payload: CorpPayload,
): Promise<DriveIntegrationResult> {
  // STUB: No bloquear el flujo actual
  console.log("🚧 STUB: Corporate Drive Integration", {
    user: payload.user.name,
    company: payload.org.name,
    area: payload.org.area,
    pdfSize: payload.pdfBlob.size,
    overallLevel: payload.overallLevel,
  });

  try {
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: Implementar llamada real a Cloud Function o Apps Script
    // const response = await fetch('/api/corporate-integration', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...payload,
    //     pdfBase64: await blobToBase64(payload.pdfBlob)
    //   })
    // });

    // Por ahora, simular éxito
    const mockDriveUrl = `https://drive.google.com/mock/${payload.org.name}/${payload.user.name}`;
    const mockSheetUrl = `https://sheets.google.com/mock/registro-fase-2#row=123`;

    return {
      success: true,
      driveUrl: mockDriveUrl,
      sheetRowUrl: mockSheetUrl,
    };
  } catch (error) {
    console.error("Error in corporate integration stub:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convierte Blob a Base64 para envío a APIs
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1]; // Remover "data:mime;base64,"
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Valida que el payload corporativo tenga todos los campos requeridos
 */
export function validateCorpPayload(
  payload: Partial<CorpPayload>,
): payload is CorpPayload {
  return !!(
    payload.user?.name &&
    payload.user?.email &&
    payload.org?.id &&
    payload.org?.name &&
    payload.pdfBlob &&
    payload.scores &&
    payload.overallLevel
  );
}

/**
 * Genera metadatos adicionales para el reporte corporativo
 */
export function generateCorpMetadata(payload: CorpPayload) {
  const timestamp = new Date().toISOString();
  const scoreAverage =
    Object.values(payload.scores).reduce((sum, score) => sum + score, 0) /
    Object.values(payload.scores).length;

  return {
    timestamp,
    scoreAverage: Math.round(scoreAverage * 100) / 100,
    totalCompetencies: Object.keys(payload.scores).length,
    fileName: `CEPS_${payload.user.name.replace(/\s+/g, "_")}_${timestamp.split("T")[0]}.pdf`,
    folderPath: `WC RG 4.01.06 Informe de entrada de Postulantes/${payload.org.name}/${payload.org.area || "General"}/${payload.user.name}`,
  };
}
