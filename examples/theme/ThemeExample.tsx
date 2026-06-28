/* eslint-disable @typescript-eslint/no-explicit-any -- Example file uses any for flexible style props */
import React from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../src/theme/useTheme';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

const ThemeDemoContent = () => {
  const { colors, spacing, typography, mode, isDark, setMode, toggleMode } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.h1,
      fontWeight: typography.weights.bold as any,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.medium as any,
      color: colors.textSecondary,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    label: {
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.md,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      padding: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    buttonText: {
      color: '#FFFFFF', // Assuming high contrast on primary
      fontFamily: typography.fontFamily,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.medium as any,
    },
    colorBox: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: spacing.sm,
      marginBottom: spacing.xs,
    },
    paletteContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  });

  const renderTypography = (name: string, size: number, weight: string, color: string) => (
    <Text
      style={{
        fontFamily: typography.fontFamily,
        fontSize: size,
        fontWeight: weight as any,
        color,
        marginBottom: spacing.xs,
      }}
    >
      {name}
    </Text>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Theme Demo</Text>
      <Text style={styles.subtitle}>Current Mode: {mode}</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Controls</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleMode}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isDark ? colors.primaryLight : '#f4f3f4'}
          />
        </View>

        <View style={[styles.row, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                flex: 1,
                marginRight: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setMode('system')}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Use System</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginLeft: 8 }]}
            onPress={toggleMode}
          >
            <Text style={styles.buttonText}>Toggle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Typography</Text>
        {renderTypography('Heading 1', typography.sizes.h1, typography.weights.bold, colors.text)}
        {renderTypography(
          'Heading 2',
          typography.sizes.h2,
          typography.weights.semibold,
          colors.text
        )}
        {renderTypography('Body 1', typography.sizes.md, typography.weights.regular, colors.text)}
        {renderTypography(
          'Caption',
          typography.sizes.sm,
          typography.weights.regular,
          colors.textSecondary
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Palette</Text>
        <View style={styles.paletteContainer}>
          {[
            { name: 'Primary', color: colors.primary },
            { name: 'P. Light', color: colors.primaryLight },
            { name: 'P. Dark', color: colors.primaryDark },
            { name: 'Secondary', color: colors.secondary },
            { name: 'Error', color: colors.error },
            { name: 'Surface', color: colors.surface },
          ].map((item) => (
            <View
              key={item.name}
              style={{ alignItems: 'center', marginRight: spacing.md, marginBottom: spacing.sm }}
            >
              <View style={[styles.colorBox, { backgroundColor: item.color }]} />
              <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export const ThemeExample = () => {
  return (
    <ThemeProvider>
      <ThemeDemoContent />
    </ThemeProvider>
  );
};
