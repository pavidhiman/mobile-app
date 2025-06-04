// components
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import HorizontalRule from '../components/HorizontalRule';
import SlidingView from '../components/SlidingView';
import { useResponsiveWidth, useResponsiveHeight, useResponsiveFontSize } from 'react-native-responsive-dimensions';

// PRIMS API
import { getOneYrSurveys, getPatientSurveyAnswerList } from '../slices/SurveySlice';

// hooks
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// styles
import { textStyles } from '../styles/textStyles';

import * as Amplitude from '@amplitude/analytics-react-native';

export default function SurveyHistoryPage() {
  // redux
  const surveys = useSelector((state) => state.surveys);
  const validUser = useSelector((state) => state.validUser);

  const dispatch = useDispatch();

  const [openSlider, setOpenSlider] = useState(true);
  const [surveySelected, setSurveySelected] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState({
    name: null,
    date: null,
    score: null,
  });
  const [selectedSurveyIndex, setSelectedSurveyIndex] = useState(null);

  const getSurveyHistory = () => {
    dispatch(getOneYrSurveys({ patientID: validUser.data.patientID }));
  };

  const handleSurveySelect = (survey) => {
    setSurveySelected(true);
    setCurrentSurvey({
      name: survey.surveyDesc,
      date: new Date(survey.dateTimeCompleted).toLocaleString('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      score: survey.surveyScore,
    });
    dispatch(getPatientSurveyAnswerList({ patientSurveyID: survey.patientSurveyID }));
  };

  const handleSurveyConfirm = () => {
    setOpenSlider(false);
    setSurveySelected(false);
    setSelectedSurveyIndex(null);
  };

  useEffect(() => {
    getSurveyHistory();

    const dataPoints = surveys.getOneYrSurveysData.map((survey) => {
      return survey.surveyScore;
    });
  }, []);

  useEffect(() => {
    Amplitude.logEvent('OPEN_SURVEY_HISTORY_PAGE');
    const startTime = new Date();

    return () => {
      const duration = (new Date() - startTime) / 1000;
      Amplitude.logEvent('CLOSE_SURVEY_HISTORY_PAGE', {
        'duration': duration,
      });
    };
  }, []);

  return (
    <View style={surveyHistoryStyles.wrapper}>
      <SlidingView
        heading="SURVEY HISTORY"
        color="#3C6672"
        isOpen={openSlider}
        onOpen={() => {
          setOpenSlider(true);
        }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        {
          <View //THIS IS THE HISTORY WRAPPER
            style={{
              ...sliderStyles.surveysWrapper,
              flex: 8,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {surveys.getOneYrSurveysData.map((survey, i) => {
                return (
                  <Pressable
                    key={i}
                    style={() => {
                      return i === selectedSurveyIndex
                        ? { ...sliderStyles.survey, backgroundColor: '#2B4851' }
                        : sliderStyles.survey;
                    }}
                    onPress={() => {
                      handleSurveySelect(survey);
                      setSelectedSurveyIndex(i);
                    }}
                  >
                    <View>
                      <Text style={{ ...textStyles.bold, fontSize: 16, color: 'white' }}>{survey.surveyDesc}</Text>
                      <Text style={{ ...textStyles.regular, fontSize: 16, color: 'white' }}>
                        {new Date(survey.dateTimeCompleted).toLocaleString('default', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <Text style={{ ...textStyles.bold, fontSize: 20, color: 'white', marginLeft: 5 }}>
                      {parseFloat(survey.surveyScore).toFixed(2)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        <View style={{ ...sliderStyles.confirmWrapper, flex: 3, paddingBottom: 25 }}>
          {surveySelected && (
            <Pressable onPress={handleSurveyConfirm}>
              {console.log('button active')}
              <View style={sliderStyles.confirm}>
                <Text style={{ ...textStyles.regular, fontSize: 14 }}>Confirm</Text>
              </View>
            </Pressable>
          )}
        </View>
      </SlidingView>

      <View style={surveyHistoryStyles.summary}>
        <View>
          <Text style={textStyles.bold}>{currentSurvey.name}</Text>
          <Text style={textStyles.regular}>{currentSurvey.date}</Text>
        </View>
        <Text style={{ ...textStyles.bold, fontSize: 28 }}>{parseFloat(currentSurvey.score).toFixed(2)}</Text>
      </View>

      <View style={surveyHistoryStyles.legend}>
        <Text style={{ ...textStyles.regular, fontSize: 10, color: '#5E5E5E' }}>Question</Text>
        <Text style={{ ...textStyles.regular, fontSize: 10, color: '#5E5E5E' }}>Answer</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={surveyHistoryStyles.results}>
        {surveys.getPatientSurveyAnswerListData.map((answer, i) => {
          return (
            <View key={i}>
              <View style={surveyHistoryStyles.question}>
                <Text style={{ ...textStyles.regular, width: 200 }}>{`${i + 1}. ${answer.componentTitle}`}</Text>
                <Text style={textStyles.regular}>{answer.answerText}</Text>
              </View>
              {i !== surveys.getPatientSurveyAnswerListData.length - 1 && <HorizontalRule color="#E8E8E8" />}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  surveysWrapper: {
    height: Dimensions.get('window').height * (2 / 3),
    paddingTop: 57,
    paddingRight: 13,
    paddingLeft: 13,
  },

  survey: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#2B4851',
    marginBottom: 9,
  },

  confirmWrapper: { alignItems: 'center', marginTop: 18 },

  confirm: {
    height: 40,
    width: 185,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const surveyHistoryStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 90,
    paddingRight: 9,
    paddingLeft: 9,
    paddingBottom: 80,
    gap: 11,
    zIndex: 0,
  },

  summary: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 27,
    paddingRight: 27,
  },

  legend: {
    backgroundColor: '#F3F3F3',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 33,
    paddingLeft: 33,
  },

  results: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E8E8E8', paddingLeft: 33, paddingRight: 33 },

  question: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 90 },
});
