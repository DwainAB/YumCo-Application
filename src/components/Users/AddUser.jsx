import React, { useState, useEffect, useRef } from 'react';
import { 
   View, 
   Text, 
   TextInput, 
   TouchableOpacity, 
   ScrollView, 
   StyleSheet,
   KeyboardAvoidingView,
   Platform,
   Keyboard,
   Alert,
   Animated
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from "../ColorContext/ColorContext";
import { useWindowDimensions } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from 'expo-haptics';

const AnimatedForm = ({ children }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
            }}
        >
            {children}
        </Animated.View>
    );
};

const AddUser = () => {
   const { t } = useTranslation();
   const { colors } = useColors();
   const styles = useStyles();
   const [restaurantId, setRestaurantId] = useState('');
   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
   const [currentFocus, setCurrentFocus] = useState(null);
   const [errors, setErrors] = useState({});
   const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho";

   const [newUser, setNewUser] = useState({
       firstname: '',
       lastname: '',
       email: '',
       phone: '',
       street: '',
       city: '',
       postal_code: '',
       country: '',
       type: '',
   });

   useEffect(() => {
       const keyboardDidShowListener = Keyboard.addListener(
           'keyboardDidShow',
           () => setKeyboardVisible(true)
       );
       const keyboardDidHideListener = Keyboard.addListener(
           'keyboardDidHide',
           () => setKeyboardVisible(false)
       );

       return () => {
           keyboardDidHideListener.remove();
           keyboardDidShowListener.remove();
       };
   }, []);

   useEffect(() => {
       const fetchRestaurantId = async () => {
           try {
               const owner = await AsyncStorage.getItem("owner");
               const ownerData = JSON.parse(owner);                
               setRestaurantId(ownerData.restaurantId);
           } catch (error) {
               console.error('Erreur utilisateur:', error);
               Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
           }
       };
       fetchRestaurantId();
   }, []);

   const validateFields = () => {
       const newErrors = {};
       if (!newUser.email.includes('@')) newErrors.email = true;
       if (!newUser.phone) newErrors.phone = true;
       if (!newUser.firstname) newErrors.firstname = true;
       if (!newUser.lastname) newErrors.lastname = true;

       setErrors(newErrors);
       return Object.keys(newErrors).length === 0;
   };

   const handleNewUserInputChange = (name, value) => {
       setNewUser({ ...newUser, [name]: value });
       if (errors[name]) {
           setErrors(prev => ({...prev, [name]: false}));
       }
   };

   const handleAddNewUser = async () => {
       if (!validateFields()) {
           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
           Alert.alert(t('error'), t('fillAllFields'));
           return;
       }

       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

       const payload = {
           first_name: newUser.firstname,
           last_name: newUser.lastname,
           email: newUser.email,
           phone: newUser.phone,
           street: newUser.street,
           city: newUser.city,
           postal_code: newUser.postal_code,
           country: newUser.country,
           category: "CLIENTS",
           restaurant_id: restaurantId,
           type: newUser.type,
       };

       try {
           const response = await fetch(
               "https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/createUserWithRelations",
               {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json",
                       "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
                   },
                   body: JSON.stringify(payload),
               }
           );

           const data = await response.json();

           if (response.ok) {
               Haptics.notificationAsync(
                   Haptics.NotificationFeedbackType.Success
               );
               Alert.alert("Succès", "Le nouvelle utilsateur a bien été créée");
               setNewUser({
                   firstname: '',
                   lastname: '',
                   email: '',
                   phone: '',
                   street: '',
                   city: '',
                   postal_code: '',
                   country: '',
                   type: '',
               });
           } else {            
               throw new Error(data.error || "Une erreur s'est produite.");
           }
       } catch (error) {
           console.error(error);
           Haptics.notificationAsync(
               Haptics.NotificationFeedbackType.Error
           );
           Alert.alert("Erreur", error.message);
       }
   };

   const pickerItems = [
       { label: 'UTILISATEUR', value: 'USER' },
       { label: 'RESPONSABLE', value: 'CHEF' },
   ];

   return (
       <KeyboardAvoidingView 
           behavior={Platform.OS === "ios" ? "padding" : "height"}
           style={styles.mainContainer}
       >
           <TouchableOpacity
               activeOpacity={1}
               onPress={Keyboard.dismiss}
               style={styles.mainContainer}
           >
               <ScrollView 
                   contentContainerStyle={[
                       styles.scrollViewContent,
                       isKeyboardVisible && { paddingBottom: 300 }
                   ]}
               >
                   <AnimatedForm style={styles.containerFormAddUser}>
                       {Object.entries({
                           firstname: t('first_name'),
                           lastname: t('last_name'),
                           email: t('email'),
                           phone: t('phone'),
                           street: t('street'),
                           city: t('city'),
                           postal_code: t('postal_code'),
                           country: t('country'),
                       }).map(([field, label]) => (
                           <View key={field}>
                               <Text style={[styles.labelUser, { 
                                   color: colors.colorText 
                               }]}>{label}</Text>
                               <TextInput
                                   style={[
                                       styles.userInput,
                                       { 
                                           color: colors.colorText,
                                           borderColor: errors[field] ? 
                                               colors.colorRed : 
                                               currentFocus === field ?
                                                   colors.colorAction :
                                                   colors.colorText
                                       }
                                   ]}
                                   placeholder={label}
                                   placeholderTextColor={colors.colorDetail}
                                   value={newUser[field]}
                                   onChangeText={(value) => 
                                       handleNewUserInputChange(field, value)
                                   }
                                   onFocus={() => {
                                       setCurrentFocus(field);
                                       Haptics.selectionAsync();
                                   }}
                                   onBlur={() => setCurrentFocus(null)}
                                   keyboardType={
                                       field === 'email' ? 'email-address' :
                                       field === 'phone' ? 'phone-pad' :
                                       field === 'postal_code' ? 'numeric' :
                                       'default'
                                   }
                                   autoCapitalize={
                                       field === 'email' ? 'none' : 'words'
                                   }
                               />
                           </View>
                       ))}

                       <Text style={[styles.labelUser, { 
                           color: colors.colorText 
                       }]}>{t('type')}</Text>
                       
                       <RNPickerSelect
                           onValueChange={(value) => {
                               handleNewUserInputChange('type', value);
                               Haptics.selectionAsync();
                           }}
                           items={pickerItems}
                           style={{
                               inputIOS: [styles.userInput, { 
                                   color: colors.colorText,
                                   borderColor: colors.colorText,
                               }],
                               inputAndroid: [styles.userInput, { 
                                   color: colors.colorText,
                                   borderColor: colors.colorText,
                               }],
                               iconContainer: styles.pickerIcon
                           }}
                           useNativeAndroidPickerStyle={false}
                           placeholder={{
                               label: t("user_type"),
                               value: '',
                               color: colors.colorDetail
                           }}
                           value={newUser.type}
                           Icon={() => (
                               <Ionicons 
                                   name="chevron-down"
                                   size={30}
                                   color={colors.colorText}
                                   style={styles.pickerArrow}
                               />
                           )}
                       />

                       <TouchableOpacity 
                           style={[styles.containerButtonAddUser, { 
                               backgroundColor: colors.colorAction,
                               opacity: Object.keys(errors).length > 0 ? 0.7 : 1
                           }]} 
                           onPress={handleAddNewUser}
                       >
                           <Text style={styles.btnAddUser}>{t('add')}</Text>
                       </TouchableOpacity>
                   </AnimatedForm>
               </ScrollView>
           </TouchableOpacity>
       </KeyboardAvoidingView>
   );
};

function useStyles() {
   const { width } = useWindowDimensions();

   return StyleSheet.create({
       mainContainer: {
           flex: 1,
       },
       scrollViewContent: {
           flexGrow: 1,
           paddingBottom: 40,
       },
       containerFormAddUser: {
           paddingTop: 20,
       },
       userInput: {
           borderWidth: 1,
           height: (width > 375) ? 50 : 40,
           borderRadius: 20,
           paddingLeft: 20,
           marginBottom: 20,
           marginHorizontal: 30,
           ...Platform.select({
               ios: {
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 1 },
                   shadowOpacity: 0.2,
                   shadowRadius: 1.41,
               },
               android: {
                   elevation: 2,
               }
           }),
       },
       containerButtonAddUser: {
           height: (width > 375) ? 50 : 40,
           justifyContent: "center",
           alignItems: "center",
           borderRadius: 20,
           marginTop: 20,
           marginHorizontal: 30,
           marginBottom: 20,
           ...Platform.select({
               ios: {
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 2 },
                   shadowOpacity: 0.25,
                   shadowRadius: 3.84,
               },
               android: {
                   elevation: 5,
               }
           }),
       },
       btnAddUser: {
           color: "#fff",
           fontSize: 16,
           fontWeight: '600',
       },
       labelUser: {
           marginLeft: 30,
           fontSize: (width > 375) ? 16 : 13,
           marginBottom: 10,
           fontWeight: '500',
       },
       pickerIcon: {
           position: 'absolute',
           right: 40,
           height: '100%',
           justifyContent: 'center',
           alignItems: 'center',
       },
       pickerArrow: {
           marginRight: 0,
           marginTop: -15,
       }
   });
}

export default AddUser;