  var site =  (function (window,document, $){

    var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0AsJLPh0xcMR3dDl6UjZJbHJjTVVXV2xCR1pfR0drS0E&output=html';

    var aboutVisible = false;

    function init(){
      addNavListeners();
      loadSiteData();
    }

    function loadSiteData(){
      Tabletop.init( {
        key: public_spreadsheet_url,
        callback: showInfo
      })
    }

    function showInfo(data, tabletop) {
      console.log(data,tabletop);
    }

    function addNavListeners(){
      $('#about-link').on('click',function(e){
        e.preventDefault();
        console.log('click');
        if (aboutVisible){
          $('#about').fadeTo(500,0,function(){
            aboutVisible = false;
            $('#about').hide();
          });
        } else {
          $('#about').show();
          $('#about').fadeTo(500,1,function(){
            aboutVisible = true;
          });
        }
      });
    }

  return {
    init: init
  }

})(window,document,jQuery);

window.onload = function(){
  site.init();
  environment.init();
};
