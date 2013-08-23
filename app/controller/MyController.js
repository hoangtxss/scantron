/*
 * File: app/controller/MyController.js
 *
 * This file was generated by Sencha Architect version 3.0.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Sencha Touch 2.2.x library, under independent license.
 * License of Sencha Architect does not include license for Sencha Touch 2.2.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('SNS.controller.MyController', {
    extend: 'Ext.app.Controller',
    requires: ['Ext.data.JsonP'],
    config: {
        refs: {
            scanField: 'textfield[name=scanfield]',
            scanButton: 'button[action=scan]',
            cancelButton: 'button[action=cancel]',
            statusView: 'dataview#statusView',
            detailView: 'container#detailview'
        },
        control: {
            scanField: {
                clearicontap: 'doClear',
                change: 'parseValue'
            },
            scanButton: {
                tap: 'startScan'
            },
            cancelButton: {
                tap: 'cancelScan'
            }
        }
    },
    status: function(msg, time, code) {
        var status = this.getStatusView().getStore().add({
            status: msg,
            statusCode: code,
            elapsed: time
        });
        return status[0]; // store.add returns an array
    },
    clearStatus: function(msg) {
        this.getStatusView().getStore().removeAll();
        this.getDetailView().setData({});
        if (msg !== false) {
            msg = msg || '';
            return this.status(msg);
        }
    },
    parseValue: function(field, newValue, oldValue) {
        if (newValue !== oldValue && newValue !== "") {
            this.status('New Code: '+newValue);
            this.checkISBN(newValue);
            this.checkURL(newValue);
            this.checkIP(newValue);
            this.checkPhone(newValue);
            this.checkEmail(newValue);
        }
    },
    doClear: function(field) {
        field.setValue("");
        this.clearStatus(false);
    },
    cancelScan: function() {
        this.doClear(this.getScanField());
    },
    startScan: function() {
        console.log('Start Scan');
        var me=this;
        var status = me.clearStatus(false);
        if (cordova && cordova.require) {
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");
            scanner.scan(
                function (result) {
                    Ext.Msg.alert(
                          "Result: " + result.text + "\n" +
                          "Format: " + result.format + "\n" +
                          "Cancelled: " + result.cancelled);
                    console.log("Result: [%s]\n" +
                          "Format: [%s]\n" +
                          "Cancelled: [%o]",result.text,result.format,result.cancelled);
                    me.getScanField().setValue(Ext.String.trim(result.text));
                },
                function (error) {
                    Ext.Msg.alert("Scanning failed: " + error);
                }
            );
            } else {
                me.getScanField().focus();
            }
    },
    checkURL: function(value) {
        if (/^(https?|ftp|file):\/\/.+$/.test(value)) {
            this.status('Scanned data appears to be a URL.');
        } else {
            this.status('Scanned data is not a valid URL.');
        }
    },
    checkIP: function(value) {
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value)) {
            this.status('Scanned data appears to be an IP address.');
        } else {
            this.status('Scanned data is not a valid IP address.');
        }
    },
    checkISBN: function(value) {
        if (/^[0-9]{10}([0-9]{3}){0,1}$/.test(value)) {
            var status = this.status('Checking ISBN...');
            var start = Date.now();
            Ext.data.JsonP.request({
                url: 'http://openlibrary.org/api/books',
                method: 'GET',
                params: {
                    bibkeys: 'ISBN:'+value,
                    jscmd: 'data'
                },
                success: function(resp, req) {
                    console.log('Success! Returned ISBN Request');
                    var end = Date.now(), elapsed = end - start;
                    if (Ext.isObject(resp['ISBN:'+value])) {
                        var book = resp['ISBN:'+value];
                        status.set('status', 'ISBN Query Complete: '+book.title);
                        console.log('Book Found: %o',book);
                        this.getDetailView().setData(book);
			this.getDetailView().enable();
                    } else {
                        status.set('status', 'ISBN Query: Book Not Found');
                    }
                    status.set('elapsed', elapsed);
                },
                failure: function() {
                    console.log('Failure ISBN Request');
                    console.log(arguments);
                    var end = Date.now(), elapsed = end - start;
                    status.set('status', 'ISBN Query Error');
                    status.set('elapsed', elapsed);
                },
                scope: this
            });
        } else {
            console.log('Not a valid ISBN.')
            this.status('Scanned data is not a valid ISBN.')
        }
    },
    checkPhone: function(value) {
        if (/^(1[\-\.\s]??)?\(?(\d{3})?\)?[\-\.\s]??(\d{3})[\-\.\s]??(\d{4})$/.test(value)) {
            this.status('Scanned data appears to be a US phone number.');
        } else {
            this.status('Scanned data is not a valid US phone number.');
        }
    },
    checkEmail: function(value) {
        if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(value)) {
            this.status('Scanned data appears to be an e-mail address.');
        } else {
            this.status('Scanned data is not a valid e-mail address.');
        }
    }
});
