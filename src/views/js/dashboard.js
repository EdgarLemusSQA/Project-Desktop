let spaceId = "";
let subPageId = "";

document.addEventListener('DOMContentLoaded', async () => {
    getInfo();
});

// Manejar el cierre de sesión
document.getElementById('logoutButton').addEventListener('click', async () => {
    await window.electronAPI.logout();
});

// Botón de Inicio: Mostrar el contenido inicial
document.getElementById('inicio').addEventListener('click', () => {
    getInfo();
});

function getInfo() {
    const content = document.getElementById('content');

    fetch('pages/info.html')
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data; // Carga el contenido en el div 'content'
        })
        .catch(error => console.error('Error al cargar el contenido:', error));
}

document.getElementById('generateStructure').addEventListener('click', async () => {
    const spaces = await window.electronAPI.getSpaces();
    const parsedSpaces = JSON.parse(spaces.spaces);

    const content = document.getElementById('content');
    // Usar AJAX para cargar el contenido de 'generateStructure.html'
    fetch('pages/generateStructure.html')
        .then(response => response.text())
        .then(data => {
            content.innerHTML = data; // Carga el contenido en el div 'content'

            // Ahora que el contenido está cargado, llama a la función que llena el primer select
            showFirstDropdown(parsedSpaces.results);
        })
        .catch(error => console.error('Error al cargar el contenido:', error));
});

function showFirstDropdown(spaces) {
    const firstDropdown = document.getElementById('dropdown1');
    if (!firstDropdown) {
        console.error('El select con id "dropdown1" no se encuentra en el DOM');
        return;
    }

    // Si el select está presente, agregar las opciones
    spaces.forEach((space, index) => {
        const option = document.createElement('option');
        option.value = space.id;  // El valor de la opción será el "id"
        option.textContent = `${space.id} - ${space.name}`;  // El texto visible será algo como "Opción 1"
        firstDropdown.appendChild(option);  // Añadir la opción al select
    });

    firstDropdown.addEventListener('change', async function (event) {
        // Obtener el valor seleccionado
        const selectedValue = event.target.value;

        const idParent = await window.electronAPI.getPagesForSpace(selectedValue);

        spaceId = selectedValue;
        const pages = await window.electronAPI.getPagesForParent(JSON.parse(idParent.idParent));

        //Segunda Lista Despegable
        const secondDropdown = document.getElementById('dropdown2');
        pages.pages.forEach((page, index) => {
            const option = document.createElement('option');
            option.value = page.id;  // El valor de la opción será el "id"
            option.textContent = `${page.id} - ${page.title}`;  // El texto visible será algo como "Opción 1"
            secondDropdown.appendChild(option);  // Añadir la opción al select
        });

        secondDropdown.addEventListener('change', async function (event) {
            const secondSelectedValue = event.target.value;

            const subPages = await window.electronAPI.getPagesForParent(secondSelectedValue);

            const thirdDropdown = document.getElementById('dropdown3');
            subPages.pages.forEach((subPage, index) => {
                const option = document.createElement('option');
                option.value = subPage.id;  // El valor de la opción será el "id"
                option.textContent = `${subPage.id} - ${subPage.title}`;  // El texto visible será algo como "Opción 1"
                thirdDropdown.appendChild(option);  // Añadir la opción al select
            });

            thirdDropdown.addEventListener('change', async function (event) {
                const thirdSelectedValue = event.target.value;
                subPageId = thirdSelectedValue;
            });
        });
    });
}

async function showSecondDropdown(idParent) {

    const secondDropdownContainer = document.getElementById('secondDropdownContainer');
    secondDropdownContainer.innerHTML = '';

    secondDropdownContainer.innerHTML = `
        <select id="dropdown2" class="form-control" onchange="showThirdDropdown()">
            <option value="" disabled selected>Seleccione una opción</option>
        </select>
    `;
}

function showThirdDropdown() {
    const thirdDropdownContainer = document.getElementById('thirdDropdownContainer');
    thirdDropdownContainer.innerHTML = `
        <select id="dropdown3" class="form-control" onchange="showInputField()">
            <option value="" disabled selected>Seleccione una opción</option>
        </select>
    `;
}

function showInputField() {
    const inputContainer = document.getElementById('inputContainer');
    inputContainer.innerHTML = `
        <div id="radioGroup" class="d-flex mb-3">
            <label class="me-3 d-flex align-items-center">
                <input type="radio" name="structure" value="Estructura 1" class="me-1" checked>
                <a href="#" class="radio-link" data-title="Estructura 1" data-image="img/Estructura 1.png">Estructura 1</a>
            </label>
            <label class="me-3 d-flex align-items-center">
                <input type="radio" name="structure" value="Estructura 2" class="me-1">
                <a href="#" class="radio-link" data-title="Estructura 2" data-image="img/Estructura 2.png">Estructura 2</a>
            </label>
            <label class="me-3 d-flex align-items-center">
                <input type="radio" name="structure" value="Estructura 3" class="me-1">
                <a href="#" class="radio-link" data-title="Estructura 3" data-image="img/Estructura 3.png">Estructura 3</a>
            </label>
            <label class="d-flex align-items-center">
                <input type="radio" name="structure" value="Estructura 4" class="me-1">
                <a href="#" class="radio-link" data-title="Estructura 4" data-image="img/Estructura 4.png">Estructura 4</a>
            </label>
        </div>
        <input id="textInput" type="text" class="form-control" placeholder="REQ-XXXX" required>
        <button id="submitButton" class="btn btn-primary mt-3" onclick="submitInput()">Enviar</button>
        
        <!-- Modal -->
        <div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="imageModalLabel">Título del Radio Button</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="modalImage" src="" alt="Imagen asociada" class="img-fluid">
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar evento a cada enlace con clase "radio-link"
    document.querySelectorAll('.radio-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
            
            const title = link.getAttribute('data-title');
            const imageSrc = link.getAttribute('data-image');

            const modalImage = document.getElementById('modalImage');
            const modalTitle = document.getElementById('imageModalLabel');
            
            // Actualizar contenido del modal
            modalImage.src = imageSrc;
            modalTitle.textContent = title;

            // Mostrar el modal
            const imageModalElement = document.getElementById('imageModal');
            const imageModal = new bootstrap.Modal(imageModalElement);
            imageModal.show();
        });
    });

    // Evento para resetear el modal al cerrarse
    const imageModalElement = document.getElementById('imageModal');
    imageModalElement.addEventListener('hidden.bs.modal', () => {
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('imageModalLabel');

        // Resetear contenido del modal
        modalImage.src = '';
        modalTitle.textContent = 'Título del Radio Button';
    });
}


async function submitInput() {

    const textInput = document.getElementById('textInput');
    const select1 = document.getElementById('dropdown1');
    const select2 = document.getElementById('dropdown2');
    const select3 = document.getElementById('dropdown3');
    const submitButton = document.getElementById('submitButton');
    const radioGroup = document.getElementsByName('structure');
    let selectedRadio = null;

    // Verificar cuál radio button está seleccionado
    for (const radio of radioGroup) {
        if (radio.checked) {
            selectedRadio = radio.value;
            break;
        }
    }

    if (!selectedRadio) {
        // Mostrar mensaje de error si no hay radio button seleccionado
        const modalMessage = document.getElementById('mandatoryFieldMessage');
        modalMessage.textContent = "Por favor, selecciona una estructura.";
        const mandatoryFieldModal = new bootstrap.Modal(document.getElementById('mandatoryFieldModal'));
        mandatoryFieldModal.show();
        return;
    }

    if (!textInput.value.trim()) {
        const modalMessage = document.getElementById('mandatoryFieldMessage');
        modalMessage.textContent = "El campo de texto es obligatorio. Por favor, ingresa un Id de Historia de Usuario.";
        const mandatoryFieldModal = new bootstrap.Modal(document.getElementById('mandatoryFieldModal'));
        mandatoryFieldModal.show();
        enableElements(select1, select2, select3, textInput, submitButton, radioGroup);
        return;
    }

    const isValid = await window.electronAPI.validateExistUserHistory(textInput.value);

    console.log(selectedRadio);

    disableElements(select1, select2, select3, textInput, submitButton, radioGroup);

    if (isValid.isValid === "200") {
        await window.electronAPI.createPages(selectedRadio, spaceId, textInput.value, subPageId);
        // Mostrar el modal de éxito
        showSuccessModal("¡Las carpetas se crearon exitosamente en Confluence!");
        enableElements(select1, select2, select3, textInput, submitButton, radioGroup);
    } else {
        // Mostrar el modal de error
        showErrorModal(isValid.isValid);
        enableElements(select1, select2, select3, textInput, submitButton, radioGroup);
    }

    textInput.value = '';
}

// Función para mostrar el modal de error
function showErrorModal(message) {
    const errorModalMessage = document.getElementById('errorModalMessage');
    errorModalMessage.textContent = message;

    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}

function showSuccessModal(message) {
    const successModalMessage = document.getElementById('successModalMessage');
    successModalMessage.textContent = message;

    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // Al cerrar el modal de éxito, habilitar los elementos nuevamente
    successModal._element.addEventListener('hidden.bs.modal', () => {
        const select1 = document.getElementById('dropdown1');
        const select2 = document.getElementById('dropdown2');
        const select3 = document.getElementById('dropdown3');
        const textInput = document.getElementById('textInput');
        const submitButton = document.getElementById('submitButton');
        const radioGroup = document.getElementsByName('structure');
        enableElements(select1, select2, select3, textInput, submitButton, radioGroup);
    });
}

function disableElements(select1, select2, select3, textInput, submitButton, radioGroup) {
    if (select1) select1.disabled = true;
    if (select2) select2.disabled = true;
    if (select3) select3.disabled = true;
    if (textInput) textInput.disabled = true;
    if (submitButton) submitButton.disabled = true;
    for (const radio of radioGroup) {
        radio.checked = false;
        radio.disabled = true;
    }
}

// Función para habilitar los elementos
function enableElements(select1, select2, select3, textInput, submitButton, radioGroup) {
    if (select1) select1.disabled = false;
    if (select2) select2.disabled = false;
    if (select3) select3.disabled = false;
    if (textInput) textInput.disabled = false;
    if (submitButton) submitButton.disabled = false;
    for (const radio of radioGroup) {
        radio.disabled = false;
    }
}