# 🏫 Sistema de Gestión Escolar - U.E. César Augusto Ágreda

Una plataforma web Full-Stack diseñada para la administración eficiente de estudiantes, representantes, calificaciones y asistencias de una institución educativa. 

## 🚀 Sobre este proyecto y mi flujo de trabajo con IA

Este proyecto fue desarrollado utilizando un enfoque de **Desarrollo Asistido por Inteligencia Artificial (AI-Assisted Development)**. 

Como desarrollador con años de experiencia construyendo interfaces y arquitecturas web, utilicé modelos de IA (generación de código y diseño UI) como multiplicadores de productividad. Esto me permitió acelerar la maquetación inicial, la escritura de boilerplate y la estructuración de componentes.

**Sin embargo, el control absoluto del proyecto es humano.** La integración fluida entre el frontend y el backend, la resolución de problemas complejos de CORS, la implementación de guardias de ruta (Route Guards) en Next.js, la seguridad con Laravel Sanctum y las reglas de validación de negocio en la base de datos fueron guiadas por mi dominio de estas tecnologías. La IA es una excelente herramienta de autocompletado avanzado, pero requiere de un arquitecto que entienda profundamente el ciclo de vida de React, la manipulación del DOM y el patrón MVC para que el software sea escalable, seguro y libre de bugs.

## 💻 Stack Tecnológico

**Frontend:**
* **Next.js (App Router):** Enrutamiento avanzado, Server Components y optimización.
* **React:** Manejo de estados complejos, useEffects y formularios multi-paso.
* **Tailwind CSS:** Diseño institucional "Light Mode", responsivo, limpio y minimalista.
* **Axios / Fetch API:** Consumo de API RESTful con interceptores para tokens de autorización.

**Backend:**
* **Laravel 12:** API RESTful robusta y controladores eficientes.
* **Laravel Sanctum:** Autenticación segura basada en tokens (SPA Auth).
* **SQLite / MySQL:** Base de datos relacional con reglas de integridad estrictas.

## ✨ Características Principales

* **🛡️ Autenticación y Seguridad Avanzada:** * Sistema de administrador único (bloquea la creación de múltiples cuentas admin).
  * Flujo de recuperación de contraseña *sin dependencias de email*, utilizando preguntas de seguridad encriptadas configuradas en el primer inicio de sesión.
  * Protección de rutas en el frontend (Route Guards) para usuarios no autenticados o con configuración pendiente.
* **📊 Dashboard Administrativo:** Panel de control con estadísticas en tiempo real de estudiantes y grados activos.
* **👨‍🎓 Gestión de Estudiantes y Representantes:** * Formularios multi-paso (Multi-part forms) con manejo de estados fluidos en React.
  * Actualización parcial de datos manteniendo la integridad referencial.
* **📚 Control Académico:**
  * CRUD de Grados y Secciones con validaciones de negocio estrictas (ej. evitar duplicidad de secciones).
  * Registro de Asistencias con manejo preciso de zonas horarias (Timezone offsets).
  * Carga de Notas Académicas con límite lógico por lapsos.

## 🛠️ Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina local, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/jobchirino/cesarAugustoApp](https://github.com/jobchirino/cesarAugustoApp)