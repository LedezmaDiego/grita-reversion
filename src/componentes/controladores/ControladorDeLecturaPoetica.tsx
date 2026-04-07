import { useLecturaPoetica } from "../../hooks/useLecturaPoetica";
import { useMantenerPantallaActiva } from "../../hooks/useMantenerPantallaActiva";
import { ContenedorDeLecturaPoetica } from "../contenedores/ContenedorDeLecturaPoetica";

export const ControladorDeLecturaPoetica = () => {
  useMantenerPantallaActiva();

  const { textoVisible, nivelDeEnergia, cambiarPoema } = useLecturaPoetica();

  return (
    <ContenedorDeLecturaPoetica
      texto={textoVisible}
      nivel={nivelDeEnergia}
      onCambiarPoema={cambiarPoema}
    />
  );
};
