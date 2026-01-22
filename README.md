# FarmaNote 💊

FarmaNote es una **aplicación web** desarrollada como proyecto de título, orientada a mejorar la **adherencia a tratamientos farmacológicos**, permitiendo a pacientes y médicos gestionar recetas digitales de manera segura y clara.

La plataforma permite registrar medicamentos con información detallada (dosis, intervalo, duración y fechas), visualizar las recetas en formato de listado y calendario mensual, y asegurar que la información médica sea accesible únicamente por los usuarios autorizados.

---

## Contexto del proyecto

Diversos estudios de la Organización Mundial de la Salud indican que la adherencia a tratamientos farmacológicos alcanza solo alrededor del 50%, incluso en países desarrollados.  
FarmaNote surge como una solución digital para apoyar el **Uso Racional de Medicamentos**, facilitando la comprensión y seguimiento de las indicaciones médicas.

El sistema se enmarca en el contexto de una **clínica ficticia**, donde médicos y pacientes interactúan mediante una plataforma web moderna.

---

## Funcionalidades principales

### Autenticación y roles
- Registro e inicio de sesión con Firebase Authentication
- Gestión de roles: **Doctor** y **Paciente**
- Redirección automática según rol

### Flujo Médico
- Búsqueda de pacientes por RUT
- Creación, edición y eliminación de recetas médicas

### Flujo Paciente
- Visualización de recetas propias
- Vista detallada tipo “receta”
- Calendario mensual dinámico con días de tratamiento
- Visualización de estado de recetas (activas / finalizadas)
- Autorización médico–paciente (por información sensible)
