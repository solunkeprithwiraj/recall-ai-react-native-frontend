import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius, shadows } from "../constants/theme";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  duration?: number;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  visible,
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: colors.successBg,
          borderColor: colors.success,
          icon: "check-circle",
          iconColor: colors.success,
        };
      case "error":
        return {
          backgroundColor: colors.errorBg,
          borderColor: colors.error,
          icon: "error",
          iconColor: colors.error,
        };
      case "warning":
        return {
          backgroundColor: colors.warningBg,
          borderColor: colors.warning,
          icon: "warning",
          iconColor: colors.warning,
        };
      case "info":
      default:
        return {
          backgroundColor: colors.infoBg,
          borderColor: colors.info,
          icon: "info",
          iconColor: colors.info,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: typeStyles.backgroundColor,
            borderLeftWidth: 4,
            borderLeftColor: typeStyles.borderColor,
          },
        ]}
      >
        <MaterialIcons
          name={typeStyles.icon as any}
          size={24}
          color={typeStyles.iconColor}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <MaterialIcons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.lg,
    minHeight: 56,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: "500",
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default Toast;

