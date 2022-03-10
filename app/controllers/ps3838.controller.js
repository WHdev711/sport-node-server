const axios = require('axios');
const PS3838Config = require("../config/ps3838.config.js");



exports.GetOdds = async (req, res) => {
    var total = [];
    const sportlist = {soccer:PS3838Config.Soccer, basketball:PS3838Config.Basketball, tennis:PS3838Config.Tennis}
    for (const _sport in sportlist)
    {
        var allodds;
        var eventlist = [];
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
                    console.log("error")
                    res.status(500).send({
                        message:
                            error.message || "Some error occurred while retrieving data."
                    });
                });
                {
                    var _tmpleage = _tmpfixture.league
                    for (var i = 0; i < _tmpleage.length; i++) {
                        for (var j = 0; j < _tmpleage[i].events.length; j++) {
                            var eventtmp = {
                                country: _tmpleage[i].name.toString().split(' ')[0],
                                sport: `${_sport}`,
                                league: _tmpleage[i].name,
                                game: `${_tmpleage[i].events[j].home} VS ${_tmpleage[i].events[j].away}`,
                                start: _tmpfixture.league[i].events[j].starts.toString().replace('T', ' ').replace('Z', '')
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

