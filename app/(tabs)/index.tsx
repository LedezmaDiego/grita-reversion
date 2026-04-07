import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native";

const POEMAS = [
  [
    "hasta que",
    "mis dedos olviden",
    "que fueron silencio",
    "y aprendan a decirte",
    "todo lo que guardé",
    "en noches sin respuesta",
  ],
  [
    "hasta que",
    "el aire responda",
    "con algo más que vacío",
    "y deje de esquivarme",
    "cuando digo tu nombre",
    "como si aún doliera",
  ],
  [
    "hasta que",
    "la noche se quiebre",
    "en el ritmo de tus manos",
    "y el tiempo se detenga",
    "justo antes del olvido",
    "para volver a empezar",
  ],
  [
    "hasta que",
    "el eco diga tu nombre",
    "aunque no estés",
    "aunque nadie escuche",
    "aunque todo se apague",
    "menos esta insistencia",
  ],
  [
    "hasta que",
    "la piel entienda",
    "lo que nunca dijiste",
    "y traduzca en latidos",
    "lo que quedó pendiente",
    "entre dos silencios",
  ],
  [
    "hasta que",
    "el tiempo se rinda",
    "ante el ritmo",
    "y deje de empujarme",
    "hacia días sin vos",
    "donde todo es más lento",
  ],
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

  const cambioRealizadoRef = useRef(false);

  const ultimoScrollRef = useRef(0);
  const posicionesRef = useRef<number[]>([]);

  const todoReveladoRef = useRef(false);

  // 🔥 NUEVO: control correcto del reset de scroll
  const resetScrollRef = useRef(false);

  // inicializar poema
  useEffect(() => {
    const inicial = poema.map((linea) =>
      linea.split("").map((c) => (c === " " ? " " : "*")),
    );

    setTexto(inicial);

    restoRef.current = 0;
    contadorAnteriorRef.current = 0;
    posicionesRef.current = [];
    ultimoScrollRef.current = 0;

    // marcar que hay que hacer scroll cuando layout esté listo
    resetScrollRef.current = true;
  }, [poemaIndex]);

  // 🔥 FIX REAL DEL SCROLL
  useEffect(() => {
    if (!resetScrollRef.current) return;

    if (posicionesRef.current.length === 0) return;

    const primera = posicionesRef.current[0];

    if (primera != null) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      resetScrollRef.current = false;
    }
  }, [texto]);

  // detectar si todo está revelado
  useEffect(() => {
    const completo = texto.every((linea, i) =>
      linea.every((c, j) => c === poema[i][j] || c === " "),
    );

    todoReveladoRef.current = completo;
  }, [texto, poema]);

  // DETECCIÓN SONIDO
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

          setContador((c) => {
            if (todoReveladoRef.current) return c;
            return c + 1;
          });
        }
      });
    }

    iniciar();

    return () => {
      grabacion?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  // decremento progresivo
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

  // progreso global
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

  // cambio de poema
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

  function scrollSuave(linea: number) {
    const ahora = Date.now();

    if (ahora - ultimoScrollRef.current > 200) {
      ultimoScrollRef.current = ahora;

      const y = posicionesRef.current[linea] ?? 0;

      scrollRef.current?.scrollTo({
        y: y - height * 0.3,
        animated: true,
      });
    }
  }

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

          scrollSuave(linea);
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

          scrollSuave(linea);
          return nuevo;
        }
      }

      return prev;
    });
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.contador}>{Math.floor(contador)}</ThemedText>

      <ScrollView ref={scrollRef} style={styles.scroll} scrollEnabled={false}>
        <ThemedText style={styles.titulo}>Chasquea</ThemedText>

        {texto.map((linea, i) => (
          <ThemedText
            key={i}
            style={styles.linea}
            onLayout={(e) => {
              posicionesRef.current[i] = e.nativeEvent.layout.y;
            }}
          >
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
