// main page

$(document).ready(

    function () {
        //adding animation to the title and subtitle
        $(".title-page").animate({
            top: "50%",
            opacity: 1
        }, 2000, 'easeInOutQuad')


        //hiding and unhiding the login sucessfull and unsucessful tags.

        $(".submit-button").click(
            function () {
                $(".token-check").css("visibility", "visible");
                $(".blur-bg").css("visibility", "visible");
            }
        )
    }

    //account page

);

