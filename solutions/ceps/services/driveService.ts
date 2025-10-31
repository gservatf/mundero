import { pushReportToDriveAndSheet, CorpPayload, DriveIntegrationResult } from "../engine/googleDriveIntegration";

/**
 * Servicio para integración corporativa con Google Drive y Sheets
 */
export async function pushCorporateReport(payload: CorpPayload): Promise<DriveIntegrationResult> {
    return pushReportToDriveAndSheet(payload);
}

/**
 * Verifica si el modo corporativo está habilitado para la organización
 */
export async function isCorporateModeEnabled(orgId: string): Promise<boolean> {
    // TODO: Implementar verificación real con org_solutions
    // Por ahora, permitir modo corporativo para todas las organizaciones
    console.log("🚧 STUB: Checking corporate mode for org:", orgId);
    return true;
}

/**
 * Obtiene configuración corporativa específica de la organización
 */
export async function getCorporateConfig(orgId: string): Promise<{
    driveEnabled: boolean;
    sheetId?: string;
    logoUrl?: string;
    customFields?: string[];
}> {
    // TODO: Implementar obtención real de configuración
    console.log("🚧 STUB: Getting corporate config for org:", orgId);

    return {
        driveEnabled: true,
        sheetId: "1ABC123_MOCK_SHEET_ID",
        logoUrl: "https://drive.google.com/uc?id=1ytsRTacOp-9ZqtIq2nxf64CYVAsBFYKD", // Logo WeC
        customFields: ["area", "position", "manager"]
    };
}