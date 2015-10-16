define(['knockout',
        'common/dialog',
        'viewmodels/common/confirmation-dialog',
        'viewmodels/common/wallet-passphrase',
        'viewmodels/common/command',
        'patterns'], function(ko,dialog,ConfirmationDialog,WalletPassphrase,Command,patterns){
    var sendType = function(options){
        var self = this, sendOptions = options || {};
        this.wallet= sendOptions.parent;
        this.recipientAddress = ko.observable("").extend( 
            { 
                pattern: { params: patterns.bitcoindark, message: 'Not a valid address' },
                required: true
            });

        this.amount = ko.observable(sendOptions.amount || 0.0).extend(
            { 
                number: true,
                required: true
            });

        this.minerFee = ko.observable(sendOptions.minerFee || 0.0001);
        this.canSend = ko.computed(function(){
            var amount = self.amount(),
                isNumber = !isNaN(amount),
                address = self.recipientAddress(),
                addressValid = self.recipientAddress.isValid(),
                amountValid = self.amount.isValid(),
                available = self.wallet.walletStatus.available(),
                canSend;

            canSend = isNumber && available > 0 && address.length > 0 && amount > 0;
            return canSend;
        });
    };

    function lockWallet(){
        var sendCommand = new Command('walletlock').execute()
            .done(function(result){
                console.log('Wallet relocked');
            })
            .fail(function(error){
                dialog.notification(error.message, "Failed to re-lock wallet");
            });
        return sendCommand;
    }
   
    sendType.prototype.unlockWallet= function(){
        var self = this, walletPassphrase = new WalletPassphrase({canSpecifyStaking:false, stakingOnly:false}),
            passphraseDialogPromise = $.Deferred();

        walletPassphrase.userPrompt(false, 'Wallet unlock', 'Unlock the wallet for sending','OK')
            .done(function(result){
                passphraseDialogPromise.resolve(walletPassphrase.walletPassphrase());                            
            })
            .fail(function(error){
                passphraseDialogPromise.reject(error);
            });
        return passphraseDialogPromise;
    };

    sendType.prototype.sendSubmit = function(){
        var self = this;
        console.log("Send request submitted, unlocking wallet for sending...");
        if(self.canSend()){
            lockWallet().done(function(){
                console.log('Wallet lcoked. Prompting for confirmation...');
                self.sendConfirm(self.amount())
                    .done(function(result){
                        self.unlockWallet()
                            .done(function(result){
                                console.log("Wallet successfully unlocked, sending...");
                                self.sendToAddress(result);
                            })
                            .fail(function(error){
                                dialog.notification(error.message);
                            });
                    })
                    .fail(function(error){
                        
                    });

            }); 
        }
        else{
            console.log("Can't send. Form in invalid state");
        }
    };

    sendType.prototype.sendConfirm = function(amount){
        var self = this, 
            sendConfirmDeferred = $.Deferred(),
            sendConfirmDialog = new ConfirmationDialog({
                title: 'Send Confirm',
                context: self,
                allowClose: false,
                message: 'You are about to send ' + amount + ' BTCD, in addition to any miner fees the transaction may incur (e.g. 0.0001 BTCD). Do you wish to continue?',
                affirmativeButtonText: 'Yes',
                negativeButtonText: 'No',
                affirmativeHandler: function(){ sendConfirmDeferred.resolve(); },
                negativeHandler: function(){ sendConfirmDeferred.reject(); }
            });
        sendConfirmDialog.open();
        return sendConfirmDeferred.promise();
    };
    
    sendType.prototype.sendToAddress = function(auth) { 
        var self = this;
        sendCommand = new Command('sendtoaddress', [self.recipientAddress(), self.amount()]).execute()
            .done(function(result){
                console.log("Send Success");
                self.recipientAddress('');
                self.amount(0);

                lockWallet()
                    .done(function(){
                        var walletPassphrase = new WalletPassphrase({
                            walletPassphrase: auth,
                            forEncryption: false,
                            stakingOnly: true
                        });
                        console.log("Wallet successfully relocked. Opening for staking...");
                        walletPassphrase.openWallet(false)
                            .done(function() {
                                auth = "";
                                console.log("Wallet successfully re-opened for staking");
                                self.wallet.refresh()
                            });
                    });
            })
            .fail(function(error){
                console.log("Send error:");
                console.log(error);
                dialog.notification(error.message);
            });
   
    };   
    return sendType; 
});
