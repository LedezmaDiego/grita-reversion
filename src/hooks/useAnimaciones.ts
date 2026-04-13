import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
  contador: number;
};

export const useAnimaciones = ({ contador }: Props) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const intensidadAnim = useRef(new Animated.Value(0)).current;

  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const intensidad = Math.min(contador / 50, 1);

    Animated.timing(intensidadAnim, {
      toValue: intensidad,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [contador, intensidadAnim]);

  useEffect(() => {
    const colorProgreso = Math.min(contador / 50, 1);

    Animated.timing(colorAnim, {
      toValue: colorProgreso,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [contador, colorAnim]);

  const ejecutarTransicionPoema = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const scale = intensidadAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 1, 1.05],
  });

  const opacity = intensidadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const colorValue = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#999999", "#ffffff", "#ffd966"],
  });

  return {
    fadeAnim,
    colorValue,
    scale,
    opacity,
    ejecutarTransicionPoema,
  };
};
