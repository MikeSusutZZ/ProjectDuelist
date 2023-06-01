module.exports = function (app, db) {
  app.get("/play", async (req, res) => {
    const code = req.query.code;
    const yourNum = req.query.player;
    const room = db.findOne({ code: code });
    // validate query hasn't been tampered with
    if (room.player1 != yourNum && room.player2 != yourNum) {
      res.redirect("lobbyError");
      return;
    }

    // set opponent
    const you = null;
    const opp = null;
    const oppChoice = null;
    if (yourNum == player1) {
      if (room.player2 == null) {
        res.redirect("waiting");
        return;
      } else {
        opp = room.player2;
        oppChoice = room.p2action;
        you = room.player1;
      }
    } else {
      opp = room.player1;
      oppChoice = room.p1action;
      you = room.player2;
    }
    if(you.health < 1){
      res.render("loose");
      return;
    }
    if(opp.health < 1){
      res.render("win");
      return;
    }
    res.render("board", { you: you, opp: opp, oppChoice: oppChoice });
  });
};
