import { Text } from "react-native";

type Props = {
  titulo: string;
};

export const TituloPrincipal = ({ titulo }: Props) => {
  return <Text>{titulo}</Text>;
};
