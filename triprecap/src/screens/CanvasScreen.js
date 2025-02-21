import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableElement from '../components/DraggableElement';
import ElementEditor from '../components/ElementEditor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SKETCHBOOK_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 500);
const SKETCHBOOK_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, 700);

const CanvasScreen = () => {
  const navigation = useNavigation();
  const [elements, setElements] = useState([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newText, setNewText] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newElement = {
        id: Date.now().toString(),
        type: 'image',
        content: result.assets[0].uri,
        position: { x: SKETCHBOOK_WIDTH / 4, y: SKETCHBOOK_HEIGHT / 4 },
        style: {
          width: 100,
          height: 100,
          opacity: 1,
        }
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const addText = () => {
    if (newText.trim()) {
      const newElement = {
        id: Date.now().toString(),
        type: 'text',
        content: newText,
        position: { x: SKETCHBOOK_WIDTH / 4, y: SKETCHBOOK_HEIGHT / 4 },
        style: {
          fontSize: 16,
          color: 'black',
          fontWeight: 'normal',
        },
      };
      setElements(prev => [...prev, newElement]);
      setNewText('');
      setIsAddingText(false);
    }
  };

  const updateElement = (updatedElement) => {
    setElements(prev =>
      prev.map(el => el.id === updatedElement.id ? updatedElement : el)
    );
  };

  const deleteElement = (id) => {
    setElements(prev => prev.filter(element => element.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const saveCanvas = async () => {
    try {
      await AsyncStorage.setItem('canvas', JSON.stringify(elements));
      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  };

  const loadCanvas = async () => {
    try {
      const savedCanvas = await AsyncStorage.getItem('canvas');
      if (savedCanvas) {
        setElements(JSON.parse(savedCanvas));
      }
    } catch (error) {
      console.error('Error loading canvas:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sketchbook}>
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            onUpdate={(updatedElement) => {
              setElements(prev => 
                prev.map(el => el.id === updatedElement.id ? updatedElement : el)
              );
            }}
            onDelete={() => deleteElement(element.id)}
            onSelect={() => setSelectedElement(element)}
            isSelected={selectedElement?.id === element.id}
          />
        ))}
      </View>
      
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolButton} onPress={pickImage}>
          <Text>Add Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => setIsAddingText(true)}>
          <Text>Add Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={saveCanvas}>
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={loadCanvas}>
          <Text>Load</Text>
        </TouchableOpacity>
      </View>

      {selectedElement && (
        <ElementEditor
          element={selectedElement}
          onUpdate={updateElement}
          onClose={() => setSelectedElement(null)}
        />
      )}

      {isAddingText && (
        <View style={styles.textInput}>
          <TextInput
            value={newText}
            onChangeText={setNewText}
            placeholder="Enter text"
            onSubmitEditing={addText}
            style={styles.input}
          />
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
  },
  sketchbook: {
    width: SKETCHBOOK_WIDTH,
    height: SKETCHBOOK_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 20,
    alignSelf: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  toolButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  textInput: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});

export default CanvasScreen; 