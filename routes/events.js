var express = require('express'),
  router = express.Router(),
  // Models
  Event = require('../models/event'),
  Interaction = require('../models/interaction');

//==========================================================
// Event Routes
//==========================================================

// INDEX ROUTE - Shows all events
router.get('/', function(req, res) {
  Event.find({}, function(err, events) {
    if (err) {
      console.log(err);
    } else {
      res.render('events/index', {
        events: JSON.stringify(events)
      });
    }
  });
});

// NEW ROUTE - Show create event form only if the user is logged in
router.get('/new', isLoggedIn, function(req, res) {
  res.render('events/new');
});

// CREATE ROUTE - Only create a new event if the user is logged in
router.post('/', isLoggedIn, function(req, res) {
  // Sanitize the event so no Script tags can be run
  req.body.event.description = req.sanitize(req.body.event.description);
  console.log(req.body.event);
  req.body.event.author = {
    id: req.user._id,
    username: req.user.username
  };

  Event.create(req.body.event, function(err, event) {
    if (err) {
      res.redirect('/events/new');
    } else {
      res.redirect('/events');
    }
  });
});

// SHOW ROUTE - Show individual event
router.get('/:id', function(req, res) {
  Event.findById(req.params.id, function(err, event) {
    if (err) {
      console.log(err);
    } else {
      if (req.isAuthenticated()) {
        var data = {
          // References to user and event.
          user: { id: req.user._id },
          event: { id: event._id }
        };
        Interaction.findOne(data, (err, interaction) => {
          if (err) {
            console.log(err);
          } else {
            res.render('events/show', {
              event: event,
              interaction: interaction
            });
          }
        });
      } else {
        var interaction = false;
        res.render('events/show', {
          event: event,
          interaction: interaction
        });
      }
    }
  });
});

// UPVOTE ROUTE
router.put('/:id/upvote', isLoggedIn, (req, res) => {
  Event.findById(req.params.id, (err, event) => {
    if (err) {
      console.log(err);
    } else {
      var data = {
        // References to user and event.
        user: { id: req.user._id },
        event: { id: event._id }
      };
      Interaction.findOne(data, (err, interaction) => {
        if (err) {
          console.log(err);
        } else if (interaction) {
          if (interaction.upvoted) {
            // Already upvoted, now undo it.
            interaction.upvoted = false;
            event.votes -= 1;
          } else if (interaction.downvoted) {
            // Already downvoted, now flip to upvote, add 2 votes.
            interaction.upvoted = true;
            interaction.downvoted = false;
            event.votes += 2;
          } else {
            // Neither upvoted or downvoted, now upvote, add 1 vote.
            interaction.upvoted = true;
            event.votes += 1;
          }
          interaction.save(err => {
            if (err) {
              console.log(err);
            }
          });
          event.save(err => {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/events/' + req.params.id);
            }
          });
        } else {
          data.upvoted = true;
          Interaction.create(data, err => {
            if (err) {
              console.log(err);
            } else {
              event.votes += 1;
              event.save(err => {
                if (err) {
                  console.log(err);
                } else {
                  res.redirect('/events/' + req.params.id);
                }
              });
            }
          });
        }
      });
    }
  });
});

// DOWNVOTE ROUTE
router.put('/:id/downvote', isLoggedIn, (req, res) => {
  Event.findById(req.params.id, (err, event) => {
    if (err) {
      console.log(err);
    } else {
      var data = {
        // References to user and event.
        user: { id: req.user._id },
        event: { id: event._id }
      };
      Interaction.findOne(data, (err, interaction) => {
        if (err) {
          console.log(err);
        } else if (interaction) {
          if (interaction.downvoted) {
            // Already downvoted, now undo it.
            interaction.downvoted = false;
            event.votes += 1;
          } else if (interaction.upvoted) {
            // Already upvoted, now flip to downvote, subtract 2 votes.
            interaction.downvoted = true;
            interaction.upvoted = false;
            event.votes -= 2;
          } else {
            // Neither upvoted or downvoted, now downvote, subtract 1 vote.
            interaction.downvoted = true;
            event.votes -= 1;
          }
          interaction.save(err => {
            if (err) {
              console.log(err);
            }
          });
          event.save(err => {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/events/' + req.params.id);
            }
          });
        } else {
          data.downvoted = true;
          Interaction.create(data, err => {
            if (err) {
              console.log(err);
            } else {
              event.votes -= 1;
              event.save(err => {
                if (err) {
                  console.log(err);
                } else {
                  res.redirect('/events/' + req.params.id);
                }
              });
            }
          });
        }
      });
    }
  });
});

// Middleware function for checking if a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
