module.exports = function (app, db) {
  app.get("/play", async (req, res) => {
    const code = req.query.code;
    const num = req.query.num;
    const name = req.query.name;
    const room = await db.findOne({ code: code });
    // validate query hasn't been tampered with
    if (room[num].name != name) {
      res.redirect("lobbyError");
      return;
    }

    //check if both players have entered
    if(room.player1action != null && room.player2action != null){
      res.redirect(`/result?code=${code}&name=${name}&num=${num}`);
      return;
    }

    // set opponent
    var you = null;
    var opp = null;
    var yourChoice = null;
    var oppChoice = null;
    if (num == "player1") {
      if (room.player2 == null) {
        res.redirect(`/waiting?code=${code}&name=${name}&num=${num}`);
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
    console.log("you\n" + you);
    console.log("opp\n" + opp);
    res.render("board", { you: you, yourChoice: yourChoice, opp: opp, oppChoice: oppChoice, code: code, name: name });
  });

  //doesn't have these vars yet
  app.get("/waiting", (req, res) => {
    const code = req.query.code;
    const num = req.query.num;
    const name = req.query.name;
    res.render("waiting", {code: code, name: name, num: num});
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
