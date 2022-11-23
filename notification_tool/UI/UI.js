var background = (function () {
  var tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-popup") {
          if (request.method === id) tmp[id](request.data);
        }
      }
    }
  });

  return {
    "receive": function (id, callback) {tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": "popup-to-background", "method": id, "data": data})}
  }
})();

var config = {
  "reset": {
    "status": function (e) {
      var status = document.getElementById("status");
      status.textContent = "Notification Tool";
    }
  },
  "update": {
    "status": function (e) {
      var status = document.getElementById("status");
      status.textContent = e.target.getAttribute("title") || "Notification Tool";
    },
    "badge": {
      "color": function (e) {
        var span = document.querySelectorAll("span[type]");
        for (var i = 0; i < span.length; i++) {
          span[i].style.color = e.color;
        }
      },
      "text": function (type, count) {
        var span = document.querySelectorAll("span[type]");
        if (count === (parseInt(count) + '') && parseInt(count) > 99) count = "99+";

        for (var i = 0; i < span.length; i++) {
          if (span[i].getAttribute("type") === type) {
            span[i].textContent = count;
            break;
          }
        }
      }
    }
  },
  "load": function () {
    document.getElementById("refresh").addEventListener("click", function () {background.send("refresh")}, false);
  

    document.querySelector(".accounts").addEventListener("click", function (e) {
      var type = e.target.getAttribute("type");
      if (type) background.send("open-tab-request", type);
    }, false);

    var arr = document.querySelectorAll("td");

    for (var i = 0; i < arr.length; i++) {
      arr[i].addEventListener("mouseleave", config.reset.status, false);
      arr[i].addEventListener("mouseenter", config.update.status, false);
    }

    background.send("load");
    window.removeEventListener("load", config.load, false);
  }
};

background.receive("badge-color", config.update.badge.color);
background.receive("gmail-count", function (count) {config.update.badge.text("gmail", count)});
background.receive("outlook-count", function (count) {config.update.badge.text("outlook", count)});

window.addEventListener("load", config.load, false);