# docnote 💊

DocNote es una **aplicación web** desarrollada como proyecto de título, orientada a mejorar la **adherencia a tratamientos farmacológicos**, permitiendo a pacientes y médicos gestionar recetas digitales de manera segura y clara.

La plataforma permite registrar medicamentos con información detallada (dosis, intervalo, duración y fechas), visualizar las recetas en formato de listado y calendario mensual, y asegurar que la información médica sea accesible únicamente por los usuarios autorizados.

---

## Contexto del proyecto

Diversos estudios de la Organización Mundial de la Salud indican que la adherencia a tratamientos farmacológicos alcanza solo alrededor del 50%, incluso en países desarrollados.  
docnote surge como una solución digital para apoyar el **Uso Racional de Medicamentos**, facilitando la comprensión y seguimiento de las indicaciones médicas.

El sistema pretende funcionar como una web en la que médicos y pacientes interactúan.

---

## Funcionalidades principales

### Autenticación y roles
- Registro e inicio de sesión con Firebase Authentication
- Gestión de roles: **Doctor** y **Paciente**
- Redirección automática según rol

### Flujo Médico
- Búsqueda de pacientes por RUT
- Creación, edición y eliminación de recetas médicas
- Creación, edición y eliminación de citas médicas
- Creación, edición y eliminación de órdenes médicas

### Flujo Paciente
- Visualización de recetas propias
- Vista detallada tipo “receta”
- Vista detallada de citas médicas
- Vista de órdenes de exámenes
- Calendario mensual dinámico con días de tratamiento y citas médicas
- Autorización médico–paciente (por información sensible)

### Seguridad
- Acceso restringido mediante reglas de Firestore
- Los pacientes solo pueden acceder a su información
- Los médicos solo pueden acceder a pacientes autorizados

---

## Tecnologías utilizadas

- **React + Vite**
- **React Router**
- **react-calendar**
- **date-fns**
- **Firebase Authentication**
- **Cloud Firestore**

---

## Arquitectura (resumen)

- Aplicación web SPA (Single Page Application)
- Separación por capas:
  - UI / Pages
  - Servicios (Firebase, lógica de negocio)
  - Contexto de autenticación
- Base de datos NoSQL orientada a documentos (Firestore)
- Control de acceso basado en roles y reglas de seguridad

---

## Instalación y ejecución local

### Requisitos
- Node.js (v18 o superior recomendado)
- npm

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/isabellaparry/examen_farmanote.git
   cd examen_farmanote


2. Instalar dependencias:
    npm install

3. Crear archivo .env con las variables de Firebase:

    VITE_FIREBASE_API_KEY=xxxxx

    VITE_FIREBASE_AUTH_DOMAIN=xxxxx

    VITE_FIREBASE_PROJECT_ID=xxxxx

    VITE_FIREBASE_STORAGE_BUCKET=xxxxx

    VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx

    VITE_FIREBASE_APP_ID=xxxxx

    
4. Ejecutar en desarrollo:
    ```bash
    npm run dev

---

## Despliegue en Netlify:

[docnote.netlify.app](https://docnote.netlify.app/)
