var app = {};

app.shortname = function () {
  return chrome.runtime.getManifest().short_name;
};

app.popup = {
  "message": {},
  "receive": function (id, callback) {
    app.popup.message[id] = callback;
  },
  "send": function (id, data) {
    chrome.runtime.sendMessage({
      "data": data,
      "method": id,
      "path": "background-to-popup"
    });
  }
};

app.options = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      app.options.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({"data": data, "method": id, "path": "background-to-options"}, app.error);
    }
  },
  "post": function (id, data) {
    if (id) {
      if (app.options.port) {
        app.options.port.postMessage({"data": data, "method": id, "path": "background-to-options"});
      }
    }
  }
};


app.play = (function () {
  var iframe = null;
  var audio = new Audio();
  var canplay = audio.canPlayType("Notification_Sound/notification.ogg");
  /*  */
  if (!canplay) {
    iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
  }
  /*  */
  return {
    "audio": function (src) {
      if (canplay) {
        audio.setAttribute("src", src);
        audio.play();
      } else {
        audio.removeAttribute("src");
        iframe.setAttribute("src", src);
      }
    }
  }
})();

app.button = {
  "badge": {
    "color": function (color) {
      chrome.browserAction.setBadgeBackgroundColor({"color": color});
      var tmp = chrome.runtime.lastError;
    },
    "text": function (tabId, badge, callback) {
      if (tabId) {
        chrome.browserAction.setBadgeText({
          "tabId": tabId,
          "text": badge + ''
        }, function (e) {
          var tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      } else {
        chrome.browserAction.setBadgeText({"text": badge + ''}, function (e) {
          var tmp = chrome.runtime.lastError;
          if (callback) callback(e);
        });
      }
    }
  }
};

app.alarms = {
  "create": function (name, options) {
    if (chrome.alarms) {
      chrome.alarms.create(name, options); 
    }
  },
  "clear": function (name, callback) {
    if (chrome.alarms) {
      chrome.alarms.clear(name ? name : '', function (e) {
        if (callback) callback(e);
      }); 
    }
  },
  "on": {
    "alarm": function (callback) {
      if (chrome.alarms) {
        chrome.alarms.onAlarm.addListener(function (e) {
          app.storage.load(function () {
            callback(e);
          });
        });
      }
    }
  }
};

app.notifications = {
  "id": app.shortname() + "-notifications-id",
  "on": {
    "clicked": function (callback) {
      if (chrome.notifications) {
        chrome.notifications.onClicked.addListener(function (e) {
          app.storage.load(function () {
            callback(e);
          });
        });
      }
    }
  },
  "create": function (e, callback) {
    if (chrome.notifications) {
      chrome.notifications.create(app.notifications.id, {
        "type": e.type,
        "title": e.title,
        "message": e.message,
        "iconUrl": chrome.runtime.getURL("icons/logo.png")
      }, function (e) {
        if (callback) callback(e);
      });
    }
  }
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    chrome.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "message": function (callback) 
  {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) 
    {
      app.storage.load(function () {

        callback(message, sender, sendResponse);
      });
    });
  }
};

app.tab = 
{
  "options": function () 
  {
    chrome.runtime.openOptionsPage();
  },
  "open": function (url, index, active, callback) 
  {
    var properties = 
    {
      "url": url, 
      "active": active !== undefined ? active : true
    };

    if (index !== undefined) 
    {
      if (typeof index === "number") 
      {
        properties.index = index + 1;
      }
    }

    chrome.tabs.create(properties, function (tab) 
    {
      if (callback) callback(tab);
    }); 
  },
  "query": 
  {
    "index": function (callback) 
    {
      chrome.tabs.query({"active": true, "currentWindow": true
    }, 
    function (tabs) 
      {
        if (tabs && tabs.length) 
        {
          callback(tabs[0].index);
        } 
        else callback(undefined);
      });
    }
  }
};

app.page = 
{
  "message": {},
  "receive": function (id, callback) 
  {
    app.page.message[id] = callback;
  },
  "send": function (id, data, tabId, frameId) 
  {
    chrome.tabs.query({}, function (tabs) {
      if (tabs && tabs.length) {
        var options = {
          "method": id, 
          "data": data,
          "path": "background-to-page"
        };
 
        tabs.forEach(function (tab) {
          if (tab) {
            if (tabId !== null) {
              if (tabId === tab.id) {
                if (frameId !== null) {
                  chrome.tabs.sendMessage(tab.id, options, {"frameId": frameId});
                } else {
                  chrome.tabs.sendMessage(tab.id, options);
                }
              }
            } else {
              chrome.tabs.sendMessage(tab.id, options);
            }
          }
        });
      }
    });
  }
};

app.storage = (function () {
  chrome.storage.onChanged.addListener(function () {
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (app.storage.callback) {
        if (typeof app.storage.callback === "function") {
          app.storage.callback(true);
        }
      }
    });
  });
  /*  */
  return {
    "local": {},
    "callback": null,
    "read": function (id) {
      return app.storage.local[id];
    },
    "on": {
      "changed": function (callback) {
        if (callback) {
          app.storage.callback = callback;
        }
      }
    },
    "write": function (id, data, callback) 
    {
      var tmp = {};
      tmp[id] = data;
      app.storage.local[id] = data;
      chrome.storage.local.set(tmp, function (e) 
      {
        if (callback) callback(e);
      });
    },
    "load": function (callback) 
    {
      var keys = Object.keys(app.storage.local);
      if (keys && keys.length) {
        if (callback) callback("cache");
      } else {
        chrome.storage.local.get(null, function (e) 
        {
          app.storage.local = e;
          if (callback) callback("disk");
        });
      }
    }
  }
})();

app.request = {
  "http": function (e, callback) {
    if (e) {
      var url = e.url;
      var data = e.data;
      var method = e.method;
      var timeout = e.timeout;
      var headers = e.headers;
      var responsetype = e.responsetype;
      var withCredentials = e.withCredentials;
  
      if (url) {
        try {
          var request = new XMLHttpRequest();
   
          request.onerror = function () {
            callback(null);
          };
   
          request.onload = function (e) {
            if (e && e.target) {
              if (e.target.status) {
                if (e.target.status >= 200 && e.target.status < 300 || e.target.status === 304) {
                  if (e.target.responseType) {
                    if (e.target.response) 
                    {
                      callback(e.target.response);
                    } 
                    else {
                      callback(null);
                    }
                  } 
                  else {
                    if (e.target.responseText) {
                      var response = e.target.responseText;
                      callback(response);
                    } 
                    else {
                      callback(null);
                    }
                  }
                } 
                else {
                  callback(null);
                }
              } 
              else {
                callback(null);
              }
            } 
            else {
              callback(null);
            }
          };
   
          request.open(method, url);
   
          if (timeout) request.timeout = timeout;
          if (withCredentials) request.withCredentials = true;
          if (responsetype) request.responseType = responsetype;
          if (headers) {
            for (var key in headers) {
              request.setRequestHeader(key, headers[key]);
            }
          }
   
          request.send(data ? JSON.stringify(data) : null);
        } 
        catch (e) {
          callback(null);
        }
      } 
      else {
        callback(null);
      }
    } 
    else {
      callback(null);
    }
  }
};