class App {

    constructor(restaurant, location) {
        this.currentRestaurant = null;
        this.map = null;
        //position pour centrer la map
        this.infoWindow = null;
        this.location = {
            lat: -34.397,
            lng: 150.644
        };
        this.NewRestaurantLatLng = null;
        this.restaurants = [];
        this.initMap();
        this.displayRestaurantList();
        this.nearbySearchCallback();

        this.addNewRestaurantOnList = this.addNewRestaurantOnList.bind(this);
        document.getElementById("form-addNewRestaurant").addEventListener("submit", this.addNewRestaurantOnList);

        this.displayRestaurantList = this.displayRestaurantList.bind(this);
        // Récuperer la valeur min et max des etoiles
        document.getElementById("minStars").addEventListener("change", this.displayRestaurantList);
        document.getElementById("maxStars").addEventListener("change", this.displayRestaurantList);
        $("body").on("click", "#returnToList", this.displayRestaurantList);
        // Récup les info pour ajoust d'un avis
        $('#form-addComment').on('shown.bs.modal', function () {
            $("body").one("click", "#submitNewComment", this.currentRestaurant.addNewRatingAndComment);
        }.bind(this));

        $('#form-addComment').on('hidden.bs.modal', function () {

            $("body").off("click", "#submitNewComment");
        });

        //Vider le formulaire apres abandant de la soumission.

        $("#cancelAdding").on("click", function () {
            $("#your-rating").val("");
            $("#your-review").val("");
        });
        $("#closeAddingRestaurant").on("click", function () {
            $("#inputNewName").val("");
            $("#inputNewAdresse").val("");
        });
    }
    // On initialise la Map
    initMap() {
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: this.location,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP

        });
        this.infoWindow = new google.maps.InfoWindow;
        //HTML5 geolocalisation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    this.location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    this.infoWindow.setPosition(this.location);
                    this.infoWindow.setContent('Vous ête ici');
                    this.infoWindow.open(this.map);
                    this.map.setCenter(this.location);
                    this.updateNearbyRestaurants();
                }.bind(this),
                // Afficher un message d'erreur si la géolocalisation n'est pas activée
                function (error) {
                    if (error.code == error.PERMISSION_DENIED)
                        alert("Veillez activer la géolocalisation");
                });
            ;
        } else {
            // Le navigateur ne supporte pas googleMap
            this.handleLocationError();
            this.updateNearbyRestaurants();

        }

        // Ajout d'un nouveau restaurant sur la map

        this.infowindow = new google.maps.InfoWindow({
            content: `<button type="button" class="btn btn-link" data-toggle="modal" data-target="#addNewRestaurant" id="ifAddNewRestaurant">
            Ajouter un restaurant ici</button>`
        });
        google.maps.event.addListener(this.map, "rightclick", function (event) {
            this.infowindow.setPosition(event.latLng);
            this.infowindow.open(this.map);

            // Obtenir les coordonnée de l'endroit ou nous avons cliqué
            this.NewRestaurantLatLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            // console.log(this.NewRestaurantLatLng);
        }.bind(this));

    }

    //Utiliser l'emplacement de l' utilisateur pour rechercher des restaurants à proximité
    updateNearbyRestaurants() {
        let request = {
            location: this.location,
            radius: "1000",
            type: ["restaurant"]
        };
        let service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, this.nearbySearchCallback.bind(this));

    }

    // Obtenir l'adresse et le nom du restaurant
    nearbySearchCallback(results, status) {

        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {

                let service = new google.maps.places.PlacesService(this.map);
                // service.getDetails(request, this.detailSearchCallBack.bind(this));
                service.getDetails({
                    placeId: results[i].place_id,
                    fields: ["review"]
                }, (place, status) => {
                    let reviews = [];
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        reviews = place.reviews.map(review => new Review(
                            review.rating,
                            review.text
                        ));
                    }

                    // On insert les restau recuperés depuis google place dans le tableau de restau

                    this.restaurants.push(new Restaurant(
                        results[i].name,
                        results[i].geometry.location.lat(),
                        results[i].geometry.location.lng(),
                        results[i].vicinity,
                        reviews

                    ));

                    let marker = new google.maps.Marker({
                        position: {
                            lat: results[i].geometry.location.lat(),
                            lng: results[i].geometry.location.lng(),
                        },
                        map: this.map,

                    });
                    this.displayRestaurantList();
                    // Au click sur un marker pour afficher les infos du restau
                    this.restaurants.forEach(function (restaurant) {
                        google.maps.event.addListener(marker, 'click', function () {
                            $("#listGeneral").hide(); //Cache la liste générale
                            $("#showRestaurantDetails").show(); //Affiche les détails du restau selctionné
                            $("#showRestaurantDetails").html(restaurant.details);
                        }.bind(this));

                    });

                });
            }
        }
    }



    //Méthode d'ajout d'un nouveau restau
    addNewRestaurantOnList(e) {
        e.preventDefault();
        //On récupere les infos du nouveau restau ajouter dépuis le formulaire

        let NewName = (document.getElementById("inputNewName").value);
        let NewAdresse = (document.getElementById("inputNewAdresse").value);
        //On affiche le marker du nouveau restau sur la map
        let marker = new google.maps.Marker({
            position: {
                lat: this.NewRestaurantLatLng.lat,
                lng: this.NewRestaurantLatLng.lng,

            },
            map: this.map,
        });

        // On insert les nouvelles données recuperer depuis le formulaire dans
        // le tableau restaurants crée plus haut 
        this.restaurants.push(new Restaurant(
            NewName,
            this.NewRestaurantLatLng.lat,
            this.NewRestaurantLatLng.lng,
            NewAdresse,
            []
        ));
        // Au click sur un marker pour afficher les infos du restau
        this.restaurants.forEach(function (restaurant) {
            google.maps.event.addListener(marker, 'click', function () {
                $("#listGeneral").hide(); //Cache la liste générale
                $("#showRestaurantDetails").show(); //Affiche les détails du restau selctionné
                $("#showRestaurantDetails").html(restaurant.details);
            }.bind(this));

        });

        // Vider le modal
        $("#inputNewName").val("");
        $("#inputNewAdresse").val("");
        // masqué le modal
        $("#addNewRestaurant").modal("hide");
        //On affiche la liste des restau dans le bandeau droit par appel de la methode "displayRestaurantList()"
        this.displayRestaurantList();
    }

    // Méthode pour afficher la liste des restau sur le bandeau droit
    displayRestaurantList() {
        $("#listGeneral").show(); //Afficher la liste générale
        $("#showRestaurantDetails").hide(); //Cacher les détails du restau selctionné
        //on recupere les valeurs min et max pour filtrer la liste à afficher
        let minStar = parseInt(document.getElementById("minStars").value);
        let maxStar = parseInt(document.getElementById("maxStars").value);
        //on vide la liste de restau
        $("#listOfRestaurants").empty();

        this.restaurants.forEach(function (restaurant) {
            // console.log(restaurant.average());
            if (restaurant.average() >= minStar && restaurant.average() <= maxStar) {
                // affiche les info des restaurants dans le html
                $("#listOfRestaurants").append(restaurant.element);
                restaurant.element.on("click", function () {
                    this.currentRestaurant = restaurant;
                    $("#listGeneral").hide(); //Cache la liste générale
                    $("#showRestaurantDetails").show(); //Affiche les détails du restau selctionné
                    $("#showRestaurantDetails").html(restaurant.details);
                }.bind(this));
            }

        }, this);
    }

    handleLocationError() {
        this.infoWindow.setPosition(this.location);
        this.infoWindow.setContent('Error: The Geolocation service failed.');
        this.infoWindow.open(this.map);

    }
}

window.initMap = function () {
    new App();
}
