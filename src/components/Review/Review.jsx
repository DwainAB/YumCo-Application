import {react, useEffect, useState} from "react";
import {View, Text, StyleSheet, Image, ScrollView} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"


function Review(){

    const [reviews, setReviews] = useState([])

    useEffect(() => {
        // ID de Place et clé API (remplacez par vos propres valeurs)
        const placeId = 'ChIJE9HLgd0S5kcRjqY585LUGjg'; 
        const apiKey = 'AIzaSyBWCVfz4hi__lsl5xctq5O1D90VCezfzP4'; 

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;


        fetch('https://cross-ply-dominion.000webhostapp.com/services/googlePlacesProxy.php?placeId=ChIJE9HLgd0S5kcRjqY585LUGjg')
        .then(response => response.json())
        .then(data => {
            setReviews(data.result.reviews)
            console.log("Données récupérées de l'API Google Places :", data);
            // ... (traitement des données)
        })
        .catch(error => console.error('Erreur lors de la récupération des avis:', error));
    
    }, []); // Le tableau vide [] assure que l'effet s'exécute une seule fois après le premier rendu


    console.log(reviews);
    return(
        <View style={styles.containerReview}>
            {reviews.length > 0 ? (
                <View style={styles.reviewFull}>
                    <Text style={styles.titleReview}>Avis des clients</Text>
                    <ScrollView horizontal={true} style={styles.listReview}>
                        {reviews.map((review, index) => (

                            <View key={index} style={styles.review}>
                                <View style={styles.containerReviewTop}>
                                    <View style={styles.reviewImageName}>
                                        <Image style={styles.imageReview} source={{ uri : review.profile_photo_url}}/>
                                        <Text style={styles.nameReview}>{review.author_name}</Text>
                                    </View>
                                    <View style={styles.containerRating}>
                                        <Text style={styles.reviewRating}>{review.rating}/5</Text>
                                        <Ionicons name="star" size={20} color="orange" marginLeft={10}/>
                                    </View>
                                </View>
                                <View style={styles.reviewText}>
                                    <Text>{review.text}</Text>
                                </View>
                                <Text style={styles.reviewTime}>{review.relative_time_description}</Text>
                            </View>

                        ))}
                    </ScrollView>
                </View>
            ) : (
                <Text>Rien</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    containerReview:{
        width: "100%",
        marginBottom : 50
    },
    reviewFull:{
        width:"100%",
    },
    titleReview:{
        textAlign: "center",
        marginTop: 70,
        fontSize: 30,
    },
    listReview:{
        display: "flex",
        flexDirection: "row",
        width:"100%"
    },
    review: {
        backgroundColor: "#dcdcdc",
        marginLeft: 20,
        width: 300, 
        marginTop : 20,
        padding: 20,
        borderRadius: 20,
    },
    containerReviewTop:{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        flexDirection: "row",
        alignItems: "center", 
        marginBottom: 10, 
    },
    reviewImageName:{
        display: "flex",
        width: "50%",
        flexDirection: "row",
        alignItems: "center"
    },
    imageReview:{
        width:30,
        height: 30,
        marginRight: 10
    }, 
    reviewTime:{
        fontWeight: "700",
        marginTop: 10, 
        textAlign : "right"
    },
    nameReview: {
        fontWeight : "700"
    },
    containerRating:{
        display: "flex",
        alignItems: "center",
        flexDirection: "row"
    }

})

export  default Review;