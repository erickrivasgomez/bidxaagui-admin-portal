
# 📘 Estándar Maestro de UI/UX: Bidxaagui Admin Suite (V1.5)

## 1. Fundamentos de Experiencia de Usuario (UX)

### 1.1 El Fin de la Jerarquía Profunda (Flat Navigation)
Se prohíbe cualquier flujo que requiera más de **2 clics** para llegar a una acción de edición.
* **Regla de Oro:** El usuario nunca "entra" a una pantalla para ver datos y luego a otra para editarlos. Los datos se ven en el **Canvas (Panel 2)** y se editan en el **Inspector (Panel 3)** que aparece en la misma vista.
* **Aplanamiento:** Los "Hubs" intermedios se eliminan. El acceso a sub-módulos (ej. Inventario dentro de Laboratorio) debe ser instantáneo desde la navegación lateral.

### 1.2 Comportamiento de los 3 Paneles (Layout Dinámico)
El sistema debe comportarse como un organismo vivo dependiendo del dispositivo:

* **Panel 1 (Sidebar Global):**
    * **Desktop:** Ancho fijo de **260px**. Colapsable a **64px** (solo iconos).
    * **iPhone 13/Mini:** Oculto por defecto. Emerge como un *Drawer* lateral desde la izquierda al tocar el "Hamburger menu". No empuja el contenido, se superpone con un backdrop de `blur(10px)`.
* **Panel 2 (Canvas Principal - Master):**
    * Es el "escritorio" de trabajo. Siempre ocupa el `100%` del espacio restante.
    * **Desktop:** Si el contenido es una tabla de datos, el ancho se limita a **1400px** centrado para evitar fatiga visual en monitores ultra-wide.
* **Panel 3 (Inspector Lateral - Detail):**
    * **Desktop:** Aparece desde la derecha ocupando **450px**. Desplaza o se superpone al Canvas según la importancia.
    * **iPhone 13/Mini:** Se convierte en una **Full-Screen Sheet**. Emerge desde abajo y cubre el 100% de la pantalla. Debe tener un botón "X" o "Listo" visible en la parte superior derecha.

---

## 2. Definición Estética "Organic Luxury"

### 2.1 Especificaciones de Color (Roles Estrictos)
No se permite el uso de colores fuera de esta lógica funcional:

| Categoría | Color Hex | Uso Obligatorio |
| :--- | :--- | :--- |
| **Fondo Base** | `#F8F8F4` | Fondo de la aplicación en Light Mode. |
| **Superficie** | `#FFFFFF` | Fondo de Cards, Inputs y el Inspector. |
| **Neutral Border** | `#DDDDCF` | Hairlines (bordes de 0.5px) entre paneles. |
| **Identidad Lab** | `#868466` | Botones primarios y estados activos en el módulo de Laboratorio. |
| **Identidad Antro** | `#866020` | Botones primarios y estados activos en Antroponómadas. |
| **Texto Primario** | `#1F1F1A` | Títulos, cuerpo de texto y etiquetas de formularios. |
| **Texto Muted** | `#8A8A77` | Placeholders, leyendas y textos de ayuda. |

### 2.2 Materialidad y Bordes (Apple Modern Style)
* **Border Radius:** * Contenedores grandes (Cards, Paneles): **12px**.
    * Botones e Inputs: **8px**.
    * Imágenes de perfil/Miniaturas: **6px**.
* **Sombras (Shadows):** Prohibido el uso de sombras negras pesadas. Usar sombras suaves: `box-shadow: 0 4px 12px rgba(134, 132, 102, 0.08)`.
* **Líneas:** Para dividir filas en tablas, usar bordes de **0.5px** color `#E5E5DA`. No usar líneas negras.

---

## 3. Guía de Interfaz para iPhone 13 & 13 Mini

### 3.1 Ergonomía Táctica
* **Área de Acción:** Los botones de "Guardar" o "Continuar" en formularios largos deben estar **fijos en la parte inferior** de la pantalla con un fondo degradado hacia el color de la superficie, para que siempre estén al alcance del pulgar.
* **Touch Targets:** Todos los elementos interactivos (iconos de eliminar, checkboxes) deben estar envueltos en un contenedor invisible de **44x44px**.
* **Inputs en PWA:** Al hacer foco en un input, el sistema no debe hacer un zoom extraño. (Regla técnica: `font-size` mínimo de **16px** en inputs para evitar el auto-zoom de iOS).

### 3.2 Navegación iOS-Native Feel
* **Navegación por Stack:** Cuando el usuario pasa de la "Lista de Ediciones" al "Inspector de Página", la pantalla debe deslizarse de derecha a izquierda.
* **Gesto de Retroceso:** Debe permitirse el deslizamiento desde el borde izquierdo de la pantalla para volver atrás (comportamiento nativo de iOS).

---

## 4. Alta Densidad de Información (The Power-User Grid)

### 4.1 Reglas de Visualización de Datos
* **Tablas Compactas:** Altura de fila de **40px** en Desktop y **48px** en Mobile.
* **Tipografía:** * Títulos de sección: 18px Bold.
    * Texto base: 14px Regular.
    * Datos de tabla/Labels: 12px Medium.
* **Sin Espacios Muertos:** Se prohíbe el uso de márgenes superiores/inferiores mayores a **24px** entre secciones de datos. La información debe estar agrupada de forma estrecha pero organizada por separadores visuales.

---

## 5. Gramática de Componentes (Sin Código)

### 5.1 Inputs y Formularios
* **Labels:** Siempre visibles arriba del campo. Nunca usar solo placeholders.
* **Estados:**
    * *Focus:* Borde de 1.5px del color de identidad del módulo (Verde o Marrón).
    * *Error:* Borde de 1px rojo técnico (`#B84C4C`) con un micro-texto explicativo debajo.
* **Auto-Reset:** Al cerrar el Inspector Lateral, todos los campos deben volver a su estado inicial.

### 5.2 Botones
* **Primario:** Color de identidad del módulo, texto blanco, sin bordes.
* **Secundario:** Fondo Marfil Envejecido, texto del color de identidad, borde sutil.
* **Destructivo:** Texto Rojo, fondo transparente que se vuelve rojo suave al hover.

### 5.3 Feedback de Carga (Skeletons)
* No usar spinners giratorios en el centro de la pantalla.
* Usar rectángulos con bordes redondeados (12px) y una animación de pulso sutil que ocupen el lugar exacto donde aparecerán las tablas o gráficos.

---

## 6. Reglas de Accesibilidad (WCAG 2.1)
1.  **Contraste:** El texto sobre fondos de color (como botones verdes) debe ser **Blanco Puro** para asegurar legibilidad.
2.  **No Solo Color:** Nunca usar el color como única forma de comunicar un estado. Un error debe llevar un icono de advertencia ⚠️ y texto.
3.  **Lectores de Pantalla:** Todos los iconos deben tener etiquetas descriptivas (aria-labels) para que un Junior Dev sepa que no son solo "adornos".

---

### Control de Conflictos para Desarrolladores
* **Si el diseño se rompe en iPhone 13 Mini:** Priorizar el stack vertical del formulario sobre la densidad de información.
* **Si el Marfil Envejecido dificulta la lectura:** Aumentar el peso de la fuente (de Regular a Medium).
* **Si el Inspector oculta datos críticos del Canvas:** En Desktop, el Canvas debe encogerse dinámicamente para que ambos paneles sean visibles simultáneamente.
