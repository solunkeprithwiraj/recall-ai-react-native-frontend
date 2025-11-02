import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { userAPI, studyAPI, studyModuleAPI } from "../../lib/api";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  borders,
  shadows,
} from "../../constants/theme";

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCards: 0,
    studiedToday: 0,
    streak: 0,
    accuracy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [studyModules, setStudyModules] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadStudyModules();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        userAPI.getStats(),
        studyAPI.getHistory(),
      ]);

      setStats({
        totalCards: statsData.totalCards || 0,
        studiedToday: statsData.studiedToday || 0,
        streak: statsData.streak || 0,
        accuracy: statsData.accuracy || 0,
      });

      if (historyData.sessions) {
        setRecentActivity(historyData.sessions.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudyModules = async () => {
    try {
      setModulesLoading(true);
      const modules = await studyModuleAPI.getAll();
      setStudyModules(modules.slice(0, 3)); // Show latest 3 modules
    } catch (error) {
      console.error("Error loading study modules:", error);
    } finally {
      setModulesLoading(false);
    }
  };

  const statsConfig = [
    {
      icon: "collections",
      value: stats.totalCards,
      label: "Total Cards",
      gradient: ["#6366f1", "#8b5cf6"],
    },
    {
      icon: "trending-up",
      value: `${stats.accuracy}%`,
      label: "Accuracy",
      gradient: ["#10b981", "#059669"],
    },
    {
      icon: "local-fire-department",
      value: stats.streak,
      label: "Day Streak",
      gradient: ["#f59e0b", "#d97706"],
    },
    {
      icon: "today",
      value: stats.studiedToday,
      label: "Today",
      gradient: ["#3b82f6", "#2563eb"],
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.subtitle}>
              Ready to ace your studies today?
            </Text>
          </View>

          {/* Quick Streak Display */}
          {stats.streak > 0 && (
            <View style={styles.streakBanner}>
              <MaterialIcons
                name="local-fire-department"
                size={24}
                color="#f59e0b"
              />
              <View style={styles.streakContent}>
                <Text style={styles.streakNumber}>{stats.streak}</Text>
                <Text style={styles.streakLabel}>day streak</Text>
              </View>
            </View>
          )}
        </View>

        {/* Primary CTA - Start Studying */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryCTACard}
          onPress={() => router.push("/(tabs)/study")}
        >
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryCTAGradient}
          >
            <View style={styles.primaryCTAContent}>
              <MaterialIcons
                name="play-circle-filled"
                size={48}
                color="#ffffff"
              />
              <View style={styles.primaryCTAText}>
                <Text style={styles.primaryCTATitle}>Start Study Session</Text>
                <Text style={styles.primaryCTASubtitle}>
                  {stats.totalCards > 0
                    ? `Review ${stats.totalCards} cards`
                    : "Create your first cards"}
                </Text>
              </View>
              <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* AI Creation CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.aiCard}
          onPress={() => router.push("/(tabs)/create")}
        >
          <View style={styles.aiCardContent}>
            <View style={styles.aiIconContainer}>
              <MaterialIcons name="auto-awesome" size={28} color={colors.ai} />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiCardTitle}>Create with AI</Text>
              <Text style={styles.aiCardSubtitle}>
                Generate flashcards instantly from any topic
              </Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={colors.ai} />
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {statsConfig.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialIcons
                    name={stat.icon as any}
                    size={24}
                    color={stat.gradient[0]}
                  />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Study Modules */}
        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Modules</Text>
            <TouchableOpacity
              onPress={loadStudyModules}
              style={styles.refreshButton}
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {modulesLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : studyModules.length > 0 ? (
            <>
              {studyModules.map((module, index) => (
                <TouchableOpacity
                  key={module.id}
                  style={[
                    styles.moduleCard,
                    index === studyModules.length - 1 && styles.moduleCardLast,
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/module-detail",
                      params: { id: module.id },
                    })
                  }
                >
                  <View style={styles.moduleCardHeader}>
                    <View
                      style={[
                        styles.moduleIconBadge,
                        module.isAIGenerated && styles.moduleIconBadgeAI,
                      ]}
                    >
                      <MaterialIcons
                        name={
                          module.isAIGenerated ? "auto-awesome" : "menu-book"
                        }
                        size={22}
                        color={module.isAIGenerated ? colors.ai : colors.text}
                      />
                    </View>
                    <View style={styles.moduleCardContent}>
                      <View style={styles.moduleTitleRow}>
                        <Text style={styles.moduleTitle} numberOfLines={1}>
                          {module.title}
                        </Text>
                        {module.isAIGenerated && (
                          <View style={styles.aiBadge}>
                            <Text style={styles.aiBadgeText}>AI</Text>
                          </View>
                        )}
                      </View>
                      {module.description && (
                        <Text
                          style={styles.moduleDescription}
                          numberOfLines={2}
                        >
                          {module.description}
                        </Text>
                      )}
                      <View style={styles.moduleStats}>
                        {module.flashcardCount > 0 && (
                          <View style={styles.moduleStatBadge}>
                            <MaterialIcons
                              name="style"
                              size={14}
                              color={colors.textTertiary}
                            />
                            <Text style={styles.moduleStatText}>
                              {module.flashcardCount} cards
                            </Text>
                          </View>
                        )}
                        {module.progress && (
                          <>
                            <View style={styles.moduleStatBadge}>
                              <MaterialIcons
                                name="check-circle"
                                size={14}
                                color={colors.success}
                              />
                              <Text
                                style={[
                                  styles.moduleStatText,
                                  { color: colors.success },
                                ]}
                              >
                                {module.progress.accuracy}% accuracy
                              </Text>
                            </View>
                            {module.progress.progressPercent > 0 && (
                              <View style={styles.moduleStatBadge}>
                                <MaterialIcons
                                  name="trending-up"
                                  size={14}
                                  color={colors.primary}
                                />
                                <Text
                                  style={[
                                    styles.moduleStatText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  {module.progress.progressPercent}% complete
                                </Text>
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => router.push("/(tabs)/create")}
              >
                <MaterialIcons
                  name="add-circle-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.createNewText}>Create New Module</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialIcons
                  name="menu-book"
                  size={48}
                  color={colors.textTertiary}
                />
              </View>
              <Text style={styles.emptyTitle}>No modules yet</Text>
              <Text style={styles.emptyDescription}>
                Create your first AI-powered study module to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyCTA}
                onPress={() => router.push("/(tabs)/create")}
              >
                <Text style={styles.emptyCTAText}>Create Module</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityContainer}>
              {recentActivity.slice(0, 3).map((session, index) => (
                <View
                  key={session.id || index}
                  style={[
                    styles.activityItem,
                    index !== recentActivity.length - 1 &&
                      styles.activityItemBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.activityIconContainer,
                      { backgroundColor: colors.successBg },
                    ]}
                  >
                    <MaterialIcons
                      name="school"
                      size={18}
                      color={colors.success}
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityMainText}>
                      Studied {session.cardsStudied} cards
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(session.startedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={styles.activityScoreContainer}>
                    <Text style={styles.activityScore}>
                      {session.cardsStudied > 0
                        ? Math.round(
                            (session.correctAnswers / session.cardsStudied) *
                              100
                          )
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Hero Section
  heroSection: {
    marginBottom: spacing.xl,
  },
  greetingContainer: {
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.h1,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#fbbf24" + "30",
  },
  streakContent: {
    marginLeft: spacing.sm,
  },
  streakNumber: {
    ...typography.h2,
    color: colors.warning,
    fontSize: 22,
  },
  streakLabel: {
    ...typography.caption,
    color: "#92400e",
    marginTop: 2,
  },

  // Primary CTA
  primaryCTACard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  primaryCTAGradient: {
    padding: spacing.lg,
  },
  primaryCTAContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryCTAText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  primaryCTATitle: {
    ...typography.h3,
    color: "#ffffff",
    marginBottom: 4,
  },
  primaryCTASubtitle: {
    ...typography.caption,
    color: "#ffffff",
    opacity: 0.9,
  },

  // AI Card
  aiCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  aiCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.aiBg,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  aiCardTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 2,
  },
  aiCardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Modules Section
  modulesSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  refreshButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  moduleCardLast: {
    marginBottom: spacing.md,
  },
  moduleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  moduleIconBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceHover,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleIconBadgeAI: {
    backgroundColor: colors.aiBg,
  },
  moduleCardContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  moduleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  moduleTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  moduleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  moduleStats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  moduleStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moduleStatText: {
    ...typography.small,
    fontSize: 11,
    color: colors.textTertiary,
  },
  aiBadge: {
    backgroundColor: colors.aiBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.ai + "40",
  },
  aiBadgeText: {
    ...typography.small,
    fontSize: 10,
    fontWeight: "700",
    color: colors.ai,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  createNewText: {
    ...typography.bodyBold,
    color: colors.primary,
  },

  // Empty States
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: "dashed",
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceHover,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  emptyCTA: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyCTAText: {
    ...typography.bodyBold,
    color: colors.surface,
  },

  // Activity Section
  activitySection: {
    marginBottom: spacing.xl,
  },
  activityContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  activityDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityMainText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  activityDate: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  activityScoreContainer: {
    backgroundColor: colors.successBg,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  activityScore: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.success,
  },

  // Loading
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
