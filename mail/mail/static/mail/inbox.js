document.addEventListener('DOMContentLoaded', function() {

  const toggle = document.querySelector('#toggle');
  toggle.addEventListener('change', darkmode);

  if (localStorage.getItem('dark-mode') === 'enabled') {
    toggle.checked = true;
  } else {
    toggle.checked = false;
  }

  ApplyDarkMode()

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // By default, load the inbox

  load_mailbox('inbox');
});

function darkmode() {
  const isDarkMode = document.querySelector('#toggle').checked;

  if (isDarkMode) {
    localStorage.setItem('dark-mode', 'enabled');
  } else {
    localStorage.setItem('dark-mode', 'disabled');
  }
  ApplyDarkMode()
}

function ApplyDarkMode() {
  const isDarkModeEnabled = localStorage.getItem('dark-mode') === 'enabled';
  const cards = document.querySelectorAll('.card');

  if (isDarkModeEnabled) {
    cards.forEach(card => card.classList.add('dark-mode'));
    document.body.classList.add('dark-mode'); 
  } else {
    cards.forEach(card => card.classList.remove('dark-mode'));
    document.body.classList.remove('dark-mode');
  }

}


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

    if (emails.length > 0){

      emails.forEach(email => {
      
        const emailElement = document.createElement('div');

        emailElement.innerHTML = `
          <div class="card my-2 rounded">
            <div class="p-2 d-flex justify-content-between" id="body${email.id}">
              <div class="d-flex align-items-center">
                <p class="mb-0" id="mailData"> Email from:${email.sender} Recived: ${email.timestamp} Subject: ${email.subject} </p>
              </div>
              <div class="d-flex align-items-center">
                <button id="Email${email.id}">Archive</button>
                <button id="page${email.id}" class="btn btn-success ml-2">See mail</button>
              </div>
            </div>
          </div>
        `;
        
        document.querySelector('#emails-view').append(emailElement);
        document.querySelector(`#page${email.id}`).addEventListener('click', () => showMail(email));

        archiveButton = document.querySelector(`#Email${email.id}`);

        if (mailbox == 'sent'){
          document.querySelectorAll('#mailData').forEach(element => element.innerHTML = `You sent this email at ${email.timestamp} to ${email.recipients}`) 
          archiveButton.style.display = 'none'
        }

        if (!email.archived){
          archiveButton.className = "btn btn-danger"
          archiveButton.innerHTML = "Archive this"
        } else{
          archiveButton.className = "btn btn-primary"
          archiveButton.innerHTML = "Unarchive this"
        }

        if (!email.read) {
          document.querySelector(`#body${email.id}`).style.backgroundColor = 'white';
        } else {
            document.querySelector(`#body${email.id}`).style.backgroundColor = '#b7b7b7';
        }
      
        archiveButton.addEventListener('click', () => archive(email));
      });
      ApplyDarkMode()
    }else{
      document.querySelector('#emails-view').innerHTML = `<h4> The ${mailbox} page don't have any results yet </h4> `
    }
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
        <button class="btn btn-secondary ml-3" id="reply">Reply</button>
      </div>
    </div>`;

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
    read: true
    }),
  })

  document.querySelector('#reply').addEventListener('click', () => reply(email));
}

function reply(email){
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-data').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  
  recipients = document.querySelector('#compose-recipients').value = email.sender;

  let subject = email.subject;
  if (!subject.startsWith("Re:")) {
    subject = "Re: " + subject;
  }

  document.querySelector('#compose-subject').value = subject;

  body = document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.recipients} writes: ${email.body} \n \n ---- \n \n`;

  document.querySelector('#compose-form').onsubmit = (event) => composeSubmit(event);

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
