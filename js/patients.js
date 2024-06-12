import { db, auth, storage } from '../js/firebase.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { showModal, hideModal, dayMonthYearFormatter, resetValidation, invalidate, dateFormatter } from '../js/utils.js';

const tbodyUsers = document.querySelector("#tbodyUsers");
const tvEmptyMessage = document.querySelector("#tvEmptyMessage");
const etFirstName = document.querySelector("#etFirstName");
const etLastName = document.querySelector("#etLastName");
const btnSearchUser = document.querySelector("#btnSearchUser");
const btnClearFilter = document.querySelector("#btnClearFilter");
const imgId = document.querySelector("#imgId");

// medical history
const modalViewUserMedicalHistory = document.querySelector("#modalViewUserMedicalHistory");
const tvMedicalHistoryPatientName = document.querySelector("#tvMedicalHistoryPatientName");
const divMedicalHistoryContainer = document.querySelector("#divMedicalHistoryContainer");

// health record
const modalViewUserHealthRecord = document.querySelector("#modalViewUserHealthRecord");
const tvMHealthRecordPatientName = document.querySelector("#tvMHealthRecordPatientName");
const divHealthRecordContainer = document.querySelector("#divHealthRecordContainer");

window.addEventListener("load", function() {
	getUsersData("", "");
});

btnSearchUser.addEventListener("click", function() {
	getUsersData(etFirstName.value.toUpperCase(), etLastName.value.toUpperCase());
});

btnClearFilter.addEventListener("click", function() {
	getUsersData("", "");
});

function getUsersData(filterFirstName, filterLastName) {
	let qryUsers = null;
	
	if (!filterFirstName && !filterLastName) {
		qryUsers = query(collection(db, "users"));	
	}
	else if (filterFirstName && !filterLastName) {
		qryUsers = query(collection(db, "users"), where("firstName", "==", filterFirstName));	
	}
	else if (!filterFirstName && filterLastName) {
		qryUsers = query(collection(db, "users"), where("lastName", "==", filterLastName));	
	}
	else if (filterFirstName && filterLastName) {
		qryUsers = query(collection(db, "users"), where("firstName", "==", filterFirstName), where("lastName", "==", filterLastName));	
	}
	
	onSnapshot(qryUsers, (users) => {
		// clear table
		tbodyUsers.innerHTML = '';

		if (users.size == 0) {
			tvEmptyMessage.classList.toggle("d-none", false);
		}
		else {
			tvEmptyMessage.classList.toggle("d-none", true);
		}
			
		users.forEach(user => {
			if (user.data().userType != 1) {
				renderUsers(
					user.id,
					user.data().idNumber,
					user.data().firstName,
					user.data().middleName,
					user.data().lastName,
					user.data().email,
					user.data().addressPurok,
					user.data().addressBarangay,
					user.data().idFileName,
					user.data().birthdate,
					user.data().mobile
				);
			}
		});
	});
}

function renderUsers(id, idNumber, firstName, middleName, lastName, email, addressPurok, addressBarangay, idFileName, birthdate, mobile) {
	const newRow = document.createElement('tr');
	const cellId = document.createElement('td');
		const imgId = document.createElement('img');
	const cellIdNumber = document.createElement('td');
	const cellName = document.createElement('td');
	const cellMobile = document.createElement('td');
	const cellEmail = document.createElement('td');
	const cellBirthday = document.createElement('td');
	const cellAddress = document.createElement('td');
	const cellNoOfAppointments = document.createElement('td');
	const cellLastAppointmentDate = document.createElement('td');
	// const cellHistory = document.createElement('td');
	// const btnAppointmentsHistory = document.createElement('button');
	// const btnHealthRecords = document.createElement('button');
	// const btnMedicalHistory = document.createElement('button');

	if (idFileName == null){
		imgId.src = "https://via.placeholder.com/150?text=No+Image";
	}
	else {
		imgId.style.cursor = "pointer";
		getDownloadURL(sRef(storage, 'images/'+idFileName))
			.then((url) => {
				imgId.src = url;
				imgId.onclick = function() {
					viewPatientId(url);
				}
			});
	}
	imgId.className = "col-12 rounded";
	imgId.style.width = "50px";
	imgId.style.height = "50px";
	imgId.style.objectFit = "cover";

	cellIdNumber.innerHTML = idNumber;
	cellName.innerHTML = firstName + " " + lastName;
	cellMobile.innerHTML = mobile;
	cellEmail.innerHTML = email;
	cellBirthday.innerHTML = dayMonthYearFormatter(birthdate);
	cellAddress.innerHTML = addressPurok + ", " + addressBarangay + ", Siaton";

	getDocs(query(collection(db, "appointments"), where("userUid", "==", id), orderBy("schedule", "desc"))).then((appointments) => {
		cellNoOfAppointments.innerHTML = appointments.size + " appts.";
		cellLastAppointmentDate.innerHTML = (appointments.size==0)?"N/A":dayMonthYearFormatter(appointments.docs[0].data().schedule);
	});

	// btnAppointmentsHistory.className = "btn btn-no-border btn-primary";
	// btnAppointmentsHistory.innerHTML = "Appointments";
	// btnAppointmentsHistory.onclick = function() {
	// 	viewUserAppointmentHistory(idNumber);
	// }

	// btnHealthRecords.className = "btn btn-no-border btn-primary mt-2";
	// btnHealthRecords.innerHTML = "Health Records";
	// btnHealthRecords.onclick = function() {
	// 	viewUserHealthRecords(id, firstName, lastName);
	// }

	// btnMedicalHistory.className = "btn btn-no-border btn-primary mt-2";
	// btnMedicalHistory.innerHTML = "Medical History";
	// btnMedicalHistory.onclick = function() {
	// 	viewUserMedicalHistory(id, firstName, lastName);
	// }
	
	newRow.appendChild(cellId);
		cellId.appendChild(imgId);
	newRow.appendChild(cellIdNumber);
	newRow.appendChild(cellName);
	newRow.appendChild(cellMobile);
	newRow.appendChild(cellEmail);
	newRow.appendChild(cellBirthday);
	newRow.appendChild(cellAddress);
	newRow.appendChild(cellNoOfAppointments);
	newRow.appendChild(cellLastAppointmentDate);
	// newRow.appendChild(cellHistory);
	// 	cellHistory.appendChild(btnAppointmentsHistory);
	// 	cellHistory.appendChild(btnHealthRecords);
	// 	cellHistory.appendChild(btnMedicalHistory);
	
	tbodyUsers.append(newRow);
}

function viewUserAppointmentHistory(idNumber) {
	window.location = "../appointments.html?id="+idNumber;
}

function viewUserHealthRecords(userUid, firstName, lastName) {
	divHealthRecordContainer.innerHTML = "";
	tvMHealthRecordPatientName.innerHTML = firstName + " " + lastName;
	showModal("#modalViewUserHealthRecord");

	const qryUserHealthRecord = query(collection(db, "healthRecords"), where("userUid", "==", userUid));
	getDocs(qryUserHealthRecord).then((healthRecords) => {
		healthRecords.forEach((record) => {
			renderHealthRecords(
				record.id,
				record.data().typeOfRecord,
				record.data().description,
				record.data().timestamp
			);
		});
	});
}

function renderHealthRecords(id, typeOfRecord, description, timestamp) {
	const cardContainer = document.createElement('div');
  	const card = document.createElement('div');
			const cardHeader = document.createElement('div');
				const tvTimestamp = document.createElement('p');
			const cardBody = document.createElement('div');
				const tvTypeOfRecord = document.createElement('h6');
				const tvDescription = document.createElement('p');

	cardContainer.classList = "col-12 container col p-4 pb-0 justify-content-center";
	card.classList = "rounded bg-white col-12 text-center p-4";
	cardHeader.classList = "row";
		tvTimestamp.classList = "col text-dark fw-medium text-start my-0";
	cardBody.classList = "col-12";
		tvTypeOfRecord.classList = "col text-start mt-1";
		tvDescription.classList = "text-dark text-start col mt-1";
		tvDescription.style.whiteSpace = "pre-wrap";

	tvTimestamp.innerHTML = dateFormatter(timestamp);
	tvTypeOfRecord.innerHTML = typeOfRecord;
	tvDescription.innerHTML = description;

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(cardBody);
				cardBody.appendChild(tvTypeOfRecord);
				cardBody.appendChild(tvDescription);

	divHealthRecordContainer.prepend(cardContainer);
}

function viewUserMedicalHistory(userUid, firstName, lastName) {
	divMedicalHistoryContainer.innerHTML = "";
	tvMedicalHistoryPatientName.innerHTML = firstName + " " + lastName;
	showModal("#modalViewUserMedicalHistory");

	const qryUserMedicalHistory = query(collection(db, "medicalHistory"), where("userUid", "==", userUid));
	getDocs(qryUserMedicalHistory).then((medicalEntries) => {
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

	cardContainer.classList = "col-12 container col p-4 pb-0 justify-content-center";
	card.classList = "rounded bg-white col-12 text-center p-4";
	cardHeader.classList = "row";
		tvTimestamp.classList = "col text-dark fw-medium text-start my-0";
	cardBody.classList = "col-12";
		divVitalsContainer.className = "row"
			tvVitalInformation.className = "col text-start mt-2";
			divVitalsLeft.className = "col-12 col-lg-6"
				tvBloodPressure.className = "col text-start m-0 p-0";
				tvRespiratoryRate.className = "col text-start m-0 p-0";
				tvBodyTemperature.className = "col text-start m-0 p-0";
				tvPulseRate.className = "col text-start m-0 p-0";
			divVitalsRight.className = "col-12 col-lg-6"
				tvO2SAT.className = "col text-start m-0 p-0";
				tvHeight.className = "col text-start m-0 p-0";
				tvWeight.className = "col text-start m-0 p-0";
		tvDiagnosisAndTreatment.classList = "col text-start mt-2";
		tvChiefComplaint.classList = "col text-start mt-1";
		tvDiagnosis.classList = "text-dark text-start col mt-1";
		tvDiagnosis.style.whiteSpace = "pre-wrap";
		tvMedications.classList = "text-dark text-start col mt-1";
		tvMedications.style.whiteSpace = "pre-wrap";
		tvTreatmentPlan.classList = "text-dark text-start col mt-1";
		tvTreatmentPlan.style.whiteSpace = "pre-wrap";

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

	cardContainer.appendChild(card);
		card.appendChild(cardHeader);
			cardHeader.appendChild(tvTimestamp);
			cardHeader.appendChild(cardBody);
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

	divMedicalHistoryContainer.prepend(cardContainer);
}

function viewPatientId(url) {
	imgId.src = url;

	showModal('#modalViewId');
}