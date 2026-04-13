import { Animated } from "react-native";

type Props = {
  lineas: string[];
  opacity: any;
};

export const TextoDePoema = ({ lineas, opacity }: Props) => {
  return (
    <>
      {lineas.map((linea, index) => (
        <Animated.Text key={index} style={{ opacity }}>
          {linea}
        </Animated.Text>
      ))}
    </>
  );
};
