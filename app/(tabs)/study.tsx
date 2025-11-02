import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { studyAPI, studyModuleAPI } from "../../lib/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { colors, spacing, typography, borderRadius, borders, shadows } from "../../constants/theme";
import { useToast } from "../../utils/toast";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject?: string;
  difficultyLevel?: string;
  questionType?: string;
  options?: string[];
}

interface StudyModule {
  id: string;
  title: string;
  description?: string;
  flashcardCount?: number;
}

export default function StudyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [totalStudied, setTotalStudied] = useState(0);
  const [showModuleSelection, setShowModuleSelection] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(undefined);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string>("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Use React Query for modules
  const {
    data: modules = [],
    isLoading: modulesLoading,
    refetch: refetchModules,
  } = useQuery({
    queryKey: ["study-modules"],
    queryFn: async () => {
      return await studyModuleAPI.getAll();
    },
    refetchOnMount: true,
  });

  // Auto-start session if moduleId is provided in params
  useEffect(() => {
    if (params.moduleId && typeof params.moduleId === 'string' && modules.length > 0 && !sessionId && showModuleSelection) {
      const moduleId = params.moduleId;
      const module = modules.find(m => m.id === moduleId);
      if (module && selectedModuleId !== moduleId) {
        setSelectedModuleId(moduleId);
        setShowModuleSelection(false);
        startSession(moduleId);
      }
    }
  }, [params.moduleId, modules, sessionId, showModuleSelection, selectedModuleId]);

  const startSession = async (moduleId?: string) => {
    try {
      setLoading(true);
      setShowModuleSelection(false);
      const result = await studyAPI.startSession("review", moduleId);
      setSessionId(result.session.id);
      setFlashcards(result.flashcards || []);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
      
      // Resume from last position if progress exists
      if (result.startIndex !== undefined && result.startIndex >= 0) {
        setCurrentIndex(result.startIndex);
      } else {
        setCurrentIndex(0);
      }
      
      // Reset counts if starting fresh (no progress)
      if (!result.progress || result.startIndex === 0) {
        setCorrectCount(0);
        setTotalStudied(0);
      } else {
        // Resume with existing progress counts
        setCorrectCount(result.progress.totalCorrect || 0);
        setTotalStudied(result.progress.cardsStudied || 0);
      }
      
      if (moduleId) {
        const selectedModule = modules.find(m => m.id === moduleId);
        setSelectedModuleTitle(selectedModule?.title || "");
        setSelectedModuleId(moduleId);
      } else {
        setSelectedModuleTitle("All Cards");
        setSelectedModuleId(undefined);
      }
    } catch (error) {
      console.error("Error starting session:", error);
      Alert.alert("Error", "Failed to start study session. Please try again.");
      // Go back to module selection on error
      setShowModuleSelection(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: StudyModule | null) => {
    if (module) {
      // Navigate to module detail page
      router.push({
        pathname: "/module-detail",
        params: { id: module.id },
      });
    } else {
      // Study all cards - start directly
      setSelectedModuleId(undefined);
      setShowModuleSelection(false);
      startSession();
    }
  };

  const handleBackToModules = () => {
    setShowModuleSelection(true);
    setFlashcards([]);
    setSessionId(null);
    setCurrentIndex(0);
    setCorrectCount(0);
    setTotalStudied(0);
    setSelectedModuleId(undefined);
    setSelectedModuleTitle("");
    // Clear the moduleId param if it exists
    router.replace("/(tabs)/study");
  };

  const handleAnswer = async (correct: boolean) => {
    if (!flashcards[currentIndex] || !sessionId) return;

    try {
      setSubmitting(true);
      const responseTime = Date.now() - cardStartTime;
      
      await studyAPI.updateCardPerformance(flashcards[currentIndex].id, {
        correct,
        responseTime,
      });

      if (correct) {
        setCorrectCount((prev) => prev + 1);
      }
      setTotalStudied((prev) => prev + 1);

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        setCardStartTime(Date.now());
      } else {
        // End session
        await endSession();
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      Alert.alert("Error", "Failed to record answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const recordMCQAnswer = async (correct: boolean) => {
    if (!flashcards[currentIndex] || !sessionId) return;

    try {
      const responseTime = Date.now() - cardStartTime;
      
      await studyAPI.updateCardPerformance(flashcards[currentIndex].id, {
        correct,
        responseTime,
      });

      if (correct) {
        setCorrectCount((prev) => prev + 1);
      }
      setTotalStudied((prev) => prev + 1);
    } catch (error) {
      console.error("Error recording MCQ answer:", error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      // Count the current card if we're at the last one
      const finalCardsStudied = currentIndex === flashcards.length - 1 ? totalStudied + 1 : totalStudied;
      
      await studyAPI.endSession(sessionId, {
        cardsStudied: finalCardsStudied,
        correctAnswers: correctCount, // This is already updated by handleAnswer/recordMCQAnswer
        sessionDuration,
        moduleId: selectedModuleId,
        currentCardIndex: currentIndex,
      });

      const accuracy = finalCardsStudied > 0 ? Math.round((correctCount / finalCardsStudied) * 100) : 0;
      
      // Check if module was completed (all cards studied)
      const isModuleCompleted = selectedModuleId && currentIndex === flashcards.length - 1;
      
      if (isModuleCompleted) {
        showToast(
          `🎉 Module completed! ${finalCardsStudied} cards studied with ${accuracy}% accuracy!`,
          "success",
          4000
        );
      } else {
        showToast(
          `Great work! ${finalCardsStudied} cards studied with ${accuracy}% accuracy!`,
          "success",
          3000
        );
      }
      
      // Navigate to home after a short delay
      setTimeout(() => {
        router.push("/(tabs)/");
      }, isModuleCompleted ? 1500 : 1000);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setSelectedAnswer(null);
      setCardStartTime(Date.now());
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setSelectedAnswer(null);
      setCardStartTime(Date.now());
    }
  };

  if (showModuleSelection) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Study Module</Text>
          <Text style={styles.headerSubtitle}>Choose a module to study, or study all cards</Text>
        </View>
        <ScrollView style={styles.modulesList} contentContainerStyle={styles.modulesListContent}>
          {/* All Cards Option */}
          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => handleModuleSelect(null)}
            activeOpacity={0.7}
          >
            <View style={[styles.moduleIcon, { backgroundColor: colors.primary + "20" }]}>
              <MaterialIcons name="collections-bookmark" size={32} color={colors.primary} />
            </View>
            <View style={styles.moduleContent}>
              <Text style={styles.moduleTitle}>All Cards</Text>
              <Text style={styles.moduleDescription}>Study all your flashcards</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Module List */}
          {modules.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="school" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No study modules yet</Text>
              <Text style={styles.emptySubtext}>Create a module from the Home screen to get started</Text>
            </View>
          )}

          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModuleSelect(module)}
              activeOpacity={0.7}
            >
              <View style={[styles.moduleIcon, { backgroundColor: colors.ai + "20" }]}>
                <MaterialIcons name="auto-stories" size={32} color={colors.ai} />
              </View>
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>
                  {module.flashcardCount || 0} cards
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Starting study session...</Text>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <MaterialIcons name="school" size={64} color={colors.textTertiary} />
        <Text style={styles.loadingText}>No flashcards available</Text>
        <Text style={styles.loadingSubtext}>This module has no cards to study</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToModules}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back to Modules</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];
  const isMCQ = currentCard.questionType === "multiple_choice" && currentCard.options && currentCard.options.length > 0;

  return (
    <View style={styles.container}>
      {/* Module Header */}
      <View style={styles.moduleHeader}>
        <TouchableOpacity
          style={styles.backButtonSmall}
          onPress={handleBackToModules}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.moduleHeaderTitle}>{selectedModuleTitle}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Card {currentIndex + 1} of {flashcards.length}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / flashcards.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Flashcard - MCQ or Regular */}
        <TouchableOpacity
          onPress={() => !isMCQ && setIsFlipped(!isFlipped)}
          activeOpacity={isMCQ ? 1 : 0.95}
        >
          <View style={[
            styles.flashcard,
            !isMCQ && isFlipped && styles.flashcardFlipped
          ]}>
            {isMCQ ? (
              <View style={styles.cardContent}>
                {currentCard.subject && (
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{currentCard.subject}</Text>
                  </View>
                )}
                <Text style={styles.questionText}>{currentCard.question}</Text>
              </View>
            ) : !isFlipped ? (
              <View style={styles.cardContent}>
                {currentCard.subject && (
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{currentCard.subject}</Text>
                  </View>
                )}
                <Text style={styles.questionText}>{currentCard.question}</Text>
                <View style={styles.flipHint}>
                  <MaterialIcons name="flip" size={24} color={colors.textSecondary} />
                  <Text style={styles.flipText}>Tap to reveal answer</Text>
                </View>
              </View>
            ) : (
              <View style={styles.cardContentFlipped}>
                <View style={styles.answerBadge}>
                  <Text style={styles.answerBadgeText}>Answer</Text>
                </View>
                <Text style={styles.answerText}>{currentCard.answer}</Text>
                <View style={styles.flipHint}>
                  <MaterialIcons name="flip" size={24} color={colors.textSecondary} />
                  <Text style={styles.flipText}>Tap to flip back</Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* MCQ Options - Separate below card */}
        {isMCQ && (
          <View style={styles.mcqContainer}>
            <View style={styles.optionsContainer}>
              {currentCard.options?.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = selectedAnswer !== null && option === currentCard.answer;
                const isWrong = selectedAnswer === option && option !== currentCard.answer;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                      isCorrect && styles.optionButtonCorrect,
                      isWrong && styles.optionButtonWrong,
                    ]}
                    onPress={() => {
                      if (!selectedAnswer) {
                        setSelectedAnswer(option);
                        recordMCQAnswer(option === currentCard.answer);
                      }
                    }}
                    disabled={selectedAnswer !== null}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      isCorrect && styles.optionTextCorrect,
                      isWrong && styles.optionTextWrong,
                    ]}>
                      {String.fromCharCode(65 + index)}. {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Show answer feedback */}
            {selectedAnswer && (
              <View style={[
                styles.feedbackContainer,
                selectedAnswer === currentCard.answer ? styles.feedbackContainerCorrect : styles.feedbackContainerIncorrect
              ]}>
                <Text style={[
                  styles.feedbackText,
                  selectedAnswer === currentCard.answer ? styles.feedbackTextCorrect : styles.feedbackTextIncorrect
                ]}>
                  {selectedAnswer === currentCard.answer ? "✓ Correct!" : "✗ Incorrect"}
                </Text>
                {selectedAnswer !== currentCard.answer && (
                  <Text style={styles.correctAnswerText}>
                    Correct Answer: {currentCard.answer}
                  </Text>
                )}
              </View>
            )}
            
            {/* Next Card Button for MCQ */}
            {selectedAnswer && (
              <TouchableOpacity
                style={[styles.mcqNextButton]}
                activeOpacity={0.7}
                onPress={handleNext}
              >
                <Text style={styles.mcqNextButtonText}>Next Card</Text>
                <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {isFlipped && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.incorrectButton]}
              activeOpacity={0.7}
              onPress={() => handleAnswer(false)}
              disabled={submitting}
            >
              <MaterialIcons name="close" size={20} color={colors.error} />
              <Text style={styles.incorrectText}>Incorrect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.correctButton]}
              activeOpacity={0.7}
              onPress={() => handleAnswer(true)}
              disabled={submitting}
            >
              <MaterialIcons name="check" size={20} color={colors.success} />
              <Text style={styles.correctText}>Correct</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation Buttons */}
        {!isFlipped && (
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              activeOpacity={0.7}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <MaterialIcons
                name="chevron-left"
                size={20}
                color={currentIndex === 0 ? colors.textTertiary : colors.text}
              />
              <Text
                style={[
                  styles.navButtonText,
                  currentIndex === 0 && styles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === flashcards.length - 1 && styles.navButtonDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handleNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentIndex === flashcards.length - 1 && styles.navButtonTextDisabled,
                ]}
              >
                Next
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={currentIndex === flashcards.length - 1 ? colors.textTertiary : colors.text}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  progressPercent: {
    ...typography.bodyBold,
    color: colors.text,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  flashcard: {
    ...borders.cardElevated,
    borderRadius: borderRadius.lg,
    minHeight: 500,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  flashcardFlipped: {
    backgroundColor: colors.surfaceHover,
  },
  cardContent: {
    alignItems: "center",
    width: "100%",
    paddingVertical: spacing.md,
  },
  cardContentFlipped: {
    alignItems: "center",
    width: "100%",
    paddingVertical: spacing.md,
  },
  cardScrollView: {
    flex: 1,
    width: "100%",
  },
  subjectBadge: {
    backgroundColor: colors.infoBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
    ...borders.subtle,
    borderColor: colors.info + "30",
  },
  subjectText: {
    ...typography.captionBold,
    color: colors.info,
  },
  answerBadge: {
    backgroundColor: colors.aiBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
    ...borders.subtle,
    borderColor: colors.ai + "30",
  },
  answerBadgeText: {
    ...typography.captionBold,
    color: colors.ai,
  },
  questionText: {
    ...typography.h1,
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 36,
  },
  answerText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 26,
  },
  flipHint: {
    alignItems: "center",
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.xs,
  },
  flipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    ...borders.card,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  incorrectButton: {
    borderColor: colors.error + "30",
  },
  correctButton: {
    borderColor: colors.success + "30",
  },
  incorrectText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  correctText: {
    ...typography.bodyBold,
    color: colors.success,
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
    ...borders.card,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    ...typography.bodyBold,
    color: colors.text,
    marginHorizontal: spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonTextDisabled: {
    color: colors.textTertiary,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modulesList: {
    flex: 1,
  },
  modulesListContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    ...borders.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  moduleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
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
    textAlign: "center",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButtonSmall: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  moduleHeaderTitle: {
    ...typography.bodyBold,
    color: colors.text,
    flex: 1,
  },
  mcqContainer: {
    marginTop: spacing.sm,
  },
  optionsContainer: {
    width: "100%",
    gap: spacing.sm,
  },
  optionButton: {
    ...borders.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 50,
    justifyContent: "center",
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + "10",
  },
  optionButtonCorrect: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: colors.success + "20",
  },
  optionButtonWrong: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: colors.error + "20",
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
  optionTextSelected: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  optionTextCorrect: {
    ...typography.bodyBold,
    color: colors.success,
  },
  optionTextWrong: {
    ...typography.bodyBold,
    color: colors.error,
  },
  feedbackContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  feedbackContainerCorrect: {
    backgroundColor: colors.success + "10",
    borderWidth: 1,
    borderColor: colors.success + "30",
  },
  feedbackContainerIncorrect: {
    backgroundColor: colors.error + "10",
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  feedbackText: {
    ...typography.bodyBold,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  feedbackTextCorrect: {
    color: colors.success,
  },
  feedbackTextIncorrect: {
    color: colors.error,
  },
  correctAnswerText: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
  },
  mcqNextButton: {
    ...borders.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  mcqNextButtonText: {
    ...typography.bodyBold,
    color: "white",
  },
});
