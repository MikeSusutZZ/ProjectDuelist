module.exports = function (app, db) {
  app.get("/play", async (req, res) => {
    const code = req.query.code;
    const playerNum = req.query.player;
    const room = db.findOne({ code: code });
    // validate query hasn't been tampered with
    if (room.player1 != playerNum && room.player2 != playerNum) {
      res.redirect("lobbyError");
      return;
    }

    // set opponent
    const you = null;
    const opp = null;
    if (playerNum == player1) {
      if (room.player2 == null) {
        res.redirect("waiting");
        return;
      } else {
        opp = room.player2;
        you = room.player1;
      }
    } else {
      opp = room.player1;
      you = room.player2;
    }
    res.render("board", { you: you, opp: opp });
  });
};
