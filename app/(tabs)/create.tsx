import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { flashcardAPI, userAPI } from "../../lib/api";
import AIStudyModuleModal from "../../components/AIStudyModuleModal";
import { colors, spacing, typography, borderRadius, borders, shadows } from "../../constants/theme";

export default function CreateScreen() {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    subject: "",
    difficulty: "intermediate",
  });
  const [loading, setLoading] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [userEducationLevel, setUserEducationLevel] = useState<string>("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userAPI.getProfile();
      if (profile?.educationLevel) {
        setUserEducationLevel(profile.educationLevel);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) {
      Alert.alert("Error", "Please fill in both question and answer fields.");
      return;
    }

    try {
      setLoading(true);
      await flashcardAPI.create({
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        subject: formData.subject.trim() || undefined,
        difficultyLevel: formData.difficulty,
      });

      Alert.alert("Success", "Flashcard created successfully!");
      setFormData({
        question: "",
        answer: "",
        subject: "",
        difficulty: "intermediate",
      });
    } catch (error: any) {
      console.error("Error creating flashcard:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create flashcard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    basic: { bg: colors.successBg, active: colors.success, text: colors.text },
    intermediate: { bg: colors.infoBg, active: colors.info, text: colors.text },
    advanced: { bg: colors.warningBg, active: colors.warning, text: colors.text },
    expert: { bg: colors.aiBg, active: colors.ai, text: colors.text },
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* AI-First Section */}
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <MaterialIcons name="auto-awesome" size={24} color={colors.ai} />
              <Text style={styles.aiTitle}>AI Study Module</Text>
            </View>
            <Text style={styles.aiDescription}>
              Generate a complete study module with personalized flashcards in seconds
            </Text>
            <TouchableOpacity
              style={styles.aiPrimaryButton}
              activeOpacity={0.8}
              onPress={() => {
                console.log("AI Module button pressed, showing modal");
                setShowAIModal(true);
              }}
            >
              <MaterialIcons name="auto-awesome" size={20} color={colors.surface} />
              <Text style={styles.aiPrimaryButtonText}>Generate with AI</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.title}>Create Manually</Text>

          {/* Question Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Question *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your question..."
                placeholderTextColor={colors.textTertiary}
                multiline
                value={formData.question}
                onChangeText={(text) =>
                  setFormData({ ...formData, question: text })
                }
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Answer Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Answer *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter the answer..."
                placeholderTextColor={colors.textTertiary}
                multiline
                value={formData.answer}
                onChangeText={(text) =>
                  setFormData({ ...formData, answer: text })
                }
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Subject Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { minHeight: 56 }]}
                placeholder="e.g., Math, Science, History"
                placeholderTextColor={colors.textTertiary}
                value={formData.subject}
                onChangeText={(text) =>
                  setFormData({ ...formData, subject: text })
                }
              />
            </View>
          </View>

          {/* Difficulty Selector */}
          <View style={styles.difficultyGroup}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.difficultyContainer}>
              {["basic", "intermediate", "advanced", "expert"].map((level) => {
                const colors =
                  difficultyColors[level as keyof typeof difficultyColors];
                const isActive = formData.difficulty === level;
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() =>
                      setFormData({ ...formData, difficulty: level })
                    }
                    style={[
                      styles.difficultyButton,
                      {
                        backgroundColor: isActive ? colors.active : colors.bg,
                        shadowColor: isActive ? colors.active : colors.text,
                        shadowOpacity: isActive ? 0.3 : 0.1,
                        elevation: isActive ? 6 : 2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: isActive ? colors.surface : colors.text },
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <>
                <MaterialIcons name="add-circle" size={20} color={colors.surface} />
                <Text style={styles.submitText}>Create Flashcard</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Study Module Modal - Outside ScrollView */}
      <AIStudyModuleModal
        visible={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSuccess={() => {
          // Refresh data if needed
          setShowAIModal(false);
        }}
        userEducationLevel={userEducationLevel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  // AI Section
  aiSection: {
    backgroundColor: colors.aiBg,
    ...borders.cardElevated,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderColor: colors.ai + "30",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  aiTitle: {
    ...typography.h3,
    color: colors.text,
  },
  aiDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  aiPrimaryButton: {
    backgroundColor: colors.ai,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.sm,
  },
  aiPrimaryButtonText: {
    ...typography.bodyBold,
    color: colors.surface,
    flex: 1,
    marginLeft: spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    ...borders.card,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  textInput: {
    ...typography.body,
    padding: spacing.md,
    minHeight: 120,
    color: colors.text,
  },
  difficultyGroup: {
    marginBottom: spacing.xl,
  },
  difficultyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  difficultyButton: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    ...borders.subtle,
  },
  difficultyText: {
    ...typography.captionBold,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.sm,
  },
  submitText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
});
