

# 📘 Blueprint de Arquitectura y Sistema de Desarrollo (V1.2)

Este documento es la **Base de Conocimiento Maestra**. Define cómo deben razonar los agentes de IA para refactorizar o crear módulos, asegurando software de alto margen, resiliencia técnica y estética premium.

## 1. Misión del Sistema
* **Objetivo:** Transformar código funcional en productos escalables con mantenimiento cercano a cero y alta densidad informativa.
* **Stack Principal:** React (Frontend), Cloudflare Workers/D1/R2 (Backend), TypeScript (Type-safety total).

## 2. Arquitectura de UI & Layout (App-First Strategy)
Para evitar diseños web convencionales y lograr una estética profesional de escritorio (macOS/iPadOS), se implementará una **Estructura de 3 Paneles**:

### A. Los Tres Paneles Obligatorios
1.  **Panel 1: Sidebar Global (Navegación):** Estilo Cloudflare. Secciones colapsables que agrupan los módulos (ej: "Antroponómadas", "Lab"). Debe permitir el crecimiento a N módulos sin saturar la vista. Fondo `slate-50` con bordes sutiles.
2.  **Panel 2: Canvas Principal (Master):** Área de trabajo donde reside la lista de registros o el visor principal. Uso de ancho completo del viewport (sin contenedores centrados de ancho fijo).
3.  **Panel 3: Inspector Lateral (Detail):** Panel que emerge desde la derecha para edición de datos, detalles o metadatos. **Prohibido el uso de modales centrados** para la edición de registros.

### B. Navegación y UX Pattern (Estilo iOS)
* **iOS-Style Push:** La navegación entre la lista y la creación/edición debe ser un reemplazo de pantalla completa dentro del Canvas Principal (como un Navigation Controller), manteniendo el Sidebar siempre visible.
* **Feedback No Invasivo:** Sustituir `alert()` y `confirm()` por **Toasts** para acciones rápidas. Para confirmaciones destructivas, usar pantallas de confirmación integradas o estados dentro del Inspector.
* **Alta Densidad:** Tablas compactas, tipografía legible pero pequeña (Inter/San Francisco) y uso de `tooltips` para maximizar la información en pantalla.

## 3. Arquitectura de Software
### A. Frontend (Clean UI)
* **Desacoplamiento:** La lógica de estado y API debe vivir en **Custom Hooks**. El componente de React solo renderiza UI.
* **Limpieza de Formularios:** Reset automático de inputs tras un submit exitoso o al desmontar el componente para evitar persistencia de datos antiguos.
* **Navegación Abstracta:** No usar React Router directamente en componentes; usar un servicio de navegación en dominio.

### B. Backend (Logic Layer)
* **Domain First:** Definir interfaces en la capa de dominio antes que la infraestructura.
* **Resiliencia:** Manejo de procesos largos (batching) con estados intermedios reanudables en la DB.

## 4. Dimensiones de Ingeniería (Checklist)
1.  **Observabilidad:** `try/catch` con logs descriptivos que identifiquen el origen exacto del fallo.
2.  **Seguridad:** Validación estricta de tipos y esquemas (Zod) en todas las entradas.
3.  **Performance:** Implementación de `Skeleton Loaders` y procesamiento por lotes para evitar bloqueos de memoria.

## 5. Protocolo de Ejecución para el LLM
Al recibir una solicitud, la IA debe:
1.  **Analizar:** Identificar capas (Infraestructura, Dominio, UI).
2.  **Mapear:** Aplicar la estructura de 3 paneles al layout solicitado.
3.  **Generar:** Entregar código tipado al 100%, limpio y listo para "copiar y pegar".
