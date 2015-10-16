(function() {


  $("p").click(function(){
       $(this).text(function(_, oldText) {
         return oldText === 'total : 0.00 USD' ? 'total : 0.00 BTCD' : 'total : 0.00 USD';
          return oldText === 'available : 0.00 USD' ? 'available : 0.00 BTCD' : 'available : 0.00 USD';
          return oldText === 'stake : 0.00 USD' ? 'stake : 0.00 BTCD' : 'stake : 0.00 USD';
       });
  });




})();