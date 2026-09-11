# Auditoría de privacidad y seguridad

Fecha de revisión: 11/09/2026  
Ámbito: versión 1.0 candidata a despliegue.

## Controles revisados

### 1. Separación entre alumnos

**Estado: implementado en el esquema.**

Las tablas con datos personales de alumnado usan RLS y comparan el `student_id` con `public.current_student_id()`. Entre ellas se incluyen progreso, resultados físicos/técnicos, diarios, cuestionarios, intentos procedimentales, sesiones SA3, valoraciones y autoevaluaciones.

No existe ninguna política que permita a un estudiante seleccionar filas de otro estudiante.

### 2. Contenidos docentes

**Estado: implementado.**

Las tablas de definición y contenido conceden escritura únicamente cuando `public.is_teacher()` es verdadero. El alumno solo obtiene lectura de contenidos publicados.

El cliente no determina la autorización: la comprobación definitiva está en PostgreSQL/RLS.

### 3. Dashboard docente

**Estado: implementado en servidor.**

`app/profesor/layout.tsx` ejecuta `requireRole("teacher")`. Cuando Supabase está configurado, la sesión se verifica y el rol se consulta en `profiles` antes de renderizar cualquier ruta docente.

`proxy.ts` mantiene la sesión SSR mediante cookies.

### 4. Documentos privados

**Estado: implementado en migraciones.**

El bucket `course-documents` se configura como privado. Las lecturas se autorizan mediante políticas de `storage.objects` que comprueban publicación o rol docente.

No debe convertirse este bucket en público desde el Dashboard de Supabase.

### 5. Row Level Security

**Estado: activado en las tablas de aplicación.**

Las migraciones `001`, `003`, `004`, `005` y `006` activan RLS explícitamente para sus tablas sensibles. La migración `002` protege Storage.

Antes de incorporar datos reales se recomienda ejecutar pruebas de integración con una cuenta alumno A, alumno B y profesor, verificando que las consultas cruzadas devuelvan cero filas o error.

### 6. Secretos

**Estado: correcto en el repositorio revisado.**

El frontend utiliza únicamente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` aparece únicamente en scripts administrativos ejecutados en servidor/terminal. Nunca debe llevar el prefijo `NEXT_PUBLIC_`.

Los archivos `.env` están incluidos en `.gitignore`.

### 7. Logs

**Estado: correcto en código propio.**

No se imprimen contraseñas, tokens, respuestas de cuestionarios ni claves. Los scripts administrativos solo imprimen estados y mensajes de error.

En producción evita añadir logging de payloads completos de formularios, especialmente cuestionarios, diarios y autoevaluaciones.

### 8. Cuestionarios psicológicos

**Estado: privacidad estructural implementada.**

No se incluyen tests psicológicos reales. Las respuestas y puntuaciones se separan de las definiciones y se protegen para alumno propietario + profesorado autorizado.

Las claves de corrección viven en tablas docentes separadas y las columnas de puntuación no están concedidas al cliente alumno.

## Riesgos y acciones antes de tratar datos reales

1. Realizar pruebas RLS contra un proyecto Supabase de staging con tres identidades diferentes.
2. Definir la política del centro sobre conservación, rectificación, eliminación y exportación de datos.
3. Revisar jurídicamente cualquier futuro instrumento psicológico antes de publicarlo.
4. Sustituir progresivamente los adaptadores demo de interfaz por repositorios Supabase en cada módulo.
5. Activar MFA para cuentas docentes si la política del centro lo permite.
6. Configurar copias de seguridad y procedimientos de recuperación en Supabase.
7. No habilitar Analytics o herramientas de terceros que capturen texto de formularios sensibles sin evaluación previa.
