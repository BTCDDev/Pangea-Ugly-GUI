define(['knockout','common/dialog'], function(ko,dialog) {
    var confirmationDialogType = function(options){
        this.wallet = options.wallet || options.context.parent || { openDialog: function() { alert('No dialog container'); }, closeDialog: function() { } };
        this.context = options.context || this;
        this.title = options.title || "Notification";
        this.affirmativeHandler = options.affirmativeHandler;
        this.negativeHandler = options.negativeHandler;
        this.template = options.template || "modals/confirmation-dialog";
        
        this.contentTemplate = options.contentTemplate || "modals/confirmation-message";
        this.message = options.message || "";
        this.affirmativeButtonText = options.affirmativeButtonText || "OK";
        this.negativeButtonText = options.negativeButtonText || "Cancel";
    };

    confirmationDialogType.prototype.open = function(){
        dialog.openDialog(this,this.template);
    };

    confirmationDialogType.prototype.close = function(){
        dialog.closeDialog();
    };

    confirmationDialogType.prototype.affirmative = function() {
        this.affirmativeHandler.call(this.context);
        dialog.closeDialog();
    };

    confirmationDialogType.prototype.negative = function(){
        this.negativeHandler.call(this.context);
        dialog.closeDialog();
    };

    return confirmationDialogType;
});
