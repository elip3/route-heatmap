import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';


function DetailsScreen({ navigation }) {

  const requestAuthorization = () => {
    Geolocation.requestAuthorization();
  };

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        
        
      <Button title="Request Authorization" onPress={requestAuthorization} />
      
      </View>

      
    );
  }

  export default DetailsScreen;
