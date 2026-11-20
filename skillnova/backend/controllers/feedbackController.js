const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  const { userEmail, mood, rating, features, suggestions } = req.body;
  console.log('Received Feedback:', req.body);

  if (
    !userEmail ||
    !mood ||
    clientRatingInvalid(rating) ||
    !Array.isArray(features) ||
    features.length === 0 ||
    !suggestions?.trim()
  ) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    await new Feedback({ userEmail, mood, rating, features, suggestions }).save();
    return res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

function clientRatingInvalid(rating) {
  return typeof rating !== 'number' || rating < 1 || rating > 5;
}
