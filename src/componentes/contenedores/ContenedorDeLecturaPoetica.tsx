import { ScrollView } from "react-native";
import { ContadorDeSonido } from "../contenidos/ContadorDeSonido";
import { TextoDePoema } from "../contenidos/TextoDePoema";
import { TituloPrincipal } from "../contenidos/TituloPrincipal";

type Props = {
  texto: string[][];
  nivel: number;
  onCambiarPoema: () => void;
};

export const ContenedorDeLecturaPoetica = ({ texto, nivel }: Props) => {
  return (
    <>
      <ContadorDeSonido valor={nivel} />

      <ScrollView>
        <TituloPrincipal titulo="Chasquea" />
        <TextoDePoema texto={texto} />
      </ScrollView>
    </>
  );
};
