// --- 1. CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://rwndahfhxxasuwycfjug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bmRhaGZoeHhhc3V3eWNmanVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzA3MjUsImV4cCI6MjA2ODYwNjcyNX0.gZCP_LDl_WDqnhIIDHdqa-kWsDkYpxJ6RQxZcPtC0ZQ';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA DE AUTENTICACIÓN DINÁMICA ---
const authLinksContainer = document.getElementById('auth-links');
const authLinksMobileContainer = document.getElementById('auth-links-mobile');

supabase.auth.onAuthStateChange((event, session) => {
    const userLoggedIn = !!session;
    const authHtml = userLoggedIn
        ? `<a href="mi-cuenta.html" class="bg-brand-dark-blue text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition text-xs uppercase">MI CUENTA</a>`
        : `<a href="login.html" class="bg-brand-dark-blue text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition text-xs uppercase">INICIAR SESIÓN</a>`;
    
    if (authLinksContainer) {
        authLinksContainer.innerHTML = authHtml;
    }
    if (authLinksMobileContainer) {
         authLinksMobileContainer.innerHTML = authHtml.replace('py-2 px-4', 'py-2 px-4 w-full text-center block');
    }
});

// --- LÓGICA PARA MENÚ MÓVIL ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
        
if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}
        
// --- LÓGICA PARA CARGAR PAQUETES (DESTACADOS Y GRUPALES) ---
const destacadosContainer = document.getElementById('destacados-container');
const grupalesContainer = document.getElementById('grupales-container');

function crearTarjetaPaquete(paquete, tipo) {
    const imageUrl = paquete.imagen_url || 'recursos/placeholder.png';
    const detailPageUrl = `detalle-paquete.html?id=${paquete.id}&type=${tipo}`;

    if (tipo === 'grupales' || tipo === 'regionales') {
        return `
            <div class="card-paquete-grupales rounded-lg shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <a href="${detailPageUrl}" class="block">
                    <img class="w-full h-48 object-cover" src="${imageUrl}" alt="Imagen de ${paquete.nombre}">
                </a>
                <div class="card-footer p-4 flex flex-col flex-grow text-center">
                    <h3 class="text-xl font-bold uppercase">${paquete.nombre}</h3>
                </div>
            </div>
        `;
    } else {
        const iconosHtml = (paquete.iconos || [])
            .map(icon => `<i class="fas fa-${icon} text-brand-light-teal mr-2"></i>`)
            .join('');

        return `
            <div class="card-paquete rounded-lg shadow-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                <a href="${detailPageUrl}" class="block">
                    <img class="w-full h-48 object-cover" src="${imageUrl}" alt="Imagen de ${paquete.nombre}">
                </a>
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-xl font-bold text-white">${paquete.nombre}</h3>
                    <p class="text-xs text-gray-400 uppercase mt-1 mb-2">${paquete.descripcion_corta || ''}</p>
                    <div class="flex items-center text-sm my-2">
                       ${iconosHtml}
                    </div>
                    <div class="mt-auto pt-2 flex justify-between items-center">
                        <span class="text-2xl font-black text-brand-light-teal">${paquete.precio}</span>
                        <a href="${detailPageUrl}" class="bg-brand-dark-blue text-white border border-brand-light-teal font-bold py-1 px-3 rounded-full hover:bg-brand-light-teal hover:text-brand-dark-blue transition text-xs uppercase">
                            Ver Más
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

async function cargarPaquetes(tipo, container, limite) {
    if (!container) return;
    container.innerHTML = `<p class="text-gray-600 text-center col-span-full">Cargando paquetes...</p>`;

    const tableName = tipo === 'grupales' ? 'grupales_paquetes' : 'destacados';
    
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('orden', { ascending: true })
        .limit(limite);

    if (error) {
        console.error(`Error al cargar los paquetes ${tipo}:`, error);
        container.innerHTML = `<p class="text-red-500 text-center col-span-full">No se pudieron cargar los paquetes.</p>`;
        return;
    }

    if (data && data.length > 0) {
        container.innerHTML = data.map(paquete => crearTarjetaPaquete(paquete, tipo)).join('');
    } else {
        container.innerHTML = `<p class="text-gray-600 text-center col-span-full">No hay paquetes ${tipo} disponibles.</p>`;
    }
}

// --- LÓGICA PARA SLIDER DE QUINCEAÑERAS ---
async function loadQuinceanerasSlider() {
    const swiperContainer = document.querySelector('.quinceaneras-slider');
    if (!swiperContainer) return;
    const swiperWrapper = document.getElementById('quinceaneras-slider-wrapper');
    if (!swiperWrapper) return;

    const { data, error } = await supabase
        .from('quinceaneras_slider_images')
        .select('imagen_url')
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
        console.error('No se encontraron imágenes para el slider de quinceañeras o hubo un error:', error);
               swiperWrapper.innerHTML = `<div class="swiper-slide"><img src="recursos/FOTOS PARA MÓDULOS/MÓDULO 6_ QUINCEAÑERAS/PLACASFEED13-07.png" class="w-full h-96 object-cover" alt="Imagen de Quinceañeras"></div>`;
    } else {
        swiperWrapper.innerHTML = data.map(img => `
            <div class="swiper-slide">
                <img src="${img.imagen_url}" class="w-full h-96 object-cover" alt="Imagen de viaje de quinceañeras">
            </div>
        `).join('');
    }

    new Swiper('.quinceaneras-slider', {
        loop: data && data.length > 1,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}
// --- NUEVA LÓGICA DE BÚSQUEDA ---
// --- NUEVA LÓGICA DE BÚSQUEDA (MEJORADA) ---
async function performSearch() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    
    const resultsContainer = document.getElementById('search-results-container');
    const searchTitle = document.getElementById('search-title');

    if (!query || !resultsContainer || !searchTitle) {
        return;
    }

    searchTitle.textContent = `Resultados para: "${query}"`;
    resultsContainer.innerHTML = `<p class="text-gray-600 text-center col-span-full">Buscando paquetes...</p>`;

    const tablesToSearch = [
        { name: 'destacados', type: 'destacados' },
        { name: 'grupales_paquetes', type: 'grupales' },
        { name: 'eventos_paquetes', type: 'eventos' },
        { name: 'regiones_paquetes', type: 'regionales' }
    ];
    
    let allResults = [];
    const promises = [];

    for (const table of tablesToSearch) {
        // Construimos el filtro de búsqueda de forma dinámica
        // Campos base que todas las tablas deberían tener
        const baseFilter = `nombre.ilike.%${query}%,subtitulo.ilike.%${query}%,descripcion.ilike.%${query}%`;
        
        let finalFilter;
        if (table.name === 'regiones_paquetes') {
            // Esta tabla usa 'continente' como campo de región
            finalFilter = `${baseFilter},continente.ilike.%${query}%`;
        } else {
            // Las otras tablas usan 'region'
            finalFilter = `${baseFilter},region.ilike.%${query}%`;
        }
        
        // Añadimos la consulta a un array de promesas para ejecutarlas en paralelo
        promises.push(
            supabase
                .from(table.name)
                .select('*')
                .or(finalFilter)
                .then(({ data, error }) => {
                    if (error) {
                        console.error(`Error buscando en la tabla ${table.name}:`, error);
                        return [];
                    }
                    // Añadimos el tipo a cada resultado para que la tarjeta se genere correctamente
                    return data ? data.map(item => ({ ...item, type: table.type })) : [];
                })
        );
    }

    // Esperamos a que todas las búsquedas terminen
    const resultsByTable = await Promise.all(promises);
    
    // Unimos todos los resultados en un solo array
    allResults = resultsByTable.flat();

    if (allResults.length > 0) {
        resultsContainer.innerHTML = allResults.map(paquete => crearTarjetaPaquete(paquete, paquete.type)).join('');
    } else {
        resultsContainer.innerHTML = `<p class="text-gray-600 text-center col-span-full">No se encontraron paquetes que coincidan con tu búsqueda.</p>`;
    }
}


// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Lógica para decidir qué funciones ejecutar dependiendo de la página
    if (window.location.pathname.includes('search-results.html')) {
        performSearch();
    } else if (window.location.pathname.includes('paquetes-destino.html')) {
        loadRegionPackages();
    } else {
        // Se ejecuta en index.html
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = document.getElementById('search-input').value;
                if (query) {
                    window.location.href = `search-results.html?query=${encodeURIComponent(query)}`;
                }
            });
        }
        
        // ... (resto de las funciones de inicialización de la página principal)
        const packageLimit = window.innerWidth < 768 ? 4 : 8;
        cargarPaquetes('destacados', destacadosContainer, packageLimit);
        cargarPaquetes('grupales', grupalesContainer, packageLimit);
        cargarEventos();
        loadQuinceanerasSlider();
        loadGroupBanners();
        loadDestinationsCarousel();
    }
});

// --- LÓGICA PARA CARGAR BANNERS DE SALIDAS GRUPALES ---
async function loadGroupBanners() {
    const swiperWrapper = document.querySelector('.banner-grupales-slider .swiper-wrapper');
    if (!swiperWrapper) return;
    swiperWrapper.innerHTML = `<div class="swiper-slide text-center text-white flex items-center justify-center">Cargando...</div>`;

    const { data, error } = await supabase
        .from('grupales_banners')
        .select('imagen_url, texto_overlay')
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error fetching group banners:', error);
        swiperWrapper.innerHTML = `<div class="swiper-slide text-center text-red-500 flex items-center justify-center">Error al cargar banners.</div>`;
        return;
    }

    if (data && data.length > 0) {
        swiperWrapper.innerHTML = data.map(banner => `
            <div class="swiper-slide">
                 <img src="${banner.imagen_url}" class="absolute inset-0 w-full h-full object-cover" alt="${banner.texto_overlay || 'Banner de viaje grupal'}">
                 <div class="absolute inset-0 bg-black/40"></div>
                 <h3 class="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider text-white text-center px-4">
                    <span class="juntos-text">${banner.texto_overlay || ''}</span>
                 </h3>
            </div>
        `).join('');
    } else {
        swiperWrapper.innerHTML = `<div class="swiper-slide"><img src="https://rwndahfhxxasuwycfjug.supabase.co/storage/v1/object/public/imagenes-web/destinos/grupo.jpg" class="absolute inset-0 w-full h-full object-cover" alt="Viajes en grupo"><div class="absolute inset-0 bg-black/40"></div><h3 class="relative z-10 text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider text-white text-center px-4"><span class="juntos-text">JUNTOS POR EL MUNDO</span></h3></div>`;
    }

    new Swiper('.banner-grupales-slider', {
        loop: data && data.length > 1,
        effect: 'fade',
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    });
}

// --- LÓGICA PARA CARGAR EL CARRUSEL DE DESTINOS ---
async function loadDestinationsCarousel() {
    const swiperWrapper = document.getElementById('destinos-container');
    if (!swiperWrapper) return;
    
    swiperWrapper.innerHTML = `<div class="swiper-slide text-center text-gray-600 flex items-center justify-center">Cargando destinos...</div>`;

    const { data, error } = await supabase
        .from('regiones_destinos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error fetching destinations:', error);
        swiperWrapper.innerHTML = `<div class="swiper-slide text-center text-red-500 flex items-center justify-center">Error al cargar destinos.</div>`;
        return;
    }

    if (data && data.length > 0) {
        swiperWrapper.innerHTML = data.map(destino => `
            <div class="swiper-slide rounded-lg overflow-hidden shadow-lg flex flex-col">
                <a href="paquetes-destino.html?region=${destino.continente}" class="block">
                    <img class="w-full h-48 object-cover" src="${destino.imagen_url}" alt="Imagen de ${destino.continente}">
                    <div class="overlay">
                        <h3 class="text-2xl font-bold">${destino.continente}</h3>
                    </div>
                </a>
            </div>
        `).join('');
    } else {
        swiperWrapper.innerHTML = `<div class="swiper-slide text-center text-gray-600 flex items-center justify-center">No hay destinos disponibles.</div>`;
    }

     new Swiper('.swiper-destinos', {
        slidesPerView: 2,
        spaceBetween: 10,
        // Puede que tengas 'breakpoints' aquí
        breakpoints: {
            640: { slidesPerView: 3, spaceBetween: 20 },
            768: { slidesPerView: 4, spaceBetween: 30 },
            1024: { slidesPerView: 5, spaceBetween: 30 },
        },
        navigation: {
            nextEl: '#busca-destino .swiper-button-next',
            prevEl: '#busca-destino .swiper-button-prev',
        },

        // --- AÑADIR ESTAS LÍNEAS ---
        loop: true, // Para que el carrusel sea infinito
        speed: 2000, // Velocidad de la transición en milisegundos (2 segundos)
        autoplay: {
            delay: 1, // El delay entre transiciones, lo ponemos casi a 0
            disableOnInteraction: false, // El autoplay no se detiene si el usuario interactúa
        },
        // --- FIN DE LAS LÍNEAS A AÑADIR ---
    });
}

// --- LÓGICA PARA CARGAR EVENTOS IMPERDIBLES ---
const eventosContainer = document.getElementById('eventos-container');

function crearTarjetaEvento(evento) {
    const imageUrl = evento.imagen_url || 'recursos/placeholder.png';
    const detailPageUrl = `detalle-paquete.html?id=${evento.id}&type=eventos`;

    return `
        <div class="text-center group">
            <a href="${detailPageUrl}">
                <img class="w-40 h-40 rounded-full object-cover mx-auto shadow-lg border-4 border-white transform group-hover:scale-105 transition-transform duration-300" src="${imageUrl}" alt="Imagen de ${evento.nombre}">
            </a>
            <a href="${detailPageUrl}" class="mt-4 inline-block bg-brand-dark-blue text-white font-bold py-2 px-8 rounded-full hover:bg-opacity-90 transition uppercase">
                ${evento.nombre}
            </a>
        </div>
    `;
}

async function cargarEventos() {
    if (!eventosContainer) return;
    eventosContainer.innerHTML = `<p class="text-gray-600">Cargando eventos...</p>`;

    const { data, error } = await supabase
        .from('eventos_paquetes')
        .select('*')
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error al cargar los eventos:', error);
        eventosContainer.innerHTML = `<p class="text-red-500">No se pudieron cargar los eventos.</p>`;
        return;
    }

    if (data && data.length > 0) {
        eventosContainer.innerHTML = data.map(evento => crearTarjetaEvento(evento)).join('');
    } else {
        eventosContainer.innerHTML = `<p class="text-gray-600">No hay eventos disponibles en este momento.</p>`;
    }
}

// --- LÓGICA PARA CARGAR PAQUETES POR REGIÓN ---
async function loadRegionPackages() {
    const params = new URLSearchParams(window.location.search);
    const regionParam = params.get('region');
    if (!regionParam) return;
    
    const paquetesContainer = document.getElementById('paquetes-container');
    const regionTitle = document.getElementById('region-title');

    if (regionTitle) regionTitle.textContent = `Paquetes en ${regionParam.toUpperCase()}`;
    if (paquetesContainer) paquetesContainer.innerHTML = `<p class="text-gray-600 text-center col-span-full">Cargando paquetes...</p>`;
    
    const { data, error } = await supabase
        .from('regiones_paquetes')
        .select('*')
        .eq('continente', regionParam);

    if (error) {
        console.error('Error al cargar paquetes de la región:', error);
        if (paquetesContainer) paquetesContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Error al cargar los paquetes.</p>`;
        return;
    }

    if (data && data.length > 0) {
        if (paquetesContainer) paquetesContainer.innerHTML = data.map(paquete => crearTarjetaPaquete(paquete, 'regionales')).join('');
    } else {
        if (paquetesContainer) paquetesContainer.innerHTML = `<p class="text-gray-600 text-center col-span-full">No hay paquetes disponibles para esta región.</p>`;
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('paquetes-destino.html')) {
        loadRegionPackages();
    } else {
        const scrollerInner = document.querySelector(".scroller__inner");
        if (scrollerInner) {
            const scrollerContent = Array.from(scrollerInner.children);
            scrollerContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute("aria-hidden", true);
                scrollerInner.appendChild(duplicatedItem);
            });
        }
        
        const isMobile = window.innerWidth < 768;
        const packageLimit = isMobile ? 4 : 8;

        cargarPaquetes('destacados', destacadosContainer, packageLimit);
        cargarPaquetes('grupales', grupalesContainer, packageLimit);
        cargarEventos();
        loadQuinceanerasSlider();
        loadGroupBanners();
        loadDestinationsCarousel();
    }
});