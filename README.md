# Bills API 🧾

API REST para gestión de facturas y proveedores con autenticación JWT independiente.

## 🚀 Tecnologías

- **Framework:** [NestJS](https://nestjs.com/) - Framework Node.js progresivo
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) via Supabase
- **Autenticación:** JWT (JSON Web Tokens) independiente
- **Hash de Contraseñas:** [Bcrypt](https://github.com/dcodeIO/bcrypt.js)
- **Validación:** [class-validator](https://github.com/typestack/class-validator)
- **Documentación:** [Swagger/OpenAPI](https://swagger.io/)
- **Deployment:** [Vercel](https://vercel.com/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)

## 📋 Características

- ✅ **Autenticación independiente** - Sin dependencias de servicios externos
- ✅ **JWT Tokens** - Autenticación stateless segura
- ✅ **CRUD completo** - Para facturas y proveedores
- ✅ **Filtros avanzados** - Búsqueda por múltiples criterios
- ✅ **Paginación** - Manejo eficiente de grandes volúmenes
- ✅ **Validación robusta** - DTOs con validación automática
- ✅ **Documentación automática** - Swagger integrado
- ✅ **CORS habilitado** - Para integración con frontend
- ✅ **Tipado completo** - TypeScript en toda la aplicación

## 🔐 Autenticación

La API utiliza JWT tokens para autenticación. Todas las rutas están protegidas por defecto excepto las marcadas como públicas.

### Endpoints de Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signup` | Registro de usuario | Pública |
| `POST` | `/auth/login` | Login de usuario | Pública |
| `GET` | `/auth/profile` | Obtener perfil | Protegida |
| `POST` | `/auth/logout` | Logout | Protegida |

## 📊 Endpoints de Facturas

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/invoices` | Listar facturas | `status`, `type`, `supplierId`, `fromDate`, `toDate`, `page`, `limit` |
| `POST` | `/invoices` | Crear factura | Body: datos de factura |
| `GET` | `/invoices/:id` | Obtener factura | `id` |
| `PUT` | `/invoices/:id` | Actualizar factura | `id`, Body: datos de factura |
| `DELETE` | `/invoices/:id` | Eliminar factura | `id` |
| `PUT` | `/invoices/:id/pay` | Marcar como pagada | `id`, Body: `{date: string}` |

### Filtros de Facturas

```bash
# Filtrar por estado
GET /invoices?status=to_pay

# Filtrar por múltiples estados
GET /invoices?status=to_pay,prepared

# Filtrar por proveedor
GET /invoices?supplierId=1

# Filtrar por fecha
GET /invoices?fromDate=2024-01-01&toDate=2024-12-31

# Paginación
GET /invoices?page=1&limit=10
```

### Estados de Factura

- `to_pay` - Por pagar
- `prepared` - Preparada
- `paid` - Pagada

### Tipos de Factura

- `A` - Factura A
- `X` - Factura X

## 🏢 Endpoints de Proveedores

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/suppliers` | Listar proveedores | - |
| `POST` | `/suppliers` | Crear proveedor | Body: datos de proveedor |
| `GET` | `/suppliers/:id` | Obtener proveedor | `id` |
| `PUT` | `/suppliers/:id` | Actualizar proveedor | `id`, Body: datos de proveedor |
| `DELETE` | `/suppliers/:id` | Eliminar proveedor | `id` |
| `GET` | `/suppliers/health` | Health check | - |

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd bills-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env`:
```env
# Database Configuration (Supabase)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 4. Ejecutar en desarrollo
```bash
npm run start:dev
```

### 5. Ejecutar en producción
```bash
npm run build
npm run start:prod
```

## 🚀 Deployment

### Vercel
La API está configurada para deployment en Vercel. El archivo `vercel.json` contiene la configuración necesaria.

### Variables de entorno en producción
Asegúrate de configurar las variables de entorno en tu plataforma de deployment:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Ejecutar en modo desarrollo con hot reload |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Ejecutar en modo producción |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:e2e` | Ejecutar tests end-to-end |
| `npm run test:cov` | Ejecutar tests con coverage |
| `npm run lint` | Ejecutar linter |
| `npm run lint:fix` | Corregir errores de linting |

**Desarrollado con ❤️ usando NestJS**
