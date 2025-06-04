import { Text, View, Image, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useResponsiveHeight, useResponsiveWidth, useResponsiveFontSize } from 'react-native-responsive-dimensions';
import { surveySelectPageStyles } from '../styles/SurveySelectPageStyles';
import { useWindowWidth } from '../hooks/useWindowWidth';
import CustomButton from '../components/CustomButton';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { textStyles } from '../styles/textStyles';
import BottomNavbar from '../components/BottomNavbar';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  getSurveys,
  getSurveyQuestions,
  getSurveyAnswers,
  canCompleteSurvey,
  resetCanCompleteSurveyState,
} from '../slices/SurveySlice';
import gif from '../assets/images/logo-loader-whitebg.gif';
import noticeIcon from '../assets/images/Noticeicon.png';
import { useFocusEffect } from '@react-navigation/native';
import * as Amplitude from '@amplitude/analytics-react-native';

export default function SurveySelectPage({ navigation }) {
  const dispatch = useDispatch();
  const isLargeScreen = useWindowWidth();
  const styles = surveySelectPageStyles;

  const validUser = useSelector((state) => state.validUser);
  const surveys = useSelector((state) => state.surveys);

  const loaderWidth = useResponsiveWidth(25);
  const loaderHeight = useResponsiveWidth(25);
  const loaderMargin = useResponsiveHeight(25);

  useEffect(() => {
    const startup = async () => {
      dispatch(getSurveys({ patientID: validUser.data.patientID }));
    };
    startup();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribeBlur = navigation.addListener('blur', (e) => {
        dispatch(resetCanCompleteSurveyState());
      });

      return () => {
        unsubscribeBlur();
      };
    }, [navigation]),
  );

  if (surveys?.getSurveysStatus === 'succeeded') {
    return (
      <SurveySelection
        isLargeScreen={isLargeScreen}
        styles={styles}
        validUser={validUser}
        navigation={navigation}
        surveys={surveys}
      />
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

function SurveySelection({ isLargeScreen, navigation, validUser, styles, surveys }) {
  const dispatch = useDispatch();

  const btnHeightLarge = useResponsiveHeight(12);
  const btnHeightSmall = useResponsiveHeight(7);
  const btnWidth = useResponsiveWidth(65);

  const [selectedSurveyID, setSelectedSurveyID] = useState(null);

  const surveysData = surveys.getSurveysData.map((survey) => ({
    label: survey.surveyDesc,
    value: survey.surveyID,
  }));

  useEffect(() => {
    if (
      surveys.canCompleteSurveyData?.canComplete === 1 &&
      surveys.canCompleteSurveyStatus === 'succeeded' &&
      selectedSurveyID !== null
    ) {
      Amplitude.logEvent('DISPATCH_GET_SURVEY_QUESTIONS_AND_ANSWERS');
      dispatch(getSurveyQuestions({ surveyID: selectedSurveyID }));
      dispatch(getSurveyAnswers({ surveyID: selectedSurveyID }));
    }
  }, [surveys.canCompleteSurveyStatus]);

  useEffect(() => {
    if (selectedSurveyID !== null) {
      Amplitude.logEvent('DISPATCH_CHECK_CAN_COMPLETE_SURVEY');
      dispatch(canCompleteSurvey({ patientID: validUser.data?.patientID, surveyID: selectedSurveyID }));
    }
  }, [selectedSurveyID]);

  const handleBeginSurvey = () => {
    Amplitude.logEvent('BEGIN_SURVEY_CLICKED');
    navigation.navigate('SURVEY');
  };

  const [surveyOptionsOpen, setSurveyOptionsOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [availableSurveys, setAvailableSurveys] = useState(surveysData);

  return (
    <View style={styles.testContainer}>
      <TopHeader styles={styles} />
      <View style={styles.mainContent}>
        <View style={styles.dropDownWrapper}>
          <Text
            style={{
              ...textStyles.regular,
              marginBottom: 10,
              fontSize: useResponsiveFontSize(2.5),
              // fontFamily: 'DMSans_500Medium',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            SELECT A SURVEY
          </Text>
          <DropDownPicker
            open={surveyOptionsOpen}
            value={selectedSurvey}
            items={availableSurveys}
            setOpen={setSurveyOptionsOpen}
            setValue={setSelectedSurvey}
            setItems={setAvailableSurveys}
            onChangeValue={(value) => {
              Amplitude.logEvent('SURVEY_SELECTED_FROM_DROPDOWN');
              setSelectedSurveyID(value);
            }}
            placeholder={''}
            style={{
              zIndex: 1,
              borderColor: '#3C6672',
              borderRadius: 15,
            }}
            dropDownContainerStyle={{
              maxHeight: 125,
            }}
          />
        </View>
        <View style={styles.buttonWrapper}>
          {selectedSurvey !== null &&
            surveys.getSurveyQuestionsStatus === 'succeeded' &&
            surveys.canCompleteSurveyStatus === 'succeeded' &&
            surveys.canCompleteSurveyData?.canComplete === 1 && (
              <CustomButton
                isLargeScreen={isLargeScreen}
                styles={styles}
                buttonText={'Begin Survey'}
                height={isLargeScreen ? btnHeightLarge : btnHeightSmall}
                width={btnWidth}
                marginBottom={20}
                marginTop={75}
                buttonColor={'#3C6672'}
                onPress={handleBeginSurvey}
              />
            )}
          {selectedSurvey !== null && surveys.canCompleteSurveyData?.canComplete === 0 && <SurveyUnavailable />}
        </View>
      </View>
    </View>
  );
}

function TopHeader({ styles }) {
  return (
    <View style={{ ...styles.topContainer, height: useResponsiveHeight(25) }}>
      <View style={{ width: useResponsiveWidth(75) }}>
        <Text style={{ ...styles.mainHeader, ...textStyles.regular, fontSize: useResponsiveFontSize(3) }}>
          SELECT A SURVEY
        </Text>
        <Text style={{ ...styles.mainText, ...textStyles.regular, fontSize: useResponsiveFontSize(2.15) }}>
          Begin by selecting a survey from the dropdown menu that you would like to complete.
        </Text>
      </View>
    </View>
  );
}

function SurveyUnavailable() {
  const text = `You have already completed this survey. It will be available again next Sunday.`;
  return (
    <View
      style={{
        backgroundColor: '#3C6672',
        padding: 15,
        paddingBottom: 20,
        paddingTop: 20,
        borderRadius: 10,
      }}
    >
      <View style={{ borderLeftWidth: 3, borderLeftColor: '#DEBE5B', paddingLeft: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#2B4851',
            alignSelf: 'baseline',
            paddingLeft: 10,
            paddingRight: 50,
            paddingBottom: 2,
            paddingTop: 2,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Image source={noticeIcon} style={{ width: 20, height: 20, marginRight: 10 }} />
          <Text style={{ ...textStyles.regular, fontSize: useResponsiveFontSize(2), color: 'white' }}>
            Survey Unavailable
          </Text>
        </View>
        <Text style={{ ...textStyles.regular, fontSize: useResponsiveFontSize(1.85), color: 'white' }}>{text}</Text>
      </View>
    </View>
  );
}
