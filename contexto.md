# Contexto del Proyecto: Sistema de Gestión Educativa

## Arquitectura y Stack Tecnológico
- **Backend:** Laravel (Modo API RESTful).
- **Frontend:** Next.js (App Router) + Tailwind CSS.
- **Despliegue planeado:** Frontend en Vercel, Backend en Railway/Render (arquitectura desacoplada).
- **Diseño UI:** Estrictamente Modo Claro (Light Mode). UI limpia, corporativa e intuitiva.

## Reglas Globales de Desarrollo
1. Escribe código limpio, modular y comentado en español.
2. Trabaja paso a paso. No intentes implementar todo el CRUD y la autenticación en una sola respuesta.
3. Para el frontend, usa componentes de servidor donde sea posible y componentes de cliente solo para interactividad.
4. Las peticiones a la API deben manejar correctamente los errores y mostrar feedback visual al usuario (toasts/alertas).

## Funcionalidades Core

### 1. Autenticación y Seguridad (Single-Tenant)
- **Registro Único:** El sistema debe bloquear la ruta de registro una vez que exista UN (1) usuario en la base de datos. Nadie más debe poder registrarse.
- **Inicio de Sesión:** Requerido para ver cualquier ruta del dashboard.
- **Recuperación de Contraseña:** Al registrarse o iniciar sesión por primera vez, el sistema debe obligar al usuario a configurar 3 preguntas de seguridad. Estas preguntas servirán para restablecer la contraseña en el futuro sin usar envío de correos.

### 2. Módulo de Estudiantes (CRUD Completo)
El sistema gestiona estudiantes de 1ero a 6to grado. Todas las entidades deben estar relacionadas correctamente en la base de datos de Laravel.

**Esquema de Datos Requerido y Relaciones:**

Todas las siguientes entidades dependen de y pertenecen a un "Estudiante". Laravel debe manejar estas relaciones con sus respectivas llaves foráneas (`estudiante_id`).

* **Tabla/Modelo: Estudiante (Entidad Principal)**
    * Nombre y Apellido (String)
    * Cédula Estudiantil (String, Único)
    * Género (Enum/Select: Masculino, Femenino)
    * Registro Médico (Text - Enfermedades, alergias, etc.)
    * Cantidad de asistencias en el lapso (number)
    * Cantidad de inasistencias en el lapso (number)
    * Observaciones sobre las inasistencias
    * *Relación:* Pertenece a un Grado/Sección (`grado_id`).

* **Tabla/Modelo: Representante**
    * *Relación:* 1 a 1 (o 1 a N) con Estudiante (Foreign Key: `estudiante_id`).
    * Nombre y Apellido (String)
    * Número de teléfono (String)
    * Dirección (Text)
    * Cédula (String)

* **Tabla/Modelo: Grado_Seccion**
    * *Relación:* 1 a N con Estudiantes (Un grado tiene muchos estudiantes).
    * Grado (Enum/Select: 1ero a 6to)
    * Nombre del docente (String)
    * Sección (String/Select)

* **Tabla/Modelo: Notas Académicas**
    * *Relación:* 1 a 1 o 1 a N con Estudiante (Foreign Key: `estudiante_id`).
    * Lapso (Enum/Select: 1, 2, 3, Final)
    * Boletín / Observaciones (Text)