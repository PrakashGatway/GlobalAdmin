// import {
//   getToken,
// } from "firebase/messaging";

// import { messaging } from "./firebase";

// export const requestNotificationPermission = async () => {
//     try {
//       const permission = await Notification.requestPermission();

//       if (permission === "granted") {

//         const token = await getToken(
//           messaging,
//           {
//             vapidKey:
//               "BDyrqnEnHplqPQDrfienXIeY4eo49-eCp3Sq7kp78t1RXwPWnUpILuTdBJXY2Isu5fZNX6fDV1FhF6m7yP0Hr2s",
//           }
//         );

//         console.log(
//           "FCM TOKEN:",
//           token
//         );

//         return token;

//       } else {

//         console.log(
//           "Notification permission denied"
//         );
//       }

//     } catch (error) {

//       console.log(error);
//     }
//   };






import {
  getToken,
  onMessage,
} from "firebase/messaging";

import toast from "react-hot-toast";
import axios from "axios";
import { messaging } from "./firebase";
import authService from "./services/authService";
import apiService from "./services/apiService";

export const requestNotificationPermission = async () => {

    try {

      const permission =
        await Notification.requestPermission();

      if (permission === "granted") {

        // GET TOKEN
        const token = await getToken(
          messaging,
          {
            vapidKey:
              "BDyrqnEnHplqPQDrfienXIeY4eo49-eCp3Sq7kp78t1RXwPWnUpILuTdBJXY2Isu5fZNX6fDV1FhF6m7yP0Hr2s",
          }
        );

        console.log(
          "FCM TOKEN:",
          token
        );

          const fetchProfile = async () => {
            try {
              const response = await authService.getMe();
              if (response.success) {
                return response.data;
              }
            } catch (err) {
              console.log(err.message || 'Failed to fetch profile');
            }
            return null;
          };

          const userData = await fetchProfile();
            console.log("/users/save-token")
          if (userData && userData._id) {
            const api = await apiService.post('/users/save-token', {
              token,
              userId: userData._id,
            });
            console.log(api, 'api', userData._id);
          } else {
            console.log('Unable to save token: no user profile available');
          }


        // FOREGROUND MESSAGE LISTENER
        onMessage(
          messaging,
          (payload) => {

            console.log(
              "Foreground Notification:",
              payload
            );

            // TOAST MESSAGE
            toast.success(
              payload.notification.title
            );

            alert(payload.notification.title);


            // OPTIONAL BROWSER ALERT
            new Notification(
              payload.notification.title,
              {
                body:
                  payload.notification.body,
              }
            );
          }
        );



        return token;

      } else {

        console.log(
          "Notification permission denied"
        );
      }

    } catch (error) {

      console.log(error);
    }
  };

