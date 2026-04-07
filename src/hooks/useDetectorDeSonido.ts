import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  INTERVALO_ACTUALIZACION_AUDIO,
  UMBRAL_DE_SONIDO,
} from "../constantes/audio";

export const useDetectorDeSonido = () => {
  const [nivelDeEnergia, setNivelDeEnergia] = useState(0);

  const grabacionRef = useRef<Audio.Recording | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const iniciarGrabacion = async () => {
      try {
        const permiso = await Audio.requestPermissionsAsync();
        if (!permiso.granted || !isMountedRef.current) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        if (!isMountedRef.current) return;

        const grabacion = new Audio.Recording();
        grabacionRef.current = grabacion;

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
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {},
        });

        if (!isMountedRef.current) return;

        grabacion.setProgressUpdateInterval(INTERVALO_ACTUALIZACION_AUDIO);

        grabacion.setOnRecordingStatusUpdate((status) => {
          if (!isMountedRef.current) return;
          if (!status.isRecording) return;
          if (status.metering == null) return;

          if (status.metering > UMBRAL_DE_SONIDO) {
            setNivelDeEnergia((v) => v + 1);
          }
        });

        await grabacion.startAsync();
      } catch (error) {
        console.error("Error audio:", error);
      }
    };

    iniciarGrabacion();

    return () => {
      isMountedRef.current = false;

      const detener = async () => {
        try {
          if (grabacionRef.current) {
            const status = await grabacionRef.current.getStatusAsync();

            if (status.isRecording) {
              await grabacionRef.current.stopAndUnloadAsync();
            }

            grabacionRef.current.setOnRecordingStatusUpdate(null);
            grabacionRef.current = null;
          }
        } catch (e) {
          // evita crash silencioso
        }
      };

      detener();
    };
  }, []);

  return {
    nivelDeEnergia,
  };
};
