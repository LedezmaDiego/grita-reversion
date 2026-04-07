import { Text } from "react-native";

type Props = {
  valor: number;
};

export const ContadorDeSonido = ({ valor }: Props) => {
  return <Text>{Math.floor(valor)}</Text>;
};
