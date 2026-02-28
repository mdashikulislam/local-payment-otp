// ==UserScript==
// @name         Socket
// @namespace    http://tampermonkey.net/
// @version      V10.0.0.5
// @description  Advanced IVAC automation system
// @author       System Administrator
// @match        http://192.168.110.31:6002/*
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      api.ivacbd.com
// @noframes
// ==/UserScript==

(async function () {
    'use strict';
    await addJsLib();
    let socket;
    const socketUrl = 'http://192.168.110.31:6001/';
    socket = io(socketUrl, {
        transports: ["websocket"],
        upgrade: false,
        secure: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 300,
        reconnectionDelayMax: 1000,
        timeout: 10000,
        forceNew: true
    });
    socket.on('connect', async () => {
        console.log(`✅ Connected to socket server`, true);
    });

    async function addJsLib() {
        return new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = () => res();
            script.onerror = e => rej(e);
            document.head.appendChild(script);
        });
    }
})();