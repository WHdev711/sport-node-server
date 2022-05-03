const axios = require('axios');
const PS3838Config = require("../config/ps3838.config.js");
const db = require("../config/db.config.js");
const nodemailer = require('nodemailer');


let lasttimelist = { soccer: 0, basketball: 0, tennis: 0 };


const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'appc31058@gmail.com',
        pass: '',
    },
});
const mailOptions = {
    from: 'appc31058@gmail.com',
    to: 'ddmitrivich0516@gmail.com',
    subject: 'hello world!',
    html: 'hello world!',
};


exports.GetOdds = async (req, res) => {
    var total = [];
    const sportlist = { soccer: PS3838Config.Soccer, basketball: PS3838Config.Basketball, tennis: PS3838Config.Tennis }
    for (const _sport in sportlist) {
        var allodds;
        var eventlist = [];
        var releaselist = {};
        allodds = await axios
            .get(`${PS3838Config.ODDS}?${sportlist[_sport]}`, { headers: { 'Authorization': `Basic ${PS3838Config.HeaderBasic}` } })
            .then(response => {
                const contacts = response.data;
                // res.send(contacts);

                return contacts;
            })
            .catch(error => {
                res.status(500).send({
                    message:
                        error.message || "Some error occurred while retrieving data."
                });
            });
        for (var i = 0; i < allodds.leagues.length; i++) {
            var myChannel = allodds.leagues[i].events;
            for (var j = 0; j < myChannel.length; j++) {
                eventlist.push(myChannel[j].id);
                var _releasetime = typeof myChannel[j].periods[0].spreadUpdatedAt !== 'undefined' ? myChannel[j].periods[0].spreadUpdatedAt : typeof myChannel[j].periods[0].moneylineUpdatedAt !== 'undefined' ? myChannel[j].periods[0].moneylineUpdatedAt : typeof myChannel[j].periods[0].totalUpdatedAt !== 'undefined' ? myChannel[j].periods[0].totalUpdatedAt : typeof myChannel[j].periods[0].teamTotalUpdatedAt !== 'undefined' ? myChannel[j].periods[0].teamTotalUpdatedAt : '';
                releaselist[myChannel[j].id] = _releasetime;
            }
        }
        var tmp = eventlist.length % 500
        var div_count = (eventlist.length - tmp) / 500
        for (var h = 0; h <= div_count; h++) {
            var _tmpfixture = await axios
                .get(`${PS3838Config.FIXTURES}?${sportlist[_sport]}&eventIds=${eventlist.slice(h * 500, (h + 1) * 500).toString()}`, { headers: { 'Authorization': `Basic ${PS3838Config.HeaderBasic}` } })
                .then(response => {
                    const fixdata = response.data
                    return fixdata
                })
                .catch(error => {
                    res.status(500).send({
                        message:
                            error.message || "Some error occurred while retrieving data."
                    });
                });
            {
                var _tmpleage = _tmpfixture.league
                for (var i = 0; i < _tmpleage.length; i++) {
                    for (var j = 0; j < _tmpleage[i].events.length; j++) {
                        var _releasetime = typeof c !== 'undefined' ? c : typeof a !== 'undefined' ? a : typeof b !== 'undefined' ? b : 0
                        var eventtmp = {
                            country: _tmpleage[i].name.toString().split(' ')[0],
                            sport: `${_sport}`,
                            league: _tmpleage[i].name,
                            homegame: `${_tmpleage[i].events[j].home}`,
                            awaygame: `${_tmpleage[i].events[j].away}`,
                            start: _tmpfixture.league[i].events[j].starts.toString().replace('T', ' ').replace('Z', ''),
                            releasetime: releaselist[_tmpleage[i].events[j].id]
                        }
                        total.push(eventtmp);
                    }
                }
            }
        }
    }
    res.send(total);
};


exports.GetFixtures = async (req, res) => {
    await axios
        .get(`${PS3838Config.FIXTURES}?${PS3838Config.Soccer}`, { headers: { 'Authorization': `Basic ${PS3838Config.HeaderBasic}` } })
        .then(response => {
            const contacts = response.data;
            res.send(contacts);
        })
        .catch(error => {
            res.status(500).send({
                message:
                    error.message || "Some error occurred while retrieving data."
            });
        });
};

exports.CronGetOdds = async () => {
    console.log('running a task every 5minutes');

    var total = [];
    const sportlist = { soccer: PS3838Config.Soccer, basketball: PS3838Config.Basketball, tennis: PS3838Config.Tennis };
    for (const _sport in sportlist) {
        var allodds;
        var eventlist = [];
        allodds = await axios
            .get(`${PS3838Config.ODDS}?${sportlist[_sport]}&since=${lasttimelist[_sport].toString()}`, { headers: { 'Authorization': `Basic ${PS3838Config.HeaderBasic}` } })
            .then(response => {
                const contacts = response.data;
                // res.send(contacts);

                return contacts;
            })
            .catch(error => {
                res.status(500).send({
                    message:
                        error.message || "Some error occurred while retrieving data."
                });
            });
        for (var i = 0; i < allodds.leagues.length; i++) {
            var myChannel = allodds.leagues[i].events;
            for (var j = 0; j < myChannel.length; j++) {
                eventlist.push(myChannel[j].id);
            }
        }
        var tmp = eventlist.length % 500
        var div_count = (eventlist.length - tmp) / 500
        for (var h = 0; h <= div_count; h++) {
            var _tmpfixture = await axios
                .get(`${PS3838Config.FIXTURES}?${sportlist[_sport]}&eventIds=${eventlist.slice(h * 500, (h + 1) * 500).toString()}&since=${lasttimelist[_sport]}`, { headers: { 'Authorization': `Basic ${PS3838Config.HeaderBasic}` } })
                .then(response => {
                    const fixdata = response.data
                    return fixdata
                })
                .catch(error => {
                    res.status(500).send({
                        message:
                            error.message || "Some error occurred while retrieving data."
                    });
                });
            {
                if (typeof _tmpfixture.league !== 'undefined') {
                    var _tmpleage = _tmpfixture.league
                    for (var i = 0; i < _tmpleage.length; i++) {
                        for (var j = 0; j < _tmpleage[i].events.length; j++) {
                            var eventtmp = {
                                country: _tmpleage[i].name.toString().split(' ')[0],
                                sport: `${_sport}`,
                                league: _tmpleage[i].name,
                                homegame: `${_tmpleage[i].events[j].home}`,
                                awaygame: `${_tmpleage[i].events[j].away}`,
                                start: _tmpfixture.league[i].events[j].starts.toString().replace('T', ' ').replace('Z', '')
                            }
                            total.push(eventtmp);
                        }
                    }
                }
            }
        }
        lasttimelist[_sport] = allodds.last;
    }
    console.log(JSON.stringify(lasttimelist), total.length)
    // res.send(total);
    for (var i = 0; i < total.length; i++) {
        db.get("SELECT * FROM alert WHERE league = ? or clubname = ? or clubname = ?", total[i].league, total[i].homegame, total[i].awaygame, function (err, row) {
            if (row) {
                // node mail 
                console.log("Sending notification about matched sport game");
                transport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                    try{
                        console.log(`Message sent: ${info.response}`);
                    }
                    catch (res_error) {
                        console.log(res_error);
                    }
                });
            }
        })
    }
};

exports.AddAlert = async (req, res) => {
    var errors = []
    console.log(req.body)
    if (!req.body.name) {
        errors.push("No Name specified");
    }

    if (!req.body.email) {
        errors.push("No Email specified");
    }


    var _country = req.body.country ? req.body.country : '';
    var _clubname = req.body.clubname ? req.body.clubname : '';
    var _league = req.body.league ? req.body.league : '';

    if (errors.length) {
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        league: _league,
        country: _country,
        clubname: _clubname,
    }
    var sql = 'INSERT INTO alert (name, email, league, country, clubname) VALUES (?,?,?,?,?)'
    var params = [data.name, data.email, data.league, data.country, data.clubname]
    db.get("SELECT * FROM alert WHERE name = ? LIMIT 1", req.body.name, function (err, row) {
        if (row) {
            console.log("account already exists");
            res.json({ "message": "Account already exists" });
        } else {

            db.run(sql, params, function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
                res.json({
                    "message": "success",
                    "data": result,
                    "id": this.lastID
                })
            });
        }
    });


};

exports.GetAlert = (req, res) => {
    db.all(
        `SELECT * FROM alert`,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: result,
                changes: this.changes
            })
        });
};

exports.UpdateAlert = (req, res) => {
    var _country = req.body.country ? req.body.country : '';
    var _clubname = req.body.clubname ? req.body.clubname : '';
    var _league = req.body.league ? req.body.league : '';
    var data = {
        name: req.body.name,
        email: req.body.email,
        league: _league,
        country: _country,
        clubname: _clubname,
    }
    db.run(
        `UPDATE alert set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           league = COALESCE(?,league), 
           country = COALESCE(?,country), 
           clubname = COALESCE(?,clubname) 
           WHERE id = ?`,
        [data.name, data.email, data.league, data.country, data.clubname, req.params.id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
        });
};

exports.DeleteAlert = (req, res) => {
    db.run(
        'DELETE FROM alert WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.json({ "message": "deleted", changes: this.changes })
        });
};
