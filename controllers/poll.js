const Poll = require('../models/Poll');
const User = require('../models/User');
const stringFormat = require('../validators/stringFormat');

//-----------------GET CREATE POLL PAGE-------------------------------
exports.getCreatePollPage = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);
    res.render('create_poll', { user });
}

//-------------------CREATE A POLL AND SAVE INTO DATABASE--------------
exports.createPoll = async (req, res) => {
    let { title, description, option, opennow } = req.body;
    let status = "Closed";
    if (opennow) {
        status = "Open";
    }

    const user = await getUserBasicInfo(req.user._id);

    //Removing extra spaces
    title = stringFormat.removeExtraWhiteSpace(title).toUpperCase();
    description = stringFormat.removeExtraWhiteSpace(description);

    let notEmpty = true;

    for (let i in option) {
        option[i] = stringFormat.removeExtraWhiteSpace(option[i]);
        //option is empty
        if (!option[i]) {
            notEmpty = false;
        }
    }

    if (option.length < 2) {    // minimum two options are required
        notEmpty = false;
    }

    //Errors
    if (!title || !description || !notEmpty) {
        res.render('create_poll', {
            error_msg: "Please fill in all fields",
            title,
            description,
            option,
            opennow,
            user
        });
    } else {    //Validation passed
        const options = option.map((opt) => {
            return {
                name: opt
            }
        });

        const newPoll = new Poll({
            title,
            description,
            creatorId: req.user._id,
            options,
            status
        });

        newPoll.save()
            .then(poll => {
                res.redirect('/poll/view-poll/' + poll._id);

            })
            .catch(err => {
                console.log(err); //Debug only
                res.send("Failed to create a poll");
            });
    }
}


//---------------------------------------GET MY POLL PAGE------------------------------------
exports.getMyPollPage = async (req, res) => {

    const user = await getUserBasicInfo(req.user._id);

    Poll.find({ creatorId: req.user._id }, { status: 1, _id: 1, title: 1, date: 1, totalVote: 1, global: 1 })
        .then(polls => {
            //Sorting by time
            polls.sort((a, b) => {
                return b.date - a.date;
            });


            // Formatting the date
            let poll = [];
            polls.forEach(p => {
                let objPoll = {
                    status: p.status,
                    global: p.global,
                    _id: p._id,
                    title: p.title.length > 52 ? p.title.substring(0, 60) + '...' : p.title,
                    totalVote: p.totalVote,
                    date: stringFormat.getDateAndTime(p.date)
                }
                poll.push(objPoll);
            });

            res.render('mypoll', { poll: poll, user });
        })
        .catch(err => {
            // console.log(err); //Debugging only
            res.send("404 not found");
        });
}

//-----------------------------SEARCH MY POLL-------------------------
exports.searchMyPoll = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);

    let partialTitle = req.body.search;

    //Adding Escape Character '\' if any special character is in the string.
    partialTitle = partialTitle.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    partialTitle = new RegExp(partialTitle);

    Poll.find({ creatorId: req.user._id, title: { $regex: partialTitle, $options: 'i' } }, { status: 1, _id: 1, title: 1, date: 1, totalVote: 1, global: 1 })
        .then(polls => {
            //Sorting by time
            polls.sort((a, b) => {
                return b.date - a.date;
            });


            // Formatting the date
            let poll = [];
            polls.forEach(p => {
                let objPoll = {
                    status: p.status,
                    global: p.global,
                    _id: p._id,
                    title: p.title,
                    totalVote: p.totalVote,
                    date: stringFormat.getDateAndTime(p.date)
                }
                poll.push(objPoll);
            });

            res.render('mypoll', { poll: poll, user, searchInput: req.body.search });
        })
        .catch(err => {
            // console.log(err); //Debugging only
            res.send("404 not found");
        });
}

//-------------------------------GET VIEW POLL-------------------------
exports.getPollView = async (req, res) => {

    let user;
    if (req.user) { //user logged in or not
        user = await getUserBasicInfo(req.user._id);
    } else {
        req.session.redirectTo = req.originalUrl;
    }

    const pollId = req.params.id;
    Poll.findOne({ _id: pollId })
        .then(async poll => {
            if (poll) {

                let alreadlySubmitted = -1;   // -1 means, not submitted yet.

                //calculating option result in percentage.
                let result = poll.options.map((opt) => {
                    let percentage = ((opt.voter.length * 100) / poll.totalVote) || 0;

                    //if user is logged in.
                    if (req.user) {
                        //checking alreadly submitted opinion or not?
                        for (let x of opt.voter) {
                            if (JSON.stringify(x.voterId) === JSON.stringify(req.user._id)) {
                                alreadlySubmitted = opt._id;
                                break;
                            }
                        }
                    }

                    return {
                        name: opt.name,
                        percentage,
                        noOfVotes: opt.voter.length
                    }
                });

                //Formating poll created date
                let createdDate = stringFormat.getDateAndTime(poll.date);

                //Get Poll Creator information
                const pollCreator = await getUserBasicInfo(poll.creatorId);

                //Sorting the result by highest percentage
                result.sort((a, b) => {
                    return b.percentage - a.percentage;
                });

                res.render('view_poll', { poll, pollCreator, result, user, alreadlySubmitted, createdDate });
            } else {
                res.send('Poll not found');
            }
        })
        .catch(err => {
            res.send('Poll not found');
        });
}

//----------------------------CHANGE POLL STATUS---------------------
exports.changePollStatus = async (req, res) => {
    const pollId = req.params.id;
    Poll.findOne({ _id: pollId })
        .then(poll => {
            if (poll) {
                //Verifying is he the author of the poll
                if ((JSON.stringify(poll.creatorId) === JSON.stringify(req.user._id))) {

                    //Checking that the poll is not ended already
                    if (poll.status !== "Ended") {
                        //update the poll status
                        let status;
                        if (poll.status === "Open") {
                            status = "Closed";
                        } else {
                            status = "Open";
                        }

                        Poll.findOneAndUpdate({ _id: pollId }, { status: status })
                            .then(updateRes => {
                                res.redirect('/poll/mypoll');
                            })
                            .catch(err => {
                                res.send("Failed to change poll status");
                            });
                    } else {
                        res.send('The poll has ended alreadly, Cannot change poll status');
                    }

                } else {
                    res.send('Unauthorized request to change poll status');
                }
            } else {
                res.redirect('/poll/mypoll');
            }
        })
        .catch(err => {
            res.send('Failed to change poll status');
        });
}


//---------------------------- TOGGLE GLOBAL / PUBLISH/UNPUBLISH GLOBAL POLL---------------------
exports.toggleGlobal = async (req, res) => {
    const pollId = req.params.id;
    Poll.findOne({ _id: pollId })
        .then(poll => {
            if (poll) {
                //Verifying is he the author of the poll
                if ((JSON.stringify(poll.creatorId) === JSON.stringify(req.user._id))) {

                    Poll.findOneAndUpdate({ _id: pollId }, { global: !poll.global })
                        .then(updateRes => {
                            res.redirect('/poll/mypoll');
                        })
                        .catch(err => {
                            res.send("Failed, internal error");
                        });

                } else {
                    res.send('Unauthorized request');
                }
            } else {
                res.redirect('/poll/mypoll');
            }
        })
        .catch(err => {
            res.send('Failed, internal error');
        });
}


//----------------------------- END POLL - STATUS -------------------
exports.endPoll = (req, res) => {
    const pollId = req.params.id;
    Poll.findOne({ _id: pollId })
        .then(poll => {
            if (poll) {
                //Verifying is he the author of the poll
                if ((JSON.stringify(poll.creatorId) === JSON.stringify(req.user._id))) {

                    //Checking that the poll is not ended already
                    if (poll.status !== "Ended") {
                        //update the poll status
                        let status = "Ended";

                        Poll.findOneAndUpdate({ _id: pollId }, { status: status })
                            .then(updateRes => {
                                res.redirect('/poll/mypoll');
                            })
                            .catch(err => {
                                res.send("Failed to end the poll");
                            });
                    } else {
                        res.send('The poll has ended alreadly');
                    }

                } else {
                    res.send('Unauthorized request to change poll status');
                }
            } else {
                res.redirect('/poll/mypoll');
            }
        })
        .catch(err => {
            res.send('Failed to end the poll');
        });
}



//-----------------------------GET EDIT POLL VIEW--------------------
exports.getEditPollPage = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);
    const pollId = req.params.id;

    Poll.findOne({ _id: pollId })
        .then(poll => {
            if (poll) {
                //Verifying is he the author of the poll
                if ((JSON.stringify(poll.creatorId) === JSON.stringify(req.user._id))) {
                    let option = poll.options.map(opt => {
                        return opt.name;
                    });

                    res.render('edit_poll', {
                        pollId,
                        title: poll.title,
                        description: poll.description,
                        option,
                        user
                    });

                } else {
                    res.send("Unauthorized request to edit a poll");
                }
            } else {
                res.send('Poll not found to edit');
            }
        })
        .catch(err => {
            res.send('error occured to edit poll');
        });
}

//---------------------------SAVE CHANGES OF POLL------------------
exports.saveChangesOfPoll = (req, res) => {
    let { description, option } = req.body;
    const pollId = req.params.id;

    //If option is not an array, then make array to keep same flow of implementation.
    if (!Array.isArray(option)) {
        if (option != undefined) {
            option = [option];
        } else {
            option = [];
        }
    }


    // //Removing extra spaces
    description = stringFormat.removeExtraWhiteSpace(description);

    let notEmpty = true;

    for (let i in option) {
        option[i] = stringFormat.removeExtraWhiteSpace(option[i]);
        //option is empty
        if (!option[i]) {
            notEmpty = false;
        }
    }

    //Errors
    if (!description || !notEmpty) {
        req.flash('error_msg', "Any field cannot be empty");
        res.redirect('/poll/mypoll/edit/' + pollId);
    } else {
        // validtion passed
        Poll.findOne({ _id: pollId })
            .then(poll => {
                if (poll) {
                    //Verifying is he the author of the poll
                    if ((JSON.stringify(poll.creatorId) === JSON.stringify(req.user._id))) {

                        //checking have any changes or not
                        if (poll.description == description && option.length == 0) { //no changes
                            req.flash('error_msg', 'No changes to save');
                            res.redirect('/poll/mypoll/edit/' + pollId);

                        } else { // Have changes, Update the poll

                            let options = poll.options;

                            option.forEach((opt) => {
                                options.push({ name: opt });
                            });

                            //Update the options and description
                            Poll.findOneAndUpdate({ _id: pollId }, { $set: { options, description } })
                                .then(updPoll => {
                                    req.flash('success_msg', 'Changes saved successfully');
                                    res.redirect('/poll/mypoll/edit/' + pollId);
                                })
                                .catch(err => {
                                    res.send("Error occured to update the poll")
                                });

                        }

                    } else {
                        res.send("Unauthorized request to save changes of poll");
                    }
                } else {
                    res.send('Poll not found to save changes');
                }
            })
            .catch(err => {
                res.send('error occured to save changes of poll');
            });
    }

}


//----------------------------GET POLL RESPONSE LIST------------------
exports.getPollResponseList = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);
    const pollId = req.params.id;

    Poll.findOne({ _id: pollId }, { title: 1, options: 1, creatorId: 1 })
        .then(async poll => {
            //Verifying is he the author of the poll
            if ((JSON.stringify(poll.creatorId) == JSON.stringify(req.user._id))) {
                const voterList = [];

                for (let opt of poll.options) {
                    let idsOfVoter = [];

                    for (let voter of opt.voter) {
                        idsOfVoter.push(voter.voterId);
                    }

                    //Get voters information for an option
                    let voterInfoArray = await getVotersBasicInfo(idsOfVoter);

                    for (let voter of voterInfoArray) {
                        let v = {
                            voter,
                            optionName: opt.name
                        }
                        voterList.push(v);
                    }
                }

                res.render('poll_res_list', { title: poll.title, voterList, pollId: poll._id, user });
            } else {
                res.send("Poll response list not found..");
            }
        })
        .catch(err => {
            res.send("Poll response list not found");
        });
}

//-------------------------------DELETE A POLL-------------------------
exports.deletePoll = (req, res) => {

    const pollId = req.params.id;

    Poll.findOne({ _id: pollId })
        .then(poll => {
            //If there is any poll?
            if (poll) {
                //Verifying user, is he the creator of the poll
                if (JSON.stringify(poll.creatorId) == JSON.stringify(req.user._id)) {
                    // console.log("OK can delete"); //Debuging only
                    Poll.deleteOne({ _id: poll._id })
                        .then(pollRes => {
                            console
                            res.redirect('/poll/mypoll');
                        })
                        .catch(err => {
                            res.send('Failed to delete a poll');
                        });
                } else {
                    // res.redirect('/poll/mypoll');
                    res.send('Invalid request to delete a poll');
                }
            } else {
                res.send('Poll not found');
            }
        })
        .catch(err => {
            // res.redirect('/poll/mypoll');
            res.send("404 not found");
        });
}

//--------------------------SUBMIT POLL OPINION-------------------------
exports.submitPollOpinion = (req, res) => {
    const pollId = req.params.id;
    const optionId = req.body.option;

    //no option is selected?
    if (optionId == undefined) {
        req.flash('error_msg', 'Please select an option!');
        res.redirect('/poll/view-poll/' + pollId);
    } else {
        //option is selected, save into database=
        Poll.findById(pollId)
            .then(poll => {
                //if it is running.. then update the opinion that is alreadly submitted, otherwise insert new vote into database.
                if (poll.status === "Open") { // poll is running
                    let options = [...poll.options];

                    let flagAlready = false; //false means not submitted yet
                    //Delete the previous option If it is selected, for this using fillter method.
                    options = options.map(opt => {
                        opt.voter = opt.voter.filter(v => {
                            if (JSON.stringify(v.voterId) === JSON.stringify(req.user._id)) {
                                flagAlready = true;
                            }
                            return JSON.stringify(v.voterId) != JSON.stringify(req.user._id);
                        });
                        return opt;
                    });

                    let index = options.findIndex(opt => optionId == opt._id);

                    const voterId = req.user._id;

                    //New voter
                    const voter = { voterId }

                    options[index].voter.push(voter);
                    let totalVote = poll.totalVote;

                    // previously not submitted, then it is a new submission.
                    if (!flagAlready) {
                        totalVote++;
                    }

                    //Update the Poll
                    Poll.findOneAndUpdate({ _id: pollId }, { $set: { options, totalVote } })
                        .then(result => {
                            req.flash('success_msg', flagAlready == true ? 'Changed Successfully' : 'Submitted Successfully');
                            res.redirect('/poll/view-poll/' + pollId);
                        })
                        .catch(err => console.log(err));
                } else if (poll.status === "Closed") {
                    res.send("The poll is closed");
                } else {
                    res.send("This poll has ended already");
                }
            })
            .catch(err => console.log(err));
    }
}


//------------------------------------------My Participations Poll list----------------------------
exports.getMyParticiPollList = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);
    const voterId = req.user._id;
    Poll.find({ options: { $elemMatch: { voter: { $elemMatch: { voterId: voterId } } } } }, { status: 1, _id: 1, title: 1, creatorId: 1, options: 1, date: 1 })
        .then(async polls => {

            //Sorting by time
            polls.sort((a, b) => {
                return b.date - a.date;
            });

            // Formatting the date
            let poll = [];

            for (p of polls) {

                //getting option name and total vote
                let pollOptions = p.options.map((opt) => {
                    return {
                        name: opt.name,
                        noOfVotes: opt.voter.length
                    }
                });

                let pollCreator = await getUserBasicInfo(p.creatorId);

                //----------------
                let objPoll = {
                    status: p.status,
                    _id: p._id,
                    title: p.title.length > 52 ? p.title.substring(0, 60) + '...' : p.title,
                    pollOptions,
                    date: stringFormat.getDateAndTime(p.date),
                    pollCreator
                }
                poll.push(objPoll);
            }
            res.render('my_participations', { poll: poll, user });
        })
        .catch(err => console.log(err));
}

//--------------------------- SEARCH IN MY PARTICIPATIONS POLL-----------------------
exports.searchMyParticipations = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);
    const voterId = req.user._id;

    let partialTitle = req.body.search;

    //Adding Escape Character '\' if any special character is in the string.
    partialTitle = partialTitle.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    partialTitle = new RegExp(partialTitle);

    Poll.find({ options: { $elemMatch: { voter: { $elemMatch: { voterId: voterId } } } }, title: { $regex: partialTitle, $options: 'i' } }, { status: 1, _id: 1, title: 1, options: 1, creatorId: 1, date: 1 })
        .then(async polls => {

            //Sorting by time
            polls.sort((a, b) => {
                return b.date - a.date;
            });

            // Formatting the date
            let poll = [];

            for (p of polls) {

                //getting option name and total vote
                let pollOptions = p.options.map((opt) => {
                    return {
                        name: opt.name,
                        noOfVotes: opt.voter.length
                    }
                });

                let pollCreator = await getUserBasicInfo(p.creatorId);

                //----------------
                let objPoll = {
                    status: p.status,
                    _id: p._id,
                    title: p.title,
                    pollOptions,
                    date: stringFormat.getDateAndTime(p.date),
                    pollCreator
                }
                poll.push(objPoll);
            }

            res.render('my_participations', { poll: poll, user, searchInput: req.body.search });
        })
        .catch(err => console.log(err));
}

//------------------------------------Get Discover Poll Page-----------------------------
exports.getDiscoverPage = async (req, res) => {
    let user;
    if (req.user) {
        user = await getUserBasicInfo(req.user._id);
    }
    let partialTitle;
    if (req.body.search) {
        partialTitle = req.body.search;
    } else {
        partialTitle = "";
    }

    //Adding Escape Character '\' if any special character is in the string.
    partialTitle = partialTitle.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    partialTitle = new RegExp(partialTitle);

    Poll.find({ global: true, title: { $regex: partialTitle, $options: 'i' } }, { _id: 1, title: 1, description: 1, totalVote: 1, date: 1, creatorId: 1 })
        .then(async polls => {

            //Sorting by time
            polls.sort((a, b) => {
                return b.date - a.date;
            });

            // Formatting the date
            let poll = [];

            for (p of polls) {

                let pollCreator = await getUserBasicInfo(p.creatorId);

                //----------------
                let objPoll = {
                    _id: p._id,
                    title: p.title,
                    // title: p.title.length > 80 ? p.title.substring(0, 80) + '...' : p.title,
                    description: p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description,
                    totalVote: p.totalVote,
                    date: stringFormat.getDateAndTime(p.date),
                    pollCreator
                }
                poll.push(objPoll);
            }

            res.render('discover_poll', { poll: poll, user });
        })
        .catch(err => {
            // console.log(err); //Debugging only
            console.log(err);
            res.send("Internal Error");
        });
}


//::::::::::::::::::::::::::::::::::::NECESSARY FUNCTION::::::::::::::::::::::::::::::::::

//Get User Basic Info
const getUserBasicInfo = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId }, { name: 1, email: 1, username: 1, img: 1 });
        return user;

    } catch (error) {
        console.log(error);
    }
}


//Get Voters Basic Info
//Get User Basic Info
const getVotersBasicInfo = async (voterIds) => {
    try {
        const voters = await User.find({}, { name: 1, email: 1, username: 1, img: 1 }).where('_id').in(voterIds);
        return voters;

    } catch (error) {
        console.log(error);
    }
}