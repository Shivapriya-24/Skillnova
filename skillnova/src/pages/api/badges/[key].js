import dbConnect from '../../../lib/dbConnect';
import Badge from '../../../models/Badge'; 

export default async function handler(req, res) {
  await dbConnect();           
  const { key } = req.query;

  try {
    const badge = await Badge.findOne({ key }); 
    if (!badge) return res.status(404).json({ error: 'Badge not found' });

    res.status(200).json({
      key: badge.key,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,          
      earnedAt: badge.earnedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
