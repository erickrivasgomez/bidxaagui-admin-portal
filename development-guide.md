

# 📘 Blueprint de Arquitectura y Sistema de Desarrollo: DevMeridian (V1.1)

Este documento es la **Base de Conocimiento Maestra**. Define cómo deben razonar los agentes de IA para refactorizar o crear módulos en el ecosistema DevMeridian, asegurando software de alto margen, resiliencia técnica y estética premium.

## 1. Misión del Sistema
* **Objetivo:** Transformar código funcional en productos escalables con mantenimiento cercano a cero.
* **Stack Principal:** React (Frontend), Cloudflare Workers/D1/R2 (Backend), TypeScript (Type-safety total).

## 2. Arquitectura de Frontend (The UI Layer)
Cualquier componente de React (como el refactor de `Campaigns.tsx`) debe seguir estas reglas:

### A. Desacoplamiento de Lógica (Hooks Propios)
* **No al State masivo en el Componente:** La lógica de fetch, guardado y manejo de errores debe vivir en un **Custom Hook** (ej: `useCampaigns.ts`). El componente solo debe renderizar UI.
* **Uso de Use Cases:** El componente interactúa con la infraestructura *solo* a través de Use Cases inyectados.
* **Componentes de Navegación:** Los componentes de navegación (ModuleHub, ModuleLayout) deben ser "dumb components" que reciben props y no contienen lógica de negocio.
* **Framework Agnostic Navigation:** La navegación debe ser abstracta. No usar React Router directamente en componentes. Crear `NavigationService` en dominio y adaptadores (ReactRouterAdapter) en infraestructura.

### B. Patrones de UX & Estética (iOS/MacOS Style)
* **Navegación tipo iOS:** Evitar modales por completo. Usar **pantallas completas** con navigation push (como iOS Navigation Controller). Cada acción (crear, editar) debe ser una pantalla completa que se navega desde la lista, no un modal superpuesto.
* **Feedback No Invasivo:** Sustituir `alert()` y `confirm()` por **Toasts** (notificaciones sutiles) para feedback de acciones rápidas. Para confirmaciones de acciones destructivas, usar pantallas de confirmación completas.
* **Alta Densidad Informativa:** Tablas compactas, uso de `tooltips`, y jerarquía visual clara. Si hay mucha información, usar vistas divididas (Split-view) como el editor de HTML actual.
* **Estados de Carga:** No usar "Cargando...". Usar **Skeleton Loaders** que mantengan la estructura de la página mientras llegan los datos.
* **Limpieza de Formularios:** Los formularios deben limpiarse automáticamente después de un submit exitoso. Al crear un registro y querer crear otro nuevo, los inputs deben estar vacíos, no con el registro anterior.

## 3. Arquitectura de Backend (The Logic Layer)
Basado en el análisis de `campaigns.ts` (Backend):

* **Domain First:** Antes de escribir una Query, definir la `interface` en la capa de Dominio.
* **Manejo de Batching Resiliente:** Los procesos largos (como envíos masivos) deben implementar pausas (`setTimeout`) y estados intermedios en la DB para que sean reanudables.
* **Inyección de Dependencias:** El código debe recibir el `env` y los servicios externos por parámetro para facilitar los tests.

## 4. Dimensiones de Ingeniería Obligatorias (The "Checklist")
Cualquier código generado por la IA debe autoevaluarse con estos criterios:

1.  **Observabilidad:** ¿Tiene `try/catch` con logs que identifiquen el origen del fallo?
2.  **Seguridad:** ¿Valida los tipos de datos en el `request.json()`? ¿Sanitiza el HTML?
3.  **Performance:** ¿Implementa `lazy loading` o procesamiento por lotes para no saturar la memoria?
4.  **Resiliencia:** Si la API externa falla, ¿el sistema sabe cómo recuperarse sin perder datos?

## 5. Protocolo de Ejecución para el LLM
Al recibir una solicitud de desarrollo, la IA debe seguir este orden:
1.  **Analizar:** Leer el código fuente e identificar qué partes pertenecen a Infraestructura, Use Cases o UI.
2.  **Mapear:** Determinar en qué carpeta y archivo del Blueprint va cada pieza.
3.  **Enriquecer:** Añadir la lógica de seguridad y resiliencia que falte (ej. validación de esquemas Zod).
4.  **Generar:** Entregar el código limpio, tipado y listo para ser "copiado y pegado" en la estructura de carpetas definida.

---

### Instrucción de Arranque (Prompt para Antigravity)
*"Actúa como un Ingeniero de Software Senior siguiendo el **Blueprint de DevMeridian**. Tu tarea es refactorizar el código que te daré a continuación. Debes separar la lógica en capas (Clean Architecture), aplicar los estándares de UX tipo iOS y asegurar que el sistema sea resiliente ante fallos de red o de API externa. No generes solo código, asegura que el resultado sea 'mantenimiento cero'."*

