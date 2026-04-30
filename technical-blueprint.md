
# ⚙️ Technical Blueprint: Bidxaagui Admin Portal (V2.0)

## 1. Arquitectura de Software: Domain-First & Clean UI
El código generado debe ser **Framework-Agnostic** en su lógica y **Optimizado para React** en su entrega.

### 1.1 Estructura de Capas (Folder Structure)
El asistente debe organizar los archivos siguiendo esta jerarquía estricta para evitar acoplamiento:
* `domain/`: Interfaces puras, Entidades y Schemas de Zod (Sin dependencias de React).
* `application/`: Casos de uso y lógica de negocio pura.
* `infrastructure/`: Adaptadores de API, clientes de Cloudflare (D1, R2) y servicios externos.
* `presentation/`:
    * `components/`: Componentes atómicos de UI (Siguiendo el **UI/UX Standard**).
    * `hooks/`: Lógica de estado de React (Custom Hooks que consumen la capa de `application`).
    * `layouts/`: Definición de los **3 Paneles**.

---

## 2. El Contrato de los 3 Paneles (Layout Engine)
Cualquier módulo nuevo debe implementar obligatoriamente esta estructura de componentes:

### 2.1 `ModuleLayout.tsx`
Componente raíz de cada módulo que gestiona la visibilidad de los paneles según el `deviceType`:
* **Desktop:** Renderiza `AppSidebar` (Panel 1) + `Canvas` (Panel 2) + `Inspector` (Panel 3) como hermanos en un flexbox.
* **Mobile (iPhone 13):** Usa un `Context` para manejar qué panel está activo. El `Inspector` debe renderizarse mediante un `Portal` al final del DOM para actuar como una **Full-Screen Sheet**.

### 2.2 `NavigationController`
* No usar navegación basada en rutas de navegador para cambios *dentro* del módulo.
* Implementar un patrón de **Stack de Pantallas** para el Canvas:
    ```typescript
    // La IA debe usar esta interfaz para transiciones internas
    interface NavigationStack {
      view: 'list' | 'detail' | 'preview';
      params?: any;
    }
    ```

---

## 3. Gestión de Estados y Resiliencia (State Logic)

### 3.1 Data States Obligatorios
Todo fetch de datos debe mapearse a este objeto de estado para alimentar los **Skeletons** y **Empty States** del UI Standard:
```typescript
interface DataState<T> {
  data: T | null;
  status: 'idle' | 'loading' | 'error' | 'success' | 'empty';
  error: string | null;
}
```

### 3.2 Lógica de Formularios e Inspector
* **Auto-Reset:** Todo formulario dentro del Inspector debe usar el hook `useForm` con una función de limpieza en el `useEffect` de desmontaje.
* **Optimistic UI:** Al guardar en el Inspector, la IA debe generar código que actualice el estado local del Canvas inmediatamente antes de que el Cloudflare Worker confirme la operación.

---

## 4. Estándares de Código y Tipado (SOLID)

### 4.1 Type Safety con Zod
* Cada entidad del dominio debe tener un schema de Zod.
* **Validación de Entrada:** Todas las respuestas de la API de Cloudflare deben ser validadas con `.parse()` antes de entrar al estado de la aplicación.

### 4.2 Inyección de Dependencias
Los componentes de UI no deben instanciar clientes de API. Deben recibir los servicios a través de un Context o Props:
* *Mal:* `axios.get('/api/data')` dentro de un componente.
* *Bien:* `useData(repository.findAll)` donde `repository` es inyectado.

---

## 5. Optimizaciones Específicas para PWA & iPhone 13

### 5.1 Touch & Performance
* **Área de Hit:** La IA debe aplicar automáticamente un padding invisible a iconos pequeños usando utilidades de CSS para alcanzar los **44x44px**.
* **Prevención de Zoom:** Configurar los inputs con `font-size: 16px` (mínimo) en media queries de mobile.
* **Scroll:** Implementar `overscroll-behavior: none` en el contenedor principal para evitar el rebote del navegador que rompe la sensación de App Nativa.

---

## 6. Protocolo de Implementación para la IA (Prompt de Ejecución)
Cuando pidas a tu AI Assistant que cree un módulo, debe seguir este checklist interno:

1.  **Analizar el Dominio:** Definir la interfaz de la entidad (ej. `Provider`, `InventoryItem`).
2.  **Crear el Custom Hook:** Desarrollar `useModuleData` que maneje el estado de carga y error.
3.  **Implementar Viewport Logic:** Asegurar que en `< 390px` (iPhone 13 Mini) el Inspector sea full-screen.
4.  **Aplicar Estética:** Usar exclusivamente las variables de color del **Organic Luxury Scheme** (Verdes/Marrones/Marfil).
5.  **Verificar Resiliencia:** Añadir `try/catch` con logs que incluyan el contexto de la falla para depuración rápida en producción.

---

## 7. Diccionario Técnico de Colores (CSS Variables)
El asistente debe inyectar estos tokens en el `index.css` o en el sistema de diseño:
* `--primary-org`: `#868466` (Verde para Lab)
* `--secondary-org`: `#866020` (Marrón para Antro)
* `--surface-ivory`: `#F8F8F4` (Fondo Base)
* `--text-main`: `#1F1F1A` (Legibilidad)
* `--border-hairline`: `#DDDDCF` (Separador sutil)
