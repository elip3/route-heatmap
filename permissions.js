//import { PERMISSIONS, request, RESULTS, check} from "react-native-permissions";
// import  * as Location from 'expo-location';

// function HomeScreen({ navigation }) {
    
 
        //alert('Sorry, we need location permissions to make this work!');


//     //const [userLocation, setUserLocation] = useState(null);
//     const [coords, setCoords] = useState(null);

//     var permission_fine_access = false;
//     var permission_background_access = false;

//     check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
//     .then((result) => {
//       switch (result) {
//         case RESULTS.UNAVAILABLE:
//           console.log('This feature is not available (on this device / in this context)');
//           break;
//         case RESULTS.DENIED:
//           console.log('The permission has not been requested / is denied but requestable');
//           break;
//         case RESULTS.LIMITED:
//           console.log('The permission is limited: some actions are possible');
//           break;
//         case RESULTS.GRANTED:
//           console.log('The permission is granted');
//           permission_fine_access = true;
//           break;
//         case RESULTS.BLOCKED:
//           console.log('The permission is denied and not requestable anymore');
//           break;
//       }
//     })
//     .catch((error) => {
//     });
//     // if no permission granted
//     if(permission_fine_access==false) {
//       try {
//         request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(res => {
//             if (res == "granted") {
//               Geolocation.getCurrentPosition(info => console.log(info));
//             //  Geolocation.watchPosition( // do watch location staffs );
//             } else {
//               // console.log("Location is not enabled");
//             }
//           });
//         } catch (error) {
//           console.log("location set error:", error);
//         }
//     }

//   if(permission_fine_access==true) {
//     async function getPermissionLocation() {
//       try {
//         const geo = await Geolocation.getCurrentPosition(
//           location =>
//             setCoords([location.coords.longitude, location.coords.latitude]),
//           err => console.log(err),
//           {enableHighAccuracy: true},
//         );
//       } catch (error) {
//         console.error('Error getting location', error);
//       }
//     }
  
//     useEffect(() => {
//       getPermissionLocation();
    
//     }, []);
//   }
    