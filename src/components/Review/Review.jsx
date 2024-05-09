import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Button } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Review() {
    const [reviews, setReviews] = useState([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [page, setPage] = useState(1);
    const [placeId, setPlaceId] = useState('')

    //Récupération de la place ID
    useEffect(() => {
        const fetchPlaceId = async () => {
            try {
                const user = await AsyncStorage.getItem("user");
                const userObject = JSON.parse(user); 
                const place = userObject.place_id; 
                setPlaceId(place);
            } catch (error) {
                console.error('Erreur lors de la récupération de ref_restaurant depuis le stockage:', error);
            }
        };
        fetchPlaceId();
    }, []);

    //Appel api pour afficher tous les commentaires
    useEffect(() => {
      if (!placeId) {
          return; // Sortir de la fonction si placeId n'est pas défini
      }
  
      const perPage = 10;
      fetch(`http://192.168.1.8/back-website-restaurant-1/services/googlePlacesApp.php?placeId=${placeId}&page=${page}&perPage=${perPage}`)
      .then(response => response.json())
      .then(data => {
          if (data && data.result && data.result.reviews) {
              setReviews(data.result.reviews);
              console.log("Données récupérées de l'API Google Places :", data);
          } else {
              console.error('Les données récupérées sont invalides :', data);
          }
      })
      .catch(error => console.error('Erreur lors de la récupération des avis:', error));
      
  }, [placeId, page]);

    const nextPage = () => {
        setPage(page + 1);
    };

    const prevPage = () => {
        setPage(page - 1);
    };

  return (
    <View style={styles.containerReview}>
      {reviews.length > 0 ? (
        <View style={styles.reviewFull}>
          <ScrollView style={styles.listReview}>
            <View style={styles.containerAllReview}>
              {reviews.map((review, index) => (
                <View key={index} style={styles.review}>
                  <View style={styles.containerReviewTop}>
                    <View style={styles.reviewImageName}>
                      <Image style={styles.imageReview} source={{ uri: review.profile_photo_url }} />
                      <Text style={styles.nameReview}>{review.author_name}</Text>
                    </View>
                    <View style={styles.containerRating}>
                      <Text style={styles.reviewRating}>{review.rating}/5</Text>
                      <Ionicons name="star" size={20} color="orange" marginLeft={10} />
                    </View>
                  </View>
                  <View>
                    <Text style={styles.reviewText}>{review.text}</Text>
                  </View>
                  <Text style={styles.reviewTime}>{review.relative_time_description}</Text>
                </View>
              ))}
                <View style={styles.pagination}>
                    <Button style={styles.btnPagination} onPress={prevPage} title="<" disabled={page === 1} />
                    <Text style={styles.numberPage}>{page}</Text>
                    <Button onPress={nextPage} title=">" />
                </View>
            </View>
          </ScrollView>
        </View>
      ) : (
        <Text>Aucun avis...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  review: {
    backgroundColor: "#27273A",
    padding: 10,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    borderRadius: 15,
    height: "auto",
  },
  nameReview: {
    color: "#fff",
    fontSize: 16
  },
  containerAllReview: {
    marginBottom: 300
  },
  containerReviewTop: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  containerRating: {
    flexDirection: "row",
    gap: 5,
    alignItems: 'center'
  },
  reviewRating: {
    color: "#fff",
    fontSize: 16
  },
  reviewText: {
    color: "#979797",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14
  },
  reviewTime: {
    color: "#fff",
    textAlign: 'right',
    marginBottom: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20
  },
  numberPage:{
    color: "#fff",
    fontSize: 16
  },
  btnPagination:{
    fontSize: 20
  }
});

export default Review;
