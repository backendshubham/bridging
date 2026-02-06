const db = require('../database/db');
const { clearCache } = require('../middleware/cache');

const index = async (req, res) => {
  try {
    const settings = await db('settings').orderBy('key');
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.render('admin/settings/index', {
      title: 'Settings',
      page: 'settings',
      contentFile: 'admin/settings/index-content',
      settings: settingsObj
    });
  } catch (error) {
    console.error('Settings index error:', error);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load settings'
    });
  }
};

const update = async (req, res) => {
  try {
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
      await db('settings')
        .where({ key })
        .update({ value: value || '' });
    }
    
    await clearCache('cache:*');
    req.flash('success', 'Settings updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('Update settings error:', error);
    req.flash('error', 'Failed to update settings');
    res.redirect('/admin/settings');
  }
};

module.exports = {
  index,
  update
};

