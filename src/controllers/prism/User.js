const Abstract = require('./Abstract');
const Model = require('../../models/User');

class User extends Abstract {
    async handle(data) {
        let metadata;

        try {
            metadata = JSON.parse(data.json_metadata);
        } catch (error) {
            // do nothing, just invalid data from another client
            return;
        }

        let model = await Model.findOne({ name: data.account });

        if (!model) {
            model = new Model({ name: data.account });

            await model.save();
        }

        this._applyProfile(model, metadata);

        await model.save();
    }

    _applyProfile(model, metadata) {
        const profile = metadata.profile;

        if (!profile) {
            // do nothing, no profile changes or another client
            return;
        }

        model.metaName = profile.name;
        model.profileImage = profile.profile_image;
        model.coverImage = profile.cover_image;
        model.about = profile.about;
        model.location = profile.location;
        model.website = profile.website;
        model.pinnedPosts = profile.pinnedPosts;
    }
}

module.exports = User;