# TechAndes POS --- Sistema de Punto de Venta y Gestión Comercial

Plataforma web full-stack desarrollada con **Spring Boot** (Backend /
API REST) y **Next.js** (Frontend), conectada a una base de datos
relacional **MySQL 8.0**. Está diseñada para la gestión de inventario,
ventas POS, clientes, empleados e informes analíticos.

------------------------------------------------------------------------

## Requisitos previos

Antes de iniciar la instalación, asegúrate de tener instalado en tu
equipo:

-   **Java JDK 17** o superior.
-   **Maven** (o utilizar el wrapper `./mvnw` incluido en el proyecto).
-   **MySQL Server 8.0** y **MySQL Workbench**.
-   **Node.js 18+** y **npm**.

------------------------------------------------------------------------

## Guía de instalación y ejecución

### 1. Configuración de la base de datos (MySQL)

1.  Abre **MySQL Workbench** e inicia sesión en tu servidor local.

2.  Dirígete al menú **Server \> Data Import**, o abre el archivo
    directamente desde **File \> Open SQL Script...**.

3.  Busca y selecciona el script SQL ubicado en la ruta del proyecto:

    ``` text
    Techandes/sql/techandes.sql
    ```

4.  Ejecuta el script completo (icono del rayo ⚡) para crear la base de
    datos `techandes`, sus tablas, relaciones y datos iniciales.

### 2. Configuración y ejecución del backend (Spring Boot)

1.  Abre la carpeta `Backend` en tu editor o IDE (VS Code, IntelliJ IDEA
    o Eclipse).

2.  Dirígete al archivo de configuración:

    ``` text
    Backend/src/main/resources/application.properties
    ```

3.  Ajusta las credenciales de conexión a tu servidor MySQL local
    (`username` y `password`):

    ``` properties
    spring.datasource.url=jdbc:mysql://localhost:3306/techandes?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
    spring.datasource.username=TU_USUARIO_MYSQL
    spring.datasource.password=TU_CONTRASEÑA_MYSQL
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    ```

4.  Inicia el servidor backend desde una terminal ubicada dentro de la
    carpeta `Backend`:

    ``` bash
    ./mvnw spring-boot:run
    ```

    También puedes ejecutar la clase principal desde tu IDE.

    El servidor quedará activo en:

    ``` text
    http://localhost:8080
    ```

### 3. Instalación y ejecución del frontend (Next.js)

1.  Abre una nueva terminal y navega hasta la carpeta del frontend:

    ``` bash
    cd Techandes/techandes-frontend
    ```

2.  Instala las dependencias del proyecto:

    ``` bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:

    ``` bash
    npm run dev
    ```

4.  Abre tu navegador e ingresa a:

    ``` text
    http://localhost:3000
    ```

------------------------------------------------------------------------

## Stack tecnológico

-   **Backend:** Java, Spring Boot, Spring Security (JWT con cookies
    HttpOnly), Spring Data JPA.
-   **Base de datos:** MySQL 8.0.
-   **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui y Axios.
