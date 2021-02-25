import React from 'react';
import Form from './Components/Form';
import Home from './Components/Home';
import FormUpdate from './Components/FormUpdate';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import Detail from './Components/Detail';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Users" component={Home} />
        <Stack.Screen name="Form" component={Form} />
        <Stack.Screen name="Update" component={FormUpdate} />
        <Stack.Screen name="Detail" component={Detail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
