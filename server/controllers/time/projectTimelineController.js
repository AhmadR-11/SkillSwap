const ProjectTimeline = require('../../models/ProjectTimeline');

exports.getTimeline = async (req, res) => {
  try {
    const timeline = await ProjectTimeline.findOne({
      projectId: req.params.projectId,
      freelancerId: req.user.id
    });

    res.json(timeline || {});
  } catch (err) {
    console.error("Timeline fetch error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTimeline = async (req, res) => {
  try {
    const { progress, timeTracked, milestones } = req.body;

    let timeline = await ProjectTimeline.findOne({
      projectId: req.params.projectId,
      freelancerId: req.user.id
    });

    if (!timeline) {
      timeline = new ProjectTimeline({
        projectId: req.params.projectId,
        freelancerId: req.user.id
      });
    }

    if (progress !== undefined) timeline.progress = progress;
    if (timeTracked !== undefined) timeline.timeTracked = timeTracked;
    if (milestones) timeline.milestones = milestones;

    timeline.lastUpdated = Date.now();

    await timeline.save();
    res.json(timeline);
  } catch (err) {
    console.error("Timeline update error:", err);
    res.status(500).json({ message: 'Failed to update timeline' });
  }
};
