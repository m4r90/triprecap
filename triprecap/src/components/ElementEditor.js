import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ElementEditor = ({ element, onUpdate, onClose }) => {
  if (!element) return null;

  const updateStyle = (updates) => {
    onUpdate({
      ...element,
      style: {
        ...element.style,
        ...updates,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollContainer}>
        {element.type === 'text' && (
          <View>
            <Text style={styles.label}>Text Options</Text>
            <View style={styles.colorPicker}>
              {['black', 'red', 'blue', 'green', 'purple'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => updateStyle({ color })}
                />
              ))}
            </View>

            <View style={styles.effectsRow}>
              <TouchableOpacity
                style={[
                  styles.effectButton,
                  element.style.fontWeight === 'bold' && styles.effectButtonActive
                ]}
                onPress={() => updateStyle({ 
                  fontWeight: element.style.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
              >
                <Text>Bold</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {element.type === 'image' && (
          <View>
            <Text style={styles.label}>Image Options</Text>
            <View style={styles.effectsRow}>
              <TouchableOpacity
                style={styles.effectButton}
                onPress={() => updateStyle({ 
                  width: element.style.width * 1.2,
                  height: element.style.height * 1.2
                })}
              >
                <Text>Larger</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.effectButton}
                onPress={() => updateStyle({ 
                  width: element.style.width * 0.8,
                  height: element.style.height * 0.8
                })}
              >
                <Text>Smaller</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
    maxHeight: '40%',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  effectsRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  effectButton: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  effectButtonActive: {
    backgroundColor: '#a0a0a0',
  },
});

export default ElementEditor; 