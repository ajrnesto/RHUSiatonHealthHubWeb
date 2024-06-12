import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged, getAuth} from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, onSnapshot, or, and, getDocs, setDoc, updateDoc, deleteDoc, increment, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL } from "../node_modules/firebase/firebase-storage.js";
import { getFirstDayOfWeek, dayMonthFormatter, dayMonthYearFormatter, parseButtonAction, dateFormatter, showModal, titleCase, invalidate, resetValidation, hideModal } from '../js/utils.js';

// chips
const btnAppointmentsToday = document.querySelector("#btnAppointmentsToday");
const btnUpcoming = document.querySelector("#btnUpcoming");
const btnCompleted = document.querySelector("#btnCompleted");
const btnMissed = document.querySelector("#btnMissed");
const btnDeclined = document.querySelector("#btnDeclined");

const appointmentsContainer = document.querySelector("#appointmentsContainer");
const etPatientId = document.querySelector("#etPatientId");
const btnSearch = document.querySelector("#btnSearch");
const btnClearFilter = document.querySelector("#btnClearFilter");

// chat
const divChatContainer = document.querySelector("#divChatContainer");
const tvChatTitle = document.querySelector("#tvChatTitle");

// add medical entry
const tvBloodPressure = document.querySelector("#tvBloodPressure");
const tvRespiratoryRate = document.querySelector("#tvRespiratoryRate");
const tvBodyTemperature = document.querySelector("#tvBodyTemperature");
const tvPulseRate = document.querySelector("#tvPulseRate");
const tvO2SAT = document.querySelector("#tvO2SAT");
const tvHeight = document.querySelector("#tvHeight");
const tvWeight = document.querySelector("#tvWeight");
const tvChiefComplaint = document.querySelector("#tvChiefComplaint");
const tvDiagnosis = document.querySelector("#tvDiagnosis");
const tvMedications = document.querySelector("#tvMedications");
const tvTreatmentPlan = document.querySelector("#tvTreatmentPlan");
const btnAddMedicalEntry = document.querySelector("#btnAddMedicalEntry");

const tvChiefComplaintValidator = document.querySelectorAll(".chief-complaint-validator");
const tvDiagnosisValidator = document.querySelectorAll(".diagnosis-validator");
const tvMedicationsValidator = document.querySelectorAll(".medications-validator");
const tvTreatmentPlanValidator = document.querySelectorAll(".treatment-plan-validator");

// doctor name
const etDoctorName = document.querySelector("#etDoctorName");
const btnSaveDoctorName = document.querySelector("#btnSaveDoctorName");

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

etDoctorName.addEventListener("input", function() {
	btnSaveDoctorName.classList.toggle("disabled", false);

	if (etDoctorName.value == "") {
		btnSaveDoctorName.classList.toggle("disabled", true);
	}
});

btnSaveDoctorName.addEventListener("click", function() {
	const refDoctorName = doc(db, "doctorName", "doctorName");
	const updateData = {doctorName: etDoctorName.value}

	updateDoc(refDoctorName, updateData).then(() => {
		btnSaveDoctorName.classList.toggle("disabled", true);
	});
});

window.addEventListener("load", function() {
	getDoc(doc(db, "doctorName", "doctorName")).then((snap) => {
		etDoctorName.value = snap.data().doctorName;
	});

	renderCalendar();
	etPatientId.value = new URL(window.location.href).searchParams.get("id");
	getAppointmentsData();
	btnAppointmentsToday.style.color = "white";
	autosizeTextareas();

	selSundayLocation.addEventListener('change', event => {
		const date = getFirstDayOfWeek(dateCursor);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selSundayLocation.value;

		updateDoctorLocation(date, dateCode, location);
	});

	selMondayLocation.addEventListener('change', event => {
		const date = addDays(getFirstDayOfWeek(dateCursor), 1);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selMondayLocation.value;

		updateDoctorLocation(date, dateCode, location);
	});

	selTuesdayLocation.addEventListener('change', event => {
		const date = addDays(getFirstDayOfWeek(dateCursor), 2);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selTuesdayLocation.value;
		
		updateDoctorLocation(date, dateCode, location);
	});

	selWednesdayLocation.addEventListener('change', event => {
		const date = addDays(getFirstDayOfWeek(dateCursor), 3);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selWednesdayLocation.value;
		
		updateDoctorLocation(date, dateCode, location);
	});

	selThursdayLocation.addEventListener('change', event => {
		const date = addDays(getFirstDayOfWeek(dateCursor), 4);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selThursdayLocation.value;
		
		updateDoctorLocation(date, dateCode, location);
	});

	selFridayLocation.addEventListener('change', event => {
		const date = addDays(getFirstDayOfWeek(dateCursor), 5);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selFridayLocation.value;
		
		updateDoctorLocation(date, dateCode, location);
	});

	selSaturdayLocation.addEventListener('change', event => {
		const date = addDays(getFirstDayOfWeek(dateCursor), 6);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		const dateCode = getDateCode(date);
		const location = selSaturdayLocation.value;
		
		updateDoctorLocation(date, dateCode, location);
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

btnAppointmentsToday.addEventListener("click", function() {
	getAppointmentsData();
	btnAppointmentsToday.style.color = "white";
	btnUpcoming.style.color = "#6AD27D";
	btnCompleted.style.color = "#6AD27D";
	btnMissed.style.color = "#6AD27D";
	btnDeclined.style.color = "#A22C29";
});

btnUpcoming.addEventListener("click", function() {
	getAppointmentsData();
	btnAppointmentsToday.style.color = "#A22C29";
	btnUpcoming.style.color = "white";
	btnCompleted.style.color = "#A22C29";
	btnMissed.style.color = "#A22C29";
	btnDeclined.style.color = "#A22C29";
});

btnCompleted.addEventListener("click", function() {
	getAppointmentsData();
	btnAppointmentsToday.style.color = "#A22C29";
	btnUpcoming.style.color = "#A22C29";
	btnCompleted.style.color = "white";
	btnMissed.style.color = "#A22C29";
	btnDeclined.style.color = "#A22C29";
});

btnMissed.addEventListener("click", function() {
	getAppointmentsData();
	btnAppointmentsToday.style.color = "#A22C29";
	btnUpcoming.style.color = "#A22C29";
	btnCompleted.style.color = "#A22C29";
	btnMissed.style.color = "white";
	btnDeclined.style.color = "#A22C29";
});

btnDeclined.addEventListener("click", function() {
	getAppointmentsData();
	btnAppointmentsToday.style.color = "#A22C29";
	btnUpcoming.style.color = "#A22C29";
	btnCompleted.style.color = "#A22C29";
	btnMissed.style.color = "#A22C29";
	btnDeclined.style.color = "white";
});

btnSearch.addEventListener("click", function(){
	getAppointmentsData();
});

btnClearFilter.addEventListener("click", function(){
	etPatientId.value = "";
	getAppointmentsData();
});

function getAppointmentsData() {
	const patientId = etPatientId.value;

	// const today12AM = new Date().setHours(0,0,0,0);
	const now = new Date().getTime();
	const tomorrow12AM = new Date().setHours(24,0,0,0);
	
	let qryAppointments = null;

	if (!patientId) {
		if (btnAppointmentsToday.checked) {
			qryAppointments = query(collection(db, "appointments"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now), orderBy("schedule", "desc"));
		}
		else if (btnUpcoming.checked) {
			qryAppointments = query(collection(db, "appointments"), and(or(where("status", "==", "Pending"), where("status", "==", "Accepted")), where("schedule", ">=", tomorrow12AM)), orderBy("schedule", "desc"));
		}
		else if (btnCompleted.checked) {
			qryAppointments = query(collection(db, "appointments"), where("status", "==", "Completed"), orderBy("schedule", "asc"));
		}
		else if (btnMissed.checked) {
			qryAppointments = query(collection(db, "appointments"), and(or(where("status", "==", "Pending"), where("status", "==", "Accepted")), where("schedule", "<", now)), orderBy("schedule", "asc"));
		}
		else if (btnDeclined.checked) {
			qryAppointments = query(collection(db, "appointments"), where("status", "==", "Declined"), orderBy("schedule", "asc"));
		}
	}
	else {
		if (btnAppointmentsToday.checked) {
			qryAppointments = query(collection(db, "appointments"), where("idNumber", "==", patientId), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now), orderBy("schedule", "desc"));
		}
		else if (btnUpcoming.checked) {
			qryAppointments = query(collection(db, "appointments"), and(where("idNumber", "==", patientId), or(where("status", "==", "Pending"), where("status", "==", "Accepted")), where("schedule", ">=", tomorrow12AM)), orderBy("schedule", "desc"));
		}
		else if (btnCompleted.checked) {
			qryAppointments = query(collection(db, "appointments"), where("idNumber", "==", patientId), where("status", "==", "Completed"), orderBy("schedule", "asc"));
		}
		else if (btnMissed.checked) {
			qryAppointments = query(collection(db, "appointments"), and(where("idNumber", "==", patientId), or(where("status", "==", "Pending"), where("status", "==", "Accepted")), where("schedule", "<", now)), orderBy("schedule", "asc"));
		}
		else if (btnDeclined.checked) {
			qryAppointments = query(collection(db, "appointments"), where("idNumber", "==", patientId), where("status", "==", "Declined"), orderBy("schedule", "asc"));
		}
	}
	
	onSnapshot(qryAppointments, (appointments) => {
		// clear table
		appointmentsContainer.innerHTML = '';
		
		if (appointments.size == 0) {
			appointmentsContainer.innerHTML = '<div class="col-12 text-center mt-4"><h4>No Appointments to Display</h4></div>';
		}
		else {
			appointmentsContainer.innerHTML = '';
		}
			
		appointments.forEach(appointment => {
			getDoc(doc(db, "users", appointment.data().userUid)).then((user) => {
				renderOrderCard(
					appointment.id,
					appointment.data().userUid,
					user.data().firstName,
					user.data().middleName,
					user.data().lastName,
					appointment.data().appointmentType,
					appointment.data().dateCode,
					appointment.data().hourIndex,
					appointment.data().location,
					appointment.data().schedule,
					appointment.data().status,
					appointment.data().timestamp
				);
			});
		});
	});
}

function renderOrderCard(appointmentId, userId, firstName, middleName, lastName, appointmentType, dateCode, hourIndex, location, schedule, status, timestamp) {
  const cardContainer = document.createElement('div');
  	const card = document.createElement('div');
			const cardHeader = document.createElement('div');
				const cardHeaderLeft = document.createElement('div');
					const tvAppointmentType = document.createElement('h6');
					const tvFullName = document.createElement('p');
					const tvLocation = document.createElement('p');
				const cardHeaderRight = document.createElement('div');
					const tvSchedule = document.createElement('h6');
					const tvStatus = document.createElement('p');
			// const cardBody = document.createElement('div');
			// 	const tvServiceType = document.createElement('h6');
			// 	const tvDescription = document.createElement('p');
				const cardBodyFooter = document.createElement('div');
					const btnChat = document.createElement('button');
					const btnMedicalHistory = document.createElement('button');
					const btnAction = document.createElement('button');
					const btnSecondaryAction = document.createElement('button');
					const btnDecline = document.createElement('button');

	cardContainer.classList = "col-10 col-md-8 col-lg-6 container col p-4 pb-0 justify-content-center";
	card.classList = "rounded bg-white col-12 text-center p-4";
	cardHeader.classList = "row";
	cardHeaderLeft.classList = "col-6";
	tvAppointmentType.classList = "col text-primary text-start";
	tvFullName.classList = "col text-dark fw-medium text-start fs-6 my-0";
	tvLocation.classList = "col text-dark text-start fs-6";
	cardHeaderRight.classList = "col-6";
	tvSchedule.classList = "col fw-medium text-end text-dark fs-6";
	tvStatus.classList = "col fw-medium text-end text-danger fs-6";
	// cardBody.classList = "col";
	// tvServiceType.classList = "col text-primary text-start";
	// tvDescription.classList = "text-dark text-start col mt-2";
	cardBodyFooter.classList = "col text-end align-self-end";
	btnChat.classList = "btn btn-primary float-start me-2";
	btnMedicalHistory.classList = "btn btn-outline-primary float-start";
	btnAction.classList = "btn btn-primary";
	btnSecondaryAction.classList = "btn btn-light me-2";
	btnDecline.classList = "btn btn-danger ms-2";

	tvAppointmentType.innerHTML = appointmentType;
	tvFullName.innerHTML = firstName + " " + lastName;
	tvLocation.innerHTML = "Location: " + location;
	tvSchedule.innerHTML = dateFormatter(schedule);
	tvStatus.innerHTML = status;

	if (getAuth().currentUser.email == "healthhub.nurse@gmail.com") {
		btnAction.classList.toggle("d-none", false);
		btnSecondaryAction.classList.toggle("d-none", false);
		document.querySelector("#tvDoctorName").classList.toggle("d-none", false);
		document.querySelector("#divDoctorName").classList.toggle("d-none", false);
	}
	else {
		btnAction.classList.toggle("d-none", true);
		btnSecondaryAction.classList.toggle("d-none", true);
		btnAddMedicalEntry.classList.toggle("d-none", true);
	}

	btnChat.innerHTML = "<i class=\"bi bi-chat-dots-fill me-2 text-white fs-6\"></i>Chat";
	btnMedicalHistory.innerHTML = "Medical History";
	if (status == "Pending") {
		btnAction.innerHTML = "Accept";
		btnDecline.innerHTML = "Decline";
		if (schedule < new Date().getTime()) {
			btnAction.classList.toggle("d-none", true);
			btnSecondaryAction.classList.toggle("d-none", true);
			btnDecline.classList.toggle("d-none", true);
		}
	}
	else if (status == "Accepted") {
		btnAction.innerHTML = "Mark as Completed";
		btnSecondaryAction.innerHTML = "Add Medical Entry";
		if (status == "Declined"){
			btnAction.classList.toggle("d-none", true);
			btnSecondaryAction.classList.toggle("d-none", true);
		}
		btnSecondaryAction.classList.toggle("d-none", false);
		btnDecline.classList.toggle("d-none", true);
	}
	else if (status == "Completed" || status == "Upcoming" || status == "Declined") {
		btnDecline.classList.toggle("d-none", true);
		btnSecondaryAction.classList.toggle("d-none", false);
		btnSecondaryAction.innerHTML = "Add Medical Entry";
		btnAction.classList.toggle("d-none", true);
		if (getAuth().currentUser.email == "healthhub.siaton@gmail.com") {
			btnSecondaryAction.classList.toggle("d-none", true);
		}
		if (status == "Declined"){
			btnSecondaryAction.classList.toggle("d-none", true);
		}
	}

	btnChat.onclick = function() { chat(userId) }
	btnMedicalHistory.onclick = function() { viewUserMedicalHistory(userId, firstName, lastName) }
	btnAction.onclick = function() { action(appointmentId, status, userId) };
	btnSecondaryAction.onclick = function() { secondaryAction(appointmentId, status, userId) };
	btnDecline.onclick = function() { decline(appointmentId, status) };

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(cardHeaderLeft);
				cardHeaderLeft.appendChild(tvAppointmentType);
				cardHeaderLeft.appendChild(tvFullName);
				cardHeaderLeft.appendChild(tvLocation);
			cardHeader.appendChild(cardHeaderRight);
				cardHeaderRight.appendChild(tvSchedule);
				cardHeaderRight.appendChild(tvStatus);
			// cardHeader.appendChild(cardBody);
			// 	cardBody.appendChild(tvServiceType);
			// 	cardBody.appendChild(tvDescription);
			cardHeader.appendChild(cardBodyFooter);
				cardBodyFooter.appendChild(btnChat);
				//cardBodyFooter.appendChild(btnMedicalHistory);
				cardBodyFooter.appendChild(btnSecondaryAction);
				cardBodyFooter.appendChild(btnAction);
				cardBodyFooter.appendChild(btnDecline);

	appointmentsContainer.prepend(cardContainer);
}

function chat(userUid) {
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

function action(appointmentId, status, userId) {
	const refAppointment = doc(db, "appointments", appointmentId);

	let updateData = {};

	if (status == "Pending") {
		updateData = {
			status: "Accepted"
		}
	}
	else if (status == "Accepted") {
		updateData = {
			status: "Completed"
		}
	}

	if (status != "Completed") {
		// if the current appointment has not yet been completed, then incrementally update the status
		appointmentsContainer.innerHTML = '';

		updateDoc(refAppointment, updateData).then(() => {
		});
	}
}

function secondaryAction(appointmentId, status, userId) {
	// add medical entry
	showModal("#modalAddMedicalEntry");

	const nurse = getAuth().currentUser.email == "healthhub.nurse@gmail.com";
	const doctor = getAuth().currentUser.email == "healthhub.siaton@gmail.com";

	const nurseui = document.querySelectorAll(".nurseui");
	const doctorui = document.querySelectorAll(".doctorui");

	if (nurse) {
		nurseui.forEach(ui => {
			ui.classList.toggle("d-none", false);
		});
		doctorui.forEach(ui => {
			ui.classList.toggle("d-none", true);
		});
	}
	else if (doctor) {
		nurseui.forEach(ui => {
			ui.classList.toggle("d-none", true);
		});
		doctorui.forEach(ui => {
			ui.classList.toggle("d-none", false);
		});
	}

	btnAddMedicalEntry.onclick = function() {
		const bloodPressure = tvBloodPressure.value;
		const respiratoryRate = tvRespiratoryRate.value;
		const bodyTemperature = tvBodyTemperature.value;
		const pulseRate = tvPulseRate.value;
		const o2sat = tvO2SAT.value;
		const height = tvHeight.value;
		const weight = tvWeight.value;
		const chiefComplaint = tvChiefComplaint.value;
		const diagnosis = tvDiagnosis.value;
		const medications = tvMedications.value;
		const treatmentPlan = tvTreatmentPlan.value;

		// if (!chiefComplaint) {
		// 	invalidate(tvChiefComplaintValidator);
		// 	return;
		// }
		// resetValidation(tvChiefComplaintValidator);
		// if (!diagnosis) {
		// 	invalidate(tvDiagnosisValidator);
		// 	return;
		// }
		// resetValidation(tvDiagnosisValidator);
		// if (!medications) {
		// 	invalidate(tvMedicationsValidator);
		// 	return;
		// }
		// resetValidation(tvMedicationsValidator);
		// if (!treatmentPlan) {
		// 	invalidate(tvTreatmentPlanValidator);
		// 	return;
		// }
		// resetValidation(tvTreatmentPlanValidator);
		// if (!treatmentPlan) {
		// 	invalidate(tvTreatmentPlanValidator);
		// 	return;
		// }
		// resetValidation(tvTreatmentPlanValidator);

		const refNewMedicalEntry = doc(collection(db, "medicalHistory"));

		if (nurse) {
			setDoc(refNewMedicalEntry, {
				id: refNewMedicalEntry.id,
				bloodPressure: bloodPressure,
				respiratoryRate: respiratoryRate,
				bodyTemperature: bodyTemperature,
				pulseRate: pulseRate,
				o2sat: o2sat,
				height: height,
				weight: weight,
				userUid: userId,
				timestamp: Date.now()
			}).then(()=> {
				hideModal("#modalAddMedicalEntry");

				tvBloodPressure.value = "";
				tvRespiratoryRate.value = "";
				tvBodyTemperature.value = "";
				tvPulseRate.value = "";
				tvO2SAT.value = "";
				tvHeight.value = "";
				tvWeight.value = "";
				tvChiefComplaint.value = "";
				tvDiagnosis.value = "";
				tvMedications.value = "";
				tvTreatmentPlan.value = "";
			});
		}
		else if (doctor) {
			setDoc(refNewMedicalEntry, {
				id: refNewMedicalEntry.id,
				chiefComplaint: chiefComplaint,
				diagnosis: diagnosis,
				medications: medications,
				treatmentPlan: treatmentPlan,
				userUid: userId,
				timestamp: Date.now()
			}).then(()=> {
				hideModal("#modalAddMedicalEntry");

				tvBloodPressure.value = "";
				tvRespiratoryRate.value = "";
				tvBodyTemperature.value = "";
				tvPulseRate.value = "";
				tvO2SAT.value = "";
				tvHeight.value = "";
				tvWeight.value = "";
				tvChiefComplaint.value = "";
				tvDiagnosis.value = "";
				tvMedications.value = "";
				tvTreatmentPlan.value = "";
			});
		}
	}
}

function decline(appointmentId, status) {
	const refAppointment = doc(db, "appointments", appointmentId);

	let updateData = {};

	updateData = {
		status: "Declined"
	}

	appointmentsContainer.innerHTML = '';
	updateDoc(refAppointment, updateData).then(() => {
	});
}

function viewUserMedicalHistory(userUid, firstName, lastName) {
	divMedicalHistoryContainer.innerHTML = "";
	tvMedicalHistoryPatientName.innerHTML = "Medical History of " + titleCase(firstName + " " + lastName);
	showModal("#modalViewUserMedicalHistory");

	const qryUserMedicalHistory = query(collection(db, "medicalHistory"), where("userUid", "==", userUid), orderBy("timestamp", "desc"));
	getDocs(qryUserMedicalHistory).then((medicalEntries) => {
		
		if (medicalEntries.size == 0){
			divMedicalHistoryContainer.innerHTML = "This patient has no medical records";
		}
		else {
			medicalEntries.forEach((entry) => {
				renderMedicalHistory(
					entry.id,
					entry.data().bloodPressure,
					entry.data().respiratoryRate,
					entry.data().bodyTemperature,
					entry.data().pulseRate,
					entry.data().o2sat,
					entry.data().height,
					entry.data().weight,
					entry.data().chiefComplaint,
					entry.data().diagnosis,
					entry.data().medications,
					entry.data().treatmentPlan,
					entry.data().timestamp
				);
			});
		}
	});
}

function renderMedicalHistory(id, bloodPressure, respiratoryRate, bodyTemperature, pulseRate, o2sat, height, weight, chiefComplaint, diagnosis, medications, treatmentPlan, timestamp) {
	const cardContainer = document.createElement('div');
  	const card = document.createElement('div');
			const cardHeader = document.createElement('div');
				const tvTimestamp = document.createElement('p');
			const cardBody = document.createElement('div');
				const tvVitalInformation = document.createElement('h6');
				const divVitalsContainer = document.createElement('div');
					const divVitalsLeft = document.createElement('div');
						const tvBloodPressure = document.createElement('p');
						const tvRespiratoryRate = document.createElement('p');
						const tvBodyTemperature = document.createElement('p');
						const tvPulseRate = document.createElement('p');
					const divVitalsRight = document.createElement('div');
						const tvO2SAT = document.createElement('p');
						const tvHeight = document.createElement('p');
						const tvWeight = document.createElement('p');
				const tvDiagnosisAndTreatment = document.createElement('h6');
				const tvChiefComplaint = document.createElement('p');
				const tvDiagnosis = document.createElement('p');
				const tvMedications = document.createElement('p');
				const tvTreatmentPlan = document.createElement('p');
			const cardFooter = document.createElement('div');
				const divButtonContainer = document.createElement('div');
					const btnSeeMore = document.createElement('button');
					const btnSeeLess = document.createElement('button');

	cardContainer.classList = "col-12 container col p-4 pb-0 justify-content-center";
	card.classList = "rounded bg-white col-12 text-center p-4";
	cardHeader.classList = "row";
		tvTimestamp.classList = "col text-dark fw-medium text-start my-0";
	cardBody.classList = "col-12";
		divVitalsContainer.className = "row d-none"
			tvVitalInformation.className = "col text-start mt-2 d-none";
			divVitalsLeft.className = "col-12 col-lg-6"
				tvBloodPressure.className = "col text-start m-0 p-0";
				tvRespiratoryRate.className = "col text-start m-0 p-0";
				tvBodyTemperature.className = "col text-start m-0 p-0";
				tvPulseRate.className = "col text-start m-0 p-0";
			divVitalsRight.className = "col-12 col-lg-6"
				tvO2SAT.className = "col text-start m-0 p-0";
				tvHeight.className = "col text-start m-0 p-0";
				tvWeight.className = "col text-start m-0 p-0";
				tvDiagnosisAndTreatment.classList = "col mt-0 pt-0 text-start d-none";
		tvChiefComplaint.classList = "col text-start mt-1 mb-0 pb-0";
		tvDiagnosis.classList = "text-dark text-start col mt-1";
		tvDiagnosis.style.whiteSpace = "pre-wrap";
		tvMedications.classList = "text-dark text-start col mt-1 d-none";
		tvMedications.style.whiteSpace = "pre-wrap";
		tvTreatmentPlan.classList = "text-dark text-start col mt-1 d-none";
		tvTreatmentPlan.style.whiteSpace = "pre-wrap";
	cardFooter.classList = "col-12";
		divButtonContainer.classList = "col-12 text-start";
			btnSeeMore.classList = "btn btn-primary";
			btnSeeLess.classList = "btn btn-primary d-none";

	tvVitalInformation.innerHTML = "Vital Information";
	tvBloodPressure.innerHTML = "Blood Pressure: " + bloodPressure + " mmHg";
	tvRespiratoryRate.innerHTML = "Respiratory Rate: " + respiratoryRate + " Breaths per Minute";
	tvBodyTemperature.innerHTML ="Body Temperature: " +  bodyTemperature + " °C";
	tvPulseRate.innerHTML = "Pulse Rate: " + pulseRate + " bpm";
	tvO2SAT.innerHTML = "O2SAT: " + o2sat + " %";
	tvHeight.innerHTML = "Height: " + height + " cm";
	tvWeight.innerHTML = "Weight: " + weight + " kg";
	tvDiagnosisAndTreatment.innerHTML = "Diagnosis and Treatment";
	tvTimestamp.innerHTML = dateFormatter(timestamp);
	tvChiefComplaint.innerHTML = "Chief Complaint: " + chiefComplaint;
	tvDiagnosis.innerHTML = "Diagnosis: " + diagnosis;
	tvMedications.innerHTML = "Medications: " + medications;
	tvTreatmentPlan.innerHTML = "Treatment Plan: " + treatmentPlan;
	btnSeeMore.innerHTML = "See More";
	btnSeeLess.innerHTML = "See Less";

	btnSeeMore.onclick = function() {
		tvVitalInformation.classList.toggle("d-none");
		tvDiagnosisAndTreatment.classList.toggle("d-none");
		tvDiagnosisAndTreatment.classList.toggle("mt-2");
		divVitalsContainer.classList.toggle("d-none");
		tvMedications.classList.toggle("d-none");
		tvTreatmentPlan.classList.toggle("d-none");
		btnSeeMore.classList.toggle("d-none");
		btnSeeLess.classList.toggle("d-none");
	}

	btnSeeLess.onclick = function() {
		tvVitalInformation.classList.toggle("d-none");
		tvDiagnosisAndTreatment.classList.toggle("d-none");
		tvDiagnosisAndTreatment.classList.toggle("mt-2");
		divVitalsContainer.classList.toggle("d-none");
		tvMedications.classList.toggle("d-none");
		tvTreatmentPlan.classList.toggle("d-none");
		btnSeeMore.classList.toggle("d-none");
		btnSeeLess.classList.toggle("d-none");
	}

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
		card.appendChild(cardBody);
			cardBody.appendChild(tvVitalInformation);
			cardBody.appendChild(divVitalsContainer);
				divVitalsContainer.appendChild(divVitalsLeft);
					divVitalsLeft.appendChild(tvBloodPressure);
					divVitalsLeft.appendChild(tvRespiratoryRate);
					divVitalsLeft.appendChild(tvBodyTemperature);
					divVitalsLeft.appendChild(tvPulseRate);
				divVitalsContainer.appendChild(divVitalsRight);
					divVitalsRight.appendChild(tvO2SAT);
					divVitalsRight.appendChild(tvHeight);
					divVitalsRight.appendChild(tvWeight);
			cardBody.appendChild(tvDiagnosisAndTreatment);
			cardBody.appendChild(tvChiefComplaint);
			cardBody.appendChild(tvDiagnosis);
			cardBody.appendChild(tvMedications);
			cardBody.appendChild(tvTreatmentPlan);
		card.appendChild(cardFooter);
			cardFooter.appendChild(divButtonContainer);
				divButtonContainer.appendChild(btnSeeMore);
				divButtonContainer.appendChild(btnSeeLess);

	divMedicalHistoryContainer.append(cardContainer);
}

function renderCalendar() {
	const startDate = getFirstDayOfWeek(dateCursor);
	const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

	tvCalendarDate.innerHTML = dayMonthYearFormatter(startDate) + " - " + dayMonthYearFormatter(endDate) + "<br/>2024";

	tvSun.innerHTML = "Sun - " + dayMonthFormatter(addDays(startDate, 0));
	tvMon.innerHTML = "Mon - " + dayMonthFormatter(addDays(startDate, 1));
	tvTue.innerHTML = "Tue - " + dayMonthFormatter(addDays(startDate, 2));
	tvWed.innerHTML = "Wed - " + dayMonthFormatter(addDays(startDate, 3));
	tvThu.innerHTML = "Thu - " + dayMonthFormatter(addDays(startDate, 4));
	tvFri.innerHTML = "Fri - " + dayMonthFormatter(addDays(startDate, 5));
	tvSat.innerHTML = "Sat - " + dayMonthFormatter(addDays(startDate, 6));

	for (let i = 0; i < 7; i++) {
		const scheduleRef = doc(db, "doctorLocation", getDateCode(addDays(startDate, i)));

		onSnapshot(scheduleRef, (snap) => {
			renderLocation(snap, i);
		});
	}
}

function renderLocation(snap, index) {
	const arrSelects = [selSundayLocation, selMondayLocation, selTuesdayLocation, selWednesdayLocation, selThursdayLocation, selFridayLocation, selSaturdayLocation];

	if (snap.exists()) {
		arrSelects[index].value = snap.data().location;
	}
	else {
		arrSelects[index].value = "Not Set";
	}
}

function addDays(date, n) {
	return new Date(date.getTime() + (n * 24 * 60 * 60 * 1000));
}

function getDateCode(date) {
	return date.getFullYear() + "" + (((date.getMonth()+1)<10)?"0"+(date.getMonth()+1):date.getMonth()+1) + "" + ((date.getDate()<10)?"0"+date.getDate():date.getDate());
}

function updateDoctorLocation(date, dateCode, location) {
	const locationRef = doc(db, "doctorLocation", dateCode);

	getDoc(locationRef).then((snap) => {
		console.log(date.getTime());
		if (snap.exists()) {
			if (location != "Not Set") {
				updateDoc(locationRef, {
					location: location,
					timestamp: date.getTime()
				});
			}
			else if (location == "Not Set") {
				deleteDoc(doc(db, "doctorLocation", dateCode));
			}
		}
		else {
			setDoc(locationRef, {
				location: location,
				timestamp: date.getTime()
			});
		}
	});
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