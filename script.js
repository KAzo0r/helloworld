// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 50);
});

// Interactive elements hover effect for cursor
const interactiveElements = document.querySelectorAll('a, button, input, select, .project-card');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorFollower.style.width = '50px';
        cursorFollower.style.height = '50px';
        cursorFollower.style.background = 'rgba(0, 240, 255, 0.1)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursorFollower.style.width = '30px';
        cursorFollower.style.height = '30px';
        cursorFollower.style.background = 'transparent';
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Reveal elements on scroll
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);
// Trigger once on load
reveal();

// Form submission to backend
const joinForm = document.querySelector('.join-form');
if(joinForm) {
    joinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = joinForm.querySelector('button');
        const originalText = btn.textContent;
        
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const track = document.getElementById('reg-track').value;

        btn.textContent = 'Отправка...';
        btn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, track })
            });

            if(response.ok) {
                btn.textContent = 'Успешно отправлено! 🚀';
                btn.style.background = '#00ffaa';
                btn.style.color = '#000';
                joinForm.reset();
            } else {
                btn.textContent = 'Ошибка отправки ❌';
                btn.style.background = '#ff0055';
            }
        } catch(error) {
            btn.textContent = 'Ошибка сети ❌';
            btn.style.background = '#ff0055';
        }
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
        }, 3000);
    });
}

// Yandex Maps Initialization
if (typeof ymaps !== 'undefined') {
    ymaps.ready(initMap);
}

let myMap, trafficControl;
let metroCollection, evCollection, busCollection;

function initMap() {
    myMap = new ymaps.Map("smart-map", {
        center: [41.311081, 69.240562], // Tashkent
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
    }, {
        suppressMapOpenBlock: true
    });

    // 1. Traffic Layer
    trafficControl = new ymaps.control.TrafficControl({ state: { providerKey: 'traffic#actual', trafficShown: true } });
    myMap.controls.add(trafficControl);
    
    // Attempt to get traffic score to display in the UI
    trafficControl.getProvider('traffic#actual').state.events.add('change', function () {
        var level = trafficControl.getProvider('traffic#actual').state.get('level');
        if(level) {
            document.getElementById('traffic-score').innerText = level;
        }
    });

    // 2. Collections for different layers
    metroCollection = new ymaps.GeoObjectCollection(null, { preset: 'islands#redCircleDotIcon' });
    evCollection = new ymaps.GeoObjectCollection(null, { preset: 'islands#blueAutoIcon' });
    busCollection = new ymaps.GeoObjectCollection(null, { preset: 'islands#greenMassTransitIcon' });

    // Metro Stations (Tashkent)
    const metroStations = [
        { coords: [41.3117, 69.2801], name: 'Амир Темур Хиёбони' },
        { coords: [41.3236, 69.2393], name: 'Чорсу' },
        { coords: [41.3150, 69.2693], name: 'Мустакиллик майдони' },
        { coords: [41.3115, 69.2562], name: 'Пахтакор' },
        { coords: [41.2858, 69.2064], name: 'Чиланзар' }
    ];
    metroStations.forEach(station => {
        metroCollection.add(new ymaps.Placemark(station.coords, { balloonContent: '🚇 ' + station.name }));
    });

    // EV Charging
    const evStations = [
        { coords: [41.3156, 69.2805], name: 'EV Charge - 50kW' },
        { coords: [41.2995, 69.2435], name: 'Tokbor - Fast Charge' },
        { coords: [41.3262, 69.2941], name: 'Smart Grid EV' }
    ];
    evStations.forEach(station => {
        evCollection.add(new ymaps.Placemark(station.coords, { balloonContent: '⚡ ' + station.name }));
    });

    // Bus stops (Search via Yandex)
    ymaps.geocode('Ташкент, автобусная остановка', { results: 10 }).then(function (res) {
        res.geoObjects.each(function (obj) {
            obj.options.set('preset', 'islands#greenMassTransitIcon');
            busCollection.add(obj);
        });
    });

    // Add layers to map
    myMap.geoObjects.add(metroCollection);
    myMap.geoObjects.add(evCollection);
    myMap.geoObjects.add(busCollection);

    // Bind checkboxes
    document.getElementById('layer-traffic').addEventListener('change', function(e) {
        if(e.target.checked) {
            trafficControl.show();
            trafficControl.getProvider('traffic#actual').state.set('infoLayerShown', true);
        } else {
            trafficControl.hide();
        }
    });

    document.getElementById('layer-metro').addEventListener('change', function(e) {
        e.target.checked ? myMap.geoObjects.add(metroCollection) : myMap.geoObjects.remove(metroCollection);
    });

    document.getElementById('layer-ev').addEventListener('change', function(e) {
        e.target.checked ? myMap.geoObjects.add(evCollection) : myMap.geoObjects.remove(evCollection);
    });

    document.getElementById('layer-bus').addEventListener('change', function(e) {
        e.target.checked ? myMap.geoObjects.add(busCollection) : myMap.geoObjects.remove(busCollection);
    });
}
