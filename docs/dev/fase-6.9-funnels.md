# 🧠 ORDEN PARA COPILOT — FASE 6.9

## FUNNELS INTEGRADOS — BLOQUE COMERCIAL MUNDERO v2.1

---

### 🎯 Objetivo General

Extender Mundero con un módulo de **funnels inteligentes**, integrados con comunidades, eventos, reputación y gamificación, **sin alterar** las estructuras sociales existentes.

---

## 🔹 PASO 1 — CONFIGURACIÓN BASE

Crea las siguientes carpetas si no existen:

```
/modules/funnels/
/services/
/functions/
```

No modifiques rutas, layouts ni hooks existentes.

---

## 🔹 PASO 2 — ESTRUCTURA DE DATOS FIRESTORE

Colecciones nuevas:

```
/organizations
/org_members
/funnels
/funnel_submissions
/funnel_events
/workflows
```

Reglas de seguridad:

- Solo el owner o admin puede crear funnels.
- Lectura pública de `/funnels` y `/funnel_events`.
- Usa funciones `isOrgOwnerOrAdmin()` y `isMember()` como validadores.

---

## 🔹 PASO 3 — SERVICIO DE FUNNELS

**Archivo:** `src/services/funnelsService.ts`

```ts
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const registerFunnelEvent = async (
  userId: string,
  source: "feed" | "event" | "community" | "challenge",
  stage: "awareness" | "interest" | "action" | "conversion",
) => {
  try {
    await addDoc(collection(db, "funnel_events"), {
      userId,
      source,
      stage,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error registering funnel event:", error);
  }
};
```

Este servicio solo agrega tracking de conversión, sin reemplazar reputación.

## 🔹 PASO 4 — UI DE FUNNELS POR EMPRESA

Rutas privadas:

```
/org/:orgId/funnels
/org/:orgId/funnels/new
/org/:orgId/funnels/:id/edit
/org/:orgId/funnels/:id/leads
/org/:orgId/workflows
```

Componentes:

- `FunnelEditor.tsx` → creación visual
- `FunnelLivePreview.tsx` → previsualización
- `FunnelMetrics.tsx` → métricas con Recharts
- `FunnelDashboard.tsx` → panel general

Usa Zustand: `/store/funnelEditorStore.ts`
Vista pública: `https://mundero.net/{orgSlug}/{funnelSlug}`

## 🔹 PASO 5 — CLOUD FUNCTIONS

Archivo: `functions/src/funnels.ts`

Crea:

- `onFunnelSubmissionCreate`
  - Lanza `runWorkflow()` o `runQuickDestination()`
  - Registra signup

- `runWorkflow()`
  - Handlers: `EMAIL`, `WEBHOOK`, `DELAY`, `NOTIFY_HR`, `START_SOLUTION`

- `onFunnelCreate`
  - Valida slug único
  - Copia branding de la organización

## 🔹 PASO 6 — WORKFLOW BUILDER

Archivo: `WorkflowEditor.tsx`

- Usa `reactflow` para los nodos.
- Guarda el flujo en `/workflows/{id}`.
- Tipos de nodo: `EMAIL`, `DELAY`, `WEBHOOK`, `START_SOLUTION`.

✅ **Resultado esperado:**
Un módulo de embudos totalmente operativo, conectado a Firestore, listo para enlazar con soluciones empresariales en la siguiente fase.
