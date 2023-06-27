module.exports = function (app, db) {
  app.get("/play", async (req, res) => {
    // Retrieve values from localStorage
    const code = req.session.code;
    const num = req.session.num;
    const name = req.session.name;


    console.log(num + "\n");

    const room = await db.findOne({ code: code });
    console.log("Room information\n" + (room.code));
    console.log((room.player1));
    console.log((room.player2));
    console.log((room.player1action));
    console.log((room.player2action));

    // Validate data hasn't been tampered with
    console.log(num);
    console.log(room[num].name);

    if (room[num].name != name) {
      res.redirect("lobbyError");
      return;
    }

    // Check if both players have entered
    if (room.player1action != null && room.player2action != null) {
      res.redirect("/result"); // Redirect without query parameters
      return;
    }

    // Set opponent
    var you = null;
    var opp = null;
    var yourChoice = null;
    var oppChoice = null;

    if (num == "player1") {
      if (room.player2 == null) {
        res.redirect("/waiting"); // Redirect without query parameters
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

    res.render("board", { you: you, yourChoice: yourChoice, opp: opp, oppChoice: oppChoice, code: code, name: name, num: num });
  });

  app.get("/waiting", (req, res) => {

    res.render("waiting");
  });

  app.post("/submit", async (req, res) => {
    // Retrieve values from localStorage
    const code = req.session.code;
    const num = req.session.num;
    const name = req.session.name;
    console.log(num);

    const room = await db.findOne({ code: code });
    if (room[num].name != name) {
      res.redirect("lobbyError");
      return;
    }
    console.log("submitting " + req.body.choice + " for " + name + ", " + num + "\n---\n");
    const action = num + "action";
    await db.updateOne({ code: code }, { $set: { [action]: req.body.choice } });
    res.redirect("/play");
  });
};
