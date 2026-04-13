import { useCallback, useEffect, useState } from "react";
import { useAnimaciones } from "../../hooks/useAnimaciones";
import { useAudio } from "../../hooks/useAudio";
import { useContadorDeSonido } from "../../hooks/useContadorDeSonido";
import { usePoema } from "../../hooks/usePoema";
import { useReveladoDeTexto } from "../../hooks/useReveladoDeTexto";
import { ContenedorPantallaPrincipal } from "../contenedores/ContenedorPantallaPrincipal";

export const ControladorDePoema = () => {
  const [haySonidoDetectado, setHaySonidoDetectado] = useState(false);
  const [todoReveladoLocal, setTodoReveladoLocal] = useState(false);

  const { poemaActual, obtenerNuevoPoema } = usePoema();

  const handleDetectarSonido = useCallback(() => {
    setHaySonidoDetectado(true);
    setTimeout(() => setHaySonidoDetectado(false), 50);
  }, []);

  useAudio({ onDetectarSonido: handleDetectarSonido });

  const { contador } = useContadorDeSonido({
    haySonidoDetectado,
    todoRevelado: todoReveladoLocal,
  });

  const animaciones = useAnimaciones({ contador });

  const handlePoemaOculto = useCallback(() => {
    animaciones.ejecutarTransicionPoema();
    setTimeout(() => {
      obtenerNuevoPoema();
    }, 400);
  }, [obtenerNuevoPoema, animaciones]);

  const { textoEnmascarado, todoRevelado } = useReveladoDeTexto({
    poema: poemaActual,
    contador,
    onPoemaCompletamenteOculto: handlePoemaOculto,
  });

  useEffect(() => {
    setTodoReveladoLocal(todoRevelado);
  }, [todoRevelado]);

  return (
    <ContenedorPantallaPrincipal
      contador={contador}
      texto={textoEnmascarado}
      animaciones={animaciones}
    />
  );
};
