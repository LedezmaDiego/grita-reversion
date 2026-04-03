import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export default function PantallaPrincipal() {
  const [haySonido, setHaySonido] = useState(false);

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

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        {haySonido ? "Se escucha sonido" : "Silencio"}
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
});
