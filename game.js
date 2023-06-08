module.exports = function (app, db) {
  app.get("/play", async (req, res) => {
    const code = req.query.code;
    const num = req.query.num;
    const name = req.query.name;
    const room = db.findOne({ code: code });
    // validate query hasn't been tampered with
    if (room[num].name != name) {
      res.redirect("lobbyError");
      return;
    }

    //check if both players have entered
    if(room.player1action != null && room.player2action != null){
      res.redirect("/result");
    }

    // set opponent
    const you = null;
    const opp = null;
    const yourChoice = null;
    const oppChoice = null;
    if (num == player1) {
      if (room.player2 == null) {
        res.redirect("/waiting");
        return;
      } else {
        opp = room.player2;
        oppChoice = room.player2action;
        you = room.player1;
        yourChoice = room.player1action;
      }
    } else {
      opp = room.player1;
      oppChoice = room.player1action;
      you = room.player2;
      yourChoice = room.player2action;
    }
    if(you.health < 1){
      res.render("loose");
      return;
    }
    if(opp.health < 1){
      res.render("win");
      return;
    }
    res.render("board", { you: you, yourChoice: yourChoice, opp: opp, oppChoice: oppChoice, code: code, name: name });
  });

  app.get("/waiting", (req, res) => {
    res.render("waiting", {code: code, name: yourName, num: num});
  })

  app.post("/submit", async (req, res) => {
    const code = req.query.code;
    const num = req.query.num;
    const name = req.query.name;
    if (room[num].name != name) {
      res.redirect("lobbyError");
      return;
    }
    const action = num + "action";
    await db.updateOne({ code: code }, { $set: { [action]: req.body.choice } });
    res.redirect(`/play?code=${code}&name=${name}&num=${num}`);
  })
};
