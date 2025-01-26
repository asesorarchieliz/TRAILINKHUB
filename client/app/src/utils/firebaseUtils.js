import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB2jldjjKxTKopeP3n2OrZdXWc_6-BS794",
    authDomain: "reactwebsitexx-126f6.firebaseapp.com",
    projectId: "reactwebsitexx-126f6",
    storageBucket: "reactwebsitexx-126f6.appspot.com",
    messagingSenderId: "800042128753",
    appId: "1:800042128753:web:342e773c74317f205c52d0",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };