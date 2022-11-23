var gmail = 
{
  "id": [], 
  "count": 0, 
  "desktop": 0, 
  "check": function () 
  {
    if (config.log) console.error(">>Check Gmail");
    
    try {
      var getcount = function (txt) 
      {
        var validate = function (id) 
        {
          for (var i = 0; i < gmail.id.length; i++) 
          {
            if (gmail.id[i] === id) return false;
          }
          
          return true;
        };
        
        var parser = new window.DOMParser();
        var feed = parser.parseFromString(txt, "text/xml");
        if (feed) 
        {
          var entry = feed.querySelectorAll("entry");
          for (var i = 0; i < entry.length; i++) {
            var id = entry[i].getElementsByTagName("id");
            if (id.length) 
            {
              id = id[0].textContent;
              if (validate(id)) 
              {
                gmail.id.push(id);
                if (gmail.desktop < config.email.desktopcount) 
                {
                  var title = entry[i].getElementsByTagName("title")[0].textContent;
                  var message = entry[i].getElementsByTagName("summary")[0].textContent;
                  if (config.email.notification) 
                  {
                    app.notifications.create(
                      {
                      "title": title,
                      "type": "basic",
                      "message": message
                    });
                  }
                  
                  gmail.desktop++;
                }
              }
            }
          }
        }
        
        return parseInt(feed.getElementsByTagName("fullcount")[0].textContent) || 0;
      };
      
      var arr = [];
      var notificationcount = 0;
      var feed = "https://mail.google.com/mail/u/0/feed/atom";
      arr.push(feed + "?rand=" + Math.round(Math.random() * 100000000));
      var labels = config.email.label.split(',').map(function (label) {return label.trim()}).filter(function (label) {return label});
      labels.forEach(function (e, i) {arr.push(feed + '/' + e.toLowerCase().replace(/\ +/g, '-') + "?rand=" + Math.round(Math.random() * 100000000))});
      
      var action = function (callback) {
        var loop = function (arr, index) {
          var options = {"method": "GET", "url": arr[index]};
          app.request.http(options, function (content) {
            if (content) notificationcount = notificationcount + getcount(content);
            else app.popup.send("gmail-count", 'Error');
            (++index < arr.length) ? loop(arr, index) : callback(true);
          });
        };
        
        loop(arr, 0);
      };
      
      action(function () 
      {
        if (notificationcount >= 0 && notificationcount !== gmail.count) 
        {
          gmail.count = notificationcount;
          app.popup.send("gmail-count", gmail.count);
          core.update.badge();
          var audio = new Audio('Notification_Sound/notification.ogg');
          audio.play();
        }
        
        gmail.desktop = 0;
      });
    } catch (e) {
      app.popup.send("gmail-count", 'Error');
    }
  }
};