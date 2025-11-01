# 🧠 ORDEN PARA COPILOT — FASE 7.0

## SOLUCIONES EMPRESARIALES — BLOQUE COMERCIAL MUNDERO v2.1

---

### 🎯 Objetivo General

Implementar un sistema modular para registrar, activar y gestionar **soluciones empresariales** (como CEPS, Work&Travel, CDP)  
Estas soluciones se habilitan por organización y se integran con los funnels de conversión.

---

## 🔹 PASO 7 — MÓDULO DE SOLUCIONES

Crea la carpeta:

```yaml
/modules/solutions/
```

Colecciones Firestore:

```bash
/solutions
/org_solutions
```

Ejemplo `/solutions`:

```json
{
  "key": "ceps_reader",
  "name": "Evaluación CEPS",
  "active": true,
  "routeReader": "/solutions/ceps/start",
  "allowedOrgs": ["weconsulting", "arkadiam"]
}
```

Ejemplo `/org_solutions`:

```json
{
  "orgId": "weconsulting",
  "solutionKey": "ceps_reader",
  "enabled": true,
  "grantedBy": "admin_uid"
}
```

Componentes:

- SolutionList.tsx
- SolutionDetail.tsx
- OrgSolutionsManager.tsx
- SolutionGuard.tsx

## 🔹 PASO 8 — SANDBOX DE DESARROLLO

Crea la carpeta:

```bash
/solutions/
  ceps/
  cdp/
  worktravel/
```

Script CLI:

```bash
scripts/create-solution.js
```

Este script genera la estructura base y el manifest.json de cada solución.

## 🔹 PASO 9 — INTEGRACIÓN FUNNELS → SOLUCIONES

Cuando un funnel tiene destino "solution":

1. Valida permiso activo (org_solutions.enabled === true).
2. Si lo tiene → abre /solutions/:key/start.
3. Si no → redirige a /soon y envía correo de espera.

## 🔹 PASO 10 — MÉTRICAS Y EMAILS

Registra:

```pgsql
view, signup, redirect, conversion, error
```

Emails automáticos:

- lead_welcome
- owner_new_lead
- hr_new_postulant

FunnelMetrics.tsx mostrará tasas y conversiones.

## 🔹 PASO 11 — HARDENING Y PERFORMANCE

Asegura:

- Logos ≤ 2MB
- Solo embeds de YouTube/Drive
- Rate-limit por IP/UID
- Sanitización de inputs

## 🔹 PASO 12 — DEPLOY Y PRUEBAS

1. Verifica compilación sin warnings.
2. Prueba flujo completo: crear funnel → ejecutar workflow → abrir solución → registrar métrica.
3. Confirmar branding y rutas públicas.

✅ **Resultado esperado:**
Dos módulos nuevos (funnels y solutions) funcionando en total integración con el ecosistema Mundero, respetando la arquitectura Firebase + React + Zustand + Cloud Functions.
