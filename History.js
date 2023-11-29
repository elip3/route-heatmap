import React, { useState, useEffect } from "react";
import {
  TextInput,
  View,
  Button,
  FlatList,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";

import Mapbox from "@rnmapbox/maps";

const { width, height } = Dimensions.get("window");

const History = ({}) => {
  const [centerCoordinate, setCenterCoordinate] = useState(null);

  async function getPermissionLocation() {
    try {
      const geo = await Geolocation.getCurrentPosition(
        (location) => {
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

  useEffect(() => {
    getPermissionLocation();
  }, []);

  //commented out
  //   <Mapbox.UserLocation
  //             animated={true}
  //             androidRenderMode={"normal"}
  //             showsUserHeadingIndicator={true}
  //           />

  return (
    <View style={styles.outercontainer}>
      {centerCoordinate && (
        <Mapbox.MapView
          style={styles.innercontainer1}
          scaleBarEnabled={false}
          scaleBarPosition={{ bottom: 68, left: 8 }}
          zoomEnabled={true}
          rotateEnabled={false}
        >
          <Mapbox.Camera
            zoomLevel={13}
            centerCoordinate={centerCoordinate}
            animationMode={"none"}
            animationDuration={0}
          />

          <Mapbox.ShapeSource
            id="earthquakes"
            url="https://www.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
          >
            <Mapbox.HeatmapLayer
              id="earthquakes"
              sourceID="earthquakes"
              style={{
                heatmapWeight: 0.5,

                heatmapIntensity: 0.8,
                heatmapRadius: 10,
                heatmapColor: [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(208,209,230,0)",
                  0.2,
                  "rgb(166,189,219)",
                  0.4,
                  "rgb(103,169,207)",
                  0.6,
                  "rgb(54,144,192)",
                  0.8,
                  "rgb(2,129,138)",
                  1,
                  "rgb(1,100,80)",
                ],
              }}
            />
          </Mapbox.ShapeSource>
        </Mapbox.MapView>
      )}

      <></>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  outercontainer: {
    position: "relative",
    height: height,
    width: width,
  },
  innercontainer1: {
    flex: 1,
  },
});
