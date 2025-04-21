
document.addEventListener("DOMContentLoaded", function () {
    const auth = firebase.auth();
const database = firebase.database();
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Finding Ayurvedic centers near you...</div>
    `;
    document.body.appendChild(loadingOverlay);

    // Add back button
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => {
        window.history.back();
    });
    document.body.appendChild(backButton);

    // Add filter options
    const filters = document.createElement('div');
    filters.className = 'filters';
    filters.innerHTML = `
        <div class="filter-option active" data-distance="all">All Centers</div>
        <div class="filter-option" data-distance="5">Within 5 km</div>
        <div class="filter-option" data-distance="10">Within 10 km</div>
        <div class="filter-option" data-distance="20">Within 20 km</div>
    `;
    document.body.appendChild(filters);

    // Replace with your Firebase configuration
    

    // Replace with your Mapbox Access Token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhcnJvbGluZWdsYWRpYSIsImEiOiJjbHJreXdqdzgwbTRrMnFvangxdTRlcDNhIn0.QnA09V9tXuzVI71gMyP0eQ';

    // Create a map with custom options for ayurvedic theme
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10', // Using a lighter style for ayurvedic theme
        zoom: 13
    });

    // Add map controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }), 'bottom-right');

    // Store markers and practitioner data
    let userMarker = null;
    let practitionerMarkers = [];
    let userLocation = null;
    let currentActiveFilter = 'all';

    // Options for high accuracy mode
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    // Function to calculate distance between two points in km
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    // Function to update markers based on filter
    function updateMarkers(filterDistance) {
        practitionerMarkers.forEach(marker => {
            const distance = marker.properties.distance;
            
            if (filterDistance === 'all' || distance <= parseInt(filterDistance)) {
                marker.addTo(map);
            } else {
                marker.remove();
            }
        });
    }

    // Set up filter click events
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.filter-option').forEach(el => {
                el.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Apply filter
            currentActiveFilter = e.target.getAttribute('data-distance');
            updateMarkers(currentActiveFilter);
        });
    });

    // Watch the user's current location
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            userLocation = { latitude, longitude };
            
            // Set the map's center to the user's location
            map.setCenter([longitude, latitude]);
            
            // Add user marker
            if (userMarker) userMarker.remove();
            userMarker = new mapboxgl.Marker({ color: '#4c8a54', scale: 1 })
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML("<div class='practitioner-card'><div class='practitioner-name'>Your Location</div></div>"))
                .addTo(map);
            
            // Fetch Ayurvedic centers (doctors) from Firebase
            fetchAyurvedicCenters(latitude, longitude);
        },
        error => {
            console.error('Error getting user location:', error);
            loadingOverlay.innerHTML = `
                <div class="loading-text">Could not access your location. Please enable location services.</div>
                <button class="back-button" style="position:static;margin-top:20px;">Try Again</button>
            `;
            document.querySelector('.loading-overlay .back-button').addEventListener('click', () => {
                window.location.reload();
            });
        },
        geoOptions
    );

    // Function to fetch and display Ayurvedic centers
    function fetchAyurvedicCenters(userLat, userLng) {
        // Clear existing markers
        practitionerMarkers.forEach(marker => marker.remove());
        practitionerMarkers = [];

        // Fetch doctor addresses from Firebase
        database.ref('users/doctors').once('value').then(snapshot => {
            const doctors = snapshot.val();
            if (!doctors) {
                loadingOverlay.remove();
                return;
            }

            let geocodingPromises = [];
            
            // Loop through doctors and prepare geocoding requests
            Object.keys(doctors).forEach(doctorId => {
                const doctor = doctors[doctorId];
                
                if (doctor.address) {
                    const geocodingPromise = new Promise((resolve, reject) => {
                        const geocodingEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(doctor.address)}.json?access_token=${mapboxgl.accessToken}`;
                        
                        fetch(geocodingEndpoint)
                            .then(response => response.json())
                            .then(data => {
                                const features = data.features;
                                
                                if (features && features.length > 0) {
                                    const [longitude, latitude] = features[0].center;
                                    const distance = calculateDistance(userLat, userLng, latitude, longitude);
                                    
                                    resolve({
                                        doctor,
                                        longitude,
                                        latitude,
                                        distance: distance.toFixed(1)
                                    });
                                } else {
                                    reject('No valid coordinates found');
                                }
                            })
                            .catch(error => {
                                reject(error);
                            });
                    });
                    
                    geocodingPromises.push(geocodingPromise);
                }
            });
            
            // Process all geocoding requests
            Promise.allSettled(geocodingPromises).then(results => {
                // Sort centers by distance
                const validResults = results
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value)
                    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
                
                // Create markers for all practitioners
                validResults.forEach((result) => {
                    const { doctor, longitude, latitude, distance } = result;
                    
                    // Create popup content
                    const popupContent = `
                        <div class="practitioner-card">
                            <div class="practitioner-name">${doctor.full_name || 'Ayurvedic Practitioner'}</div>
                            <div class="practitioner-address">${doctor.address}</div>
                            <div class="practitioner-distance">${distance} km away</div>
                        </div>
                    `;
                    
                    // Create and store the marker
                    const marker = new mapboxgl.Marker({ color: '#D2691E' })
                        .setLngLat([longitude, latitude])
                        .setPopup(new mapboxgl.Popup().setHTML(popupContent));
                    
                    // Add custom properties to the marker
                    marker.properties = {
                        doctor,
                        distance: parseFloat(distance)
                    };
                    
                    practitionerMarkers.push(marker);
                });
                
                // Apply current filter
                updateMarkers(currentActiveFilter);
                
                // If we found practitioners, fit the map to show them all
                if (practitionerMarkers.length > 0) {
                    const bounds = new mapboxgl.LngLatBounds();
                    bounds.extend([userLocation.longitude, userLocation.latitude]);
                    
                    practitionerMarkers.forEach(marker => {
                        bounds.extend(marker.getLngLat());
                    });
                    
                    map.fitBounds(bounds, {
                        padding: 50,
                        maxZoom: 14
                    });
                }
                
                // Remove loading overlay
                loadingOverlay.remove();
            });
        }).catch(error => {
            console.error('Error fetching doctors:', error);
            loadingOverlay.innerHTML = `
                <div class="loading-text">Error loading Ayurvedic centers.</div>
                <button class="back-button" style="position:static;margin-top:20px;">Try Again</button>
            `;
            document.querySelector('.loading-overlay .back-button').addEventListener('click', () => {
                window.location.reload();
            });
        });
    }
});