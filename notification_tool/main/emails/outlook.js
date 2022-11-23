var outlook = {
  "id": '', 
  "count": 0, 
  "desktop": 0, 
  "check": function () {
    if (config.log) console.error(">>Check Outlook");
  
    var options = {
      "method": "POST",
        "withCredentials": true,
          "url": "https://outlook.live.com/owa/0/sessiondata.ashx?app=Mail"
    };
  
    app.request.http(options, function (content) 
    {
      if (content) 
      {
        try 
        {
          var data = JSON.parse(content);
          if (data) 
          {
            if (data.findFolders) 
            {
              if (data.findFolders.Body) 
              {
                if (data.findFolders.Body.ResponseMessages) 
                {
                  if (data.findFolders.Body.ResponseMessages.Items) 
                  {
                    if (data.findFolders.Body.ResponseMessages.Items[0]) 
                    {
                      if (data.findFolders.Body.ResponseMessages.Items[0].RootFolder) 
                      {
                        var folders = data.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders;
                        if (folders && folders.length) {
                          for (var i = 0; i < folders.length; i++) {
                            var inbox = folders[i];
                            if (inbox.DistinguishedFolderId === "inbox") 
                            {
                              var notificationcount = inbox.UnreadCount;
                                if (notificationcount >= 0 && notificationcount != outlook.count) 
                                {
                                  outlook.count = notificationcount;
                                  app.popup.send("outlook-count", outlook.count);
                                  core.update.badge();
                                  var audio = new Audio('Notification_Sound/notification.ogg');
                                  audio.play();
                                }
                                // if (outlook.count !== notificationcount)
                                // {
                                //   var audio = new Audio('Notification_Sound/notification.ogg');
                                //   audio.play();
                                // }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } 
          else app.popup.send("outlook-count", 'Error');
        } 
        catch (e) {
          app.popup.send("outlook-count", 'Error');
        }
      } 
      else app.popup.send("outlook-count", 'Error');
    });
  }
};