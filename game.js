module.exports = function (app, db) {
  app.get("/play", async (req, res) => {
    const code = req.query.code;
    const yourName = req.query.player;
    const room = db.findOne({ code: code });
    // validate query hasn't been tampered with
    if (room.player1 != yourNum && room.player2 != yourNum) {
      res.redirect("lobbyError");
      return;
    }

    // set opponent
    const you = null;
    const opp = null;
    const yourChoice = null;
    const oppChoice = null;
    if (yourNum == player1) {
      if (room.player2 == null) {
        res.redirect("/waiting");
        return;
      } else {
        opp = room.player2;
        oppChoice = room.p2action;
        you = room.player1;
        yourChoice = room.p1action;
      }
    } else {
      opp = room.player1;
      oppChoice = room.p1action;
      you = room.player2;
      yourChoice = room.p2action;
    }
    if(you.health < 1){
      res.render("loose");
      return;
    }
    if(opp.health < 1){
      res.render("win");
      return;
    }
    res.render("board", { you: you, yourChoice: yourChoice, opp: opp, oppChoice: oppChoice, code: code, nname: yourName });
  });

  app.get("/waiting", (req, res) => {
    res.render("waiting", {code: code, name: yourName});
  })

  app.post("/submit", async (req, res) => {
    
  })
};
