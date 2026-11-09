# Guía de uso: Consultora

Esta guía explica, paso a paso, cómo usar la app. Está pensada para quienes la usan todos los días.

## 1. Ingresar

1. Abrí la app y elegí **Ingresar con Google**.
2. Usá la cuenta de Google que el administrador dio de alta para vos.
3. Si ves *"sin rol"* o no podés entrar, pedile a un administrador que cargue tu email en **Usuarios**.

## 2. Inicio

El inicio muestra tu resumen. Cada widget tiene un tipo:

- **Interactivo:** podés votar o usar accesos directos desde el widget (por ejemplo, *Ideas más votadas* o *Accesos rápidos*).
- **Informativo:** muestra números o listas para mirar (por ejemplo, *Ideas por estado*).

Para cambiar lo que ves:

1. Tocá **Personalizar inicio**.
2. Marcá o desmarcá los widgets.
3. Elegí cuántos elementos mostrar (de 1 a 10) y de qué fuente son las ideas: todas, solo las tuyas o solo las cerradas.
4. Tocá **Guardar**. La configuración queda en tu cuenta.

## 3. Directorio

1. Entrá a **Directorio** desde el inicio, en *Accesos rápidos*.
2. Elegí un área. Cada área agrupa varias áreas parecidas (por ejemplo, *Diseño y UX*).
3. En el modal, buscá por nombre o puesto. La lista carga de a poco al bajar.
4. Tocá una persona para ver su perfil y sus skills.
5. Si el perfil está pendiente y es tuyo, tocá **Confirmar mi perfil**. Solo las personas con perfil confirmado aparecen en squads y propuestas.

## 4. Ideas

Una **idea** es algo que todavía no tiene cliente ni precio. Sirve para proponer, votar y discutir antes de decidir si vale la pena avanzar.

### Cargar una idea
1. Entrá a **Ideas** y tocá **Nueva idea**.
2. Escribí un título corto y, si querés, una descripción.
3. Tocá **Guardar idea**.

### Votar
- Tocá el botón con la flecha (▲) en la card o en el detalle. Tocá de nuevo para quitar tu voto.
- Cada persona tiene un voto por idea.

### Comentar
1. Abrí la idea tocando su título.
2. Escribí en **Tu comentario** y tocá **Comentar**.

### Cambiar el estado (líderes y admin)
1. Dentro de la idea, elegí el estado en **Estado** y tocá **Cambiar estado**.
2. Estados: *Abierta*, *En evaluación*, *Cerrada*. El estado *Convertida* se asigna solo al crear una propuesta.

### Convertir una idea en propuesta
1. Dentro de la idea, tocá **Crear propuesta desde esta idea**.
2. Se abre el formulario de propuesta con el título ya cargado. Seguí el paso a paso de la sección 5.
3. Al crear la propuesta, la idea pasa a *Convertida* y queda vinculada.

## 5. Propuestas

Una **propuesta** es un documento comercial para un cliente: equipo, horas, tarifas y descuento.

### Crear una propuesta (paso a paso)
1. Entrá a **Propuestas** y tocá **Nueva propuesta**.
2. **Paso 1, Proyecto:** elegí el proyecto y escribí el título.
3. **Paso 2, Equipo:** completá las horas y la tarifa de cada rol. Las filas sin horas se ignoran.
4. **Paso 3, Condiciones:** poné el descuento (si hay) y las notas para el cliente.
5. **Paso 4, Revisión:** mirá horas, subtotal y total. Tocá **Crear propuesta**.
6. Se abre la propuesta. Tocá **Descargar PDF** para enviarla al cliente.

Si algo no está bien, la app te dice qué corregir y no pierde lo que escribiste.

## 6. Proyectos y squads (líderes)

1. Entrá a **Proyectos** y tocá **Nuevo proyecto**.
2. Dentro del proyecto, creá un squad con **Crear squad**.
3. Para sumar a alguien, elegí una persona con perfil confirmado, su rol y su dedicación (1 a 100%), y tocá **Sumar**.

## 7. Configuración y cerrar sesión

- Tocá tu avatar (arriba a la derecha) para abrir el menú.
- Ahí cambiás el tema (claro, oscuro o del sistema), abrís **Gestión de usuarios** (solo admin) o cerrás sesión.

## 8. Si algo falla

- **"No se pudo guardar":** revisá la conexión y probá de nuevo. Tu texto sigue en pantalla.
- **"No tenés permiso":** tu rol no alcanza para esa acción. Pedile a un líder o admin.
- **La página no carga o muestra error:** recargá. Si una pestaña quedó abierta antes de una actualización, es normal que haga falta recargar.
- Si el problema sigue, avisá al administrador con la pantalla y la hora.

---

# Guía técnica (equipo)

## Puesta en marcha local
```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL (rama dev de Neon)
npm run db:migrate
npm run dev
```

## Verificaciones antes de mergear
```bash
npm run lint
npm run typecheck
npm test                         # tests unitarios
TEST_DATABASE_URL=... npm run test:flujo   # flujo completo contra una base de prueba
npm run build
```

## Despliegue
1. Mergear el PR a `main`. Vercel despliega solo.
2. Si el PR trae migraciones nuevas, aplicarlas a producción **antes** de que el código las use:
   ```bash
   PURL=$(neon connection-string main --project-id <ID_PROYECTO_NEON> --pooled | tail -1) && DATABASE_URL="$PURL" npx drizzle-kit migrate
   ```
3. Revisar producción en el navegador.

## Importar colaboradores
```bash
npm run import:colaboradores -- /ruta/colaboradores.json
```
Las personas entran como `pending`. Solo quienes confirman su perfil aparecen en squads y propuestas.
