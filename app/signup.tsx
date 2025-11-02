import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";
import { authAPI } from "../lib/api";
import { storage } from "../lib/storage";
import { useToast } from "../utils/toast";

const EDUCATION_LEVELS = [
  { value: "elementary", label: "Elementary" },
  { value: "middle", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "college", label: "College" },
  { value: "competitive", label: "Competitive Exams" },
];

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [educationLevel, setEducationLevel] = useState("high_school");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEducationPicker, setShowEducationPicker] = useState(false);
  const { showToast } = useToast();

  const handleSignup = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: parseInt(age, 10),
        educationLevel,
      });

      if (response.token && response.user) {
        // Store token and user ID
        await storage.setItem("authToken", response.token);
        await storage.setItem("userId", response.user.id);

        showToast(
          "Account created successfully! Welcome to SmartFlash",
          "success"
        );
        // Small delay to show toast before navigation
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 500);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          "Failed to create account. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <MaterialIcons name="person-add" size={64} color={colors.primary} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SmartFlash to start learning</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons
              name="person"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <MaterialIcons
                name="cake"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor={colors.textTertiary}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.selectContainer, styles.halfWidth]}
              onPress={() => setShowEducationPicker(true)}
              disabled={loading}
            >
              <MaterialIcons
                name="school"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <Text style={styles.pickerText}>
                {EDUCATION_LEVELS.find(
                  (level) => level.value === educationLevel
                )?.label || "Select Level"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color={colors.textSecondary}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              disabled={loading}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Education Level Picker Modal */}
      <Modal
        visible={showEducationPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEducationPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEducationPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Education Level</Text>
              <TouchableOpacity onPress={() => setShowEducationPicker(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {EDUCATION_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.modalOption,
                    educationLevel === level.value &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setEducationLevel(level.value);
                    setShowEducationPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      educationLevel === level.value &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  {educationLevel === level.value && (
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 56,
    ...shadows.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
    ...(Platform.OS === "web"
      ? { outlineStyle: "none" as any, outlineWidth: 0 }
      : {}),
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  row: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 56,
    ...shadows.sm,
  },
  pickerText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linkText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: "100%",
    maxWidth: 400,
    maxHeight: "70%",
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalList: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalOptionSelected: {
    backgroundColor: colors.surfaceHover,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.text,
  },
  modalOptionTextSelected: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
