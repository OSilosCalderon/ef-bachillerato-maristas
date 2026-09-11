# Puesta en marcha real · EF de 1º Bachillerato · Maristas Badajoz

## Arquitectura recomendada
- Frontend/servidor Next.js: Vercel.
- Auth + PostgreSQL + Storage: Supabase.
- Producción: `NEXT_PUBLIC_DEMO_MODE=false`.

## Orden de puesta en marcha
1. Crear proyecto Supabase.
2. Ejecutar las migraciones `001` a `006` en orden (o `supabase db push`).
3. Configurar el bucket privado `course-documents` y verificar las políticas creadas por las migraciones.
4. Configurar `.env.local` en un terminal administrativo con URL, publishable key y `SUPABASE_SERVICE_ROLE_KEY`.
5. Ejecutar `npm run init:course`.
6. Ejecutar `npm run create:teacher` para el primer docente.
7. Ejecutar `npm run create:student` por cada alumno/a que se quiera dar de alta.
8. Publicar el repositorio en Vercel y añadir únicamente las variables runtime necesarias:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_DEMO_MODE=false`
9. No subir `SUPABASE_SERVICE_ROLE_KEY` al frontend ni al repositorio. Para este proyecto solo se necesita en terminal para scripts administrativos.
10. En Supabase Auth, configurar Site URL con el dominio definitivo de Vercel y las redirect URLs necesarias.

## Alta de profesor
Variables temporales en `.env.local`:

```dotenv
SUPABASE_SERVICE_ROLE_KEY=...
TEACHER_EMAIL=profesor@centro.es
TEACHER_PASSWORD=contraseña-larga-y-unica
TEACHER_DISPLAY_NAME=Profesor/a EF
```

Después:

```bash
npm run create:teacher
```

## Alta de alumno/a
Variables temporales:

```dotenv
STUDENT_EMAIL=alumno@centro.es
STUDENT_PASSWORD=contraseña-inicial-segura
STUDENT_DISPLAY_NAME=Nombre Apellidos
STUDENT_CLASS_GROUP=1º Bach A
COURSE_ACADEMIC_YEAR=2026/27
```

Después:

```bash
npm run create:student
```

## Advertencia funcional actual
El control de acceso por roles y el esquema Supabase existen, pero gran parte de las pantallas de SA1/SA2/SA3 todavía consumen `*-demo-data.ts` y componentes con estado local. Por tanto, esta versión sirve para publicar y probar acceso profesor/alumno, navegación y diseño, pero no debe considerarse todavía una plataforma de aula con persistencia completa de pruebas, diarios, cuestionarios y contenidos.

Antes de introducir datos reales del alumnado hay que conectar cada formulario/listado con las tablas Supabase y probar las políticas RLS con cuentas reales de ambos roles.
