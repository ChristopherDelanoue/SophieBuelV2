let allPhotos = [];
let categories = [{'id':0, 'name': 'Tous'}];
let userId = localStorage.userId;
let userToken = localStorage.userToken;

const gallery = document.querySelector('.gallery');
const login_Text = document.querySelector('#login-text');


startProject()

function startProject() {
    getPhotos();
    getCategories()
}

function getPhotos() {
    let response = fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(data => {
            data.forEach(photo => {
                allPhotos.push(photo);
                createGallery(allPhotos);
            })
            loginText(userId)
        });
}


function createGallery(photosToDisplay) {
    gallery.innerHTML = '';

    if (photosToDisplay.length === 0) {
        const noPhotosMessage = document.createElement('p');
        noPhotosMessage.textContent = "Aucune œuvre ne correspond à cette catégorie.";
        gallery.appendChild(noPhotosMessage);
        return;
    }

    photosToDisplay.forEach((photo) => {
        const galleryItem = document.createElement('figure');
        galleryItem.innerHTML = `
            <img src="${photo.imageUrl}" alt="${photo.title}">
            <figcaption>${photo.title}</figcaption>
        `;
        gallery.appendChild(galleryItem);
    });
}

function getCategories() {
    let response = fetch('http://localhost:5678/api/categories')
        .then((response) => response.json())
        .then(cat => {
            cat.forEach(cat => {
                categories.push(cat);
            })
            let filterContainer = document.querySelector('.filter');
            categories.forEach(cat => {
                let categoryButton = document.createElement('p');
                categoryButton.innerText = `${cat.name}`
                categoryButton.setAttribute('class', 'filter-button');
                categoryButton.dataset.id = cat.id;
                filterContainer.appendChild(categoryButton);
                if (cat.name === 'Tous') {
                    categoryButton.classList.add('active');
                }
            })
            addCategoryEventListeners()
            showModal()
        })
}

function addCategoryEventListeners() {
    let filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedCategoryId = e.target.dataset.id;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            let photosToDisplay;

            if (selectedCategoryId == 0) {
                photosToDisplay = allPhotos;
            } else {
                photosToDisplay = allPhotos.filter(photo => {
                    return photo.categoryId === Number(selectedCategoryId);
                });
            }

            createGallery(photosToDisplay);
        });
    });
}

/* login */

let loginBtn = document.querySelector('#login-btn');
let loginLink = document.querySelector('#login-text');
let loginClass = document.querySelectorAll('.login-class');
let editionBanner = document.querySelectorAll('#mode-edition');

function loginText(userid) {
    if (userid && userToken) {
        loginLink.innerText = "Logout"
        loginLink.setAttribute('href', 'index.html');
    } else {
        loginClass.forEach((btn) => {
            btn.style.display = 'none';
        });
    }
}

loginBtn.addEventListener('click', (e)=> {
    if (login_Text.innerText === 'Logout') {
        if (localStorage.userId !== null) {
            window.location.reload();
            localStorage.removeItem('userToken');
            localStorage.removeItem('userId');
        } else {
            window.location.href = 'login.html';
        }
    }
});


/* modal */

let modal = null

function showModal() {
    modalSuppression();
    modalAjout()
}



let btnModal = document.querySelector('.js-modal')

btnModal.addEventListener('click', (e) => {
    openModal(e)
})

function openModal(event) {
    event.preventDefault();
    modal = document.querySelector(event.target.getAttribute('href'));
    modal.style.display = null;
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    modal.addEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
}

function closeModal(event) {
    if (modal === null) return;
    event.preventDefault();
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)
    modal = null;
}

function stopPropagation(e) {
    e.stopPropagation()
}

function retourModal(event) {
    event.preventDefault();
    modal.querySelector('btnRetour').removeEventListener('click', closeModal)
}

window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal(e);
    }
});

async function modalPhoto(container) {
    let response  = await fetch('http://localhost:5678/api/works');
    let photo = await response.json();
    photo.forEach((img) => {
        let photoDiv = document.createElement('div');
        photoDiv.classList.add('photoDiv');
        photoDiv.innerHTML = `
                <img src="${img.imageUrl}" alt="${img.name}">
                <i id="${img.id}" class="fa-solid fa-trash poubelle"></i>
                `
        container.append(photoDiv)
        let poubelleImage = photoDiv.querySelector('.poubelle')
        poubelleImage.addEventListener('click', async (e) => {
            const photoId = parseInt(e.target.id);

            try {
                const res = await fetch(`http://localhost:5678/api/works/${photoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });

                if (res.ok) {
                    photoDiv.remove();
                    allPhotos = allPhotos.filter(photo => photo.id !== photoId);
                    createGallery(allPhotos);
                } else {
                    console.warn("Suppression échouée :", await res.text());
                    alert("Erreur lors de la suppression.");
                }
            } catch (err) {
                console.error("Erreur réseau :", err);
                alert("Erreur réseau pendant la suppression.");
            }
        });
    })
}

function modalSuppression() {
    let aside = document.createElement('aside');
    aside.classList.add('modal');
    aside.setAttribute('id', 'modal1');
    aside.setAttribute('aria-hidden', 'true');
    aside.setAttribute('role', 'dialog');
    aside.style.display = 'none';
    let modalWrapper = document.createElement('div');
    modalWrapper.classList.add('js-modal-stop');
    let modalContent = document.createElement('div');
    modalContent.classList.add('modalContent');
    modalContent.innerHTML = `<h2>Galerie photo</h2>`
    modalWrapper.appendChild(modalContent);
    let btnCLoseModal = document.createElement('div');
    btnCLoseModal.innerHTML = `<i class="fa-regular fa-xmark"></i>`;
    btnCLoseModal.setAttribute('class', 'js-modal-close')
    modalWrapper.appendChild(btnCLoseModal);
    modalWrapper.classList.add('modal-wrapper');
    let photoModalContainer = document.createElement('div');
    photoModalContainer.classList.add('photoModalContainer');
    modalPhoto(photoModalContainer)
    modalContent.appendChild(photoModalContainer);
    let divBtn = document.createElement('div');
    divBtn.classList.add('btnDiv');
    let btnAjoutPhoto  = document.createElement('button');
    btnAjoutPhoto.classList.add('buttonFondGris');
    btnAjoutPhoto.classList.add('vert')
    btnAjoutPhoto.setAttribute('id', 'btnAjoutPhoto');
    btnAjoutPhoto.innerText = 'Ajouter une photo'
    /**** a revoir absolument ****/
    btnAjoutPhoto.addEventListener('click', (e) => {
        e.preventDefault();

        // Fermer modal1
        if (modal) {
            modal.style.display = "none";
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        }

        // Ouvrir modal2
        let modal2 = document.getElementById('modal2');
        modal2.style.display = null;
        modal2.removeAttribute('aria-hidden');
        modal2.setAttribute('aria-modal', 'true');
        btnAjoutPhoto.focus()
        // Mise à jour de la référence
        modal = modal2;

        // Réattacher les events sur modal2
        modal2.addEventListener('click', closeModal)
        modal2.querySelector('.js-modal-close').addEventListener('click', closeModal);
        modal2.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
    });
    let line = document.createElement('hr');
    line.classList.add('line');
    divBtn.appendChild(line);
    divBtn.appendChild(btnAjoutPhoto);
    modalContent.appendChild(divBtn);

    aside.appendChild(modalWrapper);
    document.body.appendChild(aside);
}



function modalAjout() {
    let titrePhotoSelect = '';
    let categorieSelect = '';
    let photoSelect = null;

    let aside = document.createElement('aside');
    aside.classList.add('modal');
    aside.setAttribute('id', 'modal2');
    aside.setAttribute('aria-hidden', 'true');
    aside.setAttribute('role', 'dialog');
    aside.style.display = 'none';

    let modalWrapper = document.createElement('div');
    modalWrapper.classList.add('js-modal-stop');
    modalWrapper.classList.add('modal-wrapper');

    let modalContent = document.createElement('div');
    modalContent.classList.add('modalContent');
    modalContent.innerHTML = `<h2>Ajout photo</h2>`;
    modalWrapper.appendChild(modalContent);

    let btnCLoseModal = document.createElement('div');
    btnCLoseModal.innerHTML = `<i class="fa-regular fa-xmark"></i>`;
    btnCLoseModal.setAttribute('class', 'js-modal-close');
    modalWrapper.appendChild(btnCLoseModal);

    let btnRetour = document.createElement('div');
    btnRetour.classList.add('btnRetour');
    btnRetour.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
    modalWrapper.appendChild(btnRetour);

    btnRetour.addEventListener('click', (e) => {
        e.preventDefault();
        if (modal) {
            modal.style.display = "none";
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        }

        let modal1 = document.getElementById('modal1');
        modal1.style.display = null;
        modal1.removeAttribute('aria-hidden');
        modal1.setAttribute('aria-modal', 'true');
        modal = modal1;

        modal1.addEventListener('click', closeModal);
        modal1.querySelector('.js-modal-close').addEventListener('click', closeModal);
        modal1.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
        razGallerieContainer()
    });

    let photoAjoutFormulaire = document.createElement('form');
    photoAjoutFormulaire.setAttribute('id', 'photoFormulaireAjout');

    let divAjoutPhoto = document.createElement('div');
    divAjoutPhoto.classList.add('divAjoutPhoto');

    //ajout photo

    let inputAjoutPhoto = document.createElement('input');
    inputAjoutPhoto.setAttribute('type', 'file');
    inputAjoutPhoto.style.cursor = 'pointer';
    inputAjoutPhoto.setAttribute('id', 'inputAjoutPhoto');

    let imgAffichagePreview = document.createElement('img');
    imgAffichagePreview.setAttribute('id', 'preview');
    imgAffichagePreview.setAttribute('src', '');
    imgAffichagePreview.style.display = 'none';

    divAjoutPhoto.appendChild(imgAffichagePreview);

    let customButton = document.createElement('p');
    customButton.classList.add('customButton');
    customButton.innerHTML = '+ Ajouter photo';

    let divCustomButton = document.createElement('div');
    divCustomButton.classList.add('divCustomButton');
    divCustomButton.style.gap = '10px';

    let iconePicture = document.createElement('i');
    iconePicture.classList.add("fa-solid", 'fa-image');
    iconePicture.style.color = '#CBD6DC';
    iconePicture.style.fontSize = '70px';

    divCustomButton.appendChild(iconePicture);
    divCustomButton.appendChild(customButton);
    divCustomButton.appendChild(inputAjoutPhoto);

    let descriptionUpload = document.createElement('p');
    descriptionUpload.classList.add('descriptionUpload');
    descriptionUpload.innerText = `jpg, png: 4mo max`;
    divCustomButton.appendChild(descriptionUpload);

    divAjoutPhoto.appendChild(divCustomButton);

    inputAjoutPhoto.addEventListener('change', (e) => {
        showFile(e.target);
    });

    function showFile(input) {
        let file = input.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                alert("Format invalide. Seules les images JPG et PNG sont acceptées.");
                input.value = ''; // vide l’input
                return;
            }
            const maxSize = 4 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("Fichier trop lourd. Taille maximale autorisée : 4 Mo.");
                input.value = ''; // on vide l’input
                return;
            }
            photoSelect = file;
            const reader = new FileReader();
            reader.onload = function (event) {
                imgAffichagePreview.src = event.target.result;
                imgAffichagePreview.style.display = 'block';
                divCustomButton.style.display = 'none';
                verificationChampRempli();
            }
            reader.readAsDataURL(file);
        }
    }

    let titreLabel = document.createElement('label');
    titreLabel.innerText = 'Titre';

    let photoInputTitre = document.createElement('input');
    photoInputTitre.classList.add('input-title');

    photoInputTitre.addEventListener('input', (e) => {
        titrePhotoSelect = e.target.value;
        verificationChampRempli();
    });

    let categorieLabel = document.createElement('label');
    categorieLabel.innerText = 'Catégorie';

    let ajoutPhotoCategorieSelect = document.createElement('select');
    ajoutPhotoCategorieSelect.addEventListener('change', (e) => {
        categorieSelect = e.currentTarget.value;
        verificationChampRempli();
    });

    createOption(ajoutPhotoCategorieSelect);

    photoAjoutFormulaire.appendChild(divAjoutPhoto);
    photoAjoutFormulaire.appendChild(titreLabel);
    photoAjoutFormulaire.appendChild(photoInputTitre);
    photoAjoutFormulaire.appendChild(categorieLabel);
    photoAjoutFormulaire.appendChild(ajoutPhotoCategorieSelect);

    let divBtn = document.createElement('div');
    divBtn.classList.add('btnDiv');

    let btnValidePhoto = document.createElement('button');
    btnValidePhoto.classList.add('buttonFondGris');
    btnValidePhoto.setAttribute('id', 'btnValidePhoto');
    btnValidePhoto.innerText = 'Valider';

    let line = document.createElement('hr');
    line.classList.add('line');

    divBtn.appendChild(line);
    divBtn.appendChild(btnValidePhoto);
    photoAjoutFormulaire.appendChild(divBtn);
    modalContent.appendChild(photoAjoutFormulaire);

    aside.appendChild(modalWrapper);
    document.body.appendChild(aside);

    function verificationChampRempli() {
        if (
            titrePhotoSelect.trim() !== '' &&
            categorieSelect.trim() !== '' &&
            photoSelect instanceof File
        ) {
            btnValidePhoto.classList.add('vert');
        } else {
            btnValidePhoto.classList.remove('vert');
        }
    }

    // envoi API
    photoAjoutFormulaire.onsubmit = async (event) => {
        event.preventDefault();

        if (!photoSelect || !titrePhotoSelect || !categorieSelect) {
            alert("Merci de remplir tous les champs !");
            return; 
        }

        const formData = new FormData();
        formData.append('image', photoSelect);
        formData.append('title', titrePhotoSelect);
        formData.append('category', parseInt(categorieSelect));

        try {
            const response = await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + userToken
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Réponse serveur :", errorText);
                throw new Error(`Erreur serveur: ${response.status}`);
            } else {
                allPhotos = []
                getPhotos()
                razGallerieContainer()
            }

        } catch (error) {
            console.error("Erreur pendant l'envoi :", error);
            alert("Erreur d'envoi. Vérifie bien tous les champs.");
        }
        // Reset
        photoAjoutFormulaire.reset();
        photoSelect = null;
        titrePhotoSelect = '';
        categorieSelect = '';
        imgAffichagePreview.style.display = 'none';
        divCustomButton.style.display = 'block';
        btnValidePhoto.classList.remove('vert');
    };
}

function createOption(divParente) {
    for (cat of categories) {
        if (cat.name === 'Tous') {
            let option = document.createElement('option');
            option.innerText = '--- Choisir votre catégorie ---';
            divParente.appendChild(option);
        } else {
            let option = document.createElement('option');
            option.value = cat.id;
            option.innerText = cat.name;
            divParente.appendChild(option);
        }
    }
}

async function razGallerieContainer() {
    let container = document.querySelector('.photoModalContainer')
    if (container) {
        container.innerHTML = '';
        await modalPhoto(container)
    }
}