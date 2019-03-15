function (user, context, callback) {
    // TODO: implement your rule
    user.app_metadata = user.app_metadata || {};
  
    
    if (user.app_metadata.department){
     context.idToken["https://namespace.com/dept"] = user.app_metadata.department;
    }
    
    callback(null, user, context);
  }