define(['knockout'], function(ko){
    var consoleType = function(options){
        this.isLoading = ko.observable(false);
        this.commandText = ko.observable('help');
        this.commandOutput = ko.observable('');
    };

    function parseCommand(commandText){
        var url = 'http://127.0.0.1:8080/';
        commandText.replace(new RegExp(' ','g') );
        url = url.concat(commandText.replace(new RegExp(' ','g'), '/'));
        return url;
    }

    consoleType.prototype.runCommand = function(){
        var self = this;
        self.isLoading(true);
        $.ajax({
            async: true,
            method: 'GET',
            url: parseCommand(self.commandText()),
            dataType: 'json'
        }).done(function(data){
            console.log(data);
            var result = data.error ? data.error.error.message : data.result;
            if( toString.call(result) !== "[object String]"){
                result = JSON.stringify(data.result, null, 4);
            }
            self.commandOutput(result);                
        }).fail(function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            self.commandOutput(errorThrown);   
        }).always(function(){
            self.isLoading(false);
        });
    };
    return consoleType; 
});
