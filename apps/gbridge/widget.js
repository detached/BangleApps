(() => {

  const gb = {
    musicState: {
      STOP: "stop",
      PLAY: "play",
      PAUSE: "pause"
    },

    muiscControl: {
      NEXT: "next",
      PREV: "previous"
    },

    send: (message) => {
      Bluetooth.println(JSON.stringify(message));
    },

    controlMusic: (operation) => {
      send({ t: "music", n: operation });
    },

    reportBatteryLevel: () => {
      send({ t: "status", bat: E.getBattery() });
    },
  };

  const state = {
    music: gb.musicState.STOP,

    musicInfo: {
      artist: "",
      album: "",
      track: ""
    },

    scrollPos: 0,
  };

  const notification = {

    backgroundColor: "#222222",
    frameColor: "#ffffff",
    titelColor: "#40d040",
    contentColor: "#ffffff",

    show: (size, drawContent) => {
      var oldMode = Bangle.getLCDMode();
      Bangle.setLCDMode("direct");

      g.setClipRect(0, 240, 239, 319);
      g.setColor(backgroundColor);
      g.fillRect(1, 241, 238, 318);

      drawContent(320 - size);

      g.setColor(frameColor);
      g.fillRect(0, 240, 1, 319);
      g.fillRect(238, 240, 239, 319);
      g.fillRect(2, 318, 238, 319);

      Bangle.setLCDPower(1); // light up
      Bangle.setLCDMode(oldMode); // clears cliprect

      function anim() {
        state.scrollPos -= 2;
        if (state.scrollPos < -size) state.scrollPos = -size;
        Bangle.setLCDOffset(state.scrollPos);
        if (state.scrollPos > -size) setTimeout(anim, 10);
      }
      anim();
    },

    hide: () => {
      function anim() {
        state.scrollPos += 4;
        if (state.scrollPos > 0) state.scrollPos = 0;
        Bangle.setLCDOffset(state.scrollPos);
        if (state.scrollPos < 0) setTimeout(anim, 10);
      }
      anim();
    }
  };

  function showNotification(src, title, body) {
    notification.show(80, (y) => {
      // TODO: icon based on src?
      var x = 120;
      g.setFontAlign(0, 0);

      g.setFont("6x8", 1);
      g.setColor(titelColor);
      g.drawString(src, x, y + 7);

      g.setColor(notification.contentColor);
      g.setFont("6x8", 2);
      g.drawString(title, x, y + 25);

      g.setFont("6x8", 1);
      g.setColor(notification.contentColor);
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
    if (state.music == gb.musicState.PLAY) {
      notification.show(40, (y) => {

        g.setColor(notification.contentColor);
        const icon = require("Storage").read("music-info-ico.img");
        g.drawImage(icon, 8, y + 8);

        g.setFontAlign(-1, -1);
        g.setFont("6x8", 1);
        var x = 40;
        g.setFont("4x6", 2);
        g.setColor(notification.contentColor);
        g.drawString(state.musicInfo.artist, x, y + 8);

        g.setFont("6x8", 1);
        g.setColor(notification.contentColor);
        g.drawString(state.musicInfo.track, x, y + 22);
      });
    } else {
      notification.hide();
    }
  }

  global.GB = (event) => {
    switch (event.t) {
      case "notify":
        showNotification(event.src, event.title, event.body);
        break;
      case "musicinfo":
        state.musicInfo = event;
        break;
      case "musicstate":
        state.musicInfo = event.state;
        updateMusicInfo();
        break;
    }
  };

  // Touch control
  Bangle.on("touch", () => {
    if (state.scrollPos) {
      hideFrame();
    }
  });

  Bangle.on("swipe", (dir) => {
    if (state.music == gb.musicState.PLAY) {
      gb.controlMusic(dir > 0 ? gb.muiscControl.NEXT : gb.muiscControl.PREV);
    }
  });

  gb.reportBatteryLevel();

  function drawIcon() {
    g.setColor(-1);

    let icon;
    if (NRF.getSecurityStatus().connected) {
      icon = require("Storage").read("widget-online-ico.img");
    } else {
      icon = require("Storage").read("widget-offline-ico.img");
    }

    g.drawImage(icon, this.x + 1, this.y + 1);
  }

  function changedConnectionState() {
    WIDGETS["gbridgew"].draw();
    g.flip(); // turns screen on
  }

  NRF.on("connected", changedConnectionState);
  NRF.on("disconnected", changedConnectionState);

  WIDGETS["gbridgew"] = { area: "tl", width: 24, draw: drawIcon };

})();
