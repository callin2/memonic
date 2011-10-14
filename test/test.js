var vows   = require('vows');
var assert = require('assert');
var memonic = require('../');

var $apiKey = '4ee66e3b52605698fd2ec27eaaf40aa8';

vows.describe('memonic module test').addBatch({
	'create memonic instance' : {
		topic : new memonic($apiKey),
		'instance must not null' : function(mc) {
			assert.isNotNull(mc);
		},
		
		'connect by invalid user' : {
			topic : function(mc) {
				mc.connect('','', this.callback );
			},
			'must raise invalid user error ' : function( err, userId ) {
				assert.isNotNull(err);
				assert.isUndefined(userId);
			},
		},
		
		'connect by valid user' : {
			topic : function(mc) {
				mc.connect('test-id','test-password', this.callback );
			},
			'must no error' : function( err, userId ) {
				assert.isNull(err);
			},
			'memonic internal userid exist' : function( err, userId ) {
				assert.isNotNull(userId);
			},
			
			'get all items of user' : {
				topic : function(_a, mc) {					
					mc.items({pagesize:5},this.callback);
				},
				'page size 5' : function(err, result) {	
					assert.isNull(err);
					assert.equal(result.items.length , 5);
					
					var anItem = result.items[0];
					assert.isNotEmpty(anItem.href);
					assert.isNotEmpty(anItem.link);
					assert.isNotEmpty(anItem.id);
					assert.isNotEmpty(anItem.modified);
					assert.isNotEmpty(anItem.user);
				},				
				
				'get an item detail' : {
					topic : function(_a,_b,mc) {
						mc.item(_a.items[1].id, {}, this.callback);
					},
					'detail info must be returned' : function(err, detailInfo) {
						assert.isNull(err);
						assert.isNotNull(detailInfo);						
						
						assert.isNotNull(detailInfo.attachments);
						assert.isNotNull(detailInfo.permission);
						assert.isNotNull(detailInfo.updated_at);
						assert.isNotNull(detailInfo.tinyurl);
						assert.isNotNull(detailInfo.groups);
						assert.isNotNull(detailInfo.data);
						assert.isNotNull(detailInfo.id);
						assert.isNotNull(detailInfo.data);
						
					}
				}
			}
		},
	}	
}).export(module);
