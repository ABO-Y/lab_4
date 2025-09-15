document.getElementById("registrationForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Get the help message element
  const help = document.getElementById("formHelp");

  // Clear all inline errors
  ["FirstName","LastName","Email","Programme","Year","Interests","PhotoUrl"].forEach(function(field) {
    document.getElementById("error"+field).textContent = "";
  });

  // Collect form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const programme = document.getElementById("programme").value;
  const year = document.getElementById("year").value;
  const interests = document.getElementById("interests").value.trim();
  const photoUrl = document.getElementById("photoUrl").value.trim();

  let hasError = false;

  if (!firstName) {
    document.getElementById("errorFirstName").textContent = "First name is required.";
    hasError = true;
  }
  if (!lastName) {
    document.getElementById("errorLastName").textContent = "Last name is required.";
    hasError = true;
  }
  if (!email) {
    document.getElementById("errorEmail").textContent = "Email is required.";
    hasError = true;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    document.getElementById("errorEmail").textContent = "Please enter a valid email address.";
    hasError = true;
  }
  if (!programme) {
    document.getElementById("errorProgramme").textContent = "Programme is required.";
    hasError = true;
  }
  if (!year) {
    document.getElementById("errorYear").textContent = "Year is required.";
    hasError = true;
  }
  if (photoUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(photoUrl)) {
    document.getElementById("errorPhotoUrl").textContent = "Please enter a valid image URL (jpg, png, gif).";
    hasError = true;
  }

  if (hasError) {
    help.textContent = "⚠️ Please fix the errors above.";
    help.setAttribute("aria-live", "assertive");
    return;
  }
  help.textContent = "";
  help.setAttribute("aria-live", "polite");

  // Check for duplicate email in summary table
  const tableBody = document.querySelector("#summaryTable tbody");
  for (let tr of tableBody.children) {
    if (tr.children[3].textContent === email) {
      help.textContent = "⚠️ This email is already registered.";
      return; // Do not create profile card or table row
    }
  }

  const fullName = `${firstName} ${lastName}`;
  const yearValue = year;

  // Use placeholder if no valid photo URL
  const imageSrc = photoUrl || 'https://yourdomain.com/default-photo.jpg';

  // Create profile card
  const card = document.createElement("div");
  card.className = "profile-card";
  card.innerHTML = `
    <img src="${imageSrc}" alt="${fullName}">
    <h3>${fullName}</h3>
    <p><strong>Programme:</strong> <span class="profile-programme">${programme}</span></p>
    <p><strong>Year:</strong> <span class="profile-year">${yearValue}</span></p>
    <p><strong>Interests:</strong> <span class="profile-interests">${interests}</span></p>
    <button class="edit-btn">Edit</button>
    <button class="remove-btn">Remove</button>
  `;

  document.getElementById("profileContainer").appendChild(card);

  // Add row to summary table
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="table-name">${fullName}</td>
    <td class="table-programme">${programme}</td>
    <td class="table-year">${yearValue}</td>
    <td class="table-email">${email}</td>
    <td><button class="edit-btn">Edit</button></td>
    <td><button class="remove-btn">Remove</button></td>
  `;
  tableBody.appendChild(row);

  // Remove profile and table row when remove button is clicked
  function removeProfile() {
    card.remove();
    row.remove();
    updateStudentCount();
  }
  card.querySelector(".remove-btn").addEventListener("click", removeProfile);
  row.querySelector(".remove-btn").addEventListener("click", removeProfile);

  // Edit profile: populate form, disable email, set edit mode
  function editProfile() {
    document.getElementById("firstName").value = firstName;
    document.getElementById("lastName").value = lastName;
    document.getElementById("email").value = email;
    document.getElementById("programme").value = programme;
    document.getElementById("year").value = year;
    document.getElementById("interests").value = interests;
    document.getElementById("photoUrl").value = photoUrl;
    document.getElementById("email").setAttribute("disabled", "disabled");
    document.getElementById("registrationForm").setAttribute("data-editing", email);
  }
  card.querySelector(".edit-btn").addEventListener("click", editProfile);
  row.querySelector(".edit-btn").addEventListener("click", editProfile);

  updateStudentCount();

  // Show success message
  const successMsg = document.getElementById('successMessage');
  successMsg.textContent = 'Student registered successfully!';
  successMsg.style.display = 'block';
});

document.getElementById('toggleSuccess').addEventListener('click', function() {
  const msg = document.getElementById('successMessage');
  // If the message is empty, show a default message
  if (!msg.textContent) {
    msg.textContent = 'No message to show.';
  }
  if (msg.style.display === 'none' || msg.style.display === '') {
    msg.style.display = 'block';
  } else {
    msg.style.display = 'none';
  }
});
