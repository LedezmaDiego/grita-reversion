import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { height } = Dimensions.get("window");

type Props = {
  contador: number;
  texto: string[][];
  animaciones: any;
};

export const ContenedorPantallaPrincipal = ({
  contador,
  texto,
  animaciones,
}: Props) => {
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            opacity: animaciones.opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.5],
            }),
          },
        ]}
      />

      <Animated.Text
        style={[
          styles.contador,
          {
            opacity: animaciones.fadeAnim,
          },
        ]}
      >
        {contador}
      </Animated.Text>

      <Animated.View
        style={[
          styles.contenido,
          {
            transform: [{ scale: animaciones.scale }],
            opacity: animaciones.fadeAnim,
          },
        ]}
      >
        <Animated.Text style={styles.titulo}>Chasquea</Animated.Text>

        {texto.map((linea, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.linea,
              {
                color: animaciones.colorValue,
              },
            ]}
          >
            {linea.join("")}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a2e",
  },
  contador: {
    position: "absolute",
    top: 40,
    left: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  contenido: {
    width: "90%",
    alignItems: "center",
  },
  titulo: {
    fontSize: 28,
    marginBottom: height * 0.08,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
  },
  linea: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: height * 0.04,
    lineHeight: 24,
  },
});
