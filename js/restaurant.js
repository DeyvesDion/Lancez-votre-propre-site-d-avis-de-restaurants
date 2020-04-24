class Restaurant {
    constructor(name, lat, lng, address, reviews) {
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.address = address;
        this.reviews = reviews;
        this.createElements();
        this.addNewRatingAndComment = this.addNewRatingAndComment.bind(this);
    }

    average() {
        let totalRating = 0;
        this.reviews.forEach(function (rating) {
            totalRating += rating.rating;
        });
        return this.reviews.length === 0 ? 0 : totalRating / this.reviews.length;

    }

    get stars() {


        let stars = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= this.average()) {
                stars = stars + "<i class = 'fas fa-star' ></i>"
            } else if (i - 1 < this.average()) {
                stars = stars + "<i class = 'fas fa-star-half-alt' ></i>"
            } else {
                stars = stars + "<i class = 'far fa-star' ></i>"
            }
        }
        return stars;
    }

    addNewRatingAndComment() {
        let selectedRating = parseInt(document.getElementById("your-rating").value);
        let newComment = (document.getElementById("your-review").value);
        if (isNaN(selectedRating) || (newComment).length <= 0) {
            alert("Veillez bien remplir le formulaire");
            $("#form-addComment").modal("hide");

        } else {

            let review = new Review(selectedRating, newComment);
            this.reviews.push(review);
            this.createElements();
            $("#your-rating").val(""); // Vider le modal
            $("#your-review").val("");
            $("#showRestaurantDetails").html(this.details);
            $("#form-addComment").modal("hide");
        }
    }

    createElements() {
        let adressStreetViewURL = "https://maps.googleapis.com/maps/api/streetview?size=266x240&location=" +
            this.lat + "," + this.lng + "&heading=151.78&pitch=-0.76&key=AIzaSyAqxE4oHzIGt8Bg9Eb3yhjz6-arNbRbE5A";

        this.element = $(`
        <hr/>
        <span>${this.name}</span>
        <br/>
        ${this.stars}
        <p>${this.address}</p>
        `);

        this.details = $(`
        <button type="button" class="btn btn-light btn-sm" id="returnToList">
        <i class="fas fa-arrow-left"></i> Retourner</button>

        <button type="button" class="btn btn-light btn-sm" id="addNewReview" data-toggle="modal" data-target="#form-addComment">
        <i class="fas fa-plus"></i> Ajouter un avis </button>

        <hr/>
        <img class="imgStreetView" src="${adressStreetViewURL}">
        <span>${this.name}</span>
        <br/>
        ${this.stars}
        <p>${this.address}</p>
        <p>Avis : </p>
        ${this.reviews.map(function (rating) {
            return `<p class="InfoRating">Note : ${rating.rating}<br/> Commentaire : ${rating.comment}</p>`;

        }).join("")}
        `);
    }

}






