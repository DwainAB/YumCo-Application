import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import * as Updates from 'expo-updates';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "../ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from "react-native";
import { useLoading } from "../Hooks/useLoading";
import { Linking } from 'react-native';
import { Appearance, useColorScheme } from 'react-native';
import { supabase } from '../../lib/supabase';
import { API_CONFIG } from '../../config/constants';

function Dashboard() {
   const navigation = useNavigation();
   const [language, setLanguage] = useState(null);
   const [currentTheme, setCurrentTheme] = useState('light');
   const { t } = useTranslation();
   const styles = useStyles();
   const { startLoading, stopLoading } = useLoading();
   const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
   const { colors, setThemeSelected } = useColors();
   const [restaurantId, setRestaurantId] = useState('');
   const [userId, setUserId] = useState('');
   const [userCount, setUserCount] = useState(0);
   const [productCount, setProductCount] = useState(0);
   const colorScheme = useColorScheme();
   const [hasStripeId, setHasStripeId] = useState(false);
   const [userRole, setUserRole] = useState('USER');
   const [tableCount, setTableCount] = useState(0);
   const [onSiteOption, setOnSiteOption] = useState(false);

   useEffect(() => {
    const getLanguageFromStorage = async () => {
        try {
            const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
            const savedTheme = await AsyncStorage.getItem('selectedTheme');
            if (storedLanguage !== null) {
                setLanguage(storedLanguage);
            }
            if (savedTheme) {
                setCurrentTheme(savedTheme);
                setThemeSelected(savedTheme === 'system' ? Appearance.getColorScheme() : savedTheme);
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };
    getLanguageFromStorage();
  }, []);


  useEffect(() => {
    if (colorScheme === 'dark') {
        console.log("test");
    } else {
        console.log("test2");
    }
  }, [colorScheme]);
  

  useEffect(() => {
    const fetchRestaurantData = async () => {
        try {
            const owner = await AsyncStorage.getItem("owner");
            const ownerData = JSON.parse(owner);                
            setRestaurantId(ownerData.restaurantId);
            setUserId(ownerData.id);
            console.log(ownerData.restaurantId);

            // Récupérer les informations du restaurant
            // D'abord vérifier si les données sont dans AsyncStorage
            const restaurantData = await AsyncStorage.getItem("restaurant");
            if (restaurantData) {
                const parsedData = JSON.parse(restaurantData);
                setOnSiteOption(parsedData.on_site_option);
                if (parsedData.stripe_id) {
                    setHasStripeId(true);
                }
            } else {
                // Si les données ne sont pas dans AsyncStorage, les récupérer depuis Supabase
                const { data, error } = await supabase
                    .from('restaurants')
                    .select('stripe_id, on_site_option')
                    .eq('id', ownerData.restaurantId)
                    .single();
                
                if (error) {
                    console.error('Erreur lors de la récupération des données restaurant:', error);
                } else if (data) {
                    setOnSiteOption(data.on_site_option);
                    if (data.stripe_id) {
                        setHasStripeId(true);
                    }
                }
            }

            if (ownerData.id) {
                const { data: roleData, error: roleError } = await supabase
                    .from('roles')
                    .select('type')
                    .eq('owner_id', ownerData.id)
                    .eq('restaurant_id', ownerData.restaurantId)
                    .single();
                
                if (roleError) {
                    console.error('Erreur lors de la récupération du rôle:', roleError);
                } else if (roleData) {
                    setUserRole(roleData.type);
                    console.log('Rôle utilisateur:', roleData.type);
                }
            }

        } catch (error) {
            console.error('Erreur lors de la récupération des informations utilisateur:', error);
        }
    };
    fetchRestaurantData();
}, []);

useEffect(() => {
    const fetchUserCount = async () => {
        if (restaurantId) {
            const { data, error } = await supabase
                .from('roles')
                .select('*', { count: 'exact' })
                .eq('restaurant_id', restaurantId);

            if (error) {
                console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error);
            } else {
                setUserCount(data.length);
            }
        }
    };

    fetchUserCount();
}, [restaurantId]);


useEffect(() => {
    const fetchProductCount = async () => {
        if (restaurantId) {
            const { data, error } = await supabase
                .from('products')
                .select('*', { count: 'exact' })
                .eq('restaurant_id', restaurantId)
                .eq('is_deleted', false);

            if (error) {
                console.error('Erreur lors de la récupération du nombre de produits:', error);
            } else {
                setProductCount(data.length);
            }
        }
    };

    fetchProductCount();
}, [restaurantId]);

useEffect(() => {
    const fetchTableCount = async () => {
        if (restaurantId) {
            const { data, error } = await supabase
                .from('tables')
                .select('*', { count: 'exact' })
                .eq('restaurant_id', restaurantId);

            if (error) {
                console.error('Erreur lors de la récupération du nombre de tables:', error);
            } else {
                setTableCount(data.length);
            }
        }
    };

    fetchTableCount();
}, [restaurantId]);

const handleRelaunchApp = async () => {
    startLoading();
    try {
        // Déconnexion de Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Suppression des données locales
        await AsyncStorage.multiRemove([
            'user',
            'owner',
            'role',
            'session',
            'restaurant'
        ]);

        // Relance de l'application pour revenir à l'état initial
        Updates.reloadAsync();
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    } finally {
        stopLoading();
    }
};

   const openWebsite = async () => {
       try {
           await Linking.openURL('https://yumco.fr/');
       } catch (error) {
           console.error("Erreur ouverture site web:", error);
       }
   };

   const openStripeDashboard = async () => {
    try {
        startLoading();
        const response = await fetch(`${API_CONFIG.SUPABASE_URL}/functions/v1/stripe_generate_dashboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ restaurantId }),
        });
        
        const data = await response.json();
        
        if (data.success && data.dashboard_url) {
            await Linking.openURL(data.dashboard_url);
        } else {
            Alert.alert('Erreur', 'Impossible de générer le tableau de bord Stripe');
        }
    } catch (error) {
        console.error("Erreur lors de l'ouverture du dashboard Stripe:", error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion à Stripe');
    } finally {
        stopLoading();
    }
};

   useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (currentTheme === 'system') {
        setThemeSelected(colorScheme);
      }
    });
  
    return () => subscription.remove();
  }, [currentTheme]);



  const handleThemeChange = async (theme) => {
    try {
        await AsyncStorage.setItem('selectedTheme', theme);
        setCurrentTheme(theme);
        if (theme === 'system') {
            setThemeSelected(Appearance.getColorScheme());
        } else {
            setThemeSelected(theme);
        }
        setIsThemeModalVisible(false);
    } catch (error) {
        console.error("Erreur sauvegarde thème:", error);
    }
  };

  console.log(userId);
  

   const ThemeModal = () => (
       <Modal
           visible={isThemeModalVisible}
           transparent={true}
           animationType="fade"
           onRequestClose={() => setIsThemeModalVisible(false)}
       >
           <TouchableOpacity
               style={styles.modalOverlay}
               activeOpacity={1}
               onPress={() => setIsThemeModalVisible(false)}
           >
               <View style={[styles.modalContent, {backgroundColor: colors.colorBackground}]}>
                   <TouchableOpacity 
                       style={[styles.modalOption, {borderBottomColor: colors.colorBorderAndBlock}]}
                       onPress={() => handleThemeChange('dark')}
                   >
                       <Text style={[styles.modalOptionText, {color: colors.colorText}]}>{t('dark')}</Text>
                   </TouchableOpacity>
                   
                   <TouchableOpacity 
                       style={[styles.modalOption, {borderBottomColor: colors.colorBorderAndBlock}]}
                       onPress={() => handleThemeChange('light')}
                   >
                       <Text style={[styles.modalOptionText, {color: colors.colorText}]}>{t('light')}</Text>
                   </TouchableOpacity>
                   
                   <TouchableOpacity 
                       style={styles.modalOption}
                       onPress={() => handleThemeChange('system')}
                   >
                       <Text style={[styles.modalOptionText, {color: colors.colorText}]}>{t('system')}</Text>
                   </TouchableOpacity>
               </View>
           </TouchableOpacity>
       </Modal>
   );

   return (
       <View style={[styles.container, { backgroundColor: colors.colorBackground }]}>
           {ThemeModal()}
           <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.title, { color: colors.colorText }]}>{t('dashboard')}</Text>
                </View>
                <TouchableOpacity 
                    onPress={handleRelaunchApp}
                    style={[styles.logoutButton, { backgroundColor: colors.colorBorderAndBlock }]}
                >
                    <Icon name="logout" size={24} color={colors.colorText} />
                </TouchableOpacity>
            </View>

           <ScrollView style={styles.content}>
               {/* Section Général */}
               <View style={styles.section}>
                   <Text style={[styles.sectionTitle, { color: colors.colorDetail }]}>
                       <Icon name="cog" size={20} color="#4ECDC4" /> {t('general')}
                   </Text>
                   
                    <View style={{backgroundColor: colors.colorBorderAndBlock, padding: 10, borderRadius: 10}}>
                        <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight }]}
                        onPress={() => navigation.navigate('LanguagePage')}
                        >
                        <View style={styles.menuItemLeft}>
                            <Icon name="web" size={20} color="#6C5CE7" />
                            <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('language')}</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={[styles.menuItemDetail, { color: colors.colorDetail }]}>
                                {language || "Français"}
                            </Text>
                            <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight }]}
                        onPress={() => setIsThemeModalVisible(true)}
                    >
                        <View style={styles.menuItemLeft}>
                            <Icon name="palette" size={20} color="#FF6B6B" />
                            <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('theme')}</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={[styles.menuItemDetail, { color: colors.colorDetail }]}>
                                {currentTheme === 'light' ? t("light") : 
                                currentTheme === 'dark' ? t("dark") : t("system")}
                            </Text>
                            <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight }]}
                        onPress={() => navigation.navigate('SupportScreen')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Icon name="help-circle" size={20} color="#FFD93D" />
                            <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('support')}</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.colorBorderAndBlock, paddingBottom: 10  }]}
                        onPress={openWebsite}
                    >
                        <View style={styles.menuItemLeft}>
                            <Icon name="earth" size={20} color="#4ECDC4" />
                            <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('website')}</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={[styles.menuItemDetail, { color: colors.colorDetail }]}>www.yumco.fr</Text>
                            <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                        </View>
                    </TouchableOpacity>
                    </View>
               </View>

               {/* Section Restaurant */}
               <View style={styles.section}>
                   <Text style={[styles.sectionTitle, { color: colors.colorDetail }]}>
                       <Icon name="store" size={20} color="#FF6B6B" /> {t('my_restaurant')}
                   </Text>

                   <View style={{backgroundColor: colors.colorBorderAndBlock, padding: 10, borderRadius: 10}}>
                        <TouchableOpacity 
                            style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight }]}
                            onPress={() => navigation.navigate('CardOptionScreen')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Icon name="food" size={20} color="#4ECDC4" />
                                <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('cards')}</Text>
                            </View>
                            <View style={styles.menuItemRight}>
                                <Text style={[styles.menuItemDetail, { color: colors.colorDetail }]}>{productCount} {t('products')}</Text>
                                <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                            </View>
                        </TouchableOpacity>

                        {/* Afficher le bouton Table uniquement si on_site_option est true */}
                        {onSiteOption && (
                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight }]}
                                onPress={() => navigation.navigate('TableSetting')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Icon name="silverware-fork-knife" size={20} color="#FF6B6B" />
                                    <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('table')}</Text>
                                </View>
                                <View style={styles.menuItemRight}>
                                <Text style={[styles.menuItemDetail, { color: colors.colorDetail }]}>{tableCount} {tableCount > 1 ? t('tables') : t('table')}</Text>
                                <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                                </View>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                            style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight, paddingBottom: 15 }]}
                            onPress={() => navigation.navigate('UserOptionScreen')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Icon name="account-group" size={20} color="#6C5CE7" />
                                <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('users')}</Text>
                            </View>
                            <View style={styles.menuItemRight}>
                                <Text style={[styles.menuItemDetail, { color: colors.colorDetail }]}>{userCount} {t('active')}</Text>
                                <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                            </View>
                        </TouchableOpacity>
                        {userRole !== 'USER' && (
                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight, paddingBottom: 15  }]}
                                onPress={() => navigation.navigate('InformationScreen')}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Icon name="information" size={20} color="#FFD93D" />
                                    <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('Information')}</Text>
                                </View>
                                <View style={styles.menuItemRight}>
                                    <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                                </View>
                            </TouchableOpacity>
                        )}
                        {hasStripeId && userRole !== 'USER' && (
                            <TouchableOpacity 
                                style={[styles.menuItem, { borderBottomColor: colors.colorBorderAndBlock, paddingBottom: 10  }]}
                                onPress={openStripeDashboard}
                            >
                                <View style={styles.menuItemLeft}>
                                    <Icon name="finance" size={20} color="#00BFA6" />
                                    <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('payment_dashboard')}</Text>
                                </View>
                                <View style={styles.menuItemRight}>
                                    <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                                </View>
                            </TouchableOpacity>
                        )}
                   </View>
                   
               </View>

               {/* Section Sécurité */}
               <View style={styles.section}>
                   <Text style={[styles.sectionTitle, { color: colors.colorDetail }]}>
                       <Icon name="shield-check" size={20} color="#FFD93D" /> {t('security')}
                   </Text>

                   <View style={{backgroundColor: colors.colorBorderAndBlock, padding:10, borderRadius:10}}>
                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomColor: colors.colorDetaillight }]}
                        onPress={() => navigation.navigate('ResetPassword')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Icon name="key" size={20} color="#FF6B6B" />
                            <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('password')}</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { borderBottomWidth: 0, paddingBottom: 10 }]}
                        onPress={() => navigation.navigate('PolityPrivacy')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Icon name="shield-lock" size={20} color="#4ECDC4" />
                            <Text style={[styles.menuItemText, { color: colors.colorText }]}>{t('privacy')}</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Icon name="chevron-right" size={20} color={colors.colorDetail} />
                        </View>
                    </TouchableOpacity>
                   </View>

               </View>
           </ScrollView>
       </View>
   );
}

function useStyles() {
   const { width, height } = useWindowDimensions();

   return StyleSheet.create({
       container: {
           flex: 1,
       },
       header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginTop: height > 750 ? 60 : 40,
            marginBottom: 20,
            position: 'relative',  
       },
       headerTitleContainer: {
            position: 'absolute',  
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
        },
       title: {
           fontSize: width > 375 ? 24 : 20,
           fontWeight: '600',
       },
       logoutButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 'auto',  // Add this to push it to the right
            zIndex: 2,
       },
       content: {
           flex: 1,
           paddingHorizontal: 20,
       },
       section: {
           marginBottom: 30,
       },
       sectionTitle: {
           fontSize: width > 375 ? 18 : 16,
           fontWeight: '600',
           marginBottom: 16,
       },
       menuItem: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           paddingVertical: 16,
           borderBottomWidth: 1,
       },
       menuItemLeft: {
           flexDirection: 'row',
           alignItems: 'center',
           gap: 12,
       },
       menuItemText: {
           fontSize: width > 375 ? 16 : 14,
           fontWeight: '500',
       },
       menuItemRight: {
           flexDirection: 'row',
           alignItems: 'center',
           gap: 8,
       },
       menuItemDetail: {
           fontSize: width > 375 ? 14 : 12,
       },
       modalOverlay: {
           flex: 1,
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
           justifyContent: 'center',
           alignItems: 'center',
       },
       modalContent: {
           width: '80%',
           borderRadius: 12,
           overflow: 'hidden',
       },
       modalOption: {
           paddingVertical: 16,
           paddingHorizontal: 20,
           borderBottomWidth: 1,
       },
       modalOptionText: {
           fontSize: 16,
           textAlign: 'center',
           fontWeight: '500',
       }
   });
}

export default Dashboard;