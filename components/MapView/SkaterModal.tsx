import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface SkaterModalProps {
  visible: boolean;
  onClose: () => void;
  skater?: {
    name: string;
    avatar?: string;
    experience?: string;
    styles?: string[];
  };
}

export default function SkaterModal({ visible, onClose, skater }: SkaterModalProps) {
  if (!skater) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {skater.avatar && (
            <Image
              source={{ uri: skater.avatar }}
              style={styles.avatar}
            />
          )}
          <Text style={styles.name}>{skater.name}</Text>
          {skater.experience && (
            <Text style={styles.experience}>{`Experience: ${skater.experience}`}</Text>
          )}
          {skater.styles && skater.styles.length > 0 && (
            <View style={styles.stylesContainer}>
              <Text style={styles.stylesTitle}>Skating Styles:</Text>
              {skater.styles.map((style, index) => (
                <Text key={index} style={styles.styleItem}>• {style}</Text>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  experience: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  stylesContainer: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  stylesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  styleItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 3,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});