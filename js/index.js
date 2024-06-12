import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { auth } from '../js/firebase.js';
import { authenticate } from '../js/utils.js';

onAuthStateChanged(auth, user => {
	console.log(user);
  authenticate(user);
});