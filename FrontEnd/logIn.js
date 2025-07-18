let email = ''
let password = ''
let userId = ''
let userToken = ''

let LogInForm = document.querySelector('#logInForm');

let loginError = document.createElement('p');
loginError.classList.add('loginError');
loginError.innerText = "Erreur de connexion. Merci de vérifier vos identifiants.";


LogInForm.appendChild(loginError);

let emailInput = document.querySelector('#email');
let passwordInput = document.querySelector('#password');

emailInput.addEventListener('input', e => {
    email = e.target.value;
})

passwordInput.addEventListener('input', e => {
    password = e.target.value;
})

LogInForm.onsubmit = async (event) => {
    event.preventDefault();
    let response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": email,
            "password": password
        })
    })
    let result = await response.json();
    userId = result.userId;
    userToken = result.token;
    if (userId && userToken) {
        localStorage.setItem('userToken', userToken);
        localStorage.setItem('userId', userId);
        window.location.href = 'index.html'
    } else {
        loginError.style.display = 'flex';
        loginError.style.position = 'absolute';
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 5000);


    }
}

