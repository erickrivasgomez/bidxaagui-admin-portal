# BIDXAAGUI - Admin Portal

Panel de administración para gestionar el contenido de BIDXAAGUI.

## 🚀 Stack Tecnológico

- React 18
- TypeScript
- Vite
- Cloudflare Pages

## 🛠️ Setup Local

### Instalar dependencias
```bash
npm install
```

### Ejecutar en desarrollo
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

### Build de producción
```bash
npm run build
```

### Preview de producción
```bash
npm run preview
```

## 🌐 Deploy

Este proyecto se despliega automáticamente en Cloudflare Pages en:
- **URL**: `admin.bidxaagui.com`

Cada push a `main` dispara un deploy automático.

## 📁 Estructura del Proyecto

```
admin-portal/
├── src/
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Entry point
├── public/              # Assets estáticos
├── index.html           # HTML entry
├── vite.config.ts       # Configuración de Vite
└── package.json
```

## 🔐 Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=https://api.bidxaagui.com
```

## 📝 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecuta linter |

## 🔗 API Backend

Este portal consume el API Worker en:
- **URL**: `https://api.bidxaagui.com`
- **Repo**: `bidxaagui/backend-worker`

---

**Última actualización**: 2025-12-05
