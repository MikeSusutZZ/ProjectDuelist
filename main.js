module.exports = function (app, db, joi) {
  app.get("/", (req, res) => {
    res.render("login");
  });

  app.post("/entry", async (req, res) => {
    const code = req.body.code;
    const name = req.body.name;

    // check for hacks
    const schema = joi.string().max(20).required();
    var validationResult = schema.validate(name);
    if (validationResult.error != null) {
      console.log(validationResult.error + " in name: " + name);
      res.redirect("/");
      return;
    }
    validationResult = schema.validate(code);
    if (validationResult.error != null) {
      console.log(validationResult.error + " in code: " + code);
      res.redirect("/");
      return;
    }

    const room = await db.findOne({ code: code });
    if (room) {
      // Room is full
      if (room.player1 == name || player2 == name) {
        res.render("full");
        return;
      }
      // join as player 2
      if (room.player2 == null) {
        db.updateOne({ code: code }, { $set: { player2: new Player(name, 2) } });
        res.redirect(`/play?code=${code}&name=${name}&num=player2`);
        return;
      }
      // Make new room
    } else {
      db.insertOne({
        code: code,
        player1: new Player(name, 1),
        player2: null,
        player1action: null,
        player2action: null,
      });
      res.redirect(`/play?code=${code}&name=${name}&num=player1`);
    }
  });

  function Player(name, n) {
    this.name = name;
    this.num = "player" + n;
    this.charged = false;
    this.stabbed = false;
    this.blockSpent = false;
    this.parrySpent = false;
    this.shieldCool = false;
    this.health = 3;
  }
};
