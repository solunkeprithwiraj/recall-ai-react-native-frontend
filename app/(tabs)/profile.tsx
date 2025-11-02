import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { userAPI, authAPI } from "../../lib/api";
import { router } from "expo-router";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  borders,
  shadows,
} from "../../constants/theme";

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    educationLevel: "",
    streak: 0,
    totalCards: 0,
    accuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getStats(),
      ]);

      setUser({
        name: profileData.name || "User",
        email: profileData.email || "",
        educationLevel: profileData.educationLevel || "Not set",
        streak: statsData.streak || 0,
        totalCards: statsData.totalCards || 0,
        accuracy: statsData.accuracy || 0,
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      // Set default values if API fails
      setUser({
        name: "User",
        email: "",
        educationLevel: "Not set",
        streak: 0,
        totalCards: 0,
        accuracy: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: "settings",
      label: "Settings",
      onPress: () => {
        loadProfile(); // Refresh profile data
        Alert.alert("Settings", "Settings screen coming soon!");
      },
      color: colors.info,
    },
    {
      icon: "bar-chart",
      label: "Statistics",
      onPress: () => Alert.alert("Statistics", "Coming soon!"),
      color: colors.success,
    },
    {
      icon: "help-outline",
      label: "Help & Support",
      onPress: () => Alert.alert("Help", "Coming soon!"),
      color: colors.warning,
    },
    {
      icon: "info-outline",
      label: "About",
      onPress: () => Alert.alert("About", "SmartFlash v1.0.0"),
      color: colors.ai,
    },
    {
      icon: "logout",
      label: "Logout",
      onPress: async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              try {
                await authAPI.logout();
                router.replace("/login");
              } catch (error) {
                console.error("Logout error:", error);
                // Still redirect to login even if API call fails
                router.replace("/login");
              }
            },
          },
        ]);
      },
      color: colors.error,
    },
  ];

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user.educationLevel}</Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons
                  name="local-fire-department"
                  size={22}
                  color={colors.warning}
                />
              </View>
              <Text style={styles.statValue}>{user.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainerBlue}>
                <MaterialIcons
                  name="collections"
                  size={22}
                  color={colors.info}
                />
              </View>
              <Text style={styles.statValue}>{user.totalCards}</Text>
              <Text style={styles.statLabel}>Total Cards</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainerPurple}>
                <MaterialIcons name="trending-up" size={22} color={colors.ai} />
              </View>
              <Text style={styles.statValue}>{user.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: item.color + "15" },
                ]}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <Text
                style={[
                  styles.menuItemText,
                  item.label === "Logout" && styles.logoutText,
                ]}
              >
                {item.label}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>SmartFlash v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    ...borders.cardElevated,
    margin: spacing.md,
    marginBottom: 0,
  },
  headerContent: {
    alignItems: "center",
  },
  avatarContainer: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...borders.subtle,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: colors.infoBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...borders.subtle,
    borderColor: colors.info + "40",
  },
  badgeText: {
    ...typography.captionBold,
    color: colors.info,
  },
  statsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  statsCard: {
    ...borders.cardElevated,
    padding: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.full,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...borders.subtle,
    borderColor: colors.warning + "30",
  },
  statIconContainerBlue: {
    backgroundColor: colors.infoBg,
    borderRadius: borderRadius.full,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...borders.subtle,
    borderColor: colors.info + "30",
  },
  statIconContainerPurple: {
    backgroundColor: colors.aiBg,
    borderRadius: borderRadius.full,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...borders.subtle,
    borderColor: colors.ai + "30",
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  menuContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  menuItem: {
    ...borders.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  menuItemText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  logoutText: {
    color: colors.error,
  },
  versionContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  versionText: {
    ...typography.caption,
    textAlign: "center",
    color: colors.textTertiary,
  },
});
