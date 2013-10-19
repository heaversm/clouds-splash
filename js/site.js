var aboutVisible = false;

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
