(() => {

  let playing = false;

  function draw() {
    if (NRF.getSecurityStatus().connected && playing) {
      g.setColor(-1).drawImage(require("heatshrink").decompress(atob("jEYwILIsEAj/ggP/AQ/8kEBwACRsEBwYaBw/gj4CBn4CCwfAj42Bhg/H")), this.x, this.y);
    } else {
      g.clearRect(this.x, this.y, 24, 24);
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

  WIDGETS["mywidget"] = {
    area: "tl",
    width: 24,
    draw: draw
  };
})()
