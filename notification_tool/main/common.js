var core = {
  "total": {"count": 0},
  "start": function () {core.load()},
  "install": function () {core.load()},
  "load": function () {
    core.set.badge.color();
    core.reset.popup.metrics();
    core.alarms("check-all", config.interval.time);
  },
  "alarms": function (name, seconds) {
    var minutes = Math.floor(seconds / 60);
    /*  */
    app.alarms.clear(name, function () {
      app.alarms.create(name, {
        "when": Date.now() + 1000,
        "periodInMinutes": minutes < 1 ? 1 : minutes
      });
    });
  },
  "check": {
    "all": function () {
      outlook.check();
      gmail.check();
    }
  },
  "update": {
    "badge": function () {
      var count = outlook.count + gmail.count;
      if (config.email.beep && count > core.total.count) app.play.audio(chrome.runtime.getURL("Notification_Sound/notification.ogg"));
      if (count) core.total.count = count;
      /*  */
      count = count <= 0 ? '' : (count > 999 ? "99+" : count + '');
      app.button.badge.text(null, count);
    }
  },
  "reset": {
    "popup": {
      "metrics": function () {
        app.popup.send("outlook-count", '0');
        app.popup.send("gmail-count", '0');
      }
    }
  },
  "set": {
    "badge": {
      "color": function () {
        app.button.badge.color(config.badge.color);
        core.set.popup.metrics();
      }
    },
    "popup": {
      "metrics": function () {
        app.popup.send("outlook-count", outlook.count);
        app.popup.send("gmail-count", gmail.count);
        app.popup.send("badge-color", {"color": config.badge.color});
      }
    }
  }
};

app.popup.receive("open-tab-request", function (type) {
  var active = config.tab.active;
  /*  */
  if (type === "gmail") app.tab.open("https://mail.google.com/", null, active);
  if (type === "outlook") app.tab.open("https://mail.live.com/", null, active);
});

app.options.receive("store", function (e) {
  if (e.name === "email.beep") config.email.beep = e.value;
  if (e.name === "tab.active") config.tab.active = e.value;
  if (e.name === "badge.color") config.badge.color = e.value;
  if (e.name === "email.label") config.email.label = e.value;
  if (e.name === "email.desktopcount") config.email.desktopcount = e.value;
  if (e.name === "email.notification") config.email.notification = e.value;
  if (e.name === "interval.time") {
    config.interval.time = e.value;
    core.alarms("check-all", config.interval.time);
  }
});

app.options.receive("load", function () {
  app.options.send("storage", {
    "email.beep": config.email.beep,
    "tab.active": config.tab.active,
    "badge.color": config.badge.color,
    "email.label": config.email.label,
    "interval.time": config.interval.time,
    "email.desktopcount": config.email.desktopcount,
    "email.notification": config.email.notification
  });
});

app.popup.receive("refresh", core.check.all);
app.popup.receive("load", core.set.popup.metrics);


app.on.startup(core.start);
app.on.installed(core.install);
app.alarms.on.alarm(core.check.all);