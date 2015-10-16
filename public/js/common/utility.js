define([],function(){
    var utility = { };
    
    utility.time = {
        unixToDate: function(unixTime){
            return new Date(unixTime * 1000);
        },

        formatDate: function(date){
            return (date.toLocaleDateString()) + ' ' +  (date.toLocaleTimeString());  
        },

        unixToString: function(unixTime){
            return formatDate(unixToDate(unixTime));
        },
    };

    return utility;
});
