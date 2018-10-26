console.log('... Service Worker File Running ...');

importScripts("https://www.gstatic.com/firebasejs/5.2.0/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/5.2.0/firebase-messaging.js")


// Initialize Firebase
var config = {
    apiKey: "AIzaSyCWtXna_6Pq0PfT1dPFLkygwog7qMq_fF4",
    authDomain: "paki-olx.firebaseapp.com",
    databaseURL: "https://paki-olx.firebaseio.com",
    projectId: "paki-olx",
    storageBucket: "paki-olx.appspot.com",
    messagingSenderId: "889849646518"
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

const cacheName = 'Olx-App1';
const staticAssets = [
    '/',
    '/style.css',
    '/messages.html',
    '/favourite.html',
    '/app.js',
    '/images/OLX-Logo.png'
]

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(staticAssets);
        })
    );
})

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

async function cacheFirst(req) {
    const cacheResponse = await caches.match(req);
    return cacheResponse || fetch(req);
}

async function networkFirst(req) {
    const cache = await caches.open(cacheName);
    try {
        const res = await fetch(req);
        cache.put(req, res.clone())
        return res
    } catch (error) {
        return await cache.match(req)
    }
}

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request)
        }).catch(function (error) {
            console.log(error)
        }).then(function (response) {
            return caches.open(cacheName).then(function (cache) {
                if (event.request.url.indexOf('test') < 0) {
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
        })

    );
});


// self.addEventListener('push', function (event) {
//     // console.log('Received a push message', event);

//     var notification = event.data.json().notification
//     // console.log(notification)
//     var title = notification.title || 'Yay a message.';
//     var body = notification.body || 'We have received a push message.';
//     var icon = 'images/OLX-Logo.png';
//     // var tag = 'simple-push-demo-notification-tag';

//     event.waitUntil(
//       self.registration.showNotification(title, {
//         body: body,
//         icon: icon,
//         // tag: tag
//       })
//     );

//   });