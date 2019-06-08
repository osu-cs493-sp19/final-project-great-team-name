const bcrypt = require('bcryptjs');


bcrypt.hash("hunter2", 8)
.then( (hash)=>{

  console.log(hash);
});
