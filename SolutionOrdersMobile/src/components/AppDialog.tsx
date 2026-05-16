import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type AppDialogType = 'confirm' | 'success' | 'error';

interface AppDialogProps {
  visible: boolean;
  type: AppDialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

function AppDialog({
  visible,
  type,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Anuluj',
  loading = false,
  onConfirm,
  onCancel,
}: AppDialogProps): React.JSX.Element {
  const isConfirm = type === 'confirm';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View
            style={[
              styles.accent,
              type === 'success' && styles.successAccent,
              type === 'error' && styles.errorAccent,
              type === 'confirm' && styles.confirmAccent,
            ]}
          />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            {isConfirm && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.8}
                disabled={loading}>
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isConfirm && styles.dangerButton,
                loading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}>
              <Text style={styles.confirmButtonText}>
                {loading ? 'Proszę czekać...' : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  dialog: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  accent: {
    width: 48,
    height: 5,
    borderRadius: 999,
    marginBottom: 14,
  },

  successAccent: {
    backgroundColor: '#16a34a',
  },

  errorAccent: {
    backgroundColor: '#dc2626',
  },

  confirmAccent: {
    backgroundColor: '#f97316',
  },

  title: {
    color: '#f8fafc',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 8,
  },

  message: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },

  buttons: {
    flexDirection: 'row',
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },

  dangerButton: {
    backgroundColor: '#7f1d1d',
  },

  disabledButton: {
    opacity: 0.65,
  },

  confirmButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default AppDialog;