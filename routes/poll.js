const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll');
const { ensureAuthentication } = require("../authentication/auth");

//Get Create Poll Page - GET
router.get('/create', ensureAuthentication, pollController.getCreatePollPage);

//Create a Poll and Save into database - POST
router.post('/create', ensureAuthentication, pollController.createPoll);

//Get My Poll Page - GET
router.get('/mypoll', ensureAuthentication, pollController.getMyPollPage);

//Search Poll in My Poll - GET
router.get('/mypoll/search', ensureAuthentication, pollController.getMyPollPage);

//Search Poll in My Poll - POST
router.post('/mypoll/search', ensureAuthentication, pollController.searchMyPoll);

//Get View_Poll Page - GET
router.get('/view-poll/:id', pollController.getPollView);

//Get Poll Respose List Page
router.get('/mypoll/response/:id', ensureAuthentication, pollController.getPollResponseList);

//Get Edit Poll Page
router.get('/mypoll/edit/:id', ensureAuthentication, pollController.getEditPollPage);

//Save Changes of Poll
router.post('/mypoll/save-changes/:id', ensureAuthentication, pollController.saveChangesOfPoll);

//Change Poll Status
router.get('/change-status/:id', ensureAuthentication, pollController.changePollStatus);

//End Poll - Status
router.get('/mypoll/end-poll/:id', ensureAuthentication, pollController.endPoll);

//End Poll - Status
router.get('/toggle-global/:id', ensureAuthentication, pollController.toggleGlobal);

//Delete a Poll
router.get('/mypoll/delete/:id', ensureAuthentication, pollController.deletePoll);
        //------------Browser cannot send delete request, we need ajax to delete using delete request
        // router.delete('/mypoll/delete/:id', pollController.deletePoll);

// Submit poll opinion
router.post('/submit-opinion/:id', ensureAuthentication, pollController.submitPollOpinion);

//Get My Participation Polls List
router.get('/my-participations', ensureAuthentication, pollController.getMyParticiPollList);

//Search in My Participation Polls List - GET
router.get('/my-participations/search', ensureAuthentication, pollController.getMyParticiPollList);

//Search in My Participation Polls List - POST
router.post('/my-participations/search', ensureAuthentication, pollController.searchMyParticipations);

//Get Discover Poll Page - GET
router.get('/discover', pollController.getDiscoverPage);

//Get Discover Poll Page - Search - POST
router.post('/discover', pollController.getDiscoverPage);

module.exports = router;