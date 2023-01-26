
// This section deals with using HTML 5 Geolocation module. Asking user for location and zooming in if they accept.

let geolocationCoordinate;
let interactionCount = 0;

const successCallback = (position) => {        
    geolocationCoordinate = {lat : position.coords.latitude, lng : position.coords.longitude};
    currentZoom = map.getZoom();
    
    moveToCoordinates(geolocationCoordinate, currentZoom).then(
        function() {    
            setupTheMap();
            });
};

const errorCallback = (error) => {
    setTimeout(() => {
        toggler(welcomeContainer, 'opacity-one');
        toggler(welcomeContainer, 'display-none');    
    }, 500);        
    console.log(error);
    console.log('The user rejected the coordinate prompt');        
};

// Goes to the searched address via autocomplete

function goToSearchedAddress(geolocationCoordinate, currentZoom)
{

    moveToCoordinates(geolocationCoordinate, currentZoom).then(
    function() {                
        setupTheMap()
        });
}

function moveToCoordinates(coordinates, currentZoom) {
    
    return new Promise(function(resolve, reject) {

        map.setCenter(coordinates);
        map.setZoom(currentZoom + 3);

        let counter = currentZoom + 3;
        let timerVar = setInterval(function(){

            counter += 2;

            if (counter < 14)
            {
                // console.log('if counter < 14 true');
                counter += 2;
                map.setZoom(counter);
            }
            else
            {
                // console.log('else has been called');
                clearInterval(timerVar);                
                resolve();
            }

            // console.log('count after if below 14 check');
            // console.log(counter);

        }, 2000); 
    });
}

function setupTheMap() 
{
    coordinates = setCoordinates(map);

    setBoundingMarkers(map, coordinates);
    setSearchZones(map, coordinates);            
    searchTheZones(latLngBounds, map, radius);

    setCircles(latLngBounds, radius); 
}

class MapCoordinate {
constructor(name, lat, lng) {
    this.name = name;
    this.lat = lat;
    this.lng = lng;
}
}

let map;
let markers;    
let radius;

let resultsArray = [];
let intervalCount = 0;



function searchTheZones(latLngBounds, map, radius)
{
    
    // the below is used so we only work with one set of results
    
    /* let theRequest = {
        location: latLngBounds[0].getCenter(),                
        radius: radius,
        business_status : 'OPERATIONAL',
        opening_hours: {"open_now": true},
        type: ['restaurant']
    };

    let newServiceRequest = new google.maps.places.PlacesService(map);                
    newServiceRequest.nearbySearch(theRequest, getSearchData);  */
    
    
     for (const latLng of latLngBounds)
    {
        let theRequest = {
            location: latLng.getCenter(),                
            radius: radius,
            business_status : 'OPERATIONAL',
            opening_hours: {"open_now": true},
            type: ['restaurant']
        };

        newServiceRequest = new google.maps.places.PlacesService(map);            
        newServiceRequest.nearbySearch(theRequest, getSearchData); 
        
    }
}

let mapIdleCount = 0;

function midPointCalc(coordinateOne, coordinateTwo)
{
    return (coordinateOne + coordinateTwo) / 2;
}

function setCoordinates(map)
{
        let northEastlat = map.getBounds().getNorthEast().lat();
        let northEastlng = map.getBounds().getNorthEast().lng();
        let southWestlat = map.getBounds().getSouthWest().lat();
        let southWestlng = map.getBounds().getSouthWest().lng();

        const northWest = new MapCoordinate('north-west-coordinates', northEastlat, southWestlng);
        const northEast = new MapCoordinate('north-east-coordinates', northEastlat, northEastlng);
        const southEast = new MapCoordinate('south-east-coordinates', southWestlat, northEastlng);
        const southWest = new MapCoordinate('south-west-coordinates', southWestlat, southWestlng);

        const north = new MapCoordinate('north-coordinates', midPointCalc(northWest.lat, northEast.lat), midPointCalc(northWest.lng, northEast.lng));
        const east = new MapCoordinate('east-coordinates', midPointCalc(northEast.lat, southEast.lat), midPointCalc(northEast.lng, southEast.lng));            
        const south = new MapCoordinate('south-coordinates', midPointCalc(southEast.lat, southWest.lat), midPointCalc(southWest.lng, southEast.lng));
        const west = new MapCoordinate('west-coordinates', midPointCalc(southWest.lat, northWest.lat), midPointCalc(southWest.lng, northWest.lng));

        const center = new MapCoordinate('center-coordinates', midPointCalc(north.lat, south.lat), midPointCalc(north.lng, south.lng));

        const halfwayWestCenter = new MapCoordinate('halfwayWestCenter', midPointCalc(west.lat, center.lat), midPointCalc(west.lng, center.lng));
        const halfwayNorthNorthEast = new MapCoordinate('halfwayNorthNorthEast', midPointCalc(north.lat, northEast.lat), midPointCalc(north.lng, northEast.lng));
        const halfwaySouthWestSouth = new MapCoordinate('halfwaySouthWestSouth', midPointCalc(southWest.lat, south.lat), midPointCalc(southWest.lng, south.lng));
        const halfwayCenterEast = new MapCoordinate('halfwayCenterEast', midPointCalc(center.lat, east.lat), midPointCalc(center.lng, east.lng));
        
        return {northWest, northEast, southEast, southWest, north, east, south, west, center, halfwayWestCenter, halfwayNorthNorthEast, halfwaySouthWestSouth, halfwayCenterEast};
}

let mapMarkers = [];

function setBoundingMarkers(map, coordinates)
{
    let coordinatesKeys = Object.keys(coordinates);
    coordinatesKeys.forEach((coordinatesKey) => {            
        let latLng = new google.maps.LatLng(coordinates[coordinatesKey].lat, coordinates[coordinatesKey].lng);
        const marker = new google.maps.Marker({
            position : latLng,
            map,
            title: coordinates[coordinatesKey].name,
            visible : false
        });

        mapMarkers.push(marker);
    })
}

// send an array of latlngbounds and this function will place them on the map with the defined radius
let circles = [];
function setCircles(latLngBounds, radius)  
{
    for (const latLng of latLngBounds)
    {
        const zoneCircle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0,
            map,
            center: latLng.getCenter(),
            radius: radius,                
        });
        circles.push(zoneCircle);
    }
}

let latLngBounds = [];

function setSearchZones(map, coordinates)
{
    /* 
        There are 7 rectangluar areas that we need to generate map query areas for and for that we need the NE and SW coordinates for each rectangle - we get this using the coordinates above:

        0 - outer and main map - these are the coordinates above

        1 - top left = W / N 
        2 - top middle = midpoint(W, Center) / midpoint(N, NE)
        3 - top right = Center / NE
        4 - bottom left = SW / Center
        5 - bottom middle = midpoint(SW , S) / midpoint(Center, East)
        6 - bottom right = S / E

    */

    
    let halfwayWestCenter = new google.maps.LatLng(coordinates.halfwayWestCenter.lat, coordinates.halfwayWestCenter.lng);
    let halfwayNorthNorthEast = new google.maps.LatLng(coordinates.halfwayNorthNorthEast.lat, coordinates.halfwayNorthNorthEast.lng);
    
    let halfwaySouthWestSouth = new google.maps.LatLng(coordinates.halfwaySouthWestSouth.lat, coordinates.halfwaySouthWestSouth.lng);
    let halfwayCenterEast = new google.maps.LatLng(coordinates.halfwayCenterEast.lat, coordinates.halfwayCenterEast.lng);
    
    let zoneZeroLatLngBounds = new google.maps.LatLngBounds(coordinates.southWest, coordinates.northEast);
    let zoneOneLatLngBounds = new google.maps.LatLngBounds(coordinates.west, coordinates.north);
    let zoneTwoLatLngBounds = new google.maps.LatLngBounds(halfwayWestCenter, halfwayNorthNorthEast);
    let zoneThreeLatLngBounds = new google.maps.LatLngBounds(coordinates.center, coordinates.northEast);
    let zoneFourLatLngBounds = new google.maps.LatLngBounds(coordinates.southWest, coordinates.center);
    let zoneFiveLatLngBounds = new google.maps.LatLngBounds(halfwaySouthWestSouth, halfwayCenterEast);
    let zoneSixLatLngBounds = new google.maps.LatLngBounds(coordinates.south, coordinates.east);
    
    latLngBounds = [zoneZeroLatLngBounds, zoneOneLatLngBounds, zoneTwoLatLngBounds, zoneThreeLatLngBounds, zoneFourLatLngBounds,zoneFiveLatLngBounds ,zoneSixLatLngBounds];
}

// created search object
function createSearchObject(coordinates)
{
    return new Promise(function(resolve, reject) {

        let geocodeData = geocoder.geocode({ location: coordinates });
        let resultObject = new Object();

        geocodeData.then((results) =>
        {
            results.results.forEach(result => {
                /* console.log(result);
                console.log(result.types); */
                
                if (result.types.includes('country'))
                {
                    resultObject.country = result.formatted_address;
                }
                if (result.types.includes('administrative_area_level_1'))
                {
                    resultObject.province = result.formatted_address;                        
                }
                if (result.types.includes('administrative_area_level_2'))
                {
                    resultObject.city = result.formatted_address;                                                
                }
            }) 
            // console.log(resultObject);

            // resolve( results.results); 
            resolve( resultObject); 
        })
        .catch((err) => 
        {
            console.log(err);
        })
    });
    
}

function moveMap(coordinates)
{
    
    return new Promise(function(resolve, reject) {

        map.setCenter(coordinates);
        map.addListener("idle", () => {         
            console.log('map idle');
            resolve();
        });

    });
}

function zoomMapOut(zoomTo)
{
    
    let currentMapZoom = map.getZoom();
    console.log('current zoom');
    console.log(currentMapZoom);

    let counter = currentMapZoom;
    return new Promise(function(resolve, reject) {

        let timerVar = setInterval(function(){            
        
            if (counter - 3 < zoomTo)
            {
                console.log('if we minuse again we go lower thatn ' + zoomTo);
                map.setZoom(zoomTo);                    
                clearInterval(timerVar);                        
                resolve();
                
            }
            else if (counter > zoomTo)
            {
                // console.log('if counter < 14 true');
                counter -= 3;
                map.setZoom(counter);                    
            }           

            // console.log('count after if below 14 check');
            // console.log(counter);

        }, 1500);
    });
}

function zoomMapIn(zoomTo)
{
    console.log('zoomMapIn called');
    let currentMapZoom = map.getZoom();
    console.log('current zoom');
    console.log(currentMapZoom);

    let counter = currentMapZoom;
    return new Promise(function(resolve, reject) {
        let timerVar = setInterval(function(){            
            
            if (counter + 3 > zoomTo)
            {
                console.log('if we minuse again we go lower thatn ' + zoomTo);
                map.setZoom(zoomTo);                    
                clearInterval(timerVar);  
                resolve();                      
                
                
            }
            else if (counter < zoomTo)
            {
                // console.log('if counter < 14 true');
                counter += 3;
                map.setZoom(counter);                    
            }           

            // console.log('count after if below 14 check');
            // console.log(counter);

        }, 1500);
    })   
}

function determineZoomOutLevel(currentLocation, nextLocation, distanceBetween)
{
    console.log(currentLocation);
    console.log(nextLocation);

    console.log(distanceBetween + ' kms' );

    if (currentLocation.country != nextLocation.country)
    {
        console.log('diff country zoom out to 3');
        return 3;
    }
    else if (currentLocation.province != nextLocation.province)
    {
        console.log('country SAME but provnice difference figure out province zoom');
        return 8;
    }
    else if (currentLocation.city != nextLocation.city)
    {
        return 10;
        console.log('country and province SAME but local city is not figure out city zoon');
    }

    
}

function handleNewLocationSearch(currentCoordinates, searchedCoordinates)
{
    createSearchObject(currentCoordinates).then(
        function(resolvedValue) 
        {    
            let firstObject = resolvedValue;
            createSearchObject(searchedCoordinates).then(
                function(resolvedValue) 
                {    
                    let secondObject = resolvedValue;
                    let distanceBetweenLocations = Math.floor(google.maps.geometry.spherical.computeDistanceBetween(currentCoordinates, searchedCoordinates) / 1000);
                    let zoomLevel = determineZoomOutLevel(firstObject, secondObject, distanceBetweenLocations);
                    
                    zoomMapOut(zoomLevel).then(
                        function() {    
                            moveMap(searchedCoordinates).then(
                                function() {    
                                    zoomMapIn(14).then(
                                        function() {    
                                            setupTheMap();
                                            })
                                    })
                            }
                    );

                }
            );

        }
    );

}

let edenvale;
let melville;
let coordinates;
let currentCenter;
let currentCoordinates;
let currentLocationZoom;
let searchedCoordinates;
let infowindow;

function initMap() 
{
    geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow();
    // service = new google.maps.places.PlacesService();
    radius = 4500;
    // var edenvale = new google.maps.LatLng(-26.159, 28.162);
    edenvale = new google.maps.LatLng(-26.149, 28.157);        
    melville = new google.maps.LatLng(-26.175000375803055, 28.006359261653333);

    let initMapCoordinates = new google.maps.LatLng(0.2309232062992336, 23.360324279465893);
    // let initMapCoordinates = new google.maps.LatLng(edenvale);
    
    map = new google.maps.Map(document.getElementById('map'), {
                    center: initMapCoordinates,
                    minZoom : 3,
                    zoom: 3,
                    styles: styles
                    // mapId: 'cbeb42d93aacbcea'
                    });      
    /*  map = new google.maps.Map(document.getElementById('map'), {
        center: melville,
        zoom: 14,
        styles: styles
        // 
        }) */;   
    
    currentLocationZoom = map.getZoom();

    map.addListener("zoom_changed", () => {
        currentLocationZoom = map.getZoom();
        console.log(currentLocationZoom);
    });

    /* map.addListener("idle", () => {         
        mapIdleCount++;
        if (mapIdleCount == 1)
        {
            currentCenter = map.getCenter();            
            setupTheMap();    
        }   
    }); */

    var input = document.getElementById('searchTextField');

    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function(){
        
        toggler(searchContainer, 'opacity-one');
        toggler(searchContainer, 'display-none');

        currentCoordinates = map.getCenter();            
        let searchedCoordinates = autocomplete.getPlace().geometry.location;
        
        // These are expensive API calls
        handleNewLocationSearch(currentCoordinates, searchedCoordinates);

        // OLD WAY            
        // goToSearchedAddress(searchedCoordinates, map.getZoom());

    });
}

document.querySelector(".show-bounding-markers").addEventListener("click", showMarkers);
document.querySelector(".hide-bounding-markers").addEventListener("click", hideMarkers);

function hideMarkers() {
    
    mapMarkers.forEach((mapMarker) => {
        mapMarker.setVisible(false);
    })
}   
    
    // Shows any markers currently in the array.
function showMarkers() {        
    mapMarkers.forEach((mapMarker) => {
        mapMarker.setVisible(true);
    })
}

const delay = ms => new Promise(res => setTimeout(res, ms));

function getSearchData(results, status, pagination) 
{  
    if (results)
    {
        handleData(results)
    }    

    if (pagination)
    {
        if (pagination.hasNextPage)
        {
            delay(2000);
            pagination.nextPage();
        }
        else if (! pagination.hasNextPage)
        {
            console.log('there is NO next page');
        }
    }  
}

let totalResultCount = 0;
let uniqueResultCount = 0;

let textInfo = document.querySelector(".info-text");

let totalResults = [];
let totalResultsCount = 0;

let printArrayCount = 0;

function printArray(theArray)
{
    printArrayCount++
    // console.log(`Print array called ${printArrayCount} times`);
    // console.log(theArray);
}



// let infowindow = new google.maps.InfoWindow({});

function getRating(ratingNumber) {   
    console.log('called');
    console.log(ratingNumber);
    let stringRating = ratingNumber.toString();
    let firstPortion, secondPortion;
    
    firstPortion = stringRating.split('.')[0];
    secondPortion = stringRating.split('.')[1]; 
 
    let starGradient = [];
    if (starGradient[0] !== 5)
    {
        console.log('not five');
        starGradient[0] = parseInt(firstPortion);
        starGradient[1] = parseInt(secondPortion);
        starGradient[2] = parseInt(secondPortion) * 10;    
    }
    else if (starGradient[0] !== 5)
    {
        console.log('is five');
        starGradient[0] = parseInt(firstPortion);
    }
    
    
    return starGradient;
}


// handling the image gallery left and right interactions

function handleGalleryLeftNav()
{
    console.log('left nav clicked');

    if (activeIndex - 1 < min)
    {
        activeIndex = max;
    }
    else
    {
        activeIndex -= 1;
    }

    console.log('current slide is ' + activeIndex);

    if (activeIndex - 1 < min)
    {
        leftSlideIndex = max;
    }
    else 
    {
        leftSlideIndex = activeIndex - 1;
    }
    
    if (activeIndex + 1 > max)
    {
        rightSlideIndex = min;
    }
    else 
    {
        rightSlideIndex = activeIndex + 1;
    }

    console.log('left slide index ' + leftSlideIndex);
    console.log('right slide index ' + rightSlideIndex);

    slides[rightSlideIndex].classList.add('right-slide');
    slides[rightSlideIndex].classList.remove('active-slide');

    slides[activeIndex].classList.add('active-slide');
    slides[activeIndex].classList.remove('left-slide');

    slides[leftSlideIndex].classList.add('left-slide');
    slides[leftSlideIndex].classList.remove('right-slide');
}

function handleGalleryRightNav()
{
    console.log('right nav clicked');

    if (activeIndex + 1 > max)
    {
        activeIndex = 0;
    }
    else
    {
        activeIndex += 1;
    }

    console.log('current slide index ' + activeIndex);
    
    if ( activeIndex - 1 < min) 
    {
        leftSlideIndex = max;
    }
    else
    {
        leftSlideIndex = activeIndex - 1;
    }

    if ( activeIndex + 1 > max) 
    {
        rightSlideIndex = min;
    }
    else
    {
        rightSlideIndex = activeIndex + 1;
    }
    
    console.log('left slide index ' + leftSlideIndex);
    console.log('right slide index ' + rightSlideIndex);

    slides[leftSlideIndex].classList.remove('active-slide');
    slides[leftSlideIndex].classList.add('left-slide');

    slides[activeIndex].classList.add('active-slide');
    slides[activeIndex].classList.remove('right-slide');

    slides[rightSlideIndex].classList.add('right-slide');
    slides[rightSlideIndex].classList.remove('left-slide');

    /* slides[max].classList.add('right-slide');
    slides[max].classList.remove('left-slide'); */
}

let activeIndex = 0;
let slides = "";
let max = 0;
let min = 0;
let leftSlideIndex = 0;
let rightSlideIndex = 0;

function setupGallery()
{
    slides = document.querySelectorAll('.slide');
    max = slides.length - 1;
    slides[0].classList.add('active-slide');
    slides[1].classList.add('right-slide');    
    slides[max].classList.add('left-slide');

    for (let i = 2; i < max; i++)
    {
        slides[i].classList.add('right-slide');
    }
}

// handling the review gallery left and right interactions

function handleReviewLeftNav()
{
    console.log('left nav clicked');

    if (activeRIndex - 1 < minR)
    {
        activeRIndex = maxR;
    }
    else
    {
        activeRIndex -= 1;
    }

    console.log('current slide is ' + activeRIndex);

    if (activeRIndex - 1 < minR)
    {
        leftRSlideIndex = maxR;
    }
    else 
    {
        leftRSlideIndex = activeRIndex - 1;
    }
    
    if (activeRIndex + 1 > maxR)
    {
        rightRSlideIndex = minR;
    }
    else 
    {
        rightRSlideIndex = activeRIndex + 1;
    }

    console.log('left R slide index ' + leftRSlideIndex);
    console.log('right R slide index ' + rightRSlideIndex);

    reviews[rightRSlideIndex].classList.add('right-review');
    reviews[rightRSlideIndex].classList.remove('active-review');

    reviews[activeRIndex].classList.add('active-review');
    reviews[activeRIndex].classList.remove('left-review');

    reviews[leftSlideIndex].classList.add('left-review');
    reviews[leftSlideIndex].classList.remove('right-review');
}

function handleReviewRightNav()
{
    console.log('right nav clicked');

    if (activeRIndex + 1 > maxR)
    {
        activeRIndex = 0;
    }
    else
    {
        activeRIndex += 1;
    }

    console.log('current slide index ' + activeRIndex);
    
    if ( activeRIndex - 1 < minR) 
    {
        leftRSlideIndex = maxR;
    }
    else
    {
        leftRSlideIndex = activeRIndex - 1;
    }

    if ( activeRIndex + 1 > maxR) 
    {
        rightRSlideIndex = minR;
    }
    else
    {
        rightRSlideIndex = activeRIndex + 1;
    }
    
    console.log('left review index ' + leftRSlideIndex);
    console.log('right review index ' + rightRSlideIndex);

    reviews[leftRSlideIndex].classList.remove('active-review');
    reviews[leftRSlideIndex].classList.add('left-review');

    reviews[activeRIndex].classList.add('active-review');
    reviews[activeRIndex].classList.remove('right-review');

    reviews[rightRSlideIndex].classList.add('right-review');
    reviews[rightRSlideIndex].classList.remove('left-review');

    /* slides[max].classList.add('right-slide');
    slides[max].classList.remove('left-slide'); */
}

let activeRIndex = 0;
let reviews = "";
let maxR = 0;
let minR = 0;
let leftRSlideIndex = 0;
let rightRSlideIndex = 0;

function setupReviews()
{
    reviews = document.querySelectorAll('.review-slide');
    console.log(reviews);

    maxR = reviews.length - 1;
    reviews[0].classList.add('active-review');
    reviews[1].classList.add('right-review');    
    reviews[maxR].classList.add('left-review');

    for (let i = 2; i < maxR; i++)
    {
        reviews[i].classList.add('right-review');
    }
}

// end of review gallery

function getPlaceInfo(placeId)
{
    console.log(`getPlaceInfo called with ${placeId}`);

    let request = {
        placeId: placeId,
        fields: ['formatted_address', 'formatted_phone_number', 'url', 'reviews', 'photos', 'website']
        };

    let secondaryInfoContainer = document.querySelector('.secondary-info-container');
    let reviewContainer = document.querySelector('.review-container');
    let slideContainer = document.querySelector('.slide-container');
    
    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            
            let reviews = "";
            
            console.log(results);

            results.reviews.forEach(review => {                
                reviews += '<div class="review-slide">' +
                            '<div class="review-slide-container">' +
                                `<p class="review-text">${review.text}</p>` +
                                `<p class="review-author-text">- ${review.author_name}</p>` +
                            `</div>` +        
                        `</div>`;
            })

            
            let slides = "";
            results.photos.forEach(photo => {
                slides += '<div class="slide">' +
                            '<div class="slide-img-container">' +
                                `<img class="slider-img" src="${photo.getUrl({maxWidth : 350})}">` +
                            `</div>` +        
                        `</div>`;
            })

            
            let addressInfo = `<p class="address-text"><a href="${results.url}" target="_blank">Get Directions >></a></p>`;
            let telephoneInfo = `<p class="telephone-text"><a href="tel:${results.formatted_phone_number}">${results.formatted_phone_number}</a></p>`;            
            let websiteInfo = `<p class="website-text"><a href="${results.website}" target="_blank">Website</a></p>`;             
            
            

            reviewContainer.insertAdjacentHTML('beforeend', reviews);
            
            slideContainer.insertAdjacentHTML('beforeend', slides);
            secondaryInfoContainer.insertAdjacentHTML('afterbegin', websiteInfo);
            secondaryInfoContainer.insertAdjacentHTML('afterbegin', telephoneInfo);
            secondaryInfoContainer.insertAdjacentHTML('afterbegin', addressInfo);
            
            setupGallery();
            setupReviews();
            let leftNav = document.querySelector('.left-nav-pane').querySelector('.nav-button-container').addEventListener('click', handleGalleryLeftNav);
            let rightNav = document.querySelector('.right-nav-pane').querySelector('.nav-button-container').addEventListener('click', handleGalleryRightNav);

            let leftRNav = document.querySelector('.left-review-arrow').addEventListener('click', handleReviewLeftNav);
            let rightRNav = document.querySelector('.right-review-arrow').addEventListener('click', handleReviewRightNav);

            // console.log(results);

        }});
}

function waitForElement(className, callback){
    var poops = setInterval(function(){
        if(document.querySelector(className)){
            clearInterval(poops);
            callback();
        }
    }, 100);
}

function showInfoWindow()
{    
    let thePlaceId = this.place_id;
    let gradientArray = getRating( this.rating );
    let starAmount='';
    
    for (let i=0; i < gradientArray[0]; i++) {
        starAmount += '★';
    } 

    const contentString =
                `<div class="info-box">` +
                `<div class="photo-container">` +                    
                    `<div class="slider-container">` +
                        `<div class="nav-pane left-nav-pane">` +
                            `<div class="nav-button-container">` +
                                `<i class="arrow left-nav left-gall"></i>` +
                            `</div>` +
                        `</div>` +
                        `<div class="slide-container">` +
                        `</div>` +
                        `<div class="nav-pane right-nav-pane">` +
                            `<div class="nav-button-container">` +
                                `<i class="arrow right-nav right-gall"></i>` +
                            `</div>` +
                        `</div>` +                        
                    `</div>` +                                     
                `</div>` +                 

                `<div class="header-container">` +                    
                
                    `<div class="title-container">` +                    
                    `<h1 class="establishment-name">${this.title}</h1>` +
                    `</div>` +

                    `<div class="rating-container">` +                    
                    `<p id="rating" class="star-rating">${starAmount}<span class="final-star">★</span></p>` +
                    `</div>` +

                `</div>` +
                
                `<div class="bodyContent">` +
                    `<div class="secondary-info-container">` +
                    `</div>` +
                    `<div class="review-slider-container">` +
                            `<div class="nav-pane left-nav-pane">` +
                                `<div class="nav-button-container">` +
                                    `<i class="arrow left-nav left-review-arrow"></i>` +
                                `</div>` +
                            `</div>` +
                            `<div class="review-container">` +
                            `</div>` +
                            `<div class="nav-pane right-nav-pane">` +
                                `<div class="nav-button-container">` +
                                    `<i class="arrow right-nav right-review-arrow"></i>` +
                                `</div>` +
                            `</div>` +                        
                        `</div>` +                                     
                    `</div>` +
                `</div>`;

    infowindow.set('ariaLabel', this.title);
    infowindow.set('content', contentString);
    infowindow.set('maxWidth', 800);
    infowindow.set('closed', true);
    
    if (infowindow.get('closed'))
    {
        infowindow.open({anchor: this, map});
        
        waitForElement(".final-star", function(){
            
            let finalStar = document.querySelector('.final-star');
         
            if (gradientArray[0] === 5)
            {
                finalStar.style.display = "none";
            }
            else 
            {
                finalStar.style.backgroundImage = `linear-gradient(to right, black ${gradientArray[2]}%, #C0C0C0 ${100 - gradientArray[2]}%)`;   
            }
        });

        waitForElement(".bodyContent", function(){
            getPlaceInfo(thePlaceId);
        });
    }
}

let theMarker;

function handleData(results)
{
    
    // console.log('handle data called');
    // console.log(results)
    results.forEach(result => {
        // console.log(result);
        if (result.hasOwnProperty('rating'))
        {
            if (result.hasOwnProperty('photos'))
            {
                console.log('this result has both review and a photo');
                totalResultCount++;
                
                let location = result.geometry.location;
                let lat = location.lat();
                let lng = location.lng(); 
                
                let image = "icon.png"
                let imgSrc = "";

                // This provides a duplicate checker by adding the result ID to an array and checking against it each time.
                
                if (!totalResults.includes(result.place_id))
                {
                    imgSrc = result.photos[0].getUrl({maxWidth: 350});
                    theMarker = new google.maps.Marker({position: { lat: lat, lng: lng }, map, title: result.name, icon : image, place_id: result.place_id, photo_url : imgSrc, rating : result.rating});

                    theMarker.addListener("click", showInfoWindow);

                    uniqueResultCount++;
                    totalResults[totalResultsCount] = result.place_id;

                    totalResultsCount++;
                }
            }
        }
        
        
    })
    // console.log(resultCount);
    printArray(totalResults)
    textInfo.innerHTML = `Total Results = ${totalResultCount} Unique Results = ${uniqueResultCount}`;
}


window.initMap = initMap; 

let hideCirclesBtn = document.querySelector('.hide-circles');

hideCirclesBtn.addEventListener('click', () => {
    console.log('click');
    // console.log(mapMarkers[0].advancedMarkerViewObject.scale = 0);
    //hideMarkers(map, coordinates)
    for (const circle of circles)
    {            
        circle.setOptions({
            fillOpacity: 0,
            strokeOpacity: 0
            });
    }
    
});

let showCirclesBtn = document.querySelector('.show-circles');

showCirclesBtn.addEventListener('click', () => {
    console.log('click');
    // console.log(mapMarkers[0].advancedMarkerViewObject.scale = 0);
    //hideMarkers(map, coordinates)
    for (const circle of circles)
    {
        console.log(circle);
        circle.setOptions({
            fillOpacity: 0.35,
            strokeOpacity: 0.8
            });
    }
    
});

let searchBtn = document.querySelector('.search-img');


// closeSearchBtn.addEventListener('click', showHideSearchBox); */


let engageLocationServiceBtn = document.querySelector('.location-btn'); 

function toggler(element, theClassName)
{
    if (element.classList.contains(theClassName))
    {        
        element.classList.remove(theClassName);            
    }
    else if (! element.classList.contains(theClassName))
    {        
        element.classList.add(theClassName);
    }
    // welcomeContainer.classList.toggle("opacity-one");
}

function handleLocationServicesClick()
{
    interactionCount++;
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    toggler(welcomeContainer, 'opacity-one');
    toggler(welcomeContainer, 'display-none');
}

// "Use My Location" click event handling
engageLocationServiceBtn.addEventListener('click', handleLocationServicesClick);


let engageSearchBtn = document.querySelector('.search-btn'); 

let welcomeContainer = document.querySelector('.welcome-container');
let searchContainer = document.querySelector('.search-container');
let searchIconContainer = document.querySelector('.search-icon-container');

engageSearchBtn.addEventListener('click', () => {
    interactionCount++;

    toggler(welcomeContainer, "opacity-one");
    toggler(searchContainer, "opacity-none");       
    toggler(searchContainer, "display-none");    

    welcomeContainer.addEventListener('transitionend', () => {
        console.log('welcome container has fadedout');                
        toggler(welcomeContainer, "display-none");
        toggler(searchContainer, "opacity-one");              
    });
});

let closeSearchBtn = document.querySelector('.close-container');

closeSearchBtn.addEventListener('click', () => {
    console.log('click');

    toggler(searchContainer, 'opacity-one');
    toggler(searchContainer, 'display-none');
});

searchIconContainer.addEventListener('click', () => {        
    if (interactionCount > 0)
    {            
        toggler(searchContainer, 'opacity-one');
        toggler(searchContainer, 'display-none');
    }
});

