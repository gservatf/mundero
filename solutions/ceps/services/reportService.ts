import { CepsScoreResult } from "../engine/scoring";

export interface PdfReportParams {
  user: {
    name: string;
    email: string;
  };
  logoUrl: string;
  radarCanvas?: HTMLCanvasElement;
  tableEl?: HTMLElement;
  scores: CepsScoreResult;
  mode: "user" | "corporate";
  orgInfo?: {
    name: string;
    area?: string;
    position?: string;
  };
}

/**
 * STUB: Genera reporte PDF para usuario
 * TODO: Implementar con jsPDF o html2canvas+jspdf
 */
export async function buildUserPdf(params: PdfReportParams): Promise<Blob> {
  console.log("🚧 STUB: Building user PDF report", {
    user: params.user.name,
    mode: params.mode,
    overallLevel: params.scores.overallLevel,
    totalScore: params.scores.totalScore,
  });

  try {
    // Simular procesamiento del PDF
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Implementación real con jsPDF
    // const doc = new jsPDF();
    //
    // // Agregar logo WeC (287x72)
    // if (params.logoUrl) {
    //   doc.addImage(params.logoUrl, 'PNG', 20, 20, 57.4, 14.4);
    // }
    //
    // // Título
    // doc.setFontSize(24);
    // doc.text('Reporte CEPS', 20, 50);
    //
    // // Información del usuario
    // doc.setFontSize(12);
    // doc.text(`Nombre: ${params.user.name}`, 20, 70);
    // doc.text(`Email: ${params.user.email}`, 20, 80);
    //
    // if (params.mode === "corporate" && params.orgInfo) {
    //   doc.text(`Empresa: ${params.orgInfo.name}`, 20, 90);
    //   if (params.orgInfo.area) doc.text(`Área: ${params.orgInfo.area}`, 20, 100);
    //   if (params.orgInfo.position) doc.text(`Puesto: ${params.orgInfo.position}`, 20, 110);
    // }
    //
    // // Resultados
    // doc.text(`Nivel General: ${params.scores.overallLevel}`, 20, 130);
    // doc.text(`Puntuación Total: ${params.scores.totalScore}`, 20, 140);
    //
    // // Tabla de competencias
    // Object.entries(params.scores.levelByComp).forEach(([comp, level], index) => {
    //   const y = 160 + (index * 10);
    //   doc.text(`${comp}: ${level} (${params.scores.scores[comp]})`, 20, y);
    // });
    //
    // // Si hay canvas del radar, convertir a imagen
    // if (params.radarCanvas) {
    //   const imgData = params.radarCanvas.toDataURL('image/png');
    //   doc.addImage(imgData, 'PNG', 20, 220, 160, 120);
    // }
    //
    // return doc.output('blob');

    // Por ahora, generar un blob vacío con metadatos
    const pdfContent = generateMockPdfContent(params);
    return new Blob([pdfContent], { type: "application/pdf" });
  } catch (error) {
    console.error("Error building PDF:", error);
    throw new Error("Error generando reporte PDF");
  }
}

/**
 * Genera contenido mock para el PDF (mientras se implementa jsPDF)
 */
function generateMockPdfContent(params: PdfReportParams): string {
  const reportDate = new Date().toLocaleDateString("es-ES");

  return `%PDF-1.4
REPORTE CEPS - ${params.user.name}
Fecha: ${reportDate}
Modo: ${params.mode}

RESULTADOS:
- Nivel General: ${params.scores.overallLevel}
- Puntuación Total: ${params.scores.totalScore}/250
- Factor de Corrección: ${params.scores.correction}

COMPETENCIAS:
${Object.entries(params.scores.levelByComp)
  .map(([comp, level]) => `- ${comp}: ${level} (${params.scores.scores[comp]})`)
  .join("\n")}

${
  params.mode === "corporate" && params.orgInfo
    ? `
INFORMACIÓN CORPORATIVA:
- Empresa: ${params.orgInfo.name}
- Área: ${params.orgInfo.area || "N/A"}
- Puesto: ${params.orgInfo.position || "N/A"}
`
    : ""
}

Generado por Mundero CEPS v2.0
`;
}

/**
 * Valida que los parámetros para PDF sean correctos
 */
export function validatePdfParams(
  params: Partial<PdfReportParams>,
): params is PdfReportParams {
  return !!(
    params.user?.name &&
    params.user?.email &&
    params.scores &&
    params.mode
  );
}

/**
 * Genera nombre de archivo para el PDF
 */
export function generatePdfFileName(
  userName: string,
  mode: "user" | "corporate",
): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const cleanName = userName.replace(/[^a-zA-Z0-9]/g, "_");
  const prefix = mode === "corporate" ? "CORP_" : "";

  return `${prefix}CEPS_${cleanName}_${timestamp}.pdf`;
}
