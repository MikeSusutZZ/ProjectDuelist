module.exports = function (app, db, joi) {
  app.get("/", (req, res) => {
    res.render("login");
  });

  app.post("/entry", async (req, res) => {
    const code = req.body.code;
    const name = req.body.name;

    // check for hacks
    const schema = joi.string().max(20).required();
    const validationResult = schema.validate(name);
    if (validationResult.error != null) {
      console.log(validationResult.error + " in name");
      res.redirect("/");
      return;
    }
    validationResult = schema.validate(code);
    if (validationResult.error != null) {
      console.log(validationResult.error + " in code");
      res.redirect("/");
      return;
    }

    const room = await db.findOne({ code: code });
    if (room) {
      // Room is full
      if (room.player1 == name || player2 == name) {
        res.redirect("/full");
        return;
      }
      // join as player 2
      if (room.player2 == null) {
        db.updateOne({ code: code }, { $set: { player2: new Player(name, 2) } });
        // enter game
        return;
      }
      // Make new room
    } else {
      db.insertOne({
        code: code,
        player1: new Player(name, 1),
        player2: null,
        p1action: null,
        p2action: null,
      });
      //enter game
    }
  });

  app.get("/full", (req, res) => {
    res.render("roomFull");
  })

  function Player(name, number) {
    this.name = name;
    this.num = "player" + number;
    this.charged = false;
    this.stabbed = false;
    this.blockSpent = false;
    this.parrySpent = false;
    this.shieldCool = false;
    this.health = 3;
  }
};
