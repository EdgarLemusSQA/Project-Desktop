const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    invokeHello: () => ipcRenderer.invoke('hello'),
    validateUser: (username, token) => ipcRenderer.invoke('validateUser', { username, token }),
    sendData: (data) => ipcRenderer.invoke('processData', data),
    loginSucces: () => ipcRenderer.invoke('login-success'),
    logout: () => ipcRenderer.invoke('logout'),
    setCookies: (username, token) => ipcRenderer.invoke('setCookies', { username, token }),
    getCookies: () => ipcRenderer.invoke('getCookies'),
    getSpaces: () => ipcRenderer.invoke('getSpaces'),
    getPagesForSpace: (idSpace) => ipcRenderer.invoke('getPagesForSpace', { idSpace }),
    getPagesForParent: (idSpaceParent) => ipcRenderer.invoke('getPagesForParent', { idSpaceParent }),
    validateExistUserHistory: (issue) => ipcRenderer.invoke('validateExistUserHistory', { issue }),
    createPages: (structure, spaceId, title, subPageId) => ipcRenderer.invoke('createPages', { structure, spaceId, title, subPageId })
});