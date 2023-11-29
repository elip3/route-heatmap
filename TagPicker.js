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
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconIon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from "react-native-picker-select";
import Dropdown from "react-native-element-dropdown";

//import RNPickerSelect from "react-native-picker-select";

const TagPicker = ({ setModalVisible, modalVisible }) => {
  const colors = [
    "#638beb",
    "#ed582b",
    "#3ba355",
    "#f587e6",
    "#a63f32",
    "#f7e811",
    "#ad79e8",
    "#f2c55c",
    "#b8d9e6",
    "#b8e6bb",
  ];
  const categories = ["Restaurant", "Cafe", "Bookstore", "None"];
  //Consider adding radius/area
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("");
  const [category, setCategory] = useState("");

  const renderColorOptions = () => {
    return colors.map((color, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.colorOption,
          { backgroundColor: color.toLowerCase() },
          color === tagColor && styles.selectedColor, // Apply selected style
        ]}
        onPress={() => setTagColor(color)}
      />
    ));
  };

  const resetForm = () => {
    setTagName("");
    setTagColor("");
    setCategory("");
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  return (
    <View style={styles.container}>
      <Button title=" New Tag" onPress={() => closeModal()} />

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          closeModal();
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => closeModal()}
              >
                <Icon name="close" size={20} color="black" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Add New Tag</Text>

              <TextInput
                style={styles.input}
                placeholder="Tag Name"
                value={tagName}
                onChangeText={setTagName}
              />

              <Text style={styles.label_select_category}>Select Category</Text>
              <RNPickerSelect
                onValueChange={(value) => setCategory(value)}
                items={categories.map((cat) => ({ label: cat, value: cat }))}
                style={styles.categories}
                placeholder={{ label: "Select a category...", value: null }}
              />

              <Text style={styles.label_select_category}>Select Color</Text>

              <View style={styles.colorContainer}>{renderColorOptions()}</View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  /* Handle the save action */
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    </View>
  );
};

export default TagPicker;
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 17,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ededed", // Gray background
    borderRadius: 35 / 2,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: 250,
    height: 40,
    marginBottom: 20,
    marginTop: 20,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: "gray",
  },
  picker: {
    width: 200,
    height: 44,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "gray",
  },
  label_select_category: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: "#4484c2", // Choose a color that fits your app theme
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 2, // for Android shadow
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
    marginHorizontal: 15,
  },
  colorOption: {
    width: 30, // Smaller size
    height: 30, // Smaller size
    borderRadius: 15, // Circular shape
    margin: 4,
    borderWidth: 1, // Add border for definition
    borderColor: "#ddd", // Light border color
    shadowColor: "#000", // Shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1, // Shadow effect for Android
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#000", // Or any color that stands out
  },
  categories: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
