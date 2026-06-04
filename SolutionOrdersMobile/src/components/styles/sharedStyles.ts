import {StyleSheet} from 'react-native';

import {
  appColors,
  appFontSize,
  appFontWeight,
  appOpacity,
  appRadius,
  appSpacing,
} from './appTheme.ts';

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },

  content: {
    padding: appSpacing.screen,
    paddingBottom: appSpacing.bottom,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: appColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: appSpacing.screen,
  },

  heroBox: {
    backgroundColor: appColors.surface,
    borderRadius: appRadius.hero,
    padding: appSpacing.large,
    borderWidth: 1,
    borderColor: appColors.border,
    marginBottom: appSpacing.xxl,
  },

  appName: {
    color: appColors.primary,
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 7,
  },

  title: {
    color: appColors.text,
    fontSize: appFontSize.title,
    fontWeight: appFontWeight.black,
  },

  subtitle: {
    color: appColors.textMuted,
    fontSize: appFontSize.body,
    lineHeight: 20,
    marginTop: appSpacing.md,
    fontWeight: appFontWeight.bold,
  },

  card: {
    backgroundColor: appColors.surface,
    borderRadius: appRadius.card,
    padding: appSpacing.xxl,
    borderWidth: 1,
    borderColor: appColors.border,
    marginBottom: appSpacing.xxl,
  },

  previewCard: {
    backgroundColor: appColors.surface,
    borderRadius: appRadius.card,
    padding: appSpacing.xxl,
    borderWidth: 1,
    borderColor: appColors.info,
    marginBottom: appSpacing.xxl,
  },

  sectionTitle: {
    color: appColors.text,
    fontSize: appFontSize.section,
    fontWeight: appFontWeight.black,
    marginBottom: appSpacing.xl,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appSpacing.lg,
    alignItems: 'center',
    marginBottom: appSpacing.sm,
  },

  label: {
    color: appColors.textMuted,
    fontSize: appFontSize.body,
    fontWeight: appFontWeight.extraBold,
  },

  input: {
    backgroundColor: appColors.surfaceDark,
    borderWidth: 1,
    borderColor: appColors.border,
    color: appColors.text,
    borderRadius: appRadius.md,
    paddingHorizontal: appSpacing.xl,
    paddingVertical: appSpacing.xl,
    fontSize: appFontSize.input,
    marginBottom: appSpacing.xxl,
  },

  inputWarning: {
    borderColor: appColors.primary,
  },

  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },

  readyBox: {
    backgroundColor: appColors.successDark,
    borderRadius: appRadius.xl,
    padding: appSpacing.xxl,
    borderWidth: 1,
    borderColor: appColors.success,
    marginBottom: appSpacing.xxl,
  },

  warningBox: {
    backgroundColor: appColors.primaryDark,
    borderRadius: appRadius.xl,
    padding: appSpacing.xxl,
    borderWidth: 1,
    borderColor: appColors.primary,
    marginBottom: appSpacing.xxl,
  },

  readyTitle: {
    color: appColors.successLight,
    fontSize: appFontSize.button,
    fontWeight: appFontWeight.black,
    marginBottom: 5,
  },

  warningTitle: {
    color: appColors.primaryLight,
    fontSize: appFontSize.button,
    fontWeight: appFontWeight.black,
    marginBottom: 5,
  },

  readyText: {
    color: appColors.successLight,
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.bold,
    lineHeight: 18,
  },

  warningText: {
    color: appColors.primaryLight,
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.bold,
    lineHeight: 18,
  },

  previewHeader: {
    flexDirection: 'row',
    gap: appSpacing.xl,
    alignItems: 'center',
    marginBottom: appSpacing.xl,
  },

  previewIconBox: {
    width: 52,
    height: 52,
    borderRadius: appRadius.lg,
    backgroundColor: appColors.surfaceDark,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewIcon: {
    fontSize: 28,
  },

  previewTextBox: {
    flex: 1,
  },

  previewName: {
    color: appColors.text,
    fontSize: appFontSize.section,
    fontWeight: appFontWeight.black,
    marginBottom: appSpacing.sm,
  },

  previewDescription: {
    color: appColors.textMuted,
    fontSize: appFontSize.normal,
    lineHeight: 19,
    fontWeight: appFontWeight.bold,
  },

  previewInfoBox: {
    backgroundColor: appColors.surfaceDark,
    borderRadius: appRadius.md,
    padding: appSpacing.lg,
    borderWidth: 1,
    borderColor: appColors.borderDark,
    marginBottom: appSpacing.md,
  },

  previewLabel: {
    color: appColors.textSoft,
    fontSize: appFontSize.small,
    fontWeight: appFontWeight.extraBold,
    marginBottom: appSpacing.xs,
  },

  previewValue: {
    color: appColors.text,
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.extraBold,
    lineHeight: 18,
  },

  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: appColors.primary,
    color: appColors.text,
    paddingHorizontal: appSpacing.lg,
    paddingVertical: 5,
    borderRadius: appRadius.round,
    fontSize: appFontSize.tiny,
    fontWeight: appFontWeight.black,
    overflow: 'hidden',
  },

  archiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: appColors.border,
    color: appColors.textMuted,
    paddingHorizontal: appSpacing.lg,
    paddingVertical: 5,
    borderRadius: appRadius.round,
    fontSize: appFontSize.tiny,
    fontWeight: appFontWeight.black,
    overflow: 'hidden',
  },

  counterOk: {
    color: appColors.success,
    fontSize: appFontSize.small,
    fontWeight: appFontWeight.black,
  },

  counterWarning: {
    color: appColors.primary,
    fontSize: appFontSize.small,
    fontWeight: appFontWeight.black,
  },

  counterMuted: {
    color: appColors.textSoft,
    fontSize: appFontSize.small,
    fontWeight: appFontWeight.black,
  },

  statusButtons: {
    flexDirection: 'row',
    gap: appSpacing.lg,
  },

  statusButton: {
    flex: 1,
    backgroundColor: appColors.surfaceDark,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: appRadius.md,
    paddingVertical: appSpacing.xl,
    alignItems: 'center',
  },

  statusButtonActive: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },

  statusButtonArchive: {
    backgroundColor: appColors.border,
    borderColor: '#475569',
  },

  statusButtonText: {
    color: appColors.textMuted,
    fontSize: appFontSize.body,
    fontWeight: appFontWeight.black,
  },

  statusButtonTextSelected: {
    color: appColors.text,
  },

  saveButton: {
    backgroundColor: appColors.success,
    paddingVertical: appSpacing.xxl,
    borderRadius: appRadius.md,
    alignItems: 'center',
    marginTop: appSpacing.xs,
  },

  saveButtonText: {
    color: appColors.text,
    fontSize: appFontSize.button,
    fontWeight: appFontWeight.black,
  },

  cancelButton: {
    backgroundColor: appColors.border,
    paddingVertical: appSpacing.xxl,
    borderRadius: appRadius.md,
    alignItems: 'center',
    marginTop: appSpacing.xl,
  },

  cancelButtonText: {
    color: appColors.text,
    fontSize: appFontSize.button,
    fontWeight: appFontWeight.extraBold,
  },

  disabledButton: {
    opacity: appOpacity.disabled,
  },

  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appSpacing.lg,
    backgroundColor: appColors.surfaceDark,
    borderRadius: appRadius.md,
    padding: appSpacing.xl,
  },

  loadingBoxText: {
    color: appColors.textMuted,
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.bold,
  },

  emptyText: {
    color: '#fca5a5',
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.extraBold,
    lineHeight: 18,
  },

  hintBox: {
    backgroundColor: appColors.surfaceDark,
    borderRadius: appRadius.md,
    padding: appSpacing.lg,
    borderWidth: 1,
    borderColor: appColors.border,
  },

  hintTitle: {
    color: appColors.text,
    fontSize: appFontSize.normal,
    fontWeight: appFontWeight.black,
    marginBottom: appSpacing.xs,
  },

  hintText: {
    color: appColors.textSoft,
    fontSize: appFontSize.small,
    fontWeight: appFontWeight.bold,
    lineHeight: 17,
  },
});