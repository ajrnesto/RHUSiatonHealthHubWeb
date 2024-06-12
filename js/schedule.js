import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged, getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "../node_modules/firebase/firebase-storage.js";
import { getFirstDayOfWeek, dayMonthFormatter, dayMonthYearFormatter, showModal, hideModal, resetValidation, invalidate, blockNonAdmins, dateFormatter, titleCase } from '../js/utils.js';

// days of week
let dateCursor = new Date();
let tvCalendarDate = document.querySelector('#tvCalendarDate');
const tvSun = document.querySelector('#tvSun');
const tvMon = document.querySelector('#tvMon');
const tvTue = document.querySelector('#tvTue');
const tvWed = document.querySelector('#tvWed');
const tvThu = document.querySelector('#tvThu');
const tvFri = document.querySelector('#tvFri');
const tvSat = document.querySelector('#tvSat');
const btnPrev = document.querySelector('#btnPrev');
const btnNext = document.querySelector('#btnNext');

const selSundayLocation = document.querySelector('#selSundayLocation');
const selMondayLocation = document.querySelector('#selMondayLocation');
const selTuesdayLocation = document.querySelector('#selTuesdayLocation');
const selWednesdayLocation = document.querySelector('#selWednesdayLocation');
const selThursdayLocation = document.querySelector('#selThursdayLocation');
const selFridayLocation = document.querySelector('#selFridayLocation');
const selSaturdayLocation = document.querySelector('#selSaturdayLocation');

const divSunday = document.querySelector('#divSunday');
const divMonday = document.querySelector('#divMonday');
const divTuesday = document.querySelector('#divTuesday');
const divWednesday = document.querySelector('#divWednesday');
const divThursday = document.querySelector('#divThursday');
const divFriday = document.querySelector('#divFriday');
const divSaturday = document.querySelector('#divSaturday');


// appointment modal
const tvAppointmentType = document.querySelector('#tvAppointmentType');
const tvFullName = document.querySelector('#tvFullName');
const tvMobile = document.querySelector('#tvMobile');
const tvEmail = document.querySelector('#tvEmail');
const btnChat = document.querySelector('#btnChat');

// chat modal
const divModalBody = document.querySelector("#divModalBody");
const tvChatTitle = document.querySelector('#tvChatTitle');
const divChatContainer = document.querySelector('#divChatContainer');
const etChatBox = document.querySelector('#etChatBox');
const btnSend = document.querySelector('#btnSend');

onAuthStateChanged(auth, user => {
	blockNonAdmins(user);
});

window.addEventListener("load", function() {
	renderCalendar();
	autosizeTextareas();

	selSundayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(getFirstDayOfWeek(dateCursor));
		const location = selSundayLocation.value;

		updateDoctorLocation(dateCode, location);
	});

	selMondayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(addDays(getFirstDayOfWeek(dateCursor), 1));
		const location = selMondayLocation.value;

		updateDoctorLocation(dateCode, location);
	});

	selTuesdayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(addDays(getFirstDayOfWeek(dateCursor), 2));
		const location = selTuesdayLocation.value;
		
		updateDoctorLocation(dateCode, location);
	});

	selWednesdayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(addDays(getFirstDayOfWeek(dateCursor), 3));
		const location = selWednesdayLocation.value;
		
		updateDoctorLocation(dateCode, location);
	});

	selThursdayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(addDays(getFirstDayOfWeek(dateCursor), 4));
		const location = selThursdayLocation.value;
		
		updateDoctorLocation(dateCode, location);
	});

	selFridayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(addDays(getFirstDayOfWeek(dateCursor), 5));
		const location = selFridayLocation.value;
		
		updateDoctorLocation(dateCode, location);
	});

	selSaturdayLocation.addEventListener('change', event => {
		const dateCode = getDateCode(addDays(getFirstDayOfWeek(dateCursor), 6));
		const location = selSaturdayLocation.value;
		
		updateDoctorLocation(dateCode, location);
	});
});

btnPrev.addEventListener("click", () => {
	dateCursor.setDate(dateCursor.getDate() - 7);
	renderCalendar();
});

btnNext.addEventListener("click", () => {
	dateCursor.setDate(dateCursor.getDate() + 7);
	renderCalendar();
});

function renderCalendar() {
	const startDate = getFirstDayOfWeek(dateCursor);
	const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

	tvCalendarDate.innerHTML = dayMonthYearFormatter(startDate) + " - " + dayMonthYearFormatter(endDate);

	tvSun.innerHTML = dayMonthFormatter(addDays(startDate, 0));
	tvMon.innerHTML = dayMonthFormatter(addDays(startDate, 1));
	tvTue.innerHTML = dayMonthFormatter(addDays(startDate, 2));
	tvWed.innerHTML = dayMonthFormatter(addDays(startDate, 3));
	tvThu.innerHTML = dayMonthFormatter(addDays(startDate, 4));
	tvFri.innerHTML = dayMonthFormatter(addDays(startDate, 5));
	tvSat.innerHTML = dayMonthFormatter(addDays(startDate, 6));

	for (let i = 0; i < 7; i++) {
		const scheduleRef = doc(db, "doctorSchedule", getDateCode(addDays(startDate, i)));

		onSnapshot(scheduleRef, (snap) => {
			renderScheduleHours(snap, i);
		});
	}
}

function renderScheduleHours(snap, index) {
	const arrWeekDivs = [divSunday, divMonday, divTuesday, divWednesday, divThursday, divFriday, divSaturday];
	const arrSelects = [selSundayLocation, selMondayLocation, selTuesdayLocation, selWednesdayLocation, selThursdayLocation, selFridayLocation, selSaturdayLocation];

	if (snap.exists()) {
		arrSelects[index].value = snap.data().location;
		arrWeekDivs[index].innerHTML = "";
		const hours = snap.data().hours;

		hours.forEach(hourBooking => {
			if (hourBooking.status == "OPEN") {
				const btn = document.createElement('button');
				btn.type = "button";
				btn.classList = "btn btn-white border-white col-12 mb-2 text-success fw-medium";
				btn.disabled = true;
				btn.innerHTML = "Opened";
				
				arrWeekDivs[index].append(btn);
			}
			else if (hourBooking.status == "BOOKED") {
				const btn = document.createElement('button');
				btn.type = "button";
				btn.classList = "btn btn-primary col-12 mb-2";
				btn.innerHTML = "Booked";

				btn.onclick = function() {
					viewAppointment(hourBooking.bookingUid, hourBooking.userUid);
				}
				
				arrWeekDivs[index].append(btn);
			}
		});
	}
	else {
		arrSelects[index].value = "Closed";
		arrWeekDivs[index].innerHTML = "";

		const btn = document.createElement('button');
		btn.type = "button";
		btn.classList = "btn btn-white border-white col-12 mb-2";
		btn.disabled = true;
		btn.innerHTML = "Closed";

		for (let i = 0; i < 8; i++) {
			arrWeekDivs[index].append(btn.cloneNode(true));
		}
	}
}

function updateDoctorLocation(dateCode, location) {
	const scheduleRef = doc(db, "doctorSchedule", dateCode);

	getDoc(scheduleRef).then((snap) => {
		if (snap.exists()) {
			if (location != "Closed") {
				updateDoc(scheduleRef, {
					location: location
				});
			}
			else if (location == "Closed") {
				const hours = snap.data().hours;
				for (let i = 0; i < 8; i++) {
					const bookingUid = hours[i].bookingUid;

					if (bookingUid != "") {
						deleteDoc(doc(db, "appointments", bookingUid));
					}
					deleteDoc(doc(db, "doctorSchedule", dateCode));
				}
			}
		}
		else {
			const hours = [{status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}, {status: "OPEN", userUid: "", bookingUid: ""}]
			setDoc(scheduleRef, {
				location: location,
				hours: hours
			});
		}
	});
}
 
function viewAppointment(bookingUid, userUid) {
	const qry = query(collection(db, "appointments"), where("uid", "==", bookingUid), where("userUid", "==", userUid));
	
	getDocs(qry).then((snaps) => {
		const appointment = snaps.docs[0].data();

		getDoc(doc(db, "users", userUid)).then((snap) => {
			const user = snap.data();

			tvFullName.innerHTML = user.firstName + " " + user.middleName[0] + ". " + user.lastName;
			tvMobile.innerHTML = user.mobile;
			tvEmail.innerHTML = user.email;
		});
		
		tvAppointmentType.innerHTML = appointment.appointmentType;
		
		showModal('#modalViewAppointment');
		btnChat.onclick = function() {
			hideModal('#modalViewAppointment');
			loadChat(userUid);
		}
	});
}

function loadChat(userUid) {
	showModal('#modalChat');

	const refPatientName = doc(db, "users", userUid);

	getDoc(refPatientName).then((patient) => {
		tvChatTitle.innerHTML = titleCase(patient.data().firstName + " " + patient.data().lastName);
	});

	const qryChat = query(collection(db, "chats", userUid, "chats"), orderBy("timestamp", "asc"));

	onSnapshot(qryChat, (docSnapshots) => {
		divChatContainer.innerHTML = "";

		docSnapshots.forEach((chat) => {
			const chatBubble = document.createElement("div");
			const chatMessage = document.createElement("span");

			chatMessage.innerHTML = chat.data().message;

			chatBubble.className = "col-12";
			chatMessage.className = "rounded p-2";

			// if currently signed in user is the author of this message:
			if (chat.data().authorUid == getAuth().currentUser.uid) {
				chatBubble.classList.toggle("text-end", true);
				chatMessage.classList.toggle("bg-primary", true);
				chatMessage.classList.toggle("text-white", true);
			}
			else {
				chatBubble.classList.toggle("text-start", true);
				chatMessage.classList.toggle("bg-secondary", true);
				chatMessage.classList.toggle("text-dark", true);
			}

			chatBubble.append(chatMessage);
			divChatContainer.append(chatBubble);
		});

		divModalBody.scrollTo(0, divModalBody.scrollHeight);
	});
	
	btnSend.onclick = function() {
		const refNewChat = doc(collection(db, "chats", userUid, "chats"));

		const newChatData = {
			id: refNewChat.id,
			authorUid: getAuth().currentUser.uid,
			message: etChatBox.value,
			timestamp: Date.now()
		}

		setDoc(refNewChat, newChatData);
		etChatBox.value = "";
		etChatBox.style.height = "1px";
	}
}

function addDays(date, n) {
	return new Date(date.getTime() + (n * 24 * 60 * 60 * 1000));
}

function getDateCode(date) {
	return date.getFullYear() + "" + (((date.getMonth()+1)<10)?"0"+(date.getMonth()+1):date.getMonth()+1) + "" + ((date.getDate()<10)?"0"+date.getDate():date.getDate());
}

function autosizeTextareas() {
	const txHeight = 25;
	const tx = document.getElementsByTagName("textarea");

	for (let i = 0; i < tx.length; i++) {
		if (tx[i].value == '') {
			tx[i].setAttribute("style", "height:" + txHeight + "px;overflow-y:hidden;");
		}
		else {
			tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		}
		tx[i].addEventListener("input", OnInput, false);
	}

	function OnInput(e) {
		this.style.height = 0;
		this.style.overflow = "auto";

		if (this.scrollHeight <= 132) {
			this.style.height = (this.scrollHeight) + "px";
		}
		else {
			this.style.height = "132px";
		}
	}
}