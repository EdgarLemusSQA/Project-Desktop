const { BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const Confluences = require('./controllers/confluenceContronller');

let mainWindow;
let dashboardWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 618,
        resizable: false,
        maximizable: false,
        transparent: true,
        hiddenInset: true,
        title: "ATH | SQA | sqa.com.co",
        icon: path.join(__dirname, 'src/views/img/Icono Electron 2.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.setMenu(null);

    mainWindow.loadFile('src/views/index.html');

    // Ejecutar código para ocultar el scroll
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS('body { overflow: hidden; }');
    });
}

function createDashboard() {
    if (mainWindow) {
        mainWindow.close();
    }

    dashboardWindow = new BrowserWindow({
        width: 800,
        height: 800,
        resizable: false,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
    });

    dashboardWindow.setMenu(null);

    // Cargar el dashboard
    dashboardWindow.loadFile('src/views/dashboard.html');

    // Ejecutar código para ocultar el scroll
    dashboardWindow.webContents.on('did-finish-load', () => {
        dashboardWindow.webContents.insertCSS('body { overflow: hidden; }');
    });
}

ipcMain.handle('validateUser', async (event, { username, token }) => {
    try {
        const data = 'This is the data from Main Process';
        // Aquí haces la llamada asíncrona a tu método
        const isValid = await Confluences.getValidateUser(username, token);
        // Puedes devolver los datos y el estado de validación si lo necesitas
        return { data, isValid };
    } catch (error) {
        console.error('Error en la validación del usuario:', error);
        throw new Error('Error al validar el usuario');
    }
});

ipcMain.handle('processData', async (event, input) => {
    const result = `Processed data: ${input.toUpperCase()}`; // Procesa los datos (ejemplo)
    return result; // Devuelve el resultado
});

ipcMain.handle('login-success', () => {
    createDashboard();
});

ipcMain.handle('logout', async () => {
    // Eliminar todas las cookies
    session.defaultSession.clearStorageData({ storages: ['cookies'] }).then(() => {
        if (dashboardWindow) {
            dashboardWindow.close();
            dashboardWindow = null;
        }
        createWindow();
    });

    const cookies = await session.defaultSession.cookies.get({});
});

// Manejar la creación de cookies
ipcMain.handle('setCookies', async (event, { username, token }) => {
    await session.defaultSession.cookies.set({
        url: 'http://yourappdomain.com', // Cambia esto por la URL de tu aplicación
        name: 'userInfo',
        value: JSON.stringify({ user: username, password: token }),
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        session: true
    }).then(() => {
        console.log('User info stored in session cookie');
    }).catch((error) => {
        console.error('Error storing user info in session cookie:', error);
    });
});

ipcMain.handle('getSpaces', async () => {
    try {
        const spaces = await Confluences.getSpaces();
        return { spaces };
    } catch (error) {
        console.error('Error en la validación del usuario:', error);
        throw new Error('Error al validar el usuario');
    }
});

ipcMain.handle('getPagesForSpace', async (event, { idSpace }) => {
    try {
        const idParent = await Confluences.getPagesForSpace(idSpace);
        return { idParent };
    } catch (error) {
        console.error('Error en la validación del usuario:', error);
        throw new Error('Error al validar el usuario');
    }
});

ipcMain.handle('getPagesForParent', async (event, { idSpaceParent }) => {
    try {
        const pages = await Confluences.getPagesForParent(idSpaceParent);
        return { pages };
    } catch (error) {
        console.error('Error en la validación del usuario:', error);
        throw new Error('Error al validar el usuario');
    }
});

ipcMain.handle('validateExistUserHistory', async (event, { issue }) => {
    try {
        const isValid = await Confluences.validateExistUserHistory(issue);
        return { isValid };
    } catch (error) {
        console.error('Error en la validación del usuario:', error);
        throw new Error('Error al validar el usuario');
    }
});

ipcMain.handle('createPages', async (event, { spaceId, title, subPageId }) => {
    try {
        const isValid = await Confluences.createPages(spaceId, title, subPageId);
        return { isValid };
    } catch (error) {
        console.error('Error en la validación del usuario:', error);
        throw new Error('Error al validar el usuario');
    }
});



ipcMain.handle('getCookies', async () => {
    const cookies = await session.defaultSession.cookies.get({});
    const userInfoCookie = cookies.find(cookie => cookie.name === 'userInfo');
    const infoUser = JSON.parse(userInfoCookie.value)
    return infoUser;
});

module.exports = {
    createWindow,
    createDashboard
};