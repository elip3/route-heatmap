import React, { useState, useEffect, useRef } from "react";
import {
  TextInput,
  View,
  Button,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Keyboard,
  BackHandler,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconIon from "react-native-vector-icons/Ionicons";

const SearchBox = ({
  coords,
  onLocationSelect,
  mapPressed,
  setMapPressed,
  setLocationDetails,
  LocationDetails,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [tempSelection, setTempSelection] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSuggestions = async () => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=pk.eyJ1IjoiYWxpc2ExMSIsImEiOiJjbG94Z2VkbncxZm5rMmtscW11emZ0eTN5In0.cdMu3vaTO8UWHgS3gbgcyw&limit=6&proximity=${coords[0]},${coords[1]}`
    );
    //const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${query}&access_token=pk.eyJ1IjoiYWxpc2ExMSIsImEiOiJjbG94Z2VkbncxZm5rMmtscW11emZ0eTN5In0.cdMu3vaTO8UWHgS3gbgcyw&session_token=12s3e4567-e89b-12d3-a456-4263614&limit=5`);
    const data = await response.json();
    setSuggestions(data.features);

    setHasSearched(true); // also remove marker somehow??? and close the bottom view

    //console.log(suggestions);

    //console.log(tempSelection);
    //console.log("when searching temp selection is^");
  };

  const inputRef = useRef(null);

  const handleQueryChange = (text) => {
    setQuery(text);
    setSuggestions([]); // Clear suggestions on query change
    setTempSelection(null);
  };

  const hideSuggestions = (text) => {
    setQuery(text);

    setSuggestions([]); // Clear suggestions on query change
  };

  const temp = () => {
    setTempSelection({ start: 0, end: 0 });

    setTimeout(() => setTempSelection(null), 10);
  };

  useEffect(() => {
    // Handle keyboard minimize event
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (inputRef.current && inputRef.current.isFocused()) {
          inputRef.current.blur();
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (mapPressed) {
      handleQueryChange(""); // Clear suggestions when map is pressed
      inputRef.current?.blur(); //unfocus to remove the blinking cursor
      setLocationDetails(null); // Reset location details to hide the bottom sheet
      setMapPressed(false); // Reset mapPressed immediately after processing
    }
  }, [mapPressed, setMapPressed, setLocationDetails]);

  return (
    <View style={styles.searchBox}>
      <View style={styles.searchRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Enter address"
          placeholderTextColor="#888"
          onSubmitEditing={fetchSuggestions}
          blurOnSubmit={true}
          selection={tempSelection}
          onBlur={temp}
        />
        {hasSearched && query.length > 0 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setQuery("");
              setHasSearched(false);
              setMapPressed(true);
              Keyboard.dismiss();
            }}
          >
            <IconIon name="close" size={20} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              fetchSuggestions();
              Keyboard.dismiss();
            }}
          >
            <IconIon name="search" size={20} color="#000" />
          </TouchableOpacity>
        )}
      </View>
      {query.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor="#DDD"
              onPress={() => {
                onLocationSelect(item);
                //console.log("item passed is " + item);
                hideSuggestions(item.place_name);
              }}
            >
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.place_name}</Text>
              </View>
            </TouchableHighlight>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

export default SearchBox;

const styles = StyleSheet.create({
  searchBox: {
    position: "absolute", // This positions the search box absolutely within its parent
    top: "0%", // Adjust this value to position the search box from the top edge
    left: 0, // Adjust this value to position the search box from the left edge
    right: 10, // Adjust this value to position the search box from the right edge
    backgroundColor: "transparent", // Optional: for better visibility
    padding: 10, // Optional: for inner spacing
    borderRadius: 5, // Optional: for rounded corners
    zIndex: 10, // This ensures the search box stays on top of other components
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF", // White background
    borderRadius: 25, // Rounded corners
    shadowColor: "#000", // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 10,
    borderRadius: 25, // Rounded corners
    backgroundColor: "#FFF", // White background
    fontSize: 16, // Larger font size
    color: "#000", // Text color
  },
  button: {
    marginLeft: 10, // Adds a margin between the TextInput and the Button
    width: 40, // Width of the button (adjust as needed)
    height: 40, // Height of the button (adjust to make it square)
    justifyContent: "center", // Centers the icon horizontally in the button
    alignItems: "center", // Centers the icon vertically in the button
    marginRight: 10,
    // Add additional styling for Button if needed
  },
  listItem: {
    backgroundColor: "#FFF", // Background color for each item
    padding: 10, // Padding inside each item
    paddingLeft: 15,
    borderRadius: 20, // Rounded corners for each item
    marginVertical: 1, // Vertical margin for spacing between items
    // Horizontal margin for spacing from the sides
    width: "100%",
    // Add shadow or elevation for depth (optional)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemText: {
    color: "#333", // Text color for each item
    fontSize: 16, // Font size for text
  },
  separator: {
    height: 1,
    backgroundColor: "transparent", // Color of the separator
    marginLeft: 15, // Optional: if you want the separator to be inset
  },
});
