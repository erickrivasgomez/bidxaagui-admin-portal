# 🔍 **Análisis de Dominio y Casos de Uso**



# 📋 **Análisis Completo de Dominio y Casos de Uso**

## **🏗️ Arquitectura por Módulos Identificada**

### **📚 Módulo: Antroponómadas (Publicaciones/Content)**

#### **🎯 Modelos de Datos:**

**1. Campaign (Campañas de Email)**
```typescript
interface Campaign {
  id: string;
  subject: string;                    // Asunto del email
  preview_text?: string;             // Texto de previsualización
  content: string;                   // Contenido HTML/texto
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sent_at?: string;                   // Fecha de envío
  total_recipients: number;          // Total destinatarios
  successful_sends: number;           // Envíos exitosos
  failed_sends: number;               // Envíos fallidos
  created_at: string;
  updated_at: string;
}
```

**2. Edition (Ediciones de Revista)**
```typescript
interface Edition {
  id: string;
  titulo: string;                     // Título de la edición
  descripcion?: string;               // Descripción
  cover_url?: string;                 // URL de portada
  fecha?: string;                     // Fecha de publicación
  pdf_url?: string;                   // URL del PDF generado
  publicada: number;                  // Estado de publicación (0/1)
  created_at: string;
  pages?: EditionPage[];              // Páginas asociadas
}

interface EditionPage {
  id: string;
  imagen_url: string;                 // URL de imagen de página
  numero: number;                     // Número de página
}
```

**3. Subscriber (Suscriptores)**
```typescript
interface Subscriber {
  id: string;
  email: string;                      // Email principal
  name?: string;                      // Nombre opcional
  subscribed: number;                 // Estado de suscripción (0/1)
  subscribed_at: string;              // Fecha de suscripción
  unsubscribed_at?: string;           // Fecha de baja
}

interface SubscriberStats {
  total: number;                      // Total suscriptores
  thisMonth: number;                  // Nuevos este mes
  lastMonth: number;                  // Nuevos mes pasado
  growthRate: number;                 // Tasa de crecimiento
  recentGrowth: Array<{ date: string; count: number }>; // Crecimiento reciente
}
```

#### **⚡ Casos de Uso (Antroponómadas):**

**Campaigns:**
- [GetCampaignsUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/antroponomadas/application/campaign.use-cases.ts:3:0-8:1) - Obtener todas las campañas
- [CreateCampaignUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/antroponomadas/application/campaign.use-cases.ts:10:0-15:1) - Crear nueva campaña
- [UpdateCampaignUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/antroponomadas/application/campaign.use-cases.ts:17:0-22:1) - Actualizar campaña existente
- [DeleteCampaignUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/antroponomadas/application/campaign.use-cases.ts:24:0-29:1) - Eliminar campaña
- [SendCampaignUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/antroponomadas/application/campaign.use-cases.ts:31:0-36:1) - Enviar campaña a todos
- [SendTestCampaignUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/antroponomadas/application/campaign.use-cases.ts:38:0-43:1) - Enviar campaña de prueba

**Editions:**
- `GetEditionsUseCase` - Obtener todas las ediciones
- `CreateEditionUseCase` - Crear nueva edición
- `UpdateEditionUseCase` - Actualizar edición
- `DeleteEditionUseCase` - Eliminar edición
- `GeneratePdfUseCase` - Generar PDF de edición
- `PublishEditionUseCase` - Publicar edición

**Subscribers:**
- `GetSubscribersUseCase` - Obtener todos los suscriptores
- `CreateSubscriberUseCase` - Agregar suscriptor
- `UpdateSubscriberUseCase` - Actualizar suscriptor
- `DeleteSubscriberUseCase` - Eliminar suscriptor
- `ImportSubscribersUseCase` - Importar suscriptores masivamente
- `ExportSubscribersUseCase` - Exportar lista de suscriptores
- `GetSubscriberStatsUseCase` - Obtener estadísticas

---

### **🧪 Módulo: Laboratorio (Operations/Inventory)**

#### **🎯 Modelos de Datos:**

**1. Supplier (Proveedores)**
```typescript
interface Supplier {
  id: string;
  name: string;                       // Nombre del proveedor
  phone: string;                      // Teléfono
  city: string;                       // Ciudad
  created_at?: string;
  updated_at?: string;
}

type CreateSupplierRequest = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
type UpdateSupplierRequest = Partial<CreateSupplierRequest>;
```

**2. Product (Productos)**
```typescript
interface Product {
  id: string;
  name: string;                       // Nombre del producto
  price: number;                      // Precio
}
```

#### **⚡ Casos de Uso (Laboratorio):**

**Suppliers:**
- [GetSuppliersUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/laboratorio/application/suppliers.use-cases.ts:4:0-9:1) - Obtener todos los proveedores
- [CreateSupplierUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/laboratorio/application/suppliers.use-cases.ts:11:0-19:1) - Crear nuevo proveedor
- [UpdateSupplierUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/laboratorio/application/suppliers.use-cases.ts:21:0-26:1) - Actualizar proveedor
- [DeleteSupplierUseCase](cci:2://file:///home/erickrg/Documents/projects/bidxaagui-suite/bidxaagui-admin-portal/src/core/modules/laboratorio/application/suppliers.use-cases.ts:28:0-33:1) - Eliminar proveedor

**Inventory:**
- `GetInventoryUseCase` - Obtener inventario
- `UpdateInventoryUseCase` - Actualizar stock
- `AddProductUseCase` - Agregar producto

**Sales:**
- `GetSalesUseCase` - Obtener ventas
- `CreateSaleUseCase` - Crear venta
- `GetSalesStatsUseCase` - Estadísticas de ventas

---

## **🎯 Flujo de Negocio Identificado**

### **📱 Publishing Pipeline (Antroponómadas)**
1. **Crear Edición** → Subir páginas → Generar PDF → Publicar
2. **Gestionar Suscriptores** → Importar/Exportar → Estadísticas
3. **Campañas Email** → Crear contenido → Enviar masivo → Métricas

### **🧪 Lab Operations (Laboratorio)**
1. **Gestión Proveedores** → Alta/Baja/Modificación
2. **Control Inventario** → Stock → Productos → Precios
3. **Ventas** → Registro → Estadísticas → Reportes

## **🔧 Patrones de Arquitectura Observados**

✅ **Clean Architecture**: Domain → Application → Infrastructure  
✅ **Repository Pattern**: Abstracción de persistencia  
✅ **Use Case Pattern**: Lógica de negocio encapsulada  
✅ **Type Safety**: Interfaces TypeScript estrictas  
