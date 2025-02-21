import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [sketchbooks, setSketchbooks] = useState([]);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSketchbooks();
  }, []);

  const fetchSketchbooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sketchbooks');
      const data = await response.json();
      setSketchbooks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sketchbooks</Text>
      <FlatList
        data={sketchbooks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.sketchbookItem}>
            <Text style={styles.sketchbookTitle}>{item.title}</Text>
            <Text style={styles.date}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity 
        style={styles.newButton}
        onPress={() => navigation.navigate('Canvas')}
      >
        <Text style={styles.buttonText}>Create New Sketchbook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  sketchbookItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sketchbookTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  date: {
    color: '#666',
    marginTop: 5,
  },
  newButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 