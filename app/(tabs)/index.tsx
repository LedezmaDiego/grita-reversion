import { ThemedText } from "@/components/themed-text";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

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
  const [texto, setTexto] = useState<string[][]>([]);

  const poema = POEMAS[poemaIndex];

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intensidadAnim = useRef(new Animated.Value(0)).current;

  const ultimoSonidoRef = useRef(Date.now());
  const ultimoDecrementoRef = useRef(Date.now());
  const contadorPrevioRef = useRef(0);
  const restoRef = useRef(0);
  const todoReveladoRef = useRef(false);
  const cambioPostpuestoRef = useRef(false);

  useEffect(() => {
    const inicial = poema.map((linea) =>
      linea.split("").map((c) => (c === " " ? " " : "*")),
    );

    setTexto(inicial);
    restoRef.current = 0;
    contadorPrevioRef.current = 0;
  }, [poema]);

  useEffect(() => {
    const intensidad = Math.min(contador / 50, 1);

    Animated.timing(intensidadAnim, {
      toValue: intensidad,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [contador]);

  useEffect(() => {
    todoReveladoRef.current = texto.every((linea, i) =>
      linea.every((c, j) => c === poema[i][j] || c === " "),
    );
  }, [texto, poema]);

  // 🎤 Audio
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
        android: { extension: ".m4a", outputFormat: 2, audioEncoder: 3 },
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

        if (status.metering > -60) {
          ultimoSonidoRef.current = Date.now();
          setContador((c) => (todoReveladoRef.current ? c : c + 1));
        }
      });
    }

    iniciar();
    return () => {
      grabacion?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

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

  const revelarLetra = useCallback(() => {
    setTexto((prev) => {
      const nuevo = prev.map((l) => [...l]);

      for (let linea = 0; linea < nuevo.length; linea++) {
        const indices = nuevo[linea]
          .map((c, i) => (c === "*" ? i : null))
          .filter((i) => i !== null) as number[];

        if (indices.length > 0) {
          const i = indices[Math.floor(Math.random() * indices.length)];
          nuevo[linea][i] = poema[linea][i];
          return nuevo;
        }
      }

      return prev;
    });
  }, [poema]);

  const ocultarLetra = useCallback(() => {
    setTexto((prev) => {
      const nuevo = prev.map((l) => [...l]);

      for (let linea = nuevo.length - 1; linea >= 0; linea--) {
        const indices = nuevo[linea]
          .map((c, i) => (c !== "*" && c !== " " ? i : null))
          .filter((i) => i !== null) as number[];

        if (indices.length > 0) {
          const i = indices[Math.floor(Math.random() * indices.length)];
          nuevo[linea][i] = "*";
          return nuevo;
        }
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    const anterior = contadorPrevioRef.current;
    const diff = contador - anterior;

    restoRef.current += diff;

    while (restoRef.current >= 5) {
      revelarLetra();
      restoRef.current -= 5;
    }

    while (restoRef.current <= -5) {
      ocultarLetra();
      restoRef.current += 5;
    }

    if (anterior > 0 && contador === 0) {
      cambioPostpuestoRef.current = true;
    }

    contadorPrevioRef.current = contador;
  }, [contador, revelarLetra, ocultarLetra]);

  useEffect(() => {
    if (!cambioPostpuestoRef.current) return;
    if (contador !== 0) return;

    const todoBloqueado = texto.every((linea) =>
      linea.every((c) => c === "*" || c === " "),
    );

    if (!todoBloqueado) return;

    cambioPostpuestoRef.current = false;

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setPoemaIndex((prev) => {
      const posibles = POEMAS.map((_, i) => i).filter((i) => i !== prev);
      return posibles[Math.floor(Math.random() * posibles.length)];
    });
  }, [texto, contador]);

  const scale = intensidadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const opacity = intensidadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const colorValue = Animated.add(fadeAnim, intensidadAnim);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: intensidadAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
      />

      <ThemedText style={styles.contador}>{contador}</ThemedText>

      <Animated.View
        style={[
          styles.contenido,
          {
            transform: [{ scale }],
            opacity: fadeAnim,
          },
        ]}
      >
        <ThemedText style={styles.titulo}>Chasquea</ThemedText>

        {texto.map((linea, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.linea,
              {
                opacity,
                color: colorValue.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: ["#999999", "#ffffff", "#ffd966"],
                }),
              },
            ]}
          >
            {linea.join("")}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a2e",
  },
  contador: {
    position: "absolute",
    top: 40,
    left: 20,
    fontSize: 18,
    color: "#aaa",
  },
  contenido: {
    width: "90%",
    alignItems: "center",
  },
  titulo: {
    fontSize: 28,
    marginBottom: height * 0.08,
    color: "#fff",
    fontWeight: "bold",
  },
  linea: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: height * 0.04,
    lineHeight: 24,
  },
});
