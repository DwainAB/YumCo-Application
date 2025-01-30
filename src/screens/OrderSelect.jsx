import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRoute } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../components/ColorContext/ColorContext";
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWindowDimensions } from "react-native";


function OrderSelect() {
const navigation = useNavigation();
const { colors } = useColors()
const route = useRoute();
const { order } = route.params;
const { t } = useTranslation();
const [nameRestaurant, setNameRestaurant] = useState('')
const styles = useStyles()
const [selectedComment, setSelectedComment] = useState(null);
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmYnljdHFodmZndWR1amdkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc0MDIsImV4cCI6MjA1MTQzMzQwMn0.9g3N_aV4M5UWGYCuCLXgFnVjdDxIEm7TJqFzIk0r2Ho"

const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00 €';
  return `${Number(price).toFixed(2)} €`;
};


useEffect(() => {
  const fetchRefRestaurant = async () => {
      try {
          const user = await AsyncStorage.getItem("user");
          const userObject = JSON.parse(user);
          const nameRestaurant = userObject.ref_restaurant;
          setNameRestaurant(nameRestaurant);
      } catch (error) {
          console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
      }
  };
  fetchRefRestaurant();
}, []);


const calculateAndFormatTotalPrice = (order) => {
  let totalPrice = 0;
  order.orders.forEach((product) => {
      totalPrice += product.product_price * product.order_quantity;
  });

  if (typeof totalPrice !== 'number' || isNaN(totalPrice)) {
      return 'Prix invalide';
  }

  const roundedPrice = Math.round(totalPrice * 100) / 100;
  return roundedPrice.toFixed(2);
};


const handleDelete = async () => {
try {
  const updateResponse = await fetch('https://hfbyctqhvfgudujgdgqp.supabase.co/functions/v1/updateOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      order_id: order.order_id,
      new_status: "COMPLETED"
    })
  });

  if (!updateResponse.ok) {
    throw new Error('Erreur lors de la mise à jour du statut');
  }

  alert(t('alertDeleteOrder'));
  navigation.goBack();
} catch (error) {
  console.error('Erreur lors de la mise à jour du statut:', error);
  alert('Erreur lors de la mise à jour de la commande');
}
};


return (
  <View style={[styles.containerOrderSelect, {backgroundColor: colors.colorBackground}]}>
    <View style={styles.containerHeader}>
        <TouchableOpacity onPress={() => navigation.navigate("BasketScreen")} style={[styles.containerBtnBack, {backgroundColor: colors.colorBorderAndBlock}]}><Ionicons name="chevron-back-outline" style={{color: colors.colorText, fontSize: 30}}/></TouchableOpacity>
        <Text style={[styles.textHeader, {color: colors.colorText}]}>{order.client_ref_order}</Text>
    </View>

    <View style={[styles.line, {borderColor: colors.colorDetail}]}></View>

    <ScrollView>
      <View style={[styles.containerTicketOrder, {backgroundColor: colors.colorBorderAndBlock}]}>
       
        <Text style={[styles.textMethod, { color: colors.colorDetail, textAlign: "center"}]}>{order.client_method === "Livraison" ? t('delivery') : order.client_method === "A emporter" ? t('takeaway') : order.client_method}</Text>
        <Text style={[styles.textPaymentStatus, { 
            color: order.payment_status === "PAID" ? colors.colorAction : colors.colorRed, 
            textAlign: "center"
          }]}>
            {order.payment_status === "PAID" ? t('paid') : t('unpaid')}
          </Text>
          
          <Text style={[styles.textPayment, { color: colors.colorDetail, textAlign: "center"}]}>
            {order.client_payment === "Espèces" ? t('cash') : order.client_payment === "Carte bancaire" ? t('creditCard') : order.client_payment}
          </Text>

        <View style={[styles.circleLeft, {backgroundColor: colors.colorBackground}]}></View>
        <View style={[styles.circleRight, {backgroundColor: colors.colorBackground}]}></View>
        <View style={styles.ContainerLineTicket}>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
          <Text style={{fontSize: 30, color: colors.colorDetail, overflow: 'hidden', textAlign:'center'}}>-</Text>
        </View>

        <View style={styles.containerProducts}>
            {order.orders.map((product, index) => (
              <View key={`${product.id}-${index}`}>
                <TouchableOpacity 
                  style={[
                    styles.productCard,
                    {backgroundColor: colors.colorBorderAndBlock}
                  ]}
                  onPress={() => product.comment ? setSelectedComment(selectedComment === product.id ? null : product.id) : null}
                >
                  <View style={styles.productMainInfo}>
                    <Text style={[styles.quantityBadge, {backgroundColor: colors.colorAction}]}>
                      x{product.order_quantity}
                    </Text>
                    <View style={styles.productDetails}>
                      <Text style={[styles.titleProduct, {color: colors.colorText}]}>
                        {product.product_title}
                      </Text>
                      <Text style={[styles.subtotalText, {color: colors.colorDetail}]}>
                        {formatPrice(product.subtotal)}
                      </Text>
                    </View>
                  </View>
                  
                  {product.comment && (
                    <>
                      <View style={styles.commentIndicator}>
                        <Ionicons 
                          name={selectedComment === product.id ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={colors.colorAction}
                        />
                        <Text style={[styles.commentHint, {color: colors.colorDetail}]}>
                          {t('productComment')}
                        </Text>
                      </View>
                      
                      {selectedComment === product.id && (
                        <View style={styles.commentContent}>
                          <View style={[styles.commentDivider, {backgroundColor: colors.colorDetail}]} />
                          <Text style={[styles.commentText, {color: colors.colorText}]}>
                            {product.comment}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
        </View>

        <View style={styles.containerEmpty}></View>
        <Text style={[styles.textLeft, {color: colors.colorText}]}>{t('total')}</Text>
        <Text style={[styles.textRight, {color: colors.colorRed}]}>{calculateAndFormatTotalPrice(order)} €</Text>
      </View>

      <View style={[styles.containerCommentClient, {backgroundColor: colors.colorBorderAndBlock}]}>
        <Text style={[styles.commentTitle, {color: colors.colorDetail}]}>{t('comment')}</Text>
        <View style={styles.commentContentContainer}>
          <View style={[styles.commentLine, {backgroundColor: colors.colorDetail}]} />
          <Text style={[styles.commentText, {color: colors.colorText}]}>
            {order.order_comment ? order.order_comment : "Aucun commentaire"}
          </Text>
        </View>
      </View>

      <View style={[styles.containerInfoClient, {backgroundColor: colors.colorBorderAndBlock}]}>
        <Text style={[styles.infoClient, {color: colors.colorDetail}]}>{t('lastname')} : <Text style={[styles.textInfoClient, {color: colors.colorText}]}>{order.client_lastname}</Text></Text>
        <Text style={[styles.infoClient, {color: colors.colorDetail}]}>{t('firstname')} : <Text style={{color: colors.colorText}}>{order.client_firstname}</Text></Text>
        <Text style={[styles.infoClient, {color: colors.colorDetail}]}>{t('phoneNumber')} : <Text style={{color: colors.colorText}}>{order.client_phone}</Text></Text>
        <Text style={[styles.infoClient, {color: colors.colorDetail}]}>{t('email')} : <Text style={{color: colors.colorText}}>{order.client_email}</Text></Text>
        <Text style={[styles.infoClient, {color: colors.colorDetail}]}>{t('address')} : <Text style={{color: colors.colorText}}>{order.client_address}</Text></Text>
      </View>

      <TouchableOpacity onPress={()=> handleDelete(order.client_id, order.client_ref_order, order.client_lastname, order.client_firstname, order.client_email,order.client_method,nameRestaurant)} style={[styles.btnDelete, {backgroundColor: colors.colorAction}]}>
        <Text style={[styles.textBtnDelete, {color: colors.colorText}]}>{t('finish')}</Text>
      </TouchableOpacity>

    </ScrollView>
  </View>
);
}


function useStyles(){
const {width, height} = useWindowDimensions();
const { colors } = useColors()

return StyleSheet.create({
  containerOrderSelect:{
    height: "100%",
  },
  containerHeader:{
    flexDirection:"row",
    marginTop : (width > 375) ? 60 : 40,
    paddingRight: 35,
    paddingLeft : 35,
    alignItems:'center',
  },
  textHeader:{
    fontSize:(width > 375) ? 22 : 18,
    color: "white",
    marginLeft: 20,
    fontWeight: "bold"
  },
  containerBtnBack:{
    height:(width > 375) ? 45 : 35,
    width: (width > 375) ? 45 : 35,
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#1E1E2D",
    justifyContent: "center",
  },
  containerEmpty:{
    width: "10%",
  },
  textMethod:{
    fontSize:(width > 375) ? 20 : 18,
  },
  textPayment:{
    fontSize:(width > 375) ? 15 : 13,
    marginBottom: (width > 375) ? 30 : 15
  },
  line:{
    borderWidth:1,
    marginLeft: 30,
    marginRight:30,
    borderColor: "#232533",
    marginTop: (width > 375) ? 40 : 20,
    marginBottom: 40
  },
  containerTicketOrder:{
    marginHorizontal: 30, 
    height: 'auto',
    borderRadius: 15,
    position: "relative",
    paddingTop: 10
  },
  circleLeft:{
    position: "absolute", 
    left: -15, 
    borderRadius: 15,
    height: 30,
    width: 30,
    bottom: 100,
    zIndex: 999
  },
  circleRight:{
    position: "absolute", 
    right: -15, 
    borderRadius: 15,
    height: 30,
    width: 30,
    bottom: 100,
    zIndex: 999
  },
  ContainerLineTicket:{
    position: "absolute",
    bottom: 100,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  test:{
    fontSize: 30,
    alignItems: "flex-end"
  }, 
  textLeft:{
    fontSize: (width > 375) ? 25 : 20,
    fontWeight: "600",
    marginBottom: 30,
    position: "absolute",
    bottom: 0,
    left: 30
  },
  textRight:{
    fontSize: (width > 375) ? 25 : 20,
    fontWeight: "600",
    marginBottom: 30,
    position: "absolute",
    bottom: 0,
    right: 30
  },
  titleProduct:{
    fontSize: 16,
    fontWeight: '500'
  },
  quantityProduct:{
    fontSize: 16
  },
  productInfo:{
    marginLeft: 20,
    marginTop: 10
  },
  containerProducts:{
    height: "auto",
    overflow: "hidden",
  },
  containerEmpty:{
    height: 150
  },
  containerInfoClient:{
    marginLeft: 30,
    marginRight: 30,
    marginTop: 35,
    padding: 15,
    borderRadius: 15,
    gap:5
  },
  infoClient:{
    fontSize: (width > 375) ? 16 : 13,
    fontWeight: '500'
  },
  textInfoClient:{
    fontSize: (width > 375) ? 16 : 13,
  },
  btnDelete:{
    marginHorizontal: 30,
    paddingTop: (width > 375) ? 15 : 10,
    paddingBottom: (width > 375) ? 15 : 10,
    borderRadius: 15,
    marginTop: 35,
    marginBottom: 100
  },
  textBtnDelete:{
    fontSize: (width > 375) ? 18 : 16,
    fontWeight: "500",
    textAlign: 'center'
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  commentIcon: {
    padding: 5,
  },
  commentContainer: {
    marginLeft: 40,
    marginRight: 20,
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.colorAction,
  },
  commentText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  productCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  productMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  titleProduct: {
    fontSize: width > 375 ? 16 : 14,
    fontWeight: '500',
    flex: 1,
  },
  commentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  commentHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  commentContent: {
    marginTop: 8,
  },
  commentDivider: {
    height: 1,
    opacity: 0.2,
    marginVertical: 8,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  containerCommentClient: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 35,
    padding: 20,
    borderRadius: 15,
  },
  commentTitle: {
    fontSize: (width > 375) ? 18 : 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentContentContainer: {
    backgroundColor: colors.colorBackground,
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
  },
  commentLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  commentText: {
    fontSize: (width > 375) ? 15 : 13,
    lineHeight: (width > 375) ? 22 : 20,
    fontWeight: '400',
  }
  
  });
  
}

export default OrderSelect;
