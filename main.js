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
      if (room.player1 != null && room.player2 != null) {
        res.render("full");
        return;
      }
      // join as player 2
      if (room.player2 == null) {
        await db.updateOne({ code: code }, { $set: { player2: new Player(name, 2) } });
        // Set the session variables
        req.session.code = code;
        req.session.name = name;
        req.session.num = 'player2';

        // Redirect to the desired route
        res.redirect('/play');

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
        createdAt: new Date()
      });
      // Set the session variables
      req.session.code = code;
      req.session.name = name;
      req.session.num = 'player1';

      // Redirect to the desired route
      res.redirect('/play');

    }
  });

  function Player(name, n) {
    this.name = "" + name;
    this.num = "player" + n;
    this.charged = false;
    this.stabbed = false;
    this.blockSpent = false;
    this.parrySpent = false;
    this.shieldCool = false;
    this.health = 3;
  }
};
