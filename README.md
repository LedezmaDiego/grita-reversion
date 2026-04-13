# Chasquea (App Mobile)

Aplicación interactiva basada en sonido donde el usuario debe chasquear con sus dedos fuertemente para revelar progresivamente un poema.

La intensidad del sonido controla tanto el avance del texto como las animaciones en pantalla.

---

## Funcionalidades principales

- Detección de sonido en tiempo real mediante micrófono
- Contador dinámico basado en intensidad de audio
- Revelado progresivo de texto
- Ocultamiento automático cuando no hay sonido
- Transiciones animadas entre poemas
- Animaciones reactivas (escala, opacidad, color)

---

## Requisitos previos

Antes de comenzar, instalar:

### 1. Node.js

https://nodejs.org  
Se recomienda versión LTS.

---

### 2. Bun

https://bun.sh

---

### 3. Git

https://git-scm.com/

---

### 4. Expo Go (opcional)

Para probar en dispositivo móvil:

- Android: Play Store
- iOS: App Store

---

## Descargar el proyecto

```bash
git clone <URL_DEL_REPO>
cd grita-reversion
```

````

---

## Instalación

```bash
bun install
```

---

## Ejecución

```bash
bunx expo start
```

---

## Formas de abrir la aplicación

### Dispositivo móvil

1. Abrir Expo Go
2. Escanear el código QR que aparece en la terminal

---

### Navegador web

Abrir la URL que aparece en la terminal, por ejemplo:

```
http://localhost:8081
```

---

## Uso de la aplicación

- Generar sonido para aumentar el contador
- A mayor intensidad, más rápido se revela el poema
- Al dejar de hacer sonido:
  - El contador disminuye
  - El texto comienza a ocultarse

- Cuando el poema se oculta completamente:
  - Se ejecuta una transición
  - Se carga un nuevo poema

---

## Arquitectura

El proyecto sigue una separación clara de responsabilidades:

### Controlador

- ControladorDePoema
- Orquesta la lógica general

### Hooks (lógica)

- useAudio: detección de sonido
- useContadorDeSonido: manejo del contador
- useReveladoDeTexto: revelado y ocultamiento del texto
- usePoema: gestión de poemas
- useAnimaciones: animaciones

### UI

- ContenedorPantallaPrincipal
- Componentes visuales desacoplados

---

## Configuración

Archivo:

```
src/constantes/configuracion.ts
```

Parámetros ajustables:

- UMBRAL_SONIDO: sensibilidad del micrófono
- FACTOR_REVELADO: velocidad de revelado
- Tiempos de decremento del contador

---

## Solución de problemas

### Reinstalar dependencias

```bash
bun install --force
```

---

### Limpiar caché de Expo

```bash
bunx expo start -c
```

---

### Problemas con el micrófono

- Verificar permisos del sistema
- Asegurarse de aceptar el acceso al iniciar la app

---

## Tecnologías utilizadas

- React Native
- Expo
- expo-av
- react-native-reanimated

---

## Notas finales

Este proyecto combina entrada de audio en tiempo real con feedback visual dinámico.

También funciona como ejemplo de:

- Uso de hooks personalizados
- Separación entre lógica y UI
- Arquitectura escalable en React Native
````
