import { useCallback, useEffect, useRef, useState } from "react";
import { FACTOR_REVELADO } from "../constantes/configuracion";

type Props = {
  poema: string[];
  contador: number;
  onPoemaCompletamenteOculto: () => void;
};

export const useReveladoDeTexto = ({
  poema,
  contador,
  onPoemaCompletamenteOculto,
}: Props) => {
  const [textoEnmascarado, setTextoEnmascarado] = useState<string[][]>([]);

  const contadorPrevioRef = useRef(0);
  const restoRef = useRef(0);
  const revelarLetraRef = useRef<() => void>(() => {});
  const ocultarLetraRef = useRef<() => void>(() => {});
  const onPoemaCompletamenteOcultoRef = useRef(onPoemaCompletamenteOculto);
  const ultimoCallbackRef = useRef(0);
  const textoOcultoAnteriorRef = useRef(false);

  useEffect(() => {
    onPoemaCompletamenteOcultoRef.current = onPoemaCompletamenteOculto;
  }, [onPoemaCompletamenteOculto]);

  useEffect(() => {
    const textoInicial = poema.map((linea) =>
      linea.split("").map((char) => (char === " " ? " " : "*")),
    );

    setTextoEnmascarado(textoInicial);
    restoRef.current = 0;
    contadorPrevioRef.current = 0;
  }, [poema]);

  const revelarLetra = useCallback(() => {
    setTextoEnmascarado((previo) => {
      const nuevo = previo.map((l) => [...l]);

      for (let linea = 0; linea < nuevo.length; linea++) {
        const indices = nuevo[linea]
          .map((c, i) => (c === "*" ? i : null))
          .filter((i) => i !== null) as number[];

        if (indices.length > 0) {
          const indiceRandom =
            indices[Math.floor(Math.random() * indices.length)];

          nuevo[linea][indiceRandom] = poema[linea][indiceRandom];
          return nuevo;
        }
      }

      return previo;
    });
  }, [poema]);

  const ocultarLetra = useCallback(() => {
    setTextoEnmascarado((previo) => {
      const nuevo = previo.map((l) => [...l]);

      for (let linea = nuevo.length - 1; linea >= 0; linea--) {
        const indices = nuevo[linea]
          .map((c, i) => (c !== "*" && c !== " " ? i : null))
          .filter((i) => i !== null) as number[];

        if (indices.length > 0) {
          const indiceRandom =
            indices[Math.floor(Math.random() * indices.length)];

          nuevo[linea][indiceRandom] = "*";
          return nuevo;
        }
      }

      return previo;
    });
  }, []);

  useEffect(() => {
    revelarLetraRef.current = revelarLetra;
    ocultarLetraRef.current = ocultarLetra;
  }, [revelarLetra, ocultarLetra]);

  useEffect(() => {
    const diferencia = contador - contadorPrevioRef.current;

    restoRef.current += diferencia;

    while (restoRef.current >= FACTOR_REVELADO) {
      revelarLetraRef.current();
      restoRef.current -= FACTOR_REVELADO;
    }

    while (restoRef.current <= -FACTOR_REVELADO) {
      ocultarLetraRef.current();
      restoRef.current += FACTOR_REVELADO;
    }

    contadorPrevioRef.current = contador;
  }, [contador]);

  useEffect(() => {
    const estaTodoOculto = textoEnmascarado.every((linea) =>
      linea.every((c) => c === "*" || c === " "),
    );

    if (
      estaTodoOculto &&
      !textoOcultoAnteriorRef.current &&
      contador === 0 &&
      Date.now() - ultimoCallbackRef.current > 300
    ) {
      ultimoCallbackRef.current = Date.now();
      onPoemaCompletamenteOcultoRef.current();
    }

    textoOcultoAnteriorRef.current = estaTodoOculto;
  }, [textoEnmascarado, contador]);

  const todoRevelado = textoEnmascarado.every((linea) =>
    linea.every((c) => c !== "*" && c !== " "),
  );

  return { textoEnmascarado, todoRevelado };
};
