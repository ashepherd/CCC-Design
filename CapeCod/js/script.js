$(document).ready(function(){

	// admin bar fix
	$(function(){ if($('#adminbar').length > 0){ $('.header-position, .feature').addClass('adminbarfix'); } });

	// toggle
	$(".toggle-elements .container").on("click", function(){
	    $(this).toggleClass("active");
	    $(this).next(".element").toggleClass("hidden");
	});

    // hide address bar when page loads on mobile devices
    window.top.scrollTo(0, 1);

     // mobile nav toggle
    $(".mobile-nav-button").bind("click", function(){
        if($(".mobile-cart-button").hasClass("active")) {
            $(".mobile-cart").slideToggle(500);
            $(".mobile-cart-button").toggleClass("active");
        }
        $("header ul.main-nav").slideToggle(500);
        $(".mobile-nav-button").toggleClass("active");
    });

    // fix zoom issue when switching to landscape on iOS
    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
        var viewportmeta = document.querySelector('meta[name="viewport"]');
        if (viewportmeta) {
            viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
            document.body.addEventListener('gesturestart', function () {
                viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
            }, false);
        }
    }

});