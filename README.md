# AutoAndes Frontend

SPA Angular standalone del Examen Parcial II, versión A. Backend: https://github.com/LeonardoTA/autoandes-backend

## Ejecutar

Requisitos: Node.js compatible con Angular 22 y npm. Versiones exactas en package.json y package-lock.json. Primero iniciar el backend en http://localhost:8080.

```powershell
npm ci
npm start
```

Abrir http://localhost:4200. environment.apiUrl apunta a http://localhost:8080/api/v1. Usar localhost para coincidir con CORS. Los servicios HTTP consumen el backend real; no hay servidor simulado ni datos de negocio codificados en pantallas.

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Usuarios de prueba

| Usuario | Contraseña de prueba | Rol |
|---|---|---|
| admin | Auto2026* | ADMIN |
| asesor | Auto2026* | ASESOR |
| jefe | Auto2026* | JEFE_TALLER |
| inactivo | Auto2026* | ASESOR, acceso deshabilitado |

## Estructura y comportamiento

core: sesión con signals, modelos, servicios HTTP por recurso, interceptores, guards y menú. shared: directiva siPermiso y páginas 403/404. layout: cabecera, menú y contenido. features: login, servicios, vehículos, órdenes y reportes, con carga diferida.

Servicios y vehículos tienen listas, filtros, formularios de alta/edición y mensajes de validación del backend. Los clientes se consultan para la lista desplegable. Las órdenes usan cabecera y FormArray de 1 a 10 líneas; los subtotales visibles son una vista previa y el servidor calcula el importe definitivo. Un 409 conserva los datos escritos.

La sesión se almacena en sessionStorage con vencimiento y cierre automático. Un interceptor añade Bearer solo a la API; el interceptor de errores distingue 401 de 403. authGuard protege el layout, invitadoGuard evita repetir login y permisoGuard protege cada operación. Menú y botones dependen de permisos, además de las verificaciones obligatorias del backend. Escribir una URL sin permiso muestra Acceso denegado y conserva la sesión.

Angular 22.2.3, herramientas CLI/build 22.2.5, TypeScript 6.0.2, RxJS 7.8.2. Documentación oficial: [Angular](https://angular.dev/), [instalación](https://angular.dev/installation), [formularios reactivos](https://angular.dev/guide/forms/reactive-forms), [guards](https://angular.dev/guide/routing/route-guards), [interceptores](https://angular.dev/guide/http/interceptors).

## Contrato HTTP

Base: http://localhost:8080/api/v1. JSON; Bearer JWT salvo login. Fechas de filtros YYYY-MM-DD. GET devuelve listas directas. POST de dominio devuelve 201; login, GET, PUT y PATCH devuelven 200; DELETE 204 sin cuerpo.

| Ruta | Operación | Permiso |
|---|---|---|
| /auth/login | POST {username,password} | Pública |
| /auth/me | GET | Autenticado |
| /clientes | GET | VEHICULO_LEER |
| /servicios, /servicios/{id} | GET | SERVICIO_LEER |
| /servicios, /servicios/{id} | POST, PUT, DELETE | SERVICIO_ESCRIBIR |
| /servicios/{id}/estado | PATCH {activo} | SERVICIO_ESCRIBIR |
| /vehiculos, /vehiculos/{id} | GET; filtro clienteId | VEHICULO_LEER |
| /vehiculos, /vehiculos/{id} | POST, PUT, DELETE | VEHICULO_ESCRIBIR |
| /ordenes | GET; placa,estado,desde,hasta | ORDEN_LEER |
| /ordenes/{id} | GET | ORDEN_LEER |
| /ordenes | POST | ORDEN_REGISTRAR |
| /ordenes/{id}/anular | PATCH {motivo} | ORDEN_ANULAR |
| /reportes/ingresos-por-servicio | GET; desde,hasta | REPORTE_VER |

Servicio: {codigo,nombre,precio,duracionMin,activo}. Vehículo: {placa,marca,modelo,anio,clienteId}. Orden: {vehiculoId,kilometraje,detalles:[{servicioId,cantidad}]}; precios, número, fecha, usuario y total se calculan en el servidor. Login responde {token,tipo,expiraEnSegundos,nombreCompleto,username,roles,permisos}. Los DTO de respuestas completas se consultan en Swagger.

Error común: {timestamp,status,error,mensaje,ruta,campos?}; campos contiene mensajes por atributo solo cuando hay errores de validación. 400 datos inválidos, 401 sesión ausente/inválida/vencida, 403 falta de permiso, 404 recurso inexistente, 409 conflicto de negocio. Un 403 conserva la sesión de la SPA.

## Evidencias y versionado

El repositorio del backend reúne colección Postman, PDF de capturas y resultados de integración real. Los archivos qa/ del frontend describen las pruebas de navegador. Trabajar en examen-a-Tequen, integrar por develop y main y evaluar la etiqueta v1.0-examen-u2. Las cuentas de prueba son públicas por el enunciado; las credenciales reales de Oracle y la clave JWT no se versionan.

## Ensayo de navegador opcional
qa/navegador-real.mjs requiere Playwright y Chrome/Chromium además de ambos servidores activos. Puedes instalar Playwright para el ensayo sin cambiar el contrato del proyecto: npm install --no-save --package-lock=false playwright. Configurar CHROME_PATH con la ruta de Chrome instalado, o instalar Chromium con npx playwright install chromium. Ejecutar node qa/navegador-real.mjs ../autoandes-backend/entrega. Se probaron20comprobaciones reales y37pruebas unitarias; no ejecutar a la vez que Postman. El ensayo anula su orden propia y conserva su historial.

