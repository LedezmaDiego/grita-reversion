import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { UMBRAL_SONIDO } from "../constantes/configuracion";

type Props = {
  onDetectarSonido: () => void;
};

export const useAudio = ({ onDetectarSonido }: Props) => {
  const referenciaGrabacion = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    const iniciarGrabacion = async () => {
      try {
        const permiso = await Audio.requestPermissionsAsync();
        if (!permiso.granted) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const grabacion = new Audio.Recording();

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

        grabacion.setOnRecordingStatusUpdate((estado) => {
          if (estado.metering == null) return;

          const esSonidoDetectado = estado.metering > UMBRAL_SONIDO;

          if (esSonidoDetectado) {
            onDetectarSonido();
          }
        });

        await grabacion.startAsync();
        referenciaGrabacion.current = grabacion;
      } catch (error) {
        console.error("Error al iniciar audio", error);
      }
    };

    iniciarGrabacion();

    return () => {
      referenciaGrabacion.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, [onDetectarSonido]);
};
