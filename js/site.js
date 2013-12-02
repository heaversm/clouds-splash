  var site =  (function (window,document, $){

    var siteData; //all our site data from the google spreadsheet will be stored here;

    var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?key=0AsJLPh0xcMR3dDl6UjZJbHJjTVVXV2xCR1pfR0drS0E&output=html';

    var aboutVisible = false;

    function init(){
      loadSiteData();
    }

    function loadSiteData(){
      //TABLETOP: https://github.com/jsoma/tabletop
      Tabletop.init( {
        key: public_spreadsheet_url,
        callback: showInfo
      });
    }

    function showInfo(data, tabletop) {
      console.log(data,tabletop);
      siteData = data;
      addNavLinks(data.content);
    }

    function addNavLinks(content){
      var source   = $("#navlink-template").html();
      var template = Handlebars.compile(source);
      var html    = template(content);
      $('#nav').html(html);
      addNavListeners();
    }

    function addOverlayListeners(){
      $('.overlay-close, #overlay').on('click',function(){
        hideOverlay();
      });
    }

    function addNavListeners(){
      $('.navlink').on('click',function(e){
        e.preventDefault();
        $linkElement = $(this);
        var linkID = $linkElement.data('id');
        var externalLink = $linkElement.attr('href');

        if (externalLink == undefined){ //open a content window

          var source, pageContent;

          switch (linkID){
            case 'screenings':
              source = $('#screenings-template').html();
              pageContent = siteData.screenings;
              break;
            case 'cast':
              source = $('#cast-template').html();
              pageContent = siteData.cast;
              break;
            case 'credits':
              source = $('#credits-template').html();
              pageContent = siteData.credits;
              break;
            case 'press':
              source = $('#press-template').html();
              pageContent = siteData.press;
              break;
            default:
              source = $("#content-template").html();
              pageContent = _.find(siteData.content.elements, function(element){
                return element.id == linkID;
              });
              break;
          }

          var template = Handlebars.compile(source);

          var html = template(pageContent);

          $('#overlay').html(html);
          showOverlay();

        } else { //open the external link
          window.open(externalLink,"_blank");
        }

      });
    }

    function hideOverlay(){
      $('#overlay').fadeTo(500,0,function(){
        $('#overlay').hide();
      });
    }

    function showOverlay(){
      $('#overlay').show();
      $('#overlay').fadeTo(500,1,function(){
        addOverlayListeners();
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
