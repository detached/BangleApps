(() => {

  let playing = false;

  function draw() {
    if (NRF.getSecurityStatus().connected && playing) {
      WIDGETS["gbmusic"].width = 24;
      g.setColor(-1).drawImage(require("heatshrink").decompress(atob("jEYwILIsEAj/ggP/AQ/8kEBwACRsEBwYaBw/gj4CBn4CCwfAj42Bhg/H")), this.x, this.y);
    } else {
      g.clearRect(this.x, this.y, 24, 24);
      WIDGETS["gbmusic"].width = 0;
    }
  }

  var _GB = global.GB;
  global.GB = (event) => {
    switch (event.t) {
      case "musicinfo":
        require("Storage").writeJSON("musicinf.json", event);
        break;
      case "musicstate":
        require("Storage").writeJSON("musicsta.json", event);
        playing = event.state == "play";
        draw();
        break;
    }
    if(_GB)setTimeout(_GB,0,event);
  };

  NRF.on("disconnected", draw);

  WIDGETS["gbmusic"] = {
    area: "tl",
    width: 24,
    draw: draw
  };
})()
