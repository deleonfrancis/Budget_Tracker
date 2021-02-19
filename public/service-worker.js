const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/style.css',
    '/js/index.js',
    '../routes/api.js', 
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ];
  
  const STATIC_CACHE = "static-cache-v1";
  const RUNTIME_CACHE = "runtime-cache";

self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(STATIC_CACHE)
        .then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
// Activate
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  // Fetch
  self.addEventListener("fetch", function(evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
    evt.respondWith(
      caches.match(evt.request).then(function(response) {
        return response || fetch(evt.request);
      })
    );
  });

    
//   self.addEventListener("install", event => {
//       console.log();
//     event.waitUntil(
//       caches
//         .open(STATIC_CACHE)
//         .then(cache => {console.log("cached success");return cache.addAll(FILES_TO_CACHE);})
//         // .then(cache => cache.addAll(FILES_TO_CACHE))
//         // .then(() => self.skipWaiting())
//     );
//     self.skipWaiting();
//   });
  
//   // The activate handler takes care of cleaning up old caches.
//   self.addEventListener("activate", event => {
//     const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
//     event.waitUntil(
//       caches
//         .keys()
//         .then(cacheNames => {
//           // return array of cache names that are old to delete
//           return cacheNames.filter(
//             cacheName => !currentCaches.includes(cacheName)
//           );
//         })
//         .then(cachesToDelete => {
//           return Promise.all(
//             cachesToDelete.map(cacheToDelete => {
//               return caches.delete(cacheToDelete);
//             })
//           );
//         })
//         .then(() => self.clients.claim())
//     );
//   });
  
//   self.addEventListener("fetch", event => {
//     // non GET requests are not cached and requests to other origins are not cached
//     if (
//       event.request.method !== "GET" ||
//       !event.request.url.startsWith(self.location.origin)
//     ) {
//       event.respondWith(fetch(event.request));
//       return;
//     }
  
//     // handle runtime GET requests for data from /api routes
//     if (event.request.url.includes("/api/images")) {
//       // make network request and fallback to cache if network request fails (offline)
//       event.respondWith(
//         caches.open(RUNTIME_CACHE).then(cache => {
//           return fetch(event.request)
//             .then(response => {
//               cache.put(event.request, response.clone());
//               return response;
//             })
//             .catch(() => caches.match(event.request));
//         })
//       );
//       return;
//     }
  
//     // use cache first for all other requests for performance
//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }
  
//         // request is not in cache. make network request and cache the response
//         return caches.open(RUNTIME_CACHE).then(cache => {
//           return fetch(event.request).then(response => {
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   });
