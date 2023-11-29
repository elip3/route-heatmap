import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  Dimensions,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconIon from "react-native-vector-icons/Ionicons";
import BottomSheet from "@gorhom/bottom-sheet";

import Mapbox from "@rnmapbox/maps";
import Geolocation from "@react-native-community/geolocation";

import SearchBox from "./SeachBox";
import TagPicker from "./TagPicker";
import History from "./History";

//import { UserLocation } from '@rnmapbox/maps';

import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiYWxpc2ExMSIsImEiOiJjbG94Z2VkbncxZm5rMmtscW11emZ0eTN5In0.cdMu3vaTO8UWHgS3gbgcyw"
);

//Geolocation.getCurrentPosition((info) => console.log(info));

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: "auto",
});

const { width, height } = Dimensions.get("window");

function HomeScreen({ navigation }) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef(null);
  const handleBottomSheetChanges = (index) => {
    setIsBottomSheetOpen(index !== -1);
  };
  const snapPoints = ["23%", "43%"];

  const [coords, setCoords] = useState(null);

  const [centerCoordinate, setCenterCoordinate] = useState(null);

  const [markerCoordinate, setMarkerCoordinate] = useState(null);

  const [mapPressed, setMapPressed] = useState(false);

  const closeSearch = () => {
    //clear query??

    setMarkerCoordinate(null); //idk if I want to remove it
    bottomSheetRef.current.close();
  };

  useEffect(() => {
    if (mapPressed) {
      setMapPressed(false);

      closeSearch();
    }
  }, [mapPressed]);

  const [locationDetails, setLocationDetails] = useState(null);
  const mapRef = useRef(null);

  const handleLocationSelect = (location) => {
    setCenterCoordinate(location.center);
    setMarkerCoordinate(location.center);
    // console.log("Marker selected and centered at " + location.center);
    //console.log("name and full address " + location.place_name);
    //console.log(" name " + location.text);

    let address = location.place_name.replace(
      new RegExp(location.text + ",?\\s?"),
      ""
    );
    //console.log(" address edited is " + address);

    // console.log("category " + location.properties.category);
    const generalTypes = [
      "country",
      "region",
      "postcode",
      "district",
      "place",
      "locality",
      "neighborhood",
    ];

    // console.log(
    //   "location.place_type JSON:",
    //   JSON.stringify(location.place_type, null, 2)
    // );

    let is_general_type = location.place_type.some((type) =>
      generalTypes.includes(type)
    );

    let is_address = location.place_type.includes("address");

    let is_undefined =
      location.place_type.includes(null) ||
      location.place_type.includes(undefined);

    let is_poi = location.place_type.includes("poi");
    // here you need to...add the bottom slidable component
    // Update map center and marker
    setLocationDetails({
      name: location.text, //handle support for draggable
      address: is_address || is_undefined ? location.place_name : address, //for addresses
      coordinates: location.center, //disable coordinates for countries
      is_general_type: is_general_type,
      is_address: is_address,
      is_undefined: is_undefined,
      is_poi: is_poi,
      is_just_coordinates: false,
    });
    //console.log("set location details " + locationDetails);
    // console.log("place type " + location.place_type);
    // console.log("is general type ?" + is_general_type);
    // console.log("is address type ?" + is_address);
    // console.log("is undefined type ?" + is_undefined);
    // Open the bottom sheet
    bottomSheetRef.current?.expand();
  };

  const [suggestions, setSuggestions] = useState([]);
  const [newCoords, setNewCoords] = useState([]);

  const fetchPOISuggestions = async (newcoords) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${newcoords[0]},${newcoords[1]}.json?access_token=pk.eyJ1IjoiYWxpc2ExMSIsImEiOiJjbG94Z2VkbncxZm5rMmtscW11emZ0eTN5In0.cdMu3vaTO8UWHgS3gbgcyw&limit=1&types=poi`
    );
    const response_address = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${newcoords[0]},${newcoords[1]}.json?access_token=pk.eyJ1IjoiYWxpc2ExMSIsImEiOiJjbG94Z2VkbncxZm5rMmtscW11emZ0eTN5In0.cdMu3vaTO8UWHgS3gbgcyw&limit=1&types=address`
    );

    console.log("state new coords " + newCoords);
    console.log("parameter new coords " + newcoords);

    const data = await response.json(); // just 1
    const data_address = await response_address.json();
    let closest_suggestion = null;
    let global_min_diff = 0.5;
    console.log("new search");

    console.log(
      "JSON just coords of type : ",
      JSON.stringify(newcoords, null, 2)
    );

    data.features.forEach((suggestion, index) => {
      var diff = haversineDistance(suggestion.center, newcoords);
      console.log("diff with poi is " + diff);
      console.log(
        "JSON suggestion.center of type: ",
        JSON.stringify(suggestion.center, null, 2)
      );

      if (diff < global_min_diff) {
        //console.log("found even smaller!");
        console.log("closest suggestion now is " + suggestion.place_name);

        global_min_diff = diff;
        closest_suggestion = suggestion;
        let address = suggestion.place_name.replace(
          new RegExp(suggestion.text + ",?\\s?"),
          ""
        );

        setLocationDetails({
          name: suggestion.text, //handle support for draggable
          address: address, //for addresses
          coordinates: suggestion.center, //disable coordinates for countries
          is_general_type: false,
          is_address: false,
          is_undefined: false,
          is_poi: true,
          is_just_coordinates: false,
        });
      }
    });

    data_address.features.forEach((suggestion, index) => {
      var diff = haversineDistance(suggestion.center, newcoords) + 0.008;
      console.log("diff with the address is " + diff);
      if (diff < global_min_diff) {
        //console.log("found even smaller!");
        console.log(
          "closest suggestion now is AN ADDRESS" + suggestion.place_name
        );

        global_min_diff = diff;
        closest_suggestion = suggestion;

        setLocationDetails({
          name: suggestion.text, //handle support for draggable
          address: suggestion.place_name, //for addresses
          coordinates: suggestion.center, //disable coordinates for countries
          is_general_type: false,
          is_address: true,
          is_undefined: false,
          is_poi: false,
          is_just_coordinates: false,
        });
      }
    });
    if (global_min_diff == 1) {
      console.log("is just a point, just coordinates rendered");
      //if it wasnt set return just coords
      setLocationDetails({
        name: "", //handle support for draggable
        address: "", //for addresses
        coordinates: newcoords,
        is_general_type: false,
        is_address: false,
        is_undefined: false,
        is_poi: false,
        is_just_coordinates: true,
      });
    }

    //console.log("JSON suggestion", JSON.stringify(data, null, 2));
    setSuggestions(data.features);
    return closest_suggestion;
  };

  const onDragEnd = (event) => {
    setNewCoords(event.geometry.coordinates);
    setMarkerCoordinate(event.geometry.coordinates);

    let closest_suggestion = fetchPOISuggestions(event.geometry.coordinates);
    bottomSheetRef.current?.expand();

    console.log("New Coordinates:", newCoords); // Logging the new coordinates
  };

  function haversineDistance(coords1, coords2) {
    function toRad(x) {
      return (x * Math.PI) / 180;
    }

    var lon1 = coords1[0];
    var lat1 = coords1[1];

    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // Earth's radius in kilometers
    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in kilometers

    return d;
  }
  async function getPermissionLocation() {
    try {
      const geo = await Geolocation.getCurrentPosition(
        (location) => {
          setCoords([location.coords.longitude, location.coords.latitude]);
          setCenterCoordinate([
            location.coords.longitude,
            location.coords.latitude,
          ]);
        },
        (err) => console.log(err),
        { enableHighAccuracy: true }
      );
    } catch (error) {
      console.error("Error getting location", error);
    }
  }
  // implement button to bring you back to center

  //when loading map recenter to current location
  useEffect(() => {
    getPermissionLocation();
  }, []);
  useEffect(() => {
    if (coords) {
      setCenterCoordinate(coords);
    }
  }, []);

  const resetToCurrentLocation = () => {
    if (coords) {
      setCenterCoordinate(coords); // Update the centerCoordinate state
      setMarkerCoordinate(null); // Optionally reset the marker

      if (mapRef.current) {
        mapRef.current.setCamera({
          centerCoordinate: coords,
          zoomLevel: 13,
          animationMode: "easeTo",
          animationDuration: 1100,
        });
      }
    }
  };

  const addMarker = () => {
    //console.log("coordinates of type", JSON.stringify(coords, null, 2));

    setMarkerCoordinate([coords[0] + 0.01, coords[1] + 0.01]); // better to set it in the center of the map
    setCenterCoordinate(coords);

    // TODO
  };

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.outercontainer}>
      <SearchBox
        coords={coords}
        onLocationSelect={handleLocationSelect}
        mapPressed={mapPressed}
        setMapPressed={setMapPressed}
        setLocationDetails={setLocationDetails}
        locationDetails={locationDetails}
      />

      {coords && (
        <Mapbox.MapView
          style={styles.innercontainer1}
          scaleBarEnabled={false}
          scaleBarPosition={{ bottom: 68, left: 8 }}
          zoomEnabled={true}
          rotateEnabled={true}
          onPress={(feature) => {
            // console.log("Coords:", feature.geometry.coordinates);
            setMapPressed(true); // set to true
          }}
        >
          <Mapbox.Camera
            ref={mapRef}
            zoomLevel={13}
            centerCoordinate={centerCoordinate}
            animationMode={"none"}
            animationDuration={0}
          />
          {markerCoordinate && (
            <Mapbox.PointAnnotation
              ref={(ref) => (this.markerRef = ref)}
              id="marker"
              coordinate={markerCoordinate}
              draggable={true}
              onDragEnd={onDragEnd}
            >
              <Image
                source={require("/home/alisa/RN/Routes/assets/location_icon6.png")}
                style={{ height: 35, width: 35, zIndex: 10 }}
                fadeDuration={0}
                onLoad={() => this.markerRef.refresh()}
              />
            </Mapbox.PointAnnotation>
          )}
          <Mapbox.UserLocation
            animated={true}
            androidRenderMode={"normal"}
            showsUserHeadingIndicator={true}
          />
        </Mapbox.MapView>
      )}

      {!isBottomSheetOpen && (
        <View
          style={{
            width: 40,
            height: 40,
            position: "absolute",
            top: "71%",
            left: "82%",
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={addMarker}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#FFF", // Set the background color
              width: 45, // Width of the button
              height: 45, // Height of the button (to make it square)
              borderRadius: 45 / 2,
              alignItems: "center", // Center the text horizontally
              justifyContent: "center", // Center the text vertically
              shadowColor: "#000", // Shadow for depth
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Icon name="add" size={25} color="#000" />
          </TouchableOpacity>
        </View>
      )}
      {!isBottomSheetOpen && (
        <View
          style={{
            width: 45,
            height: 45,
            position: "absolute",
            top: "80%",
            left: "82%",
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={resetToCurrentLocation}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#FFF",
              width: 45, // Width of the button
              height: 45, // Height of the button (to make it square)
              borderRadius: 45 / 2,
              alignItems: "center", // Center the text horizontally
              justifyContent: "center", // Center the text vertically
              shadowColor: "#000", // Shadow for depth
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
              overflow: "hidden",
            }}
          >
            <IconIon name="ios-locate-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      )}
      <>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1} // Start in the closed state
          onChange={handleBottomSheetChanges}
        >
          <View style={styles.bottomSheetContent}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
              }}
              style={styles.addTagButton}
            >
              <Icon name="tag" size={20} color="black" />
            </TouchableOpacity>

            <TagPicker
              setModalVisible={setModalVisible}
              modalVisible={modalVisible}
            />

            <TouchableOpacity
              onPress={() => {
                closeSearch();
                setMapPressed(true);
              }}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color="black" />
            </TouchableOpacity>

            {locationDetails && (
              <View>
                {(locationDetails.is_general_type ||
                  locationDetails.is_poi) && (
                  <>
                    <Text style={styles.detailTitle}>Name</Text>
                    <Text style={styles.detailText}>
                      {locationDetails.name}
                    </Text>
                  </>
                )}

                {(locationDetails.is_address ||
                  locationDetails.is_undefined ||
                  locationDetails.is_poi) &&
                  !locationDetails.is_just_coordinates && (
                    <>
                      <Text style={styles.detailTitle}>Address</Text>
                      <Text style={styles.detailText}>
                        {locationDetails.address}
                      </Text>
                    </>
                  )}

                {!locationDetails.is_general_type && (
                  <>
                    <Text style={styles.detailTitle}>Coordinates</Text>
                    <Text style={styles.detailText}>
                      {locationDetails.coordinates.join(", ")}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </BottomSheet>
      </>
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: { backgroundColor: "#d2dff7", width: 240 },
          drawerActiveBackgroundColor: "#adc6f7",
          headerStyle: { backgroundColor: "#4484c2" },
          headerTintColor: "white",
          headerTitleStyle: { fontSize: 22 },
          drawerLabelStyle: { fontSize: 16, paddingVertical: 4 },
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{
            drawerLabel: "Home",
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="home"
                size={22}
                color={focused ? "#387bff" : "#4584ff"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Location History"
          component={History}
          options={{
            drawerLabel: "Location History",
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="place"
                size={22}
                color={focused ? "#387bff" : "#4584ff"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Tags"
          component={HomeScreen}
          options={{
            drawerLabel: "Tags",
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="tag"
                size={22}
                color={focused ? "#387bff" : "#4584ff"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={HomeScreen}
          options={{
            drawerLabel: "Settings",
            drawerIcon: ({ focused, size }) => (
              <Icon
                name="settings"
                size={22}
                color={focused ? "#387bff" : "#4584ff"}
              />
            ),
          }}
        />
        <Drawer.Screen
          name="Account"
          component={HomeScreen}
          options={{
            drawerLabel: "User Account",
            drawerIcon: ({ focused, size }) => (
              <IconIon
                name="person-circle"
                size={24}
                color={focused ? "#387bff" : "#4584ff"}
              />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  outercontainer: {
    position: "relative",
    height: height,
    width: width,
  },
  innercontainer1: {
    flex: 1,
  },
  innercontainer2: {
    position: "absolute",
    bottom: 100,
    right: 50,
    zIndex: 100, // Ensure it's above other components
  },

  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 17,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ededed", // Gray background
    borderRadius: 35 / 2,
    zIndex: 1,
  },
  addTagButton: {
    position: "absolute",
    top: 0,
    right: 65,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#adcfde", // Gray background
    borderRadius: 35 / 2,
    zIndex: 1,
  },
  bottomSheetContent: {
    padding: 20,
    backgroundColor: "white", // White background for content area
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  },

  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: "#333", // Dark text for title
  },

  detailText: {
    fontSize: 14,
    color: "#666", // Slightly lighter text for details
  },
});
