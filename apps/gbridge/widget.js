(() => {

  const music = {
    STOP: "stop",
    PLAY: "play",
    PAUSE: "pause"
  }

  const muiscControl = {
    NEXT: "next",
    PREV: "previous"
  }

  var musicState = music.STOP;

  var musicInfo = {
    "artist": "",
    "album": "",
    "track": ""
  };

  var scrollPos = 0;

  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }

  function gb_musicControl(operation) {
    gb({ t: "music", n: operation });
  }

  function gb_reportBattery() {
    gb({ t: "status", bat: E.getBattery() });
  }

  // Popover
  function show(size, render) {
    var oldMode = Bangle.getLCDMode();
    Bangle.setLCDMode("direct");
    g.setClipRect(0, 240, 239, 319);
    g.setColor("#222222");
    g.fillRect(1, 241, 238, 318);
    render(320 - size);
    g.setColor("#ffffff");
    g.fillRect(0, 240, 1, 319);
    g.fillRect(238, 240, 239, 319);
    g.fillRect(2, 318, 238, 319);
    Bangle.setLCDPower(1); // light up
    Bangle.setLCDMode(oldMode); // clears cliprect
    function anim() {
      scrollPos -= 2;
      if (scrollPos < -size) scrollPos = -size;
      Bangle.setLCDOffset(scrollPos);
      if (scrollPos > -size) setTimeout(anim, 10);
    }
    anim();
  }

  function hide() {
    function anim() {
      scrollPos += 4;
      if (scrollPos > 0) scrollPos = 0;
      Bangle.setLCDOffset(scrollPos);
      if (scrollPos < 0) setTimeout(anim, 10);
    }
    anim();
  }

  // Touch control
  Bangle.on('touch', function () {
    if (scrollPos) {
      hide();
    }
  });

  Bangle.on('swipe', function (dir) {
    if (musicState == music.PLAY) {
      gb_musicControl(dir > 0 ? muiscControl.NEXT : muiscControl.PREV)
    }
  });

  gb_reportBattery();

  function showNotification(src, title, body) {
    show(80, function (y) {
      // TODO: icon based on src?
      var x = 120;
      g.setFontAlign(0, 0);
      g.setFont("6x8", 1);
      g.setColor("#40d040");
      g.drawString(src, x, y + 7);
      g.setColor("#ffffff");
      g.setFont("6x8", 2);
      g.drawString(title, x, y + 25);
      g.setFont("6x8", 1);
      g.setColor("#ffffff");
      // split text up a word boundaries
      var txt = body.split("\n");
      var MAXCHARS = 38;
      for (var i = 0; i < txt.length; i++) {
        txt[i] = txt[i].trim();
        var l = txt[i];
        if (l.length > MAXCHARS) {
          var p = MAXCHARS;
          while (p > MAXCHARS - 8 && !" \t-_".includes(l[p]))
            p--;
          if (p == MAXCHARS - 8) p = MAXCHARS;
          txt[i] = l.substr(0, p);
          txt.splice(i + 1, 0, l.substr(p));
        }
      }
      g.setFontAlign(-1, -1);
      g.drawString(txt.join("\n"), 10, y + 40);
      Bangle.buzz();
    });
  }

  function updateMusicInfo() {
    if (musicState == music.PLAY)
      show(40, function (y) {
        g.setColor("#ffffff");
        const icon = require("Storage").read("music-info-ico.img")
        g.drawImage(icon, 8, y + 8);
        g.setFontAlign(-1, -1);
        g.setFont("6x8", 1);
        var x = 40;
        g.setFont("4x6", 2);
        g.setColor("#ffffff");
        g.drawString(musicInfo.artist, x, y + 8);
        g.setFont("6x8", 1);
        g.setColor("#ffffff");
        g.drawString(musicInfo.track, x, y + 22);
      });
    if (musicState == music.PAUSE) {
      hide();
    }
  }

  global.GB = function (event) {
    switch (event.t) {
      case "notify":
        showNotification(event.src, event.title, event.body);
        break;
      case "musicinfo":
        musicInfo = event;
        break;
      case "musicstate":
        musicState = event.state;
        updateMusicInfo();
        break;
    }
  };

  function drawWidgetIcon() {
    g.setColor(-1);

    const icon;
    if (NRF.getSecurityStatus().connected) {
      icon = require("Storage").read("widget-online-ico.img")
    } else {
      icon = require("Storage").read("widget-offline-ico.img")
    }

    g.drawImage(icon, this.x + 1, this.y + 1);
  }

  function changed() {
    WIDGETS["gbridgew"].draw();
    g.flip(); // turns screen on
  }

  NRF.on('connected', changed);
  NRF.on('disconnected', changed);

  WIDGETS["gbridgew"] = { area: "tl", width: 24, draw: drawWidgetIcon };

})();
