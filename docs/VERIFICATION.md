# Informe de verificación · v1.0

Fecha: 11/09/2026

## Comprobaciones completadas

- `npm run check:routes`: **OK**
  - 38 páginas detectadas.
  - 0 enlaces internos estáticos rotos.
- `npm run audit:static`: **OK**
  - 45 tablas de aplicación detectadas.
  - 45/45 con Row Level Security activado.
  - 0 referencias a `SUPABASE_SERVICE_ROLE_KEY` en `app/`, `components/` o `lib/`.
- Imports internos `@/...`: **0 rotos**.
- Páginas de alumnado/profesorado: **36/36** heredan navegación mediante sus layouts.
- Revisión de secretos embebidos: **0 coincidencias** con patrones de claves/JWT.
- Revisión de responsive de las nuevas pantallas centrales: grids/breakpoints móviles presentes.
- `tsc --noEmit` global: no aparecen códigos de error de parser TypeScript/TSX.

## Comprobaciones que el entorno no permite cerrar

`npm install --no-audit --no-fund` queda bloqueado antes de crear `node_modules`.

Por ese motivo:

- `npm run lint` no puede arrancar ESLint instalado localmente.
- `npm run typecheck` usa el TypeScript global y falla posteriormente por ausencia de React, Next, Supabase, Lucide, Recharts y `@types/node`.
- `npm run build` no puede ejecutar el binario local de Next.js.

Esto es una limitación del entorno de generación, no una confirmación de que el build final pase.

## Comando obligatorio antes de despliegue real

En un equipo/CI con acceso normal a npm:

```bash
npm ci
npm run verify
```

No desplegar con alumnado real si `npm run verify` no termina con código 0.

## Validación de permisos recomendada en staging

Crear tres identidades:

1. alumno A;
2. alumno B;
3. profesor.

Verificar manualmente:

- alumno A no puede seleccionar/actualizar filas de alumno B;
- alumno B tampoco puede acceder a alumno A;
- ambos reciben error o cero filas al intentar tablas docentes;
- el profesor sí puede consultar ambos;
- un alumno no puede acceder a `/profesor`;
- un objeto privado de Storage no publicado no es legible por alumnado;
- respuestas de cuestionarios psicológicos solo son visibles por propietario + profesor.
