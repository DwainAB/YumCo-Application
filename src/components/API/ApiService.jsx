const BASE_URL = 'http://192.168.1.8/back-website-restaurant-1/api'; 

export const apiService = {

    getFoods: async ($ref_restaurant) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/${$ref_restaurant}`);
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    addFood: async (foodData) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/add`, {
                method: 'POST',
                body: foodData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const responseData = await response.text();
            return responseData;
        } catch (error) {
            throw error;
        }
    },
    
    

    updateFood: async (id, foodData) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/update/${id}`, {
                method: 'POST', // Si vous changez cela en PUT, assurez-vous que votre serveur le supporte
                body: foodData, // foodData devrait être un objet FormData
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteFood: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/delete/${id}`, {
                method: 'DELETE',
            });
            // Vérifier si la réponse est un succès
            if (response.status === 204) {
                return { success: true }; // Retourner un objet indiquant le succès
            } else {
                // S'il y a une autre réponse, analyser le JSON comme d'habitude
                return await response.json();
            }
        } catch (error) {
            throw error;
        }
    },
    

    addClientAndOrder: async (clientData) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/addClientAndOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData),
            });
            const responseBody = await response.text();
            console.log('Réponse brute:', responseBody);
        
            // Vérifiez que la réponse n'est pas vide avant de la convertir en JSON
            if (!responseBody || !responseBody.startsWith('{')) {
                throw new Error('La réponse du serveur n\'est pas un JSON valide');
            }
        
            const responseJson = JSON.parse(responseBody);
            console.log('Réponse JSON:', responseJson);
            return responseJson;
        } catch (error) {
            throw error;
        }
    },

    getAllOrdersAndClients: async (refRestaurant) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/orders/${refRestaurant}`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    getAllOrdersAndClientsData: async (refRestaurant) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/ordersdata/${refRestaurant}`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteClient: async (clientId) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/deleteClient/${clientId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteClient: async (clientId) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/deleteClientdata/${clientId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    addCategory: async (formData) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/addCategory`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    },
    

    getAllCategories: async (ref_restaurant) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/categories/${ref_restaurant}`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    deleteCategory: async (categoryId) => {
        try {
            const response = await fetch(`${BASE_URL}/foods/categories/delete/${categoryId}`, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    

    login: async (credentials) => {
        try {
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    // Ajouter un utilisateur
    addUser: async (formData) => {
        try {
            const response = await fetch(`${BASE_URL}/users/addUsers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: formData, // Utilisation directe du corps de la requête sans JSON.stringify
            });


            if (!response.ok) {
                throw new Error(`HTTP status code: ${response.status}`);
            }
    
            const responseData = await response.json();
    
            if (response.ok) {
                console.log('Utilisateur ajouté avec succès', responseData.message);
                return responseData; // Retourner les données de la réponse
            } else {
                console.error('Erreur lors de l\'ajout de l\'utilisateur:', responseData.message);
                throw new Error(responseData.message); // Lancer une erreur pour la gérer dans le composant
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi à l\'API2:', error.message);
            throw error;
        }
    },
    
    
    
    
    

    // Supprimer un utilisateur
    deleteUser: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/users/delete/${id}`, {
                method: 'DELETE',
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour un utilisateur
// Dans apiService
updateUser: async (id, userData) => {
    try {
        const response = await fetch(`${BASE_URL}/users/update/${id}`, {
            method: 'POST',
            body: userData, // userData est un objet FormData
        });
        return response; // Ici, nous retournons directement l'objet Response.
    } catch (error) {
        console.error('Erreur lors de la connexion à l\'API', error);
        throw error; // Propager l'erreur pour la gérer dans le composant.
    }
},

    


    // Récupérer tous les utilisateurs
    getAllUsers: async (refRestaurant) => {
        try {
            const response = await fetch(`${BASE_URL}/users/${refRestaurant}`);
            if (!response.ok) {
                throw new Error(`HTTP status code: ${response.status}`);
            }
            const responseData = await response.json();
            console.log('Utilisateurs récupérés avec succès', responseData);
            return responseData;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error.message);
            throw error;
        }
    },
    

    // Récupérer un utilisateur par son ID
    getUserById: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/users/getUser/${id}`, {
                method: 'GET',
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

};