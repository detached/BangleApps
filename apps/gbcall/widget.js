(() => {

  let state = "";
  let offset = 0;

  function showIncomingCall(e) {
    Bangle.setLCDPower(1);

    let title = e.name ? e.name : e.number;

    let oldMode = Bangle.getLCDMode();
    Bangle.setLCDMode("direct");
    g.setClipRect(0, 240, 239, 319);
    g.setBgColor(0x0000).clearRect(0, 240, 239, 319);

    g.setColor(0x39C7).fillRect(5, 240, 234, 264);

    g.setColor(-1).setFontAlign(1, -1, 0).setFont("6x8", 1);
    g.setFontAlign(0, -1, 0).setFont("6x8", 2);
    g.drawString(title.trim().substring(0, 20), 120, 244);

    g.setColor(0x4F20).fillCircle(58, 293, 25);
    g.setColor(0xF800).fillCircle(180, 293, 25);
    g.setColor(-1).drawImage(require("heatshrink").decompress(atob("mUywIkhvgFEv+AAoc/8AFDj/8AocP/4FDgf/4AGD//4Dwn+DAorDDAPwDAgrEn4rEDAsBGIt/JQokEgY9EgA9ECQIeEg4YEgI9EHwJ8Eh4xECTWBBocP/YNDMgJlEO4JGDO4JZDCRBsDg4MBTogSEj4lEWAKFEv7DFRYokEBgIFEAB4=")), 33, 267);
    g.drawImage(require("heatshrink").decompress(atob("mUywJC/AGUP//8AoV/////AFBAgIAB4AFECYIFDBgIXCDIU///wgYGBFIPwgAJB4YoCg4JB//+gEBEoIOBwA6CDAPggEfDAQeBEoIYBJwQYCDwISCg5aDEQIXBAAMDK4IA/ADgA=")), 155, 267);

    Bangle.setLCDMode(oldMode);

    function anim() {
      offset -= 7;
      if (offset < -80) offset = -80;
      Bangle.setLCDOffset(offset);
      if (offset > -80) setTimeout(anim, 15);
    }
    anim();
  }

  function gbSend(message) {
    Bluetooth.println(JSON.stringify(message));
  }

  function hide() {
    function anim() {
      offset += 7;
      if (offset > 0) offset = 0;
      Bangle.setLCDOffset(offset);
      if (offset < 0) setTimeout(anim, 10);
    }
    anim();
  }

  var _GB = global.GB;
  global.GB = (event) => {
    if (event.t === "call" && event.cmd === "accept") {
      state = event.cmd;
      switch (event.cmd) {
        case "accept":
          showIncomingCall(event);
          Bangle.buzz();
          break;
        default:
          hide();
          break;
      }
    }
    if (_GB) setTimeout(_GB, 0, event);
  };

  Bangle.on("touch", (dir) => {
    if (state === "accept") {
      if (dir === 1) {
        gbSend({ "t": "call", "n": "accept" });
      } else {
        gbSend({ "t": "call", "n": "reject" });
      }
      state = "";
      hide();
    }
  });

  Bangle.on("swipe", (dir) => {
    if (state === "accept") {
      gbSend({ "t": "call", "n": "ignore" });
      state = "";
      hide();
    }
  });

  WIDGETS["mywidget"] = {
    area: "tl",
    width: 24,
    draw: () => { }
  };
})()
