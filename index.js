// # Memonic
// memonic api wrapper for nodejs.
// it support basic auth only.
// curruntly this wrapper support only two api call `items` and `item` .
// you should read [api document](http://www.memonic.com/developers/api/) first 
var request = require('request');
var LRU = require("lru-cache")
var _ = require('underscore');

var memonicUrl = 'https://api.memonic.com/v2';
var apiKey = '';

var pool = LRU(100);

// ## constructor function.
// it  takes one parameter `_apikey`. it is not optional parameter.
function Memonic( _apikey ) {
	apiKey = _apikey;
	
    this.userId = '';
    this.auth = '';
    this.isConnected = false;
    this.queue = [];
}

// ## connect 
// it accept 3 parameter `id`, `password`, `callback`. last parameter callback is optional.
// callback type is `function(err , internalUserId)`.
// before connected to memonic api server, other function call just wait until connected. 
Memonic.prototype.connect = function( id, passwd, callback ) {
    this.auth = 'Basic ' + new Buffer(id + ':' + passwd).toString('base64');
    
    if( pool.get( id + ':' + passwd ) ) {
        this.userId = pool.get( id + ':' + passwd );
        this.isConnected = true;
        if(callback) {
            callback(null, this.userId );
        }
        return;
    }
    
    this.isConnected = false;        
	var self = this;
	var url =  memonicUrl + '/users.json?apikey=' + apiKey;
	
    request(
        { 
            'method' : 'GET'
          , 'url' : url
          , 'headers' : {
                'Authorization' : this.auth
          }
        },function(err, response, body){
            if(err) {
                if(callback) {       
                    callback(err);
                }
            }else {
                var result = JSON.parse(body);
                if(result.message) {
                	!!callback && callback(result.message);
                	return;
                }else if( !result.users || result.users.length < 1) {
                	!!callabck && callback('memonic user info incorrect');
                	return;
                }
                
                self.userId = result.users[0].id;
                pool.set( id + ':' + passwd , self.userId );
                self.isConnected = true;
                
                if(callback) {                
                    callback(null, self.userId);
                }
                
                // if waiting api call exist then execute,
                while(self.queue.length > 0 ) {
                	var waitFunc = self.queue.shift();
                	//console.log(waitFunc.toString());
                	waitFunc();
                }                
            }
        }
	);    
}

// ## items
// get all memonic note items list.
// option type is object. possible option name is `page` and `pagesize`
// 3rd parameter connected is internal use only
Memonic.prototype.items = function( option, callback, connected ) {
    var self = this;
    
    if(!this.isConnected && !connected ) {
        this.queue.push(function(){
            self.items(option, callback, true);
        });
        return;
    }
    
    if(!option)  option = {};
    var url = memonicUrl + '/users/'+ this.userId +'/items.json?apikey=' + apiKey;
    
    _(['page','pagesize']).each(function(v){
        if(option[v]) url = url + '&' + v + '=' + option[v];
    });
    
    request(
        { 
            'method'    : 'GET'
          , 'url'       : url
          , 'headers'   : {
                'Authorization' : this.auth
          }
        },function(err, response, body){
            if(err) {
                callback(err);
            }else {
                callback(null, JSON.parse(body));
            }
        }
	);      
}

// ## item
// get a memonic note item.
// option type is object. possible option name is `thumbnails` 
// 4th parameter connected is internal use only
Memonic.prototype.item = function( itemId, option, callback, connected ) {
    var self = this;
    
    if(!this.isConnected && !connected ) {
        this.queue.push(function(){
            self.item(itemId,option,callback, true);
        });
        return;
    }
    
    option =  option || {};
    var url = memonicUrl + '/users/'+ this.userId +'/items/' + itemId +'.json?apikey=' + apiKey;   
    
    _(['page','pagesize']).each(function(v){
        if(option[v]) url = url + '&' + v + '=' + option[v];
    });
    
    request(
        { 
            'method'    : 'GET'
          , 'url'       : url
          , 'headers'   : {
                'Authorization' : this.auth
          }
        },function(err, response, body){
            if(err) {
                callback(err);
            }else {
                callback(null, JSON.parse(body));
            }
        }
	);      
}

module.exports = Memonic;
