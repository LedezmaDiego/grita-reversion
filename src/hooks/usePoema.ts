import { useCallback, useState } from "react";
import { POEMAS } from "../constantes/poemas";

export const usePoema = () => {
  const [indicePoema, setIndicePoema] = useState(0);

  const poemaActual = POEMAS[indicePoema];

  const obtenerNuevoPoema = useCallback(() => {
    setIndicePoema((previo) => {
      const indicesDisponibles = POEMAS.map((_, i) => i).filter(
        (i) => i !== previo,
      );

      return indicesDisponibles[
        Math.floor(Math.random() * indicesDisponibles.length)
      ];
    });
  }, []);

  return {
    poemaActual,
    obtenerNuevoPoema,
  };
};
