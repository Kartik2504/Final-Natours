const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// mergeParams: true allows access to params from parent routers (e.g. :tourId)
const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
  .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
