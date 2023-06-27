module.exports = function (app, db) {
    app.get("/result", async (req, res) => {
        const code = req.session.code;
        const num = req.session.num;
        const name = req.session.name;
        const oppNum = num == "player1" ? "player2" : "player1";

        const room = await db.findOne({ code: code });
        // validate query hasn't been tampered with
        if (room[num].name != name) {
            res.redirect("lobbyError");
            return;
        }
        var you = room[num];

        var opp = room[oppNum];

        var yourPick = num + "action";
        var oppPick = oppNum + "action";
        yourPick = room[yourPick];
        oppPick = room[oppPick];

        var message = "";
        await update(num, "shieldCool", false, code);

        if (yourPick == "Shield") {
            await update(num, "shieldCool", true, code);

            if (oppPick == "Shoot" || oppPick == "Stab" || oppPick == "Rush") {
                message = "You defended thier attack";
            }
        }

        if (yourPick == "Block") {
            await update(num, "blockSpent", true, code);

            if (oppPick == "Shoot" || oppPick == "Stab" || oppPick == "Rush") {
                message = "You defended thier attack";
            }
        }

        if (yourPick == "Parry") {
            await update(num, "parrySpent", true, code);
            if (oppPick == "Stab") {
                if (opp.stabbed) {
                    message = "You parried their attack, but didn't land a strike"
                } else {
                    await update(oppNum, "stabbed", true, code);
                    message = "You parried their attack and struck back";
                }
            }
        }

        if (yourPick == "Shoot") {
            await update(num, "charged", false, code);
            if (oppPick == "Shield" || oppPick == "Block") {
                message = "Your attack was defended";
            } else {
                await hurt(opp, code);
            }
            if (oppPick == "Stab" || oppPick == "Rush") {
                message = "You shot your opponent as they were coming to attack you";
            }
            else if (oppPick == "Shoot") {
                message = "You and your opponent shot eachother";
            } else {
                message = "You shot your opponent"
            }
        }

        if (yourPick == "Rush") {
            await update(num, "blockSpent", true, code);
            if (oppPick == "Shield" || oppPick == "Block") {
                message = "Your attack was defended";
            } else if (oppPick == "Shoot") {
                message = "You were shot before you could reach your opponent";
            } else {
                await hurt(opp, code)
                message = "You rushed down and killed your opponent"
            }

        }

        if (yourPick == "Stab") {
            if (oppPick == "Shield" || oppPick == "Block") {
                message = "Your attack was defended";
            } else if (oppPick == "Shoot") {
                message = "You were shot before you could reach your opponent";
            } else if (opp.stabbed) {
                await hurt(opp);
                message = "You landed the finishing blow";
                if (oppPick == "Stab" && !you.stabbed) {
                    message += " as they wounded you"
                }
                else if (oppPick == "Stab" || oppPick == "Rush") {
                    message = "You and your opponent mortally wounded each other at the same time"
                }
            }
        }

        if (yourPick == "Charge") {
            await update(num, "charged", true, code);
            if (oppPick == "Shoot") {
                message = "You were shot ";
            }
            else if (oppPick == "Stab" && you.stabbed || oppPick == "Rush") {
                message = "You were mortally wounded "
            } else if (oppPick == "Stab") {
                message = "You were wounded "
            }
            else {
                message = "Your opponent didn't challenge you ";
            }
            message += "while you were charging"
        }

        res.render("result", { message: message })

    })

    async function update(playerNum, key, value, code) {
        var field = `${playerNum}.${key}`
        await db.updateOne({ code: code }, { $set: { [field]: value } });
    }


    async function hurt(player, code) {
        player.health -= 1;
        player.charged = false;
        player.stabbed = false;
        player.blockSpent = false;
        player.parrySpent = false;
        player.shieldCool = false;

        await db.updateOne({ code: code }, { $set: { [player.num]: player } });
    }


}
