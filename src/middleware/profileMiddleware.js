
const getProfileMiddleware = async (req, res, next) => {
    const { Profile: ProfileModel } = req.app.get('models');
    const profileId = req.get('profile_id') || 0;
    const currentProfile = await ProfileModel.findOne({ where: { id: profileId }});

    if (!currentProfile) {
        return res.status(401).end()
    }

    req.profile = currentProfile;
    next();
};

module.exports = { getProfileMiddleware };