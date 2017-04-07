$(document).ready(function(){
    $('.NavLateral-DropDown').on('click', function(e){
        e.preventDefault();
        var DropMenu=$(this).next('ul');
        var CaretDown=$(this).children('i.NavLateral-CaretDown');
        DropMenu.slideToggle('fast');
        if(CaretDown.hasClass('NavLateral-CaretDownRotate')){
            CaretDown.removeClass('NavLateral-CaretDownRotate');    
        }else{
            CaretDown.addClass('NavLateral-CaretDownRotate');    
        }
         
    });
    $('.tooltipped').tooltip({delay: 50});
    $('.ShowHideMenu').on('click', function(){
        var MobileMenu=$('.NavLateral');
        if(MobileMenu.css('opacity')==="0"){
            MobileMenu.addClass('Show-menu');   
        }else{
            MobileMenu.removeClass('Show-menu'); 
        }   
    }); 
         
});
(function($){
    $(window).load(function(){
        $(".NavLateral-content").mCustomScrollbar({
            theme:"light-thin",
            scrollbarPosition: "inside",
            autoHideScrollbar: true,
            scrollButtons:{ enable: true }
        });
        $(".ContentPage, .NotificationArea").mCustomScrollbar({
            theme:"dark-thin",
            scrollbarPosition: "inside",
            autoHideScrollbar: true,
            scrollButtons:{ enable: true }
        });
    });
})(jQuery);