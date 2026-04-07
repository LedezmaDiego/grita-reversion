import { Text } from "react-native";

type Props = {
  texto: string[][];
};

export const TextoDePoema = ({ texto }: Props) => {
  return (
    <>
      {texto.map((linea, i) => (
        <Text key={i}>{linea.join("")}</Text>
      ))}
    </>
  );
};
