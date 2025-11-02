import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { studyModuleAPI } from "../lib/api";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  borders,
  shadows,
} from "../constants/theme";

interface StudyModule {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  educationLevel?: string;
  difficultyLevel?: string;
  estimatedHours?: number;
  topics?: string[];
  learningPlan?: any[];
  isAIGenerated?: boolean;
  createdAt: string;
  flashcardCount?: number;
  progress?: {
    currentCardIndex: number;
    cardsStudied: number;
    totalCorrect: number;
    accuracy: number;
    completedAt?: string;
    lastStudiedAt?: string;
    progressPercent: number;
    isCompleted: boolean;
  } | null;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  questionType?: string;
  options?: string[];
}

export default function ModuleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const moduleId = params.id as string;
  
  const [module, setModule] = useState<StudyModule | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleCards, setSampleCards] = useState(3);

  useEffect(() => {
    if (moduleId) {
      loadModuleDetails();
    }
  }, [moduleId]);

  const loadModuleDetails = async () => {
    try {
      setLoading(true);
      const data = await studyModuleAPI.getById(moduleId);
      setModule(data.module);
      setFlashcards(data.flashcards || []);
    } catch (error) {
      console.error("Error loading module details:", error);
      Alert.alert("Error", "Failed to load module details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = () => {
    router.push({
      pathname: "/(tabs)/study",
      params: { moduleId },
    });
  };

  const difficultyColors: Record<string, { bg: string; text: string }> = {
    basic: { bg: colors.successBg, text: colors.success },
    intermediate: { bg: colors.infoBg, text: colors.info },
    advanced: { bg: colors.warningBg, text: colors.warning },
    expert: { bg: colors.aiBg, text: colors.ai },
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading module details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!module) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.emptyText}>Module not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const difficultyColor = difficultyColors[module.difficultyLevel || "intermediate"] || difficultyColors.intermediate;
  const displayFlashcards = flashcards.slice(0, sampleCards);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Module Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Module Info Card */}
        <View style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              {module.isAIGenerated && (
                <View style={styles.aiBadge}>
                  <MaterialIcons name="auto-awesome" size={16} color={colors.ai} />
                  <Text style={styles.aiBadgeText}>AI Generated</Text>
                </View>
              )}
            </View>
          </View>

          {module.description && (
            <Text style={styles.description}>{module.description}</Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <MaterialIcons name="style" size={20} color={colors.info} />
              <Text style={styles.statText}>
                {flashcards.length} {flashcards.length === 1 ? "Card" : "Cards"}
              </Text>
            </View>

            {module.estimatedHours && (
              <View style={styles.statBadge}>
                <MaterialIcons name="schedule" size={20} color={colors.success} />
                <Text style={styles.statText}>
                  ~{module.estimatedHours} hours
                </Text>
              </View>
            )}

            {module.difficultyLevel && (
              <View style={[styles.statBadge, { backgroundColor: difficultyColor.bg }]}>
                <MaterialIcons name="flag" size={20} color={difficultyColor.text} />
                <Text style={[styles.statText, { color: difficultyColor.text }]}>
                  {module.difficultyLevel.charAt(0).toUpperCase() + module.difficultyLevel.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Progress Row */}
          {module.progress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                {module.progress.isCompleted && (
                  <View style={styles.completedBadge}>
                    <MaterialIcons name="check-circle" size={16} color={colors.success} />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${module.progress.progressPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {module.progress.progressPercent}% Complete
                </Text>
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <MaterialIcons name="check-circle" size={18} color={colors.success} />
                  <Text style={styles.progressStatText}>
                    {module.progress.accuracy}% Accuracy
                  </Text>
                </View>
                <View style={styles.progressStat}>
                  <MaterialIcons name="trending-up" size={18} color={colors.info} />
                  <Text style={styles.progressStatText}>
                    {module.progress.cardsStudied} Studied
                  </Text>
                </View>
                <View style={styles.progressStat}>
                  <MaterialIcons name="star" size={18} color={colors.warning} />
                  <Text style={styles.progressStatText}>
                    {module.progress.totalCorrect} Correct
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Subject and Education Level */}
          <View style={styles.metaRow}>
            {module.subject && (
              <View style={styles.metaBadge}>
                <MaterialIcons name="subject" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{module.subject}</Text>
              </View>
            )}
            {module.educationLevel && (
              <View style={styles.metaBadge}>
                <MaterialIcons name="school" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  {module.educationLevel.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Topics Covered */}
        {module.topics && module.topics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Topics Covered</Text>
            <View style={styles.topicsContainer}>
              {module.topics.map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sample Flashcards */}
        {flashcards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Sample Flashcards ({flashcards.length})
            </Text>
            {displayFlashcards.map((card, index) => (
              <View key={card.id} style={styles.flashcardPreview}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardNumber}>Card {index + 1}</Text>
                  {card.questionType === "multiple_choice" && (
                    <View style={styles.mcqBadge}>
                      <MaterialIcons name="radio-button-checked" size={14} color={colors.info} />
                      <Text style={styles.mcqText}>MCQ</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardQuestion}>{card.question}</Text>
                <Text style={styles.cardAnswer}>{card.answer}</Text>
              </View>
            ))}
            {flashcards.length > sampleCards && (
              <Text style={styles.moreCardsText}>
                +{flashcards.length - sampleCards} more flashcards
              </Text>
            )}
          </View>
        )}

        {/* Start Study Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartStudy}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name={module.progress?.isCompleted ? "replay" : "play-circle-filled"} 
            size={28} 
            color={colors.surface} 
          />
          <Text style={styles.startButtonText}>
            {module.progress?.isCompleted ? "Review Module" : module.progress ? "Continue Study" : "Start Study"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backIcon: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  backButton: {
    marginTop: spacing.xl,
    ...borders.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  backButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  moduleCard: {
    ...borders.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  moduleHeader: {
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  moduleTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.aiBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs / 2,
  },
  aiBadgeText: {
    ...typography.captionBold,
    color: colors.ai,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs / 2,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressSection: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  completedText: {
    ...typography.captionBold,
    color: colors.success,
  },
  progressBarContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  progressStatText: {
    ...typography.caption,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
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
    paddingVertical: spacing.sm,
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardNumber: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  mcqBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  mcqText: {
    ...typography.caption,
    color: colors.info,
  },
  cardQuestion: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardAnswer: {
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
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
    marginTop: spacing.md,
  },
  startButtonText: {
    ...typography.h3,
    color: colors.surface,
    fontSize: 20,
  },
});

