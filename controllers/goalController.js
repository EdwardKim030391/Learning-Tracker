const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    goals.forEach(goal => {
      if (goal.deadline) {
        goal.deadlineLocal = new Date(goal.deadline.getTime() - goal.deadline.getTimezoneOffset() * 60000);
      }
    });

    res.render('goals', { goals });
  } catch (error) {
    console.error(error);
    res.render('goals', { error_msg: 'Error fetching goals' });
  }
};

exports.addGoal = async (req, res) => {
  const { title, description, deadline } = req.body;

  if (!title) {
    return res.render('goals', { error_msg: 'Title is required' });
  }

  try {
    const newGoal = new Goal({
      title,
      description,
      deadline,
      user: req.user.id,
    });

    await newGoal.save();
    req.flash('success_msg', 'Goal added!');
    res.redirect('/goals');
  } catch (error) {
    console.error(error);
    res.render('goals', { error_msg: 'Error adding goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(403).send('Unauthorized');
    }

    await goal.deleteOne();
    req.flash('success_msg', 'Goal deleted!');
    res.redirect('/goals');
  } catch (error) {
    console.error(error);
    res.redirect('/goals');
  }
};

exports.editGoalForm = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(403).send('Unauthorized');
    }

    res.render('editGoal', { goal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateGoal = async (req, res) => {
  const { title, description, deadline } = req.body;

  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user.id) {
      return res.status(403).send('Unauthorized');
    }

    goal.title = title;
    goal.description = description;
    goal.deadline = deadline;
    await goal.save();

    req.flash('success_msg', 'Goal updated!');
    res.redirect('/goals');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
