import { useEffect, useRef, useState } from "react";
import {
  RETRASO_DECREMENTO_LENTO,
  RETRASO_DECREMENTO_MEDIO,
  RETRASO_DECREMENTO_RAPIDO,
  TIEMPO_SIN_SONIDO_LENTO,
  TIEMPO_SIN_SONIDO_MEDIO,
  TIEMPO_SIN_SONIDO_RAPIDO,
} from "../constantes/configuracion";

type Props = {
  haySonidoDetectado: boolean;
  todoRevelado?: boolean;
};

export const useContadorDeSonido = ({
  haySonidoDetectado,
  todoRevelado = false,
}: Props) => {
  const [contador, setContador] = useState(0);

  const ultimoSonidoRef = useRef(Date.now());
  const ultimoDecrementoRef = useRef(Date.now());
  const ultimoIncrementoRef = useRef(0);

  useEffect(() => {
    if (
      !todoRevelado &&
      haySonidoDetectado &&
      Date.now() - ultimoIncrementoRef.current > 100
    ) {
      ultimoSonidoRef.current = Date.now();
      ultimoIncrementoRef.current = Date.now();
      setContador((previo) => previo + 1);
    }
  }, [haySonidoDetectado, todoRevelado]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const tiempoSinSonido = ahora - ultimoSonidoRef.current;

      let delay: number | null = null;

      if (tiempoSinSonido > TIEMPO_SIN_SONIDO_RAPIDO) {
        delay = RETRASO_DECREMENTO_RAPIDO;
      } else if (tiempoSinSonido > TIEMPO_SIN_SONIDO_MEDIO) {
        delay = RETRASO_DECREMENTO_MEDIO;
      } else if (tiempoSinSonido > TIEMPO_SIN_SONIDO_LENTO) {
        delay = RETRASO_DECREMENTO_LENTO;
      }

      if (!delay) return;

      if (ahora - ultimoDecrementoRef.current > delay) {
        ultimoDecrementoRef.current = ahora;
        setContador((previo) => (previo > 0 ? previo - 1 : 0));
      }
    }, 50);

    return () => clearInterval(intervalo);
  }, []);

  return { contador };
};
