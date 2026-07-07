# Conector gratuito de solicitudes

Este Google Apps Script recibe las solicitudes de la página pública en una hoja de cálculo y permite que la aplicación administrativa las consulte mediante una clave privada.

La URL de implementación se coloca en `reservar/config.js` y en **Conexiones** dentro de la aplicación.

Propiedades privadas necesarias en Apps Script:

- `ADMIN_KEY`: clave larga y privada para que la app de gestión pueda leer solicitudes.
- `NOTIFY_EMAIL`: correo que recibirá cada solicitud nueva. Para Villa il Fanale: `juanleonflesca@gmail.com`.

Después de actualizar `Code.gs`, crear una nueva implementación o editar la implementación web existente para que la URL pública use la versión nueva del script.
