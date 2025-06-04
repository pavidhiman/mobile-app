import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Pressable, Switch, Image } from 'react-native';
import { settingsPageStyles } from '../styles/SettingsPageStyles';
import { useResponsiveWidth, useResponsiveHeight, useResponsiveFontSize } from 'react-native-responsive-dimensions';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { useDispatch, useSelector } from 'react-redux';
import { getLocations } from '../slices/LocationsSlice';
import { getConditions } from '../slices/ConditionsSlice';
import { savePatientSettings, getPatientSettings } from '../slices/PatientSettingsSlice';
import { textStyles } from '../styles/textStyles';
import Dropdown from '../components/Dropdown';
import HorizontalRule from '../components/HorizontalRule';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from '../components/CustomButton';
import CheckBox from 'expo-checkbox';
import plusImg from '../assets/images/plus.png';
import minusImg from '../assets/images/minus.png';
import Popup from '../components/Popup/Popup';
import gif from '../assets/images/logo-loader-whitebg.gif';
import * as Amplitude from '@amplitude/analytics-react-native';

export default function SettingsPage({ navigation, setHasUnsavedChanges }) {
  const styles = settingsPageStyles;

  const isLargeScreen = useWindowWidth();

  const settings = useSelector((state) => state.settings);
  const locationsSlice = useSelector((state) => state.locations);
  const conditionsSlice = useSelector((state) => state.conditions);
  const validUser = useSelector((state) => state.validUser);
  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();
  useEffect(() => {
    const callAPIs = async () => {
      dispatch(getLocations());
      dispatch(getConditions());
      dispatch(getPatientSettings({ patientID: validUser.data.patientID }));
    };
    callAPIs();
  }, []);

  useEffect(() => {
    Amplitude.logEvent('OPEN_SETTINGS_PAGE');
    const startTime = new Date();

    return () => {
      const duration = (new Date() - startTime) / 1000;
      Amplitude.logEvent('CLOSE_SETTINGS_PAGE', {
        'duration': duration,
      });
    };
  }, []);

  const loaderWidth = useResponsiveWidth(25);
  const loaderHeight = useResponsiveWidth(25);
  const loaderMargin = useResponsiveHeight(25);

  if (
    locationsSlice.getLocationsStatus === 'succeeded' &&
    conditionsSlice.getConditionsStatus === 'succeeded' &&
    settings.getPatientSettingsStatus === 'succeeded'
  ) {
    const locationsData = locationsSlice.getLocationsData.map((location) => ({
      label: location.locationName,
      value: location.locationName,
    }));
    const conditionMap = Object.fromEntries(conditionsSlice.getConditionsData.map((c) => [c.conditionID, c.condition]));
    let patientConditions = settings.getPatientSettingsData.patientConditions.map((patient) => {
      const conditionName = conditionMap[patient.conditionID] || 'Unknown';
      return {
        patientID: patient.patientID,
        condition: conditionName,
      };
    });
    return (
      <View style={styles.container}>
        <TopHeader styles={styles} />
        <SettingsContent
          isLargeScreen={isLargeScreen}
          styles={styles}
          locationsData={locationsData}
          patientConditions={patientConditions}
          settings={settings}
          locationsSlice={locationsSlice}
          conditionsSlice={conditionsSlice}
          validUser={validUser}
          user={user}
          dispatch={dispatch}
          navigation={navigation}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />
      </View>
    );
  }
  return (
    <View>
      <TopHeader styles={styles} />
      <View style={{ alignItems: 'center', marginTop: loaderMargin, flex: 1 }}>
        <Image source={gif} style={{ width: loaderWidth, height: loaderHeight }}></Image>
      </View>
    </View>
  );
}

function SettingsContent({
  isLargeScreen,
  styles,
  locationsData,
  settings,
  patientConditions,
  locationsSlice,
  conditionsSlice,
  validUser,
  user,
  dispatch,
  navigation,
  setHasUnsavedChanges,
}) {
  const [selectedLocationOpen, setSelectedLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(settings.getPatientSettingsData.patient.preferredLocation);
  const [locations, setLocations] = useState(locationsData);

  const [patientCurrentConditions, setPatientCurrentConditions] = useState(patientConditions);
  const [conditionToRemove, setConditionToRemove] = useState(null);

  const [notificationsToggled, setNotificationsToggled] = useState(
    settings.getPatientSettingsData.notificationSettings.emailNotices === 1 &&
      settings.getPatientSettingsData.notificationSettings.textNotices === 1,
  );
  const [textNotificationsToggled, setTextNotificationsToggled] = useState(
    settings.getPatientSettingsData.notificationSettings.textNotices === 1,
  );
  const [emailNotificationsToggled, setEmailNotificationsToggled] = useState(
    settings.getPatientSettingsData.notificationSettings.emailNotices === 1,
  );
  const [pushNotificationsToggled, setPushNotificationsToggled] = useState(
    settings.getPatientSettingsData.notificationSettings.appNotices === 1,
  );

  const [showUpdatedPopup, setShowUpdatedPopup] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const conditionsArray = conditionsSlice.getConditionsData.map((condition) => {
    return {
      conditionID: condition.conditionID,
      condition: condition.condition,
    };
  });

  const locationToID = locationsSlice.getLocationsData.reduce((acc, location) => {
    acc[location.locationName] = location.locationID;
    return acc;
  }, {});

  const patientConditionsIDArray = patientCurrentConditions.map((patient) => {
    const matchingCondition = conditionsArray.find((condition) => condition.condition === patient.condition);
    if (matchingCondition) {
      return {
        patientID: patient.patientID,
        conditionID: matchingCondition.conditionID,
      };
    }
  });

  useEffect(() => {
    if (settingsSaved) {
      navigation.navigate('HOME');
    }
  }, [settingsSaved]);

  useEffect(() => {
    const data = {
      notificationSettings: {
        userNotificationSettingsID: settings.getPatientSettingsData.notificationSettings.userNotificationSettingsID,
        userID: user.getUserData.userID,
        receiveNotifications: notificationsToggled ? 1 : 0,
        emailNotices: emailNotificationsToggled ? 1 : 0,
        textNotices: textNotificationsToggled ? 1 : 0,
        appNotices: pushNotificationsToggled ? 1 : 0,
      },
    };
    if (settingsSaved) {
      return;
    }
    const hasUnsavedChanges =
      settings.getPatientSettingsData.patient.preferredLocation !== selectedLocation ||
      JSON.stringify(settings.getPatientSettingsData.patientConditions) !== JSON.stringify(patientConditionsIDArray) ||
      JSON.stringify(settings.getPatientSettingsData.notificationSettings) !==
        JSON.stringify(data.notificationSettings);
    setHasUnsavedChanges(hasUnsavedChanges);
  }, [
    notificationsToggled,
    emailNotificationsToggled,
    textNotificationsToggled,
    pushNotificationsToggled,
    patientCurrentConditions,
    selectedLocation,
    settingsSaved,
  ]);

  const rowWidth = useResponsiveWidth(80);
  const conditionTextSize = useResponsiveFontSize(1.85);
  const removeBtnHeight = useResponsiveHeight(0.75);
  const removeBtnWidth = useResponsiveWidth(6.5);
  const buttonFontSize = useResponsiveFontSize(1.85);

  const handleTextNotifsToggled = () => {
    setTextNotificationsToggled(!textNotificationsToggled);
  };

  const handleEmailNotifsToggled = () => {
    setEmailNotificationsToggled(!emailNotificationsToggled);
  };

  const handlePushNotifsToggled = () => {
    setPushNotificationsToggled(!pushNotificationsToggled);
  };

  const handleNotifsToggled = () => {
    setEmailNotificationsToggled(!notificationsToggled);
    setTextNotificationsToggled(!notificationsToggled);
    setPushNotificationsToggled(!notificationsToggled);
    setNotificationsToggled(!notificationsToggled);
  };

  const handleConfirmBtnPressed = () => {
    setShowUpdatedPopup(false);
    setSettingsSaved(true);
  };

  const removeConditionSelected = (condition) => {
    if (patientCurrentConditions.length === 1 && patientCurrentConditions[0].condition === 'Unknown') {
      return;
    }
    setConditionToRemove(condition);
    setShowRemovePopup(true);
  };

  const completeRemoveCondition = () => {
    let newCurrentConditions = patientCurrentConditions.filter((item) => item.condition !== conditionToRemove);
    if (newCurrentConditions.length === 0) {
      newCurrentConditions = [{ 'condition': 'Unknown', 'patientID': validUser.data.patientID }];
    }
    setPatientCurrentConditions(newCurrentConditions);
    setShowRemovePopup(false);
  };

  const handleAddAnotherClicked = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNoBtnPressed = () => {
    setShowRemovePopup(false);
  };

  const addNewCondition = (selection) => {
    if (selection !== 'Unknown') {
      const newCondition = { condition: selection, patientID: validUser.data.patientID };
      if (
        !patientCurrentConditions.some(
          (condition) =>
            condition.condition === newCondition.condition && condition.patientID === newCondition.patientID,
        )
      ) {
        const updatedConditions = patientCurrentConditions.filter((item) => item.condition !== 'Unknown');

        updatedConditions.push(newCondition);

        setPatientCurrentConditions(updatedConditions);
        setShowDropdown(!showDropdown);
      }
    }
  };

  const handleSaveBtnClicked = () => {
    const data = {
      patientId: validUser.data.patientID,
      patientConditions: patientConditionsIDArray,
      conditions: conditionsArray,
      patient: {
        patientID: validUser.data.patientID,
        userID: user.getUserData.userID,
        preferredLocationID: locationToID[selectedLocation],
        preferredLocation: selectedLocation,
        firstName: user.getUserData.firstName,
        lastName: user.getUserData.lastName,
        email: user.getUserData.email,
        dob: user.getUserData.dob,
        conditions: '',
        lastAssessmentDate: user.getUserData.dob,
      },
      notificationSettings: {
        userNotificationSettingsID: settings.getPatientSettingsData.notificationSettings.userNotificationSettingsID,
        userID: user.getUserData.userID,
        receiveNotifications: notificationsToggled ? 1 : 0,
        emailNotices: emailNotificationsToggled ? 1 : 0,
        textNotices: textNotificationsToggled ? 1 : 0,
        appNotices: pushNotificationsToggled ? 1 : 0,
      },
    };
    dispatch(savePatientSettings({ data: data }));
    setShowUpdatedPopup(true);
  };

  const btnHeightLarge = useResponsiveHeight(12);
  const btnHeightSmall = useResponsiveHeight(7);

  const popupMarginBottom = useResponsiveHeight(25);

  const patientConditionsArray = [];
  for (let condition of patientCurrentConditions) {
    patientConditionsArray.push({ patientID: validUser.data.patientID, conditionID: condition.conditionID });
  }

  const dropdownOptions = [];
  for (let condition of conditionsArray) {
    dropdownOptions.push(condition.condition);
  }

  return (
    <View style={styles.container}>
      {showUpdatedPopup ? (
        <Popup
          header={'Updated Settings'}
          text={`Your settings have been updated.`}
          buttonAmount={1}
          firstButtonText={'Confirm'}
          leftFunction={handleConfirmBtnPressed}
          coloredButton={'left'}
          theme={'general'}
          isLargeScreen={isLargeScreen}
          singleButtonWidth={60}
          marginBottom={popupMarginBottom}
        />
      ) : null}
      {showRemovePopup ? (
        <Popup
          header={'Remove Condition'}
          text={`Are you sure you want to remove the selected condition?`}
          buttonAmount={2}
          firstButtonText={'No'}
          secondButtonText={'Yes'}
          leftFunction={handleNoBtnPressed}
          rightFunction={completeRemoveCondition}
          coloredButton={'right'}
          theme={'general'}
          isLargeScreen={isLargeScreen}
          marginBottom={popupMarginBottom}
        />
      ) : null}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{ ...styles.label, ...textStyles.regular, fontSize: useResponsiveFontSize(2.5), marginBottom: 20 }}
          >
            PREFERRED LOCATION
          </Text>
          <View
            style={{
              marginBottom: selectedLocationOpen ? 50 * locationsSlice.getLocationsData.length : 50,
              width: isLargeScreen ? useResponsiveWidth(35) : useResponsiveWidth(85),
            }}
          >
            <DropDownPicker
              open={selectedLocationOpen}
              value={selectedLocation}
              items={locations}
              setOpen={setSelectedLocationOpen}
              setValue={setSelectedLocation}
              setItems={setLocations}
              nestedScrollEnabled={true}
              placeholder={''}
              style={{
                borderColor: '#3C6672',
                borderRadius: 15,
              }}
              dropDownContainerStyle={{
                maxHeight: 42 * locationsSlice.getLocationsData.length,
              }}
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              borderBottomWidth: 1,
              borderColor: '#F3F3F3',
              width: useResponsiveWidth(90),
              zIndex: -1,
            }}
          >
            <View
              style={{
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#F3F3F3',
                width: useResponsiveWidth(90),
              }}
            ></View>
            <Text style={{ marginTop: 30, ...textStyles.regular, fontSize: useResponsiveFontSize(2.5) }}>
              CONDITIONS
            </Text>
            <View style={{ width: useResponsiveWidth(90), alignItems: 'center', marginTop: 10 }}>
              {patientCurrentConditions.map((patientCondition, idx) => (
                <View key={idx} style={{ ...styles.row, width: rowWidth }}>
                  <Text style={{ fontSize: conditionTextSize, ...textStyles.regular }}>
                    • {patientCondition.condition}
                  </Text>
                  <Pressable
                    style={styles.settingsButton}
                    onPress={() => removeConditionSelected(patientCondition.condition)}
                  >
                    <Image source={minusImg} style={{ width: removeBtnWidth, height: removeBtnHeight }} />
                    <Text style={{ ...styles.settingsButtonText, ...textStyles.regular, fontSize: buttonFontSize }}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              ))}
              <View
                style={{
                  ...styles.row,
                  width: rowWidth,
                  marginBottom: 10,
                  marginTop: 20,
                }}
              >
                <Pressable onPress={handleAddAnotherClicked} style={styles.settingsButton}>
                  <Image source={plusImg} style={{ width: useResponsiveWidth(6.5), height: useResponsiveWidth(6.5) }} />
                  <Text style={{ ...styles.settingsButtonText, ...textStyles.regular, fontSize: buttonFontSize }}>
                    Add another
                  </Text>
                </Pressable>
              </View>
              <View style={{ width: useResponsiveWidth(55), marginBottom: 30 }}>
                <Dropdown isOpen={showDropdown} options={dropdownOptions} onSelect={addNewCondition} />
              </View>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{ fontSize: useResponsiveFontSize(2.5), ...textStyles.regular, marginBottom: 20, marginTop: 30 }}
          >
            NOTIFICATIONS
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ marginRight: 20, ...textStyles.regular, fontSize: useResponsiveFontSize(2.15) }}>
              Toggle notifications off/on
            </Text>
            <Switch
              value={notificationsToggled}
              onValueChange={handleNotifsToggled}
              trackColor={{ false: '#D9D9D9', true: '#3C6672' }}
              thumbColor="white"
            />
          </View>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#D9D9D9',
              paddingTop: 30,
              paddingBottom: 30,
              alignItems: 'center',
              width: useResponsiveWidth(80),
            }}
          >
            <Pressable onPress={handleTextNotifsToggled} style={{ marginBottom: 20 }}>
              <View style={styles.checkboxContainer}>
                <Text style={{ fontSize: useResponsiveFontSize(2.15), ...textStyles.regular, flex: 1 }}>
                  Text Notifications
                </Text>
                <CheckBox value={textNotificationsToggled} onValueChange={handleTextNotifsToggled} />
              </View>
            </Pressable>
            <Pressable onPress={handleEmailNotifsToggled} style={{ marginBottom: 20 }}>
              <View style={styles.checkboxContainer}>
                <Text style={{ fontSize: useResponsiveFontSize(2.15), ...textStyles.regular, flex: 1 }}>
                  Email Notifications
                </Text>
                <CheckBox value={emailNotificationsToggled} onValueChange={handleEmailNotifsToggled} />
              </View>
            </Pressable>
            <Pressable onPress={handlePushNotifsToggled}>
              <View style={styles.checkboxContainer}>
                <Text style={{ fontSize: useResponsiveFontSize(2.15), ...textStyles.regular, flex: 1 }}>
                  App Push Notifications
                </Text>
                <CheckBox value={pushNotificationsToggled} onValueChange={handlePushNotifsToggled} />
              </View>
            </Pressable>
          </View>
          <View style={{ marginTop: 35, marginBottom: 130 }}>
            <CustomButton
              isLargeScreen={isLargeScreen}
              styles={styles}
              buttonText={'Save'}
              height={isLargeScreen ? btnHeightLarge : btnHeightSmall}
              width={useResponsiveWidth(65)}
              onPress={handleSaveBtnClicked}
              buttonColor={'#3C6672'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TopHeader({ styles }) {
  return (
    <View style={{ ...styles.topContainer, height: useResponsiveHeight(25) }}>
      <View style={{ width: useResponsiveWidth(75) }}>
        <Text style={{ ...styles.mainHeader, ...textStyles.regular, fontSize: useResponsiveFontSize(3) }}>
          SETTINGS
        </Text>
        <Text style={{ ...styles.mainText, ...textStyles.regular, fontSize: useResponsiveFontSize(2.15) }}>
          View and modify account settings and profile preferences.
        </Text>
      </View>
    </View>
  );
}
