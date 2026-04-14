## Descargas

- APK (Android):
  https://github.com/LedezmaDiego/grita-reversion/releases/download/v1.0.0/chasquea-v1.0.0.apk

---

## Instalación en dispositivo (Android)

Esta aplicación no es compatible con Expo Go, ya que utiliza funcionalidades nativas (audio en tiempo real).

### Opción 1 — Instalar APK (recomendado)

1. Descargar la APK desde el enlace de la sección "Descargas"
2. Transferir el archivo al dispositivo
3. Abrir el archivo `.apk`
4. Aceptar la instalación desde orígenes desconocidos si es necesario
5. Instalar la aplicación

---

### Opción 2 — Build local (desarrolladores)

```bash
bunx expo prebuild
bun run android
```

Esto compila e instala la app en un dispositivo conectado por USB o en un emulador.

---

## Desarrollo

Una vez instalada la app en el dispositivo:

```bash
bun start --dev-client
```

Esto inicia el servidor de desarrollo (Metro).

---

## Conexión con el dispositivo

### Con USB

```bash
adb reverse tcp:8081 tcp:8081
bun start --dev-client
```

---

### Sin USB

```bash
bunx expo start --dev-client --tunnel
```

---

## Notas importantes

- No funciona con Expo Go
- Requiere instalación previa de la APK
- Los cambios en código JavaScript se reflejan en tiempo real
- Los cambios nativos requieren recompilación de la app

---

## Cuándo recompilar la app

Ejecutar:

```bash
bun run android
```

Si se realizaron cambios en:

- permisos (`app.json`)
- librerías nativas
- plugins de Expo
- código dentro de `/android`
