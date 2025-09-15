const registrationForm = document.getElementById("registrationForm");
const profileContainer = document.getElementById("profileContainer");
const tableBody = document.querySelector("#summaryTable tbody");
const successMsg = document.getElementById('successMessage');
const searchInput = document.getElementById('searchInput');

let students = JSON.parse(localStorage.getItem('students') || "[]");
let editEmail = null;

// Render all students (cards and table)
function renderStudents(filter = "") {
  profileContainer.innerHTML = "";
  tableBody.innerHTML = "";
  students
    .filter(s => {
      const search = filter.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.programme.toLowerCase().includes(search) ||
        s.year.toString().includes(search) ||
        (s.interests && s.interests.toLowerCase().includes(search))
      );
    })
    .forEach(student => {
      addProfileCard(student);
      addStudentToTable(student);
    });
}

// Add profile card
function addProfileCard(student) {
  const card = document.createElement("div");
  card.className = "profile-card";
  card.innerHTML = `
    <img src="${student.photoUrl || 'https://via.placeholder.com/100'}" alt="${student.firstName} ${student.lastName}">
    <h3>${student.firstName} ${student.lastName}</h3>
    <p><strong>Programme:</strong> <span class="profile-programme">${student.programme}</span></p>
    <p><strong>Year:</strong> <span class="profile-year">${student.year}</span></p>
    <p><strong>Interests:</strong> <span class="profile-interests">${student.interests || ''}</span></p>
    <button class="edit-btn">Edit</button>
    <button class="remove-btn">Remove</button>
  `;
  // Remove
  card.querySelector(".remove-btn").onclick = () => removeStudent(student.email);
  // Edit
  card.querySelector(".edit-btn").onclick = () => startEdit(student.email);
  profileContainer.appendChild(card);
}

// Add row to summary table
function addStudentToTable(student) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="table-name">${student.firstName} ${student.lastName}</td>
    <td class="table-email">${student.email}</td>
    <td class="table-programme">${student.programme}</td>
    <td class="table-year">${student.year}</td>
    <td class="table-interests">${student.interests || ''}</td>
    <td><button class="edit-btn">Edit</button></td>
    <td><button class="remove-btn">Remove</button></td>
  `;
  // Remove
  row.querySelector(".remove-btn").onclick = () => removeStudent(student.email);
  // Edit
  row.querySelector(".edit-btn").onclick = () => startEdit(student.email);
  tableBody.appendChild(row);
}

// Remove student
function removeStudent(email) {
  students = students.filter(s => s.email !== email);
  saveAndRender();
  successMsg.textContent = "Student removed.";
  successMsg.style.display = "block";
}

// Start editing
function startEdit(email) {
  const student = students.find(s => s.email === email);
  if (!student) return;
  registrationForm.firstName.value = student.firstName;
  registrationForm.lastName.value = student.lastName;
  registrationForm.email.value = student.email;
  registrationForm.programme.value = student.programme;
  registrationForm.year.value = student.year;
  registrationForm.interests.value = student.interests || "";
  registrationForm.photoUrl.value = student.photoUrl || "";
  registrationForm.email.setAttribute("disabled", "disabled");
  editEmail = email;
}

// Save to localStorage and re-render
function saveAndRender() {
  localStorage.setItem('students', JSON.stringify(students));
  renderStudents(searchInput.value);
}

// Form submit
registrationForm.addEventListener("submit", function(e) {
  e.preventDefault();
  // Clear errors
  ["FirstName","LastName","Email","Programme","Year","Interests","PhotoUrl"].forEach(function(field) {
    document.getElementById("error"+field).textContent = "";
  });
  const help = document.getElementById("formHelp");
  help.textContent = "";

  // Collect values
  const firstName = registrationForm.firstName.value.trim();
  const lastName = registrationForm.lastName.value.trim();
  const email = registrationForm.email.value.trim();
  const programme = registrationForm.programme.value;
  const year = registrationForm.year.value;
  const interests = registrationForm.interests.value.trim();
  const photoUrl = registrationForm.photoUrl.value.trim();

  let hasError = false;
  if (!firstName) { document.getElementById("errorFirstName").textContent = "First name is required."; hasError = true; }
  if (!lastName) { document.getElementById("errorLastName").textContent = "Last name is required."; hasError = true; }
  if (!email) { document.getElementById("errorEmail").textContent = "Email is required."; hasError = true; }
  else if (!/\S+@\S+\.\S+/.test(email)) { document.getElementById("errorEmail").textContent = "Please enter a valid email address."; hasError = true; }
  if (!programme) { document.getElementById("errorProgramme").textContent = "Programme is required."; hasError = true; }
  if (!year) { document.getElementById("errorYear").textContent = "Year is required."; hasError = true; }
  if (photoUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(photoUrl)) {
    document.getElementById("errorPhotoUrl").textContent = "Please enter a valid image URL (jpg, png, gif)."; hasError = true;
  }
  if (hasError) {
    help.textContent = "⚠️ Please fix the errors above.";
    help.setAttribute("aria-live", "assertive");
    return;
  }
  help.textContent = "";
  help.setAttribute("aria-live", "polite");

  // Check for duplicate email (unless editing)
  if (!editEmail && students.some(s => s.email === email)) {
    help.textContent = "⚠️ This email is already registered.";
    return;
  }

  const studentData = { firstName, lastName, email, programme, year, interests, photoUrl };

  if (editEmail) {
    // Update existing
    const idx = students.findIndex(s => s.email === editEmail);
    students[idx] = studentData;
    editEmail = null;
    registrationForm.email.removeAttribute("disabled");
    successMsg.textContent = "Student updated successfully!";
  } else {
    // Add new
    students.push(studentData);
    successMsg.textContent = "Student registered successfully!";
  }
  successMsg.style.display = "block";
  registrationForm.reset();
  saveAndRender();
});

// Show/Hide success message
document.getElementById('toggleSuccess').addEventListener('click', function() {
  if (!successMsg.textContent) successMsg.textContent = 'No message to show.';
  if (successMsg.style.display === 'none' || successMsg.style.display === '') {
    successMsg.style.display = 'block';
  } else {
    successMsg.style.display = 'none';
  }
});

// Search/filter
searchInput.addEventListener('input', function() {
  renderStudents(this.value);
});

// On load, render students
renderStudents();
