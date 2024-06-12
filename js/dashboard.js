import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, getDoc, getDocs, addDoc, updateDoc, increment, deleteDoc, Timestamp, arrayUnion, deleteField, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref, getDownloadURL, deleteObject, connectStorageEmulator } from "../node_modules/firebase/firebase-storage.js";
import { showModal, hideModal, resetValidation, invalidate } from '../js/utils.js';

// appointments today
const cardAppointmentsToday = document.querySelector("#cardAppointmentsToday");
const tvEmptyAppointmentsToday = document.querySelector("#tvEmptyAppointmentsToday");
const divAppointmentsToday = document.querySelector("#divAppointmentsToday");
let chartAppointmentsToday = Chart.getChart("chartAppointmentsToday");

// appointments this month
const cardAppointmentsThisMonth = document.querySelector("#cardAppointmentsThisMonth");
const tvEmptyAppointmentsThisMonth = document.querySelector("#tvEmptyAppointmentsThisMonth");
const divAppointmentsThisMonth = document.querySelector("#divAppointmentsThisMonth");
let chartAppointmentsThisMonth = Chart.getChart("chartAppointmentsThisMonth");

// patients
const cardPatients = document.querySelector("#cardPatients");
const tvEmptyPatients = document.querySelector("#tvEmptyPatients");
const divPatients = document.querySelector("#divPatients");
let chartPatients = Chart.getChart("chartPatients");

// patients
const cardAppointmentHistory = document.querySelector("#cardAppointmentHistory");
const tvEmptyAppointmentHistory = document.querySelector("#tvEmptyAppointmentHistory");
const divAppointmentHistory = document.querySelector("#divAppointmentHistory");
let chartAppointmentHistory = Chart.getChart("chartAppointmentHistory");
// const cardAppointments = document.querySelector("#cardAppointments");

// const tvConsultation = document.querySelector("#tvConsultation");
// const tvLaboratory = document.querySelector("#tvLaboratory");
// const tvXray = document.querySelector("#tvXray");
// const tvHemoglobin = document.querySelector("#tvHemoglobin");
// const tvFastingBloodSugar = document.querySelector("#tvFastingBloodSugar");
// const tvUrinalysis = document.querySelector("#tvUrinalysis");
// const tvTbdots = document.querySelector("#tvTbdots");
// const tvFamilyPlanning = document.querySelector("#tvFamilyPlanning");
// const tvMedicalCertificate = document.querySelector("#tvMedicalCertificate");
// const tvBirthingHome = document.querySelector("#tvBirthingHome");
// const tvImmunization = document.querySelector("#tvImmunization");
// const tvCircumcision = document.querySelector("#tvCircumcision");

// const cardPatients = document.querySelector("#cardPatients");
// const tvPatients = document.querySelector("#tvPatients");
// const tvNewPatients = document.querySelector("#tvNewPatients");

const now = new Date().getTime();
const tomorrow12AM = new Date().setHours(24,0,0,0);

cardAppointmentsToday.addEventListener("click", function() {
	window.location = "appointments.html";
});

cardAppointmentsThisMonth.addEventListener("click", function() {
	window.location = "appointments.html";
});

// cardPatients.addEventListener("click", function() {
// 	window.location = "patients.html";
// });

window.addEventListener("load", function() {
	renderAppointmentsToday();
	renderAppointmentsThisMonth();
	renderPatients();
	renderAppointmentHistory();
	// listenToConsultationAppointments();
	// listenToLaboratoryAppointments();
	// listenToXrayAppointments();
	// listenToHemoglobinAppointments();
	// listenToFastingBloodSugarAppointments();
	// listenToUrinalysisAppointments();
	// listenToTbdotsAppointments();
	// listenToFamilyPlanningAppointments();
	// listenToMedicalCertificateAppointments();
	// listenToBirthingHomeAppointments();
	// listenToImmunizationAppointments();
	// listenToCircumcisionAppointments();

	// listenToPatients();
});

function renderAppointmentsToday() {
	const qryAppointmentsToday = query(collection(db, "appointments"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now), orderBy("schedule", "desc"));

	onSnapshot(qryAppointmentsToday, (appointments) => {
		let totalAppointments = 0; 

		let consultation = 0;
		let familyPlanning = 0;
		let xray = 0;
		let laborAndDelivery = 0;
		let tbdots = 0;
		let circumcision = 0;
		let medicalCertificate = 0;
		let micronutrientSupplementation = 0;
		let vaccination = 0;
		let woundCare = 0;
		let sputumTest = 0;
		let hemoglobin = 0;
		let urinalysis = 0;
		let fastingBloodSugar = 0;
		let hepatitisBBloodTest = 0;
		let hivScreening = 0;
		let newbornCare = 0;
		let newbornScreening = 0;

		appointments.forEach((appointment) => {
			totalAppointments++;

			if (appointment.data().appointmentType == "Consultation") {
				consultation++;
			}
			if (appointment.data().appointmentType == "Family Planning") {
				familyPlanning++;
			}
			if (appointment.data().appointmentType == "X-Ray") {
				xray++;
			}
			if (appointment.data().appointmentType == "Labor & Delivery") {
				laborAndDelivery++;
			}
			if (appointment.data().appointmentType == "TB-DOTS") {
				tbdots++;
			}
			if (appointment.data().appointmentType == "Circumcision") {
				circumcision++;
			}
			if (appointment.data().appointmentType == "Medical Certificate") {
				medicalCertificate++;
			}
			if (appointment.data().appointmentType == "Micronutrient Supplementation") {
				micronutrientSupplementation++;
			}
			if (appointment.data().appointmentType == "Vaccination") {
				vaccination++;
			}
			if (appointment.data().appointmentType == "Wound Care") {
				woundCare++;
			}
			if (appointment.data().appointmentType == "Sputum Test") {
				sputumTest++;
			}
			if (appointment.data().appointmentType == "Hemoglobin") {
				hemoglobin++;
			}
			if (appointment.data().appointmentType == "Urinalysis") {
				urinalysis++;
			}
			if (appointment.data().appointmentType == "Fasting Blood Sugar") {
				fastingBloodSugar++;
			}
			if (appointment.data().appointmentType == "Hepatitis B Blood Test") {
				hepatitisBBloodTest++;
			}
			if (appointment.data().appointmentType == "HIV Screening") {
				hivScreening++;
			}
			if (appointment.data().appointmentType == "Newborn Care") {
				newbornCare++;
			}
			if (appointment.data().appointmentType == "Newborn Screening") {
				newbornScreening++;
			}

			if (chartAppointmentsToday != undefined) {
				chartAppointmentsToday.destroy();
			}
			chartAppointmentsToday = new Chart("chartAppointmentsToday", {
				type: "doughnut",
				data: {
					labels: [
						'Consultation',
						'Family Planning',
						'X-Ray',
						'Labor & Delivery',
						'TB-DOTS',
						'Circumcision',
						'Medical Certificate',
						'Micronutrient Supplementation',
						'Vaccination',
						'Wound Care',
						'Sputum Test',
						'Hemoglobin',
						'Urinalysis',
						'Fasting Blood Sugar',
						'Hepatitis B Blood Test',
						'HIV Screening',
						'Newborn Care',
						'Newborn Screening'
					],
					datasets: [{
						data: [
							consultation,
							familyPlanning,
							xray,
							laborAndDelivery,
							tbdots,
							circumcision,
							medicalCertificate,
							micronutrientSupplementation,
							vaccination,
							woundCare,
							sputumTest,
							hemoglobin,
							urinalysis,
							fastingBloodSugar,
							hepatitisBBloodTest,
							hivScreening,
							newbornCare,
							newbornScreening
						]
					}]
				},
				options: {
					responsive: false, 
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							},
							autocolors: {
								mode: 'data'
							}
					}
				}
			});
		});

		if (totalAppointments == 0) {
			tvEmptyAppointmentsToday.classList.toggle("d-none", false);
			divAppointmentsToday.classList.toggle("d-none", true);
		}
		else {
			tvEmptyAppointmentsToday.classList.toggle("d-none", true);
			divAppointmentsToday.classList.toggle("d-none", false);
		}
	});
}

function renderAppointmentsThisMonth() {
	const date = new Date();
	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
	const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
	
	const qryAppointmentsThisMonth = query(collection(db, "appointments"), where("schedule", ">=", firstDayOfMonth), where("schedule", "<", lastDayOfMonth));

	onSnapshot(qryAppointmentsThisMonth, (appointments) => {

		const now = new Date().getTime();

		let totalAppointments = 0;
		let pendingCount = 0;
		let acceptedCount = 0;
		let completedCount = 0;
		let declinedCount = 0;
		let missedCount = 0;

		appointments.forEach((appointment) => {
			totalAppointments++;
			const status = appointment.data().status;
			const schedule = appointment.data().schedule;

			if (status == "Pending") {
				pendingCount++;
			}
			if (status == "Accepted") {
				acceptedCount++;
			}
			else if (status == "Completed") {
				completedCount++;
			}
			// status == missed
			else if ((status == "Pending" || status == "Accepted") && schedule < now) {
				missedCount++;
			}
			else if (status == "Declined") {
				declinedCount++;
			}

			if (chartAppointmentsThisMonth != undefined) {
				chartAppointmentsThisMonth.destroy();
			}
			chartAppointmentsThisMonth = new Chart("chartAppointmentsThisMonth", {
				type: "doughnut",
				data: {
					labels: [
						'Pending',
						'Accepted',
						'Completed',
						'Missed',
						'Declined'
					],
					datasets: [{
						backgroundColor: [
							'#F1CE63',
							'#4E79A7',
							'#8CD17D',
							'#BAB0AC',
							'#E15759'
						],
						data: [
							pendingCount,
							acceptedCount,
							completedCount,
							missedCount,
							declinedCount
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});

			if (totalAppointments == 0) {
				tvEmptyAppointmentsThisMonth.classList.toggle("d-none", false);
				divAppointmentsThisMonth.classList.toggle("d-none", true);
			}
			else {
				tvEmptyAppointmentsThisMonth.classList.toggle("d-none", true);
				divAppointmentsThisMonth.classList.toggle("d-none", false);
			}
		});
	});
}

function renderPatients() {
	const date = new Date();
	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
	
	const qryPatients = query(collection(db, "users"), where("userType", "==", 0));

	onSnapshot(qryPatients, (patients) => {

		let totalPatients = 0;
		let patientsThisMonthCount = 0;
		let existingPatients = 0;

		patients.forEach((patient) => {
			totalPatients++;
			const joinDate = patient.data().joinDate;

			if (joinDate >= firstDayOfMonth) {
				patientsThisMonthCount++;
			}
			else {
				existingPatients++;
			}

			if (chartPatients != undefined) {
				chartPatients.destroy();
			}
			chartPatients = new Chart("chartPatients", {
				type: "doughnut",
				data: {
					labels: [
						'New Patients',
						'Existing Patients'
					],
					datasets: [{
						backgroundColor: [
							'#4E79A7',
							'#8CD17D'
						],
						data: [
							patientsThisMonthCount,
							existingPatients
						]
					}]
				},
				options: {
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});

			if (totalPatients == 0) {
				tvEmptyPatients.classList.toggle("d-none", false);
				divPatients.classList.toggle("d-none", true);
			}
			else {
				tvEmptyPatients.classList.toggle("d-none", true);
				divPatients.classList.toggle("d-none", false);
			}
		});
	});
}

function renderAppointmentHistory() {
	const date = new Date();
	const monthNameThisMonth = (new Date(date.getFullYear(), date.getMonth(), 1)).toLocaleString('default', { month: 'long' });
	const firstDayThisMonth = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
	const lastDayThisMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
	const monthNameprev1Month = (new Date(date.getFullYear(), date.getMonth()-1, 1)).toLocaleString('default', { month: 'long' });
	const firstDayprev1Month = new Date(date.getFullYear(), date.getMonth()-1, 1).getTime();
	const lastDayprev1Month = new Date(date.getFullYear(), date.getMonth() -1 + 1, 0).getTime();
	const monthNameprev2Months = (new Date(date.getFullYear(), date.getMonth()-2, 1)).toLocaleString('default', { month: 'long' });
	const firstDayprev2Months = new Date(date.getFullYear(), date.getMonth()-2, 1).getTime();
	const lastDayprev2Months = new Date(date.getFullYear(), date.getMonth() -2 + 1, 0).getTime();
	const monthNameprev3Months = (new Date(date.getFullYear(), date.getMonth()-3, 1)).toLocaleString('default', { month: 'long' });
	const firstDayprev3Months = new Date(date.getFullYear(), date.getMonth()-3, 1).getTime();
	const lastDayprev3Months = new Date(date.getFullYear(), date.getMonth() -3 + 1, 0).getTime();
	
	const qryAppointments = query(collection(db, "appointments"));

	onSnapshot(qryAppointments, (appointments) => {

		console.log(appointments.size);

		let totalAppointments = 0;
		let appointmentsThisMonthCount = 0;
		let appointments1MonthAgoCount = 0;
		let appointments2MonthsAgoCount = 0;
		let appointments3MonthsAgoCount = 0;

		appointments.forEach((appointment) => {
			totalAppointments++;
			const schedule = appointment.data().schedule;

			if (schedule >= firstDayThisMonth && schedule < lastDayThisMonth) {
				appointmentsThisMonthCount++;
			}
			else if (schedule >= firstDayprev1Month && schedule < lastDayprev1Month) {
				appointments1MonthAgoCount++;
			}
			else if (schedule >= firstDayprev2Months && schedule < lastDayprev2Months) {
				appointments2MonthsAgoCount++;
			}
			else if (schedule >= firstDayprev3Months && schedule < lastDayprev3Months) {
				appointments3MonthsAgoCount++;
			}

			var ctx = document.getElementById('chartAppointmentHistory').getContext('2d');
			var gradient = ctx.createLinearGradient(0, 0, 0, 300);
			gradient.addColorStop(0, 'rgba(140, 209, 125, 1)');
			gradient.addColorStop(1, 'rgba(140, 209, 125, 0)');

			if (chartAppointmentHistory != undefined) {
				chartAppointmentHistory.destroy();
			}
			chartAppointmentHistory = new Chart("chartAppointmentHistory", {
				type: "line",
				data: {
					labels: [
						monthNameprev3Months,
						monthNameprev2Months,
						monthNameprev1Month,
						monthNameThisMonth
					],
					datasets: [{
						label: 'Appointments Per Month',
						backgroundColor: gradient,
						fill: true,
						data: [
							appointments3MonthsAgoCount,
							appointments2MonthsAgoCount,
							appointments1MonthAgoCount,
							appointmentsThisMonthCount
						]
					}]
				},
				options: {
					tension: 0.5,
					plugins: {
							legend: {
									display: true,
									position: 'bottom',
									align: 'start'
							}
					}
				}
			});

			if (totalAppointments == 0) {
				tvEmptyAppointmentHistory.classList.toggle("d-none", false);
				divAppointmentHistory.classList.toggle("d-none", true);
			}
			else {
				tvEmptyAppointmentHistory.classList.toggle("d-none", true);
				divAppointmentHistory.classList.toggle("d-none", false);
			}
		});
	});
}

// function listenToConsultationAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Consultation"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvConsultation.innerHTML = appointments.size;
// 	});
// }

// function listenToLaboratoryAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Laboratory"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvLaboratory.innerHTML = appointments.size;
// 	});
// }

// function listenToXrayAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "X-Ray"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvXray.innerHTML = appointments.size;
// 	});
// }

// function listenToHemoglobinAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Hemoglobin"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvHemoglobin.innerHTML = appointments.size;
// 	});
// }

// function listenToFastingBloodSugarAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Fasting Blood Sugar"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvFastingBloodSugar.innerHTML = appointments.size;
// 	});
// }

// function listenToUrinalysisAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Urinalysis"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvUrinalysis.innerHTML = appointments.size;
// 	});
// }

// function listenToTbdotsAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "TB-DOTS"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvTbdots.innerHTML = appointments.size;
// 	});
// }

// function listenToFamilyPlanningAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Family Planning"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvFamilyPlanning.innerHTML = appointments.size;
// 	});
// }

// function listenToMedicalCertificateAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Medical Certificate"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvMedicalCertificate.innerHTML = appointments.size;
// 	});
// }

// function listenToBirthingHomeAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Birthing Home"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvBirthingHome.innerHTML = appointments.size;
// 	});
// }

// function listenToImmunizationAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Immunization"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvImmunization.innerHTML = appointments.size;
// 	});
// }

// function listenToCircumcisionAppointments() {
// 	const qry = query(collection(db, "appointments"), where("appointmentType", "==", "Circumcision"), where("schedule", "<", tomorrow12AM), where("schedule", ">=", now));

// 	onSnapshot(qry, (appointments) => {
// 		tvCircumcision.innerHTML = appointments.size;
// 	});
// }

// function listenToPatients() {
// 	const qry = query(collection(db, "users"), where("userType", "!=", 1));

// 	onSnapshot(qry, (patients) => {
// 		tvPatients.innerHTML = patients.size;
// 		tvNewPatients.innerHTML = patients.size;
// 	});
// }