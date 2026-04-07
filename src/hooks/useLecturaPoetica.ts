import { useEffect, useState } from "react";
import { POEMAS } from "../constantes/poemas";
import { Poema } from "../tipos/poema";
import { useDetectorDeSonido } from "./useDetectorDeSonido";
import { useProgresoDePoema } from "./useProgresoDePoema";

export const useLecturaPoetica = () => {
  const [indicePoema, setIndicePoema] = useState(
    Math.floor(Math.random() * POEMAS.length),
  );

  const poemaActual: Poema = POEMAS[indicePoema];

  const { nivelDeEnergia } = useDetectorDeSonido();

  const { textoVisible, actualizarProgreso } = useProgresoDePoema(poemaActual);

  useEffect(() => {
    actualizarProgreso(nivelDeEnergia);
  }, [nivelDeEnergia]);

  const cambiarPoema = () => {
    setIndicePoema((prev) => {
      let nuevo = prev;
      while (nuevo === prev) {
        nuevo = Math.floor(Math.random() * POEMAS.length);
      }
      return nuevo;
    });
  };

  return {
    textoVisible,
    nivelDeEnergia,
    cambiarPoema,
  };
};
