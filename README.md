# Mercado_Digital

## Sesion unica por usuario (1 dispositivo a la vez)
El backend puede invalidar sesiones anteriores cuando un usuario inicia sesion en otro dispositivo. Para que funcione, la BD debe tener estas columnas en la tabla `usuario`:

```sql
ALTER TABLE usuario ADD COLUMN Estado varchar(20) NOT NULL DEFAULT 'Activo';
ALTER TABLE usuario ADD COLUMN SesionId varchar(64) DEFAULT NULL;
```

Comportamiento:
- En cada login/registro se genera un `sid` nuevo y se guarda en `usuario.SesionId`.
- El JWT incluye ese `sid`.
- En cada request protegido, el middleware compara el `sid` del token con el de la BD. Si no coincide, responde `401` y el frontend cierra sesion.
