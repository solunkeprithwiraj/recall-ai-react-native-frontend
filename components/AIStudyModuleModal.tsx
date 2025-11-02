import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { studyModuleAPI } from "../lib/api";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  borders,
  shadows,
} from "../constants/theme";

interface AIStudyModuleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEducationLevel?: string;
}

const EDUCATION_LEVELS = [
  "elementary",
  "middle",
  "high_school",
  "college",
  "competitive",
];

const DIFFICULTY_LEVELS = ["basic", "intermediate", "advanced", "expert"];

export default function AIStudyModuleModal({
  visible,
  onClose,
  onSuccess,
  userEducationLevel,
}: AIStudyModuleModalProps) {
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    educationLevel: userEducationLevel || "",
    difficultyLevel: "intermediate",
    numberOfCards: "20",
    estimatedHours: "",
  });
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const handlePreview = async () => {
    if (!formData.topic.trim()) {
      Alert.alert("Error", "Please enter a topic for the study module.");
      return;
    }

    try {
      setLoading(true);
      const preview = await studyModuleAPI.preview({
        topic: formData.topic.trim(),
        subject: formData.subject.trim() || undefined,
        educationLevel: formData.educationLevel || undefined,
        difficultyLevel: formData.difficultyLevel || undefined,
        numberOfCards: parseInt(formData.numberOfCards) || 20,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : undefined,
      });
      setPreviewData(preview);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Error generating preview:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to generate preview. Please try again.";
      const errorTitle =
        error.response?.status === 503 ? "AI Service Unavailable" : "Error";

      Alert.alert(
        errorTitle,
        errorMessage +
          (error.response?.data?.help ? `\n\n${error.response.data.help}` : ""),
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      Alert.alert("Error", "Please enter a topic for the study module.");
      return;
    }

    try {
      setLoading(true);
      await studyModuleAPI.generate({
        topic: formData.topic.trim(),
        subject: formData.subject.trim() || undefined,
        educationLevel: formData.educationLevel || undefined,
        difficultyLevel: formData.difficultyLevel || undefined,
        numberOfCards: parseInt(formData.numberOfCards) || 20,
        estimatedHours: formData.estimatedHours
          ? parseInt(formData.estimatedHours)
          : undefined,
      });

      Alert.alert("Success", "Study module created successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            onClose();
            if (onSuccess) onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error generating study module:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to generate study module. Please try again.";
      const errorTitle =
        error.response?.status === 503 ? "AI Service Unavailable" : "Error";

      Alert.alert(
        errorTitle,
        errorMessage +
          (error.response?.data?.help ? `\n\n${error.response.data.help}` : ""),
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      topic: "",
      subject: "",
      educationLevel: userEducationLevel || "",
      difficultyLevel: "intermediate",
      numberOfCards: "20",
      estimatedHours: "",
    });
    setPreviewData(null);
    setShowPreview(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const difficultyColors = {
    basic: { bg: colors.successBg, active: colors.success, text: colors.text },
    intermediate: { bg: colors.infoBg, active: colors.info, text: colors.text },
    advanced: {
      bg: colors.warningBg,
      active: colors.warning,
      text: colors.text,
    },
    expert: { bg: colors.aiBg, active: colors.ai, text: colors.text },
  };

  if (!visible) {
    return null;
  }

  if (showPreview && previewData) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.scrollView}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Preview Study Module</Text>
                  <Text style={styles.subtitle}>
                    Review the generated content before creating
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Module Info */}
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>
                  {previewData.module.title}
                </Text>
                {previewData.module.description && (
                  <Text style={styles.previewDescription}>
                    {previewData.module.description}
                  </Text>
                )}
                <View style={styles.previewStats}>
                  <View style={styles.statBadge}>
                    <MaterialIcons name="style" size={16} color={colors.info} />
                    <Text style={styles.statText}>
                      {previewData.stats.totalFlashcards} cards
                    </Text>
                  </View>
                  {previewData.module.estimatedHours && (
                    <View style={styles.statBadge}>
                      <MaterialIcons
                        name="schedule"
                        size={16}
                        color={colors.success}
                      />
                      <Text style={styles.statText}>
                        ~{previewData.module.estimatedHours} hours
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Topics */}
              {previewData.module.topics &&
                previewData.module.topics.length > 0 && (
                  <View style={styles.previewSection}>
                    <Text style={styles.sectionLabel}>Topics Covered</Text>
                    <View style={styles.topicsContainer}>
                      {previewData.module.topics.map(
                        (topic: string, index: number) => (
                          <View key={index} style={styles.topicChip}>
                            <Text style={styles.topicText}>{topic}</Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                )}

              {/* Sample Flashcards */}
              {previewData.flashcards && previewData.flashcards.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionLabel}>
                    Sample Flashcards ({previewData.flashcards.length})
                  </Text>
                  {previewData.flashcards
                    .slice(0, 3)
                    .map((card: any, index: number) => (
                      <View key={index} style={styles.flashcardPreview}>
                        <Text style={styles.flashcardQuestion}>
                          {card.question}
                        </Text>
                        <Text style={styles.flashcardAnswer}>
                          {card.answer}
                        </Text>
                      </View>
                    ))}
                  {previewData.flashcards.length > 3 && (
                    <Text style={styles.moreCardsText}>
                      +{previewData.flashcards.length - 3} more flashcards
                    </Text>
                  )}
                </View>
              )}

              {/* Actions */}
              <View style={styles.previewActions}>
                <TouchableOpacity
                  onPress={() => {
                    setShowPreview(false);
                    setPreviewData(null);
                  }}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGenerate}
                  style={styles.primaryButton}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.surface} />
                  ) : (
                    <>
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={colors.surface}
                      />
                      <Text style={styles.primaryButtonText}>
                        Create Module
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>AI Study Module Generator</Text>
                <Text style={styles.subtitle}>
                  Create a complete study module with flashcards
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Topic Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Topic * <Text style={styles.required}>Required</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., World War II, Photosynthesis, Calculus Basics"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.topic}
                  onChangeText={(text) =>
                    setFormData({ ...formData, topic: text })
                  }
                  multiline
                  maxLength={200}
                />
              </View>
              <Text style={styles.hintText}>
                Describe what you want to study (max 200 characters)
              </Text>
            </View>

            {/* Subject Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, { minHeight: 56 }]}
                  placeholder="e.g., History, Biology, Mathematics"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                />
              </View>
            </View>

            {/* Education Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Education Level</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.levelScroll}
              >
                {EDUCATION_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() =>
                      setFormData({ ...formData, educationLevel: level })
                    }
                    style={[
                      styles.levelButton,
                      formData.educationLevel === level &&
                        styles.levelButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        formData.educationLevel === level &&
                          styles.levelButtonTextActive,
                      ]}
                    >
                      {level
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Difficulty Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.difficultyContainer}>
                {DIFFICULTY_LEVELS.map((level) => {
                  const difficultyColor =
                    difficultyColors[level as keyof typeof difficultyColors];
                  const isActive = formData.difficultyLevel === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      onPress={() =>
                        setFormData({ ...formData, difficultyLevel: level })
                      }
                      style={[
                        styles.difficultyButton,
                        {
                          backgroundColor: isActive
                            ? difficultyColor.active
                            : difficultyColor.bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          {
                            color: isActive
                              ? colors.surface
                              : difficultyColor.text,
                          },
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Number of Cards */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Flashcards</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, { minHeight: 56 }]}
                  placeholder="20"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.numberOfCards}
                  onChangeText={(text) => {
                    // 1. Always update the state so the user sees their input
                    setFormData({ ...formData, numberOfCards: text });

                    // 2. Now, validate the input and set an error message
                    const num = parseInt(text);
                    if (text === "") {
                      setError("Please enter a number.");
                    } else if (isNaN(num) || num < 5 || num > 100) {
                      setError("Must be a number between 5 and 100.");
                    } else {
                      // 3. If it's valid, clear the error
                      setError("");
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleGenerate}
                style={styles.generateButton}
                disabled={loading || !formData.topic.trim()}
              >
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <MaterialIcons
                      name="auto-awesome"
                      size={20}
                      color={colors.surface}
                    />
                    <Text style={styles.generateButtonText}>Generate Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalContent: {
    backgroundColor: colors.surface,
    flex: 1,
    paddingBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  closeButton: {
    padding: spacing.xs,
  },
  inputGroup: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  required: {
    ...typography.small,
    color: colors.error,
  },
  inputContainer: {
    ...borders.card,
    overflow: "hidden",
  },
  textInput: {
    ...typography.body,
    padding: spacing.md,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: "top",
  },
  hintText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  levelScroll: {
    marginTop: spacing.sm,
  },
  levelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceHover,
    marginRight: spacing.sm,
    ...borders.subtle,
  },
  levelButtonActive: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  levelButtonText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  levelButtonTextActive: {
    color: colors.surface,
  },
  difficultyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  difficultyButton: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    ...borders.subtle,
  },
  difficultyText: {
    ...typography.captionBold,
  },
  actions: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.aiBg,
    ...borders.subtle,
    borderWidth: 1.5,
    borderColor: colors.ai + "40",
    gap: spacing.sm,
  },
  previewButtonText: {
    ...typography.bodyBold,
    color: colors.ai,
  },
  generateButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.ai,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  generateButtonText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  // Preview Styles
  previewSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  previewTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  previewDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  previewStats: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...borders.subtle,
  },
  statText: {
    ...typography.captionBold,
    color: colors.text,
  },
  sectionLabel: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 18,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  topicChip: {
    backgroundColor: colors.infoBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    ...borders.subtle,
    borderColor: colors.info + "30",
  },
  topicText: {
    ...typography.captionBold,
    color: colors.info,
  },
  flashcardPreview: {
    ...borders.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  flashcardQuestion: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  flashcardAnswer: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moreCardsText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  previewActions: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceHover,
    alignItems: "center",
    ...borders.subtle,
  },
  secondaryButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.ai,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
