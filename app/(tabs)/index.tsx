import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";

const POEMAS = [
  ["hasta que", "mis dedos olviden", "que fueron silencio"],
  ["hasta que", "el aire responda", "con algo más que vacío"],
  ["hasta que", "la noche se quiebre", "en el ritmo de tus manos"],
  ["hasta que", "el eco diga tu nombre", "aunque no estés"],
  ["hasta que", "la piel entienda", "lo que nunca dijiste"],
  ["hasta que", "el tiempo se rinda", "ante el ritmo"],
];

const { height } = Dimensions.get("window");

export default function PantallaPrincipal() {
  const [contador, setContador] = useState(0);

  const [poemaIndex, setPoemaIndex] = useState(
    Math.floor(Math.random() * POEMAS.length),
  );

  const poema = POEMAS[poemaIndex];

  const [texto, setTexto] = useState<string[][]>([]);

  const scrollRef = useRef<ScrollView>(null);

  const ultimoSonidoRef = useRef(Date.now());
  const ultimoDecrementoRef = useRef(Date.now());

  const contadorAnteriorRef = useRef(0);
  const restoRef = useRef(0);

  // 🔥 ESTE ES EL FIX DEL LOOP
  const cambioRealizadoRef = useRef(false);

  // 🔤 inicializar poema
  useEffect(() => {
    const inicial = poema.map((linea) =>
      linea.split("").map((c) => (c === " " ? " " : "*")),
    );

    setTexto(inicial);

    // reset scroll arriba
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 50);

    // reset progreso
    restoRef.current = 0;
    contadorAnteriorRef.current = 0;
  }, [poemaIndex]);

  // 🎤 DETECCIÓN SONIDO
  useEffect(() => {
    let grabacion: Audio.Recording | null = null;

    async function iniciar() {
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
        },
        ios: {
          extension: ".m4a",
          audioQuality: 2,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {},
      });

      grabacion.setProgressUpdateInterval(100);
      await grabacion.startAsync();

      grabacion.setOnRecordingStatusUpdate((status) => {
        if (status.metering == null) return;

        if (status.metering > -45) {
          ultimoSonidoRef.current = Date.now();
          setContador((c) => c + 1);
        }
      });
    }

    iniciar();

    return () => {
      grabacion?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  // ⏳ decremento
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = Date.now();
      const diff = ahora - ultimoSonidoRef.current;

      let delay: number | null = null;

      if (diff > 1500) delay = 50;
      else if (diff > 1000) delay = 250;
      else if (diff > 500) delay = 500;

      if (!delay) return;

      if (ahora - ultimoDecrementoRef.current > delay) {
        ultimoDecrementoRef.current = ahora;
        setContador((c) => (c > 0 ? c - 1 : 0));
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 🔥 PROGRESO GLOBAL
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

  // 🔥 CAMBIO DE POEMA SIN LOOP
  useEffect(() => {
    if (contador !== 0) {
      cambioRealizadoRef.current = false;
      return;
    }

    if (cambioRealizadoRef.current) return;

    const todoBloqueado = texto.every((linea) =>
      linea.every((c) => c === "*" || c === " "),
    );

    if (!todoBloqueado) return;

    cambioRealizadoRef.current = true;

    setPoemaIndex((prev) => {
      let nuevo = prev;
      while (nuevo === prev) {
        nuevo = Math.floor(Math.random() * POEMAS.length);
      }
      return nuevo;
    });
  }, [contador, texto]);

  function revelarLetra() {
    setTexto((prev) => {
      const nuevo = prev.map((l) => [...l]);

      for (let linea = 0; linea < nuevo.length; linea++) {
        const indices = nuevo[linea]
          .map((c, i) => (c === "*" ? i : null))
          .filter((i) => i !== null) as number[];

        if (indices.length > 0) {
          const i = indices[Math.floor(Math.random() * indices.length)];
          nuevo[linea][i] = poema[linea][i];

          scrollRef.current?.scrollTo({
            y: (linea + 1) * (height * 0.25),
            animated: true,
          });

          return nuevo;
        }
      }

      return prev;
    });
  }

  function ocultarLetra() {
    setTexto((prev) => {
      const nuevo = prev.map((l) => [...l]);

      for (let linea = nuevo.length - 1; linea >= 0; linea--) {
        const indices = nuevo[linea]
          .map((c, i) => (c !== "*" && c !== " " ? i : null))
          .filter((i) => i !== null) as number[];

        if (indices.length > 0) {
          const i = indices[Math.floor(Math.random() * indices.length)];
          nuevo[linea][i] = "*";

          scrollRef.current?.scrollTo({
            y: (linea + 1) * (height * 0.25),
            animated: true,
          });

          return nuevo;
        }
      }

      return prev;
    });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.contador}>{Math.floor(contador)}</ThemedText>

      <ScrollView ref={scrollRef} style={styles.scroll}>
        <ThemedText style={styles.titulo}>Chasquea</ThemedText>

        {texto.map((linea, i) => (
          <ThemedText key={i} style={styles.linea}>
            {linea.join("")}
          </ThemedText>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  contador: {
    position: "absolute",
    top: 40,
    left: 20,
    fontSize: 18,
    zIndex: 10,
  },

  titulo: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: "center",
    marginTop: height * 0.15,
    marginBottom: height * 0.2,
  },

  scroll: {
    marginTop: 120,
  },

  linea: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
    marginVertical: height * 0.2,
  },
});
