# 🚀 Guía de Despliegue en Vercel

## 📋 Prerrequisitos

1. **Cuenta en Vercel**: [vercel.com](https://vercel.com)
2. **Cuenta en Supabase**: [supabase.com](https://supabase.com)
3. **CLI de Vercel** (opcional): `npm i -g vercel`

## 🔧 Configuración de Supabase

### 1. Obtener Credenciales de Supabase
1. Ve a tu proyecto en Supabase
2. Ve a **Settings > Database**
3. Copia los valores de:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: Tu contraseña de base de datos

### 2. Obtener API Keys
1. Ve a **Settings > API**
2. Copia:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: Tu clave pública
   - **service_role secret**: Tu clave secreta (opcional)

### 3. Aplicar Migraciones en Supabase
1. Ve a **SQL Editor** en Supabase
2. Ejecuta estas consultas:

```sql
-- Agregar nuevos campos para manejo de IVA
ALTER TABLE "invoice" ADD COLUMN "amount_105" decimal(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice" ADD COLUMN "total_neto" decimal(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice" ADD COLUMN "vat_amount_21" decimal(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice" ADD COLUMN "vat_amount_105" decimal(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "invoice" ADD COLUMN "total_amount" decimal(10,2) NOT NULL DEFAULT 0;

-- Actualizar precision de campos existentes
ALTER TABLE "invoice" ALTER COLUMN "amount" TYPE decimal(10,2);

-- Eliminar el campo vat (tipo de IVA)
ALTER TABLE "invoice" DROP COLUMN "vat";
```

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en **"New Project"**
   - Importa tu repositorio de GitHub
   - Selecciona el repositorio

3. **Configura Variables de Entorno**
   En Vercel, ve a **Settings > Environment Variables** y agrega:

   ```
   DB_HOST=db.xxxxxxxxxxxxx.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=tu-password-de-supabase
   DB_NAME=postgres
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   NODE_ENV=production
   ```

4. **Configuración del Proyecto**
   - **Framework Preset**: `Node.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Deploy**
   - Haz clic en **"Deploy"**
   - Espera a que termine el build

### Opción 2: Despliegue desde CLI

1. **Instala Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configura Variables de Entorno**
   ```bash
   vercel env add DB_HOST
   vercel env add DB_PASSWORD
   # ... repite para todas las variables
   ```

## 🔍 Verificación del Despliegue

### 1. Verificar Endpoints
Una vez desplegado, prueba estos endpoints:

```bash
# Health check
curl https://tu-app.vercel.app/

# Listar facturas
curl https://tu-app.vercel.app/invoices

# Documentación (solo en desarrollo)
curl https://tu-app.vercel.app/docs
```

### 2. Verificar Logs
En Vercel Dashboard:
- Ve a tu proyecto
- Haz clic en **"Functions"**
- Revisa los logs de la función

## 🛠️ Solución de Problemas

### Error: "Cannot find module"
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que el build se complete correctamente

### Error: "Database connection failed"
- Verifica las variables de entorno de Supabase
- Asegúrate de que las credenciales sean correctas
- Verifica que la base de datos esté activa

### Error: "Function timeout"
- El timeout está configurado a 30 segundos
- Si necesitas más tiempo, modifica `vercel.json`

### Error: "CORS"
- CORS está configurado para permitir todos los orígenes
- Si necesitas restringir, modifica `src/index.ts`

## 📝 Notas Importantes

1. **Variables de Entorno**: Nunca subas credenciales reales a GitHub
2. **Base de Datos**: Asegúrate de que Supabase esté en la región correcta
3. **Cold Starts**: La primera petición puede ser lenta
4. **Logs**: Revisa los logs en Vercel para debugging

## 🔄 Actualizaciones

Para actualizar tu aplicación:
1. Haz push a GitHub
2. Vercel automáticamente hará un nuevo deploy
3. O usa `vercel --prod` desde CLI 