import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    })
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = "c3231076-739a-4599-a861-9539f5cdabc6";
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (e) {
            console.error(e);
            alert(`Failed to get push token: ${e.message}`);
            token = null;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}

export async function sendNotification(expoPushToken) {
    const message = {
        to: expoPushToken,
        sound: "default",
        title: "Nouvelle commande !",
        body: "Une nouvelle commande vien d'être passé depuis votre site internet."
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'host': "exp.host",
                'accept': "application/json",
                'accept-encoding': "gzip, deflate",
                'content-type': "application/json"
            },
            body: JSON.stringify(message)
        });

        const data = await response.json();
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}
