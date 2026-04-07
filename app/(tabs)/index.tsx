import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

const POEMAS = [
  ["Chasquea", "hasta que", "mis dedos olviden", "que fueron silencio"],
  ["Chasquea", "hasta que", "el aire responda", "con algo más que vacío"],
  ["Chasquea", "hasta que", "la noche se quiebre", "en el ritmo de tus manos"],
];

export default function PantallaPrincipal() {
  const [haySonido, setHaySonido] = useState(false);
  const [contador, setContador] = useState(0);

  const [poemaIndex] = useState(0);
  const [lineaIndex, setLineaIndex] = useState(1);

  const [textoRevelado, setTextoRevelado] = useState<string[]>([]);

  const ultimoSonidoRef = useRef(Date.now());
  const ultimoDecrementoRef = useRef(Date.now()); // ✅ FIX

  const progresoRef = useRef(0);
  const restoRef = useRef(0);
  const contadorAnteriorRef = useRef(0);

  const lineaActual = POEMAS[poemaIndex][lineaIndex];

  // Inicializar línea
  useEffect(() => {
    if (!lineaActual) return;

    setTextoRevelado(
      lineaActual.split("").map((char) => (char === " " ? " " : "◼️")),
    );

    progresoRef.current = 0;
    restoRef.current = 0;
    contadorAnteriorRef.current = 0;

    setContador(0); // ✅ FIX: evita acumulación entre líneas
  }, [lineaIndex]);

  // DETECCIÓN DE SONIDO (sin cambios)
  useEffect(() => {
    let grabacion: Audio.Recording | null = null;

    async function iniciarDeteccionDeSonido() {
      try {
        const permiso = await Audio.requestPermissionsAsync();
        if (!permiso.granted) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        grabacion = new Audio.Recording();

        await grabacion.prepareToRecordAsync({
          isMeteringEnabled: true,
          android: {
            extension: ".m4a",
            outputFormat: 2,
            audioEncoder: 3,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: ".m4a",
            audioQuality: 2,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          web: {},
        });

        grabacion.setProgressUpdateInterval(100);

        await grabacion.startAsync();

        grabacion.setOnRecordingStatusUpdate((status) => {
          if (status.metering == null) return;

          const hayRuido = status.metering > -45;
          setHaySonido(hayRuido);

          if (hayRuido) {
            ultimoSonidoRef.current = Date.now();
            setContador((c) => c + 1);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }

    iniciarDeteccionDeSonido();

    return () => {
      if (grabacion) {
        grabacion.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // 🔥 DECREMENTO PROGRESIVO CORREGIDO
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = Date.now();
      const diff = ahora - ultimoSonidoRef.current;

      let delay: number | null = null;

      if (diff > 4000) delay = 500;
      else if (diff > 3000) delay = 1000;
      else if (diff > 2000) delay = 2000;

      if (!delay) return;

      if (ahora - ultimoDecrementoRef.current > delay) {
        ultimoDecrementoRef.current = ahora;

        setContador((c) => (c > 0 ? c - 1 : 0));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Progreso (liberar / ocultar letras)
  useEffect(() => {
    const diff = contador - contadorAnteriorRef.current;
    contadorAnteriorRef.current = contador;

    restoRef.current += diff;

    while (restoRef.current >= 5) {
      revelarLetra();
      restoRef.current -= 5;
    }

    while (restoRef.current <= -5) {
      ocultarLetra();
      restoRef.current += 5;
    }
  }, [contador]);

  function revelarLetra() {
    setTextoRevelado((prev) => {
      const indices = prev
        .map((char, i) => (char === "◼️" ? i : null))
        .filter((i) => i !== null) as number[];

      if (indices.length === 0) {
        avanzarLinea();
        return prev;
      }

      const randomIndex = indices[Math.floor(Math.random() * indices.length)];

      const nuevo = [...prev];
      nuevo[randomIndex] = lineaActual[randomIndex];

      return nuevo;
    });
  }

  function ocultarLetra() {
    setTextoRevelado((prev) => {
      const indices = prev
        .map((char, i) => (char !== "◼️" && char !== " " ? i : null))
        .filter((i) => i !== null) as number[];

      if (indices.length === 0) return prev;

      const randomIndex = indices[Math.floor(Math.random() * indices.length)];

      const nuevo = [...prev];
      nuevo[randomIndex] = "◼️";

      return nuevo;
    });
  }

  function avanzarLinea() {
    setLineaIndex((i) => i + 1);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Chasquea</ThemedText>

      {lineaActual && (
        <ThemedText style={styles.texto}>{textoRevelado.join("")}</ThemedText>
      )}

      <ThemedText style={styles.contador}>
        Contador: {Math.floor(contador)}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  texto: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  contador: {
    marginTop: 20,
    opacity: 0.5,
  },
});
