let musicinfo = require("Storage").readJSON("musicinf.json", true) || { track: "", artist: "" };
let musicstate = require("Storage").readJSON("musicsta.json", true) || { state: "unknown" };

function draw() {
  drawText();
  drawPlayPause();
  g.drawImage(require("heatshrink").decompress(atob("mUywI2ziAFEgwCBn/AgEB8EAh/wBIN8gED/gFBj4PB/4FBg/4DAn/wAYDv/wDAgWBDAf/8AYE/wYE//DDAn8DAn/34YDAAIYECYIYDAAIYE/4YQ/wYFJQn/JQuDDAmADAnADAnADAngPgiiBDAYPBDAYFBDAd4VwkYAQIYCgj/wAAoA=")), 160, 240 / 2);
  g.drawImage(require("heatshrink").decompress(atob("mUywI52gQCBh/wgEBwEAgf8AoPgBgP/AQP4AQM/4EA/wYEv4YEv4YEn4YEn4YEj//DAYFBDAcP/4YD5//DAf3/4YDAgIYEAAIYDAoIYDBgQYP74YE+YYE/gmBDAcHDAnAv5jEGYJ8EDAkAj4YEgKVFn4YEgauFvCuEgzOFDAIAxA")), 30, 240 / 2);
}

function drawText() {
  g.clearRect(0, 50, 239, 120);
  g.setFontAlign(0, 1, 0);

  // TODO: What do we do with too long titles? scrolling? linebreak?
  g.setFont("6x8", 2).drawString(musicinfo.track.trim().substring(0, 17), 120, 75, true);
  g.setFont("6x8", 1).drawString(musicinfo.artist, 120, 85, true);
}

function drawPlayPause() {
  g.clearRect(96, 120, 146, 170);

  if (musicstate.state === "play") {
    g.drawImage(require("heatshrink").decompress(atob("mUywI2zh/8AIIFBgf/AIIMC//AAIIFBn/wAIIY/DH4Y9AGA=")), 96, 120);
  } else {
    g.drawImage(require("heatshrink").decompress(atob("mUywIpmgYGF+AFEn4FEh/gDAn+Bgn/Bgk//gYE//ADAf/Bgn/Bgk///4DAn/wAYDBggFB/4YE/5TCDAQMCDARGDAoRTCDAQMCDAYsBDAYyCAooYCLAQYCAoQYCMgYwEDAQFDDAIFDDAR8FSogFEDAKuEQIYYCAok/AokPUAYYBAokAAooAkA")), 96, 240 / 2);
  }
}

function toggleState() {
  if (musicstate.state === "play") {
    gbSend({ t: "music", n: "pause" });
  } else {
    gbSend({ t: "music", n: "play" });
  }
}

function volumeUp() {
  gbSend({ t: "music", n: "volumeup" });
}

function volumeDown() {
  gbSend({ t: "music", n: "volumedown" });
}

function gbSend(message) {
  Bluetooth.println(JSON.stringify(message));
}

Bangle.on("touch", (dir) => {
  if (dir === 1) {
    gbSend({ t: "music", n: "previous" });
  } else {
    gbSend({ t: "music", n: "next" });
  }
});

let _GB = global.GB;
global.GB = (event) => {
  switch (event.t) {
    case "musicinfo":
      require("Storage").writeJSON("musicinf.json", event);
      musicinfo = event;
      drawText(); break;
    case "musicstate":
      require("Storage").writeJSON("musicsta.json", event);
      musicstate = event;
      drawPlayPause();
      break;
  }
  if (_GB) setTimeout(_GB, 0, event);
};

setWatch(volumeUp, BTN1, true);
setWatch(toggleState, BTN2, true);
setWatch(volumeDown, BTN3, true);

g.setBgColor(0x0000).setColor(-1);

draw();