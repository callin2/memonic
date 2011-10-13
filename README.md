# memonic

memonic api wrapper for nodejs.

## Installation

```
  npm install memonic
```

## Usage

``` js
  var memonic = require('memonic');
  var user = { id : 'memonicId', password : 'memonicPassword' };
  
  var mn = new memonic('your memonic api key here');
  mn.connect( user.id, user.password );
  mn.items({pagesize:5, page : 1} , function(err, result){
	// do something with result	  
  });
  
```

## Run Tests
``` 
  npm test
```

## Author: [임창진](http://callin3.cafe24.com)
