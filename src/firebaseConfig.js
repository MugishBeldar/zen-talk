import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
 
// Initialize Firebase
const app = initializeApp ({
    apiKey: "AIzaSyCdkhlRAqUIO-wQAy7HsFOaSsfJphA84ic",
    authDomain: "talkwave-24b6d.firebaseapp.com",
    projectId: "talkwave-24b6d",
    storageBucket: "talkwave-24b6d.appspot.com",
    messagingSenderId: "686992749920",
    appId: "1:686992749920:web:38f4dd8fd750f8d0185a05",
    measurementId: "G-5DKZLJCZF0",
});
 
// Firebase storage reference
const storage = getStorage(app);
export default storage;