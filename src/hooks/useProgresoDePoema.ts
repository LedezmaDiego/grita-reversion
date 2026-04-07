import { useEffect, useRef, useState } from "react";
import { UNIDAD_DE_PROGRESO } from "../constantes/audio";
import { MatrizDeTexto, Poema } from "../tipos/poema";

export const useProgresoDePoema = (poema: Poema) => {
  const [textoVisible, setTextoVisible] = useState<MatrizDeTexto>([]);

  const restoRef = useRef(0);
  const valorAnteriorRef = useRef(0);

  useEffect(() => {
    const inicial = poema.map((linea) =>
      linea.split("").map((letra) => (letra === " " ? " " : "*")),
    );

    setTextoVisible(inicial);
    restoRef.current = 0;
    valorAnteriorRef.current = 0;
  }, [poema]);

  const revelarLetra = () => {
    setTextoVisible((prev) => {
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
  };

  const ocultarLetra = () => {
    setTextoVisible((prev) => {
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
  };

  const actualizarProgreso = (valor: number) => {
    const diff = valor - valorAnteriorRef.current;
    valorAnteriorRef.current = valor;

    restoRef.current += diff;

    while (restoRef.current >= UNIDAD_DE_PROGRESO) {
      revelarLetra();
      restoRef.current -= UNIDAD_DE_PROGRESO;
    }

    while (restoRef.current <= -UNIDAD_DE_PROGRESO) {
      ocultarLetra();
      restoRef.current += UNIDAD_DE_PROGRESO;
    }
  };

  return {
    textoVisible,
    actualizarProgreso,
  };
};
