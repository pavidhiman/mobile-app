import * as Amplitude from '@amplitude/analytics-react-native';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useResponsiveWidth } from 'react-native-responsive-dimensions';
import { useDispatch, useSelector } from 'react-redux';
import gif from '../assets/images/logo-loader-whitebg.gif';
import { getUser } from '../slices/UserSlice';
import { getValidUser, setValidUserMock } from '../slices/ValidUserSlice';
import {
  parseJwt
} from '../utils/Library';

export default function ValidationPage({ navigation }) {
  const dispatch = useDispatch();
  const validUser = useSelector((state) => state.validUser);
  const user = useSelector((state) => state.user);

  const [expoToken, setExpoToken] = useState(null);

  useEffect(() => {
    if (validUser.status === 'succeeded') {
      dispatch(getUser({ userID: validUser.data.userID }));
    }

    if (validUser.status === 'failed') {
      console.error('Error occurred validating user', validUser.error);
      sendToStarterPage(navigation, expoToken);
    }
  }, [validUser.status]);

  useEffect(() => {
    if (user.getUserStatus === 'succeeded') {
      if (user.getUserData.userSetupCompleted === 1 && user.getUserData.isEULA === 1) {
        Amplitude.logEvent('EXISTING_USER_VALIDATED');
        // UNCOMMENT THE FOLLOWING FOR PRODUCTION
        // if (expoToken?.data) {
        //   const pushTokenData = {
        //     UserID: user.getUserData.userID,
        //     PatientID: validUser.data.patientID,
        //     PushToken: expoToken.data,
        //   };
        //   dispatch(addPushToken({ data: pushTokenData }));
        // }
        navigation.reset({
          index: 0,
          routes: [{ name: 'HOME' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'USERSETUP' }],
        });
      }
    }
    if (user.getUserStatus === 'failed') {
      console.error('Error occurred getting user', user.error);
      sendToStarterPage(navigation, expoToken);
    }
  }, [user.getUserStatus]);

  /*
  useEffect(() => {
    Amplitude.logEvent('VALIDATION_PAGE_OPENED');
    const startUp = async () => {
      // UNCOMMENT THE FOLLOWING FOR PRODUCTION
      // const pushToken = await registerForPushNotificationsAsync();
      // Amplitude.logEvent('USER_PUSH_TOKEN_RESULT', {
      //   'result': pushToken,
      // });
      setExpoToken(pushToken);
      const token = await getAccessToken();
      const refreshToken = await getRefreshToken();
      console.log('access token: ', token);
      console.log('refresh token: ', refreshToken);
      if (token && isValidToken(token)) {
        Amplitude.logEvent('TOKEN_EXISTS_AND_IS_VALID');
        if (tokenExpired(token)) {
          Amplitude.logEvent('TOKEN_IS_EXPIRED');
          // token exists but expired
          const refreshToken = await getRefreshToken();
          const refreshResult = await refreshAccessToken(refreshToken);
          if (refreshResult && refreshResult?.access_token && refreshResult?.refresh_token) {
            const storeAccessTokenResult = await storeAccessToken(refreshResult.access_token);
            const storeRefreshTokenResult = await storeRefreshToken(refreshResult.refresh_token);
            if (storeAccessTokenResult && storeRefreshTokenResult) {
              handleSetup(dispatch, refreshResult.access_token);
            }
          } else {
            Amplitude.logEvent('TOKEN_REFRESH_FAILED');
            await deleteAccessToken();
            await deleteRefreshToken();
            sendToStarterPage(navigation, expoToken);
          }
        } else {
          Amplitude.logEvent('TOKEN_VALID_AND_NOT_EXPIRED');
          handleSetup(dispatch, token, expoToken, navigation);
        }
      } else {
        Amplitude.logEvent('TOKEN_NOT_EXISTS_OR_NOT_VALID');
        sendToStarterPage(navigation, expoToken);
      }
    };
    startUp();
  }, []);
  */

  // TEMP mock for testing
  useEffect(() => {
    dispatch(setValidUserMock({
      userID: 123,
      patientID: 456,
    }));
  
    console.log("Mocked validUser, navigating to HOME");
    navigation.reset({
      index: 0,
      routes: [{ name: 'HOME' }],
    });
  }, []);
  

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Image source={gif} style={{ width: useResponsiveWidth(25), height: useResponsiveWidth(25) }}></Image>
    </View>
  );
}

// handle setting up access and refresh tokens and retrieving valid user from db
function handleSetup(dispatch, token, expoToken, navigation) {
  try {
    // decode it so we can pass the email into ValidateUser
    const decodedToken = parseJwt(token);
    dispatch(getValidUser({ email: decodedToken.emails[0] }));
  } catch (error) {
    sendToStarterPage(navigation, expoToken);
  }
}

function sendToStarterPage(navigation, expoToken) {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: 'STARTER',
        params: {
          expoTokenForStarter: expoToken,
        },
      },
    ],
  });
}
