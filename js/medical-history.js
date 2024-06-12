import { db, auth, storage } from '../js/firebase.js';
import { onAuthStateChanged, getAuth } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';
import { doc, collection, collectionGroup, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, query, where, orderBy, startAt, endAt, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { showModal, titleCase, hideModal, dayMonthYearFormatter, resetValidation, invalidate, dateFormatter } from '../js/utils.js';

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
	const cellName = document.createElement('td');
	const cellMobile = document.createElement('td');
	const cellEmail = document.createElement('td');
	const cellAddress = document.createElement('td');
	const cellNumOfRecords = document.createElement('td');
	const cellLastEntryDate = document.createElement('td');
	const cellViewRecords = document.createElement('td');
		const btnMedicalHistory = document.createElement('button');
	// const cellHistory = document.createElement('td');
	// const btnAppointmentsHistory = document.createElement('button');
	// const btnHealthRecords = document.createElement('button');

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

	cellName.innerHTML = firstName + " " + lastName;
	cellMobile.innerHTML = mobile;
	cellEmail.innerHTML = email;
	cellAddress.innerHTML = addressPurok + ", " + addressBarangay + ", Siaton";

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

	btnMedicalHistory.className = "btn btn-no-border btn-primary mt-2";
	btnMedicalHistory.innerHTML = "View";
	btnMedicalHistory.onclick = function() {
		viewUserMedicalHistory(id, firstName, lastName);
	}

	getDocs(query(collection(db, "medicalHistory"), where("userUid", "==", id), orderBy("timestamp", "desc"))).then((entry) => {
		cellNumOfRecords.innerHTML = entry.size + " appts.";
		cellLastEntryDate.innerHTML = (entry.size==0)?"N/A":dayMonthYearFormatter(entry.docs[0].data().timestamp);
	});
	
	newRow.appendChild(cellName);
	newRow.appendChild(cellMobile);
	newRow.appendChild(cellEmail);
	newRow.appendChild(cellAddress);
	newRow.appendChild(cellNumOfRecords);
	newRow.appendChild(cellLastEntryDate);
	newRow.appendChild(cellViewRecords);
	// 	cellHistory.appendChild(btnAppointmentsHistory);
	// 	cellHistory.appendChild(btnHealthRecords);
		cellViewRecords.appendChild(btnMedicalHistory);
	
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

	// cardContainer.classList = "col-12 container col p-4 pb-0 justify-content-center";
	// card.classList = "rounded bg-white col-12 text-center p-4";
	// cardHeader.classList = "row";
	// 	tvTimestamp.classList = "col text-dark fw-medium text-start my-0";
	// cardBody.classList = "col-12";
	// 	divVitalsContainer.className = "row d-none"
	// 		tvVitalInformation.className = "col text-start mt-2 nurseui";
	// 		divVitalsLeft.className = "col-12 col-lg-6 nurseui"
	// 			tvBloodPressure.className = "col text-start m-0 p-0";
	// 			tvRespiratoryRate.className = "col text-start m-0 p-0";
	// 			tvBodyTemperature.className = "col text-start m-0 p-0";
	// 			tvPulseRate.className = "col text-start m-0 p-0";
	// 		divVitalsRight.className = "col-12 col-lg-6 nurseui"
	// 			tvO2SAT.className = "col text-start m-0 p-0";
	// 			tvHeight.className = "col text-start m-0 p-0";
	// 			tvWeight.className = "col text-start m-0 p-0";
	// 			tvDiagnosisAndTreatment.classList = "col mt-0 pt-0 text-start d-none";
	// 	tvChiefComplaint.classList = "col text-start mt-1 mb-0 pb-0 doctorui";
	// 	tvDiagnosis.classList = "text-dark text-start col mt-1 doctorui";
	// 	tvDiagnosis.style.whiteSpace = "pre-wrap";
	// 	tvMedications.classList = "text-dark text-start col mt-1 d-none doctorui";
	// 	tvMedications.style.whiteSpace = "pre-wrap";
	// 	tvTreatmentPlan.classList = "text-dark text-start col mt-1 d-none doctorui";
	// 	tvTreatmentPlan.style.whiteSpace = "pre-wrap";
	// cardFooter.classList = "col-12";
	// 	divButtonContainer.classList = "col-12 text-start";
	// 		btnSeeMore.classList = "btn btn-primary";
	// 		btnSeeLess.classList = "btn btn-primary d-none";

	cardContainer.classList = "col-12 container col p-4 pb-0 justify-content-center";
	card.classList = "rounded bg-white col-12 text-center p-4";
	cardHeader.classList = "row";
		tvTimestamp.classList = "col text-dark fw-medium text-start my-0";
	cardBody.classList = "col-12";
		divVitalsContainer.className = "row"
			tvVitalInformation.className = "col text-start mt-2 nurseui";
			divVitalsLeft.className = "col-12 col-lg-6 nurseui"
				tvBloodPressure.className = "col text-start m-0 p-0";
				tvRespiratoryRate.className = "col text-start m-0 p-0";
				tvBodyTemperature.className = "col text-start m-0 p-0";
				tvPulseRate.className = "col text-start m-0 p-0";
			divVitalsRight.className = "col-12 col-lg-6 nurseui"
				tvO2SAT.className = "col text-start m-0 p-0";
				tvHeight.className = "col text-start m-0 p-0";
				tvWeight.className = "col text-start m-0 p-0";
				tvDiagnosisAndTreatment.classList = "col mt-0 pt-0 text-start doctorui";
		tvChiefComplaint.classList = "col text-start mt-1 mb-0 pb-0 doctorui";
		tvDiagnosis.classList = "text-dark text-start col mt-1 doctorui";
		tvDiagnosis.style.whiteSpace = "pre-wrap";
		tvMedications.classList = "text-dark text-start col mt-1 doctorui";
		tvMedications.style.whiteSpace = "pre-wrap";
		tvTreatmentPlan.classList = "text-dark text-start col mt-1 doctorui";
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
		// card.appendChild(cardFooter);
		// 	cardFooter.appendChild(divButtonContainer);
		// 		divButtonContainer.appendChild(btnSeeMore);
		// 		divButtonContainer.appendChild(btnSeeLess);

	divMedicalHistoryContainer.append(cardContainer);

	const nurseui = document.querySelectorAll(".nurseui");
	const doctorui = document.querySelectorAll(".doctorui");

	if (!chiefComplaint) {
		nurseui.forEach(ui => {
			ui.classList.toggle("d-none", false);
		});
		doctorui.forEach(ui => {
			ui.classList.toggle("d-none", true);
		});
	}
	else if (!bloodPressure) {
		nurseui.forEach(ui => {
			ui.classList.toggle("d-none", true);
		});
		doctorui.forEach(ui => {
			ui.classList.toggle("d-none", false);
		});
	}
}

function viewPatientId(url) {
	imgId.src = url;

	showModal('#modalViewId');
}