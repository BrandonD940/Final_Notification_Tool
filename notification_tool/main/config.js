var config = {};

config.log = false;

config.welcome = 
{
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.tab = 
{
  set active (val) {app.storage.write("tab-active", val)},
  get active () {return app.storage.read("tab-active") !== undefined ? app.storage.read("tab-active") : true}
};

config.badge = 
{
  set color (val) {app.storage.write("badge-color", val)},
  get color () {return app.storage.read("badge-color") !== undefined ? app.storage.read("badge-color") : "#0099FF"}
};

config.interval = {
  get time () {return app.storage.read("interval") !== undefined  ? parseInt(app.storage.read("interval")) : 300},
  set time (val) {
    val = parseInt(val);
    if (val < 15) val = 15;
    app.storage.write("interval", val);
  }
};

config.email = 
{
  set beep (val) {app.storage.write("email-beep", val)},
  set notification (val) {app.storage.write("email-notification", val)},
  get label () {return app.storage.read("email-label") !== undefined ? app.storage.read("email-label") : ''},
  get beep () {return app.storage.read("email-beep") !== undefined ? app.storage.read("email-beep") : false},
  get notification () {return app.storage.read("email-notification") !== undefined ? app.storage.read("email-notification") : true},
  get desktopcount () {return app.storage.read("email-desktop-count") !== undefined ? parseInt(app.storage.read("email-desktop-count")) : 3},
  set desktopcount (val) {
    val = parseInt(val);
    if (val < 1) val = 1;
    app.storage.write("email-desktop-count", val);
  },
  set label (val) {
    val = val.trim().split(/\s*\,\s*/).map(function (key) 
    {
      return key.toLowerCase().replace(/\s+/g, '-');
    }).join(', ');

    app.storage.write("email-label", val);
  }
};
