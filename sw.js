

const CACHE_STATIC_NAME = "estatico-v1";
const CACHE_DYNAMIC_NAME = "dinamico-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";

self.addEventListener("install", evento => {

    const cachepwa = caches.open( CACHE_STATIC_NAME ).then( cache => {
        return cache.addAll([
            "/",
            "/index.html",
            "/css/style.css",
            "/img/logoUtng.jpg",
            "/js/script.js"
        ]);
    });

    const cacheinmutable =  caches.open( CACHE_INMUTABLE_NAME ).then( cache => {
        return cache.add("https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css");
    })

    evento.waitUntil( Promise.all([cachepwa, cacheinmutable]) );

});

// eliminar cache viejo
self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== CACHE_STATIC_NAME && key.includes('estatico') ) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil( respuesta );


});

self.addEventListener("fetch", evento => {

    const respuesta = caches.match( evento.request )
        .then( resp => {

            if(resp) return resp; 
    
            return fetch( evento.request ).then( nuevaRespuesta => {    

                caches.open( CACHE_DYNAMIC_NAME ).then( cache =>{
                    cache.put( evento.request, nuevaRespuesta);
                });

                return nuevaRespuesta.clone();

            }).catch(error => {

                if(evento.request.headers.get('accept').includes("text/html")){
                return caches.match("/pages/offline.html");
                }
            } );

    });

    evento.respondWith( respuesta );

});