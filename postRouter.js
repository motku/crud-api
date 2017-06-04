const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

const {BlogPost} = require('./models');

const router = express.Router();

router.use(morgan('common'));
router.use(bodyParser.json());

router.get('/', (req, res) => {
  BlogPost
    .find()
    .limit(100)
    .exec()
    .then(blogposts => {
      res.json({
        blogposts: blogposts.map( 
          blogposts => blogposts.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});

router.get('/:id', (req, res) => {
  BlogPost
    .find({
      '_id': req.params.id
    })
    .limit(10)
    .exec()
    .then(blogposts => {
      res.json({
        blogposts: blogposts.map( 
          blogposts => blogposts.apiRepr())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.post('/', (req, res) => {
  console.log('this is a post yo');
  console.log('body: ', req.body);
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong'});
    });

});

router.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      console.log(`Deleted blog post \`${req.params.ID}\``);
      res.status(200).json({message: 'success'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.put('/:id', (req, res) => {
  console.log('body: ', req.body);
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedPost => {
      res.status(201).json(updatedPost.apiRepr());
      console.log(`Updating blog post item ${req.params.id}`);
    })
    .catch(err => {
      res.status(500).json({message: 'Something went wrong'});
    });
});

module.exports = router;
