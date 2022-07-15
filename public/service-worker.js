console.log("Hello from your service-worker.js file!");

const CACHE_NAME = "my-site-cache-v2";
const DATA_CACHE_NAME = 'data-cache-v2';

const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/styles.css',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
    './js/index.js',
    './js/db.js'
];
// this installs the service worker
self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Your files were pre-caches successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting()
})

// this activates the service worker & removes old data from the cache
self.addEventListener('activate', function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Remove old cache data', key);
                        return caches.delete(key);
                    }
                })
            )
        }
        )
    )
    self.clients.claim();
})

//intercept fetch requests
self.addEventListener('fetch', function (evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(evt.request)
                        .then(response => {
                            //if response was good, clone it & store it in the cache
                            if (response.status === 200) {
                                //clone means copys
                                cache.put(evt.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            //network request failed, try to get it from the cache
                            return cache.match(evt.request);
                        });
                })
                .catch(err => console.log(err))
        );
        return;
    }
    evt.respondWith(
        fetch(evt.request).catch(function () {
            return caches.match(evt.request).then(function (response) {
                if (response) {
                    return response;
                } else if (evt.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/')
                }
            })
        })
    )
})