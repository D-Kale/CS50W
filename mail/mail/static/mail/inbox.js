document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  recipients = document.querySelector('#compose-recipients').value = '';
  subject = document.querySelector('#compose-subject').value = '';
  body = document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = (event) => composeSubmit(event)
  
}

function composeSubmit(event) {

  event.preventDefault();

  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-data').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  showData(mailbox)
}

function showData(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {

        // Append each email to the emails-view
        const emailElement = document.createElement('div');
        emailElement.innerHTML = `
          <div class="card">
            <div class="card-header">
              from ${email.sender} to ${email.recipients}
            </div>
            <div class="card-body">
              <h5 class="card-title">${email.subject}</h5>
              <p class="card-text"> Date: ${email.timestamp} </p>
              <div class="d-flex">
                <a id="Email${email.id}">Archive</a>
                <a id="page${email.id}" class="btn btn-success ml-2">See mail</a>
              </div>
            </div>
          </div>
        `;
        document.querySelector('#emails-view').append(emailElement);
        document.querySelector(`#page${email.id}`).addEventListener('click', () => showMail(email));

        archiveButton = document.querySelector(`#Email${email.id}`);

        if (!email.archived){
          archiveButton.className = "btn btn-primary"
          archiveButton.innerHTML = "Archive this"
        } else{
          archiveButton.className = "btn btn-danger"
          archiveButton.innerHTML = "Unarchive this"
        }

        // Add event listener to archive button
        archiveButton.addEventListener('click', () => archive(email));
      });
  });
}

function showMail(email) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-data').style.display = 'block'

  document.querySelector('#email-data').innerHTML = 
    `<div class="container"> 
        <h1>${email.subject}</h1>
        <h3> from ${email.sender} to ${email.recipients}</h3>
        <p> ${email.body} </p>
        <br>
        <div class="d-flex">
          <p> ${email.timestamp} </p>
        </div>
      </div>`;
}



function archive(email) {

  const newArchivedStatus = !email.archived;

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: newArchivedStatus
    }),
  })
  .then(response => {
    if (response.ok) {
      load_mailbox('inbox');
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
}
