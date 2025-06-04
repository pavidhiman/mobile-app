import HomePage from './pages/HomePage';
import StarterPage from './pages/StarterPage';
import UserSetupPage from './pages/UserSetupPage';
import SupportPage from './pages/SupportPage';
import ValidationPage from './pages/ValidationPage';
import AssessmentHistoryPage from './pages/AssessmentHistoryPage';
import SettingsPage from './pages/SettingsPage';
import SurveyHistoryPage from './pages/SurveyHistory';
import SurveySelectPage from './pages/SurveySelectPage';
import SurveyPage from './pages/SurveyPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import { useState } from 'react';
import { View, StatusBar, Platform, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import store from './Store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useCallback, useEffect, Fragment, useRef } from 'react';
import BottomNavbar from './components/BottomNavbar';
import { useWindowWidth } from './hooks/useWindowWidth';
import * as Notifications from 'expo-notifications';
import * as Amplitude from '@amplitude/analytics-react-native';

const screensColour = {
  HOME: 'white',
  STARTER: 'white',
  USERSETUP: '#95B0AA',
  SUPPORT: '#95B0AA',
  PRIVACY: '#95B0AA',
  ABOUT: '#95B0AA',
  VALIDATE: 'white',
  ASSESSMENTHISTORY: '',
  SETTINGS: '#95B0AA',
  RESOURCES: '',
  SURVEYHISTORY: '#3C6672',
  SURVEYSELECT: '#3C6672',
  SURVEY: '#3C6672',
};

const Stack = createStackNavigator();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('VALIDATE');
  const [settingsUnsavedChanges, setSettingsUnsavedChanges] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const navigationRef = useRef(null);
  const routeNameRef = useRef();

  useEffect(() => {
    Amplitude.init('19a90d04b8be84a32ffb54c9010528ac');
    Amplitude.logEvent('APP_STARTED');
  }, []);

  useEffect(() => {
    // Function to load fonts
    const loadFonts = async () => {
      await Font.loadAsync({
        'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
        'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(() => {});

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      subscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  if (fontsLoaded) {
    return (
      <Provider store={store}>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state) => {
            const currentRouteName = getActiveRouteName(state);
            if (routeNameRef.current !== currentRouteName) {
              setCurrentScreen(currentRouteName);
              routeNameRef.current = currentRouteName;
            }
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Fragment>
              <SafeAreaView style={{ flex: 0, backgroundColor: screensColour[currentScreen] }} />
              <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <StatusBar barStyle="dark-content" />
                <StackNavigator setSettingsUnsavedChanges={setSettingsUnsavedChanges} />
                {!(currentScreen === 'USERSETUP' || currentScreen === 'STARTER' || currentScreen === 'VALIDATE') && (
                  <BottomNavbar
                    onChangeScreen={(screenName) => {
                      if (currentScreen !== screenName) {
                        navigationRef.current?.reset({
                          index: 0,
                          routes: [{ name: screenName }],
                        });
                      }
                    }}
                    currentScreen={currentScreen}
                    changedSettings={settingsUnsavedChanges}
                  />
                )}
              </SafeAreaView>
            </Fragment>
          </View>
        </NavigationContainer>
      </Provider>
    );
  }
}

function StackNavigator({ setSettingsUnsavedChanges }) {
  return (
    <Stack.Navigator
      initialRouteName="VALIDATE"
      screenOptions={{
        cardStyle: { backgroundColor: 'white' },
        headerShown: false,
      }}
    >
      <Stack.Screen name="HOME" component={HomePage} />
      <Stack.Screen name="VALIDATE" component={ValidationPage} />
      <Stack.Screen name="STARTER" component={StarterPage} />
      <Stack.Screen name="USERSETUP" component={UserSetupPage} />
      <Stack.Screen name="SUPPORT" component={SupportPage} />
      <Stack.Screen name="SETTINGS">
        {(props) => <SettingsPage {...props} setHasUnsavedChanges={setSettingsUnsavedChanges} />}
      </Stack.Screen>
      <Stack.Screen name="SURVEYHISTORY" component={SurveyHistoryPage} />
      <Stack.Screen name="SURVEYSELECT" component={SurveySelectPage} />
      <Stack.Screen name="SURVEY" component={SurveyPage} />
      <Stack.Screen name="PRIVACY" component={PrivacyPage} />
      <Stack.Screen name="ABOUT" component={AboutPage} />
    </Stack.Navigator>
  );
}

function getActiveRouteName(navigationState) {
  if (!navigationState) return null;

  const route = navigationState.routes[navigationState.index];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  return route.name;
}
