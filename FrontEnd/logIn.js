let email = ''
let password = ''
let userId = ''
let userToken = ''

let emailInput = document.querySelector('#email');
let passwordInput = document.querySelector('#password');

emailInput.addEventListener('input', e => {
    email = e.target.value;
    console.log(email);
})

passwordInput.addEventListener('input', e => {
    password = e.target.value;
    console.log(password);
})

let LogInForm = document.querySelector('#logInForm');

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
        console.log(`l'utilisateur : ${userId} avec le toker : ${userToken}`);
        window.location.href = 'index.html'
    } else {
        alert(`Erreur de connecxion merci de vous identifier`)
    }
}

