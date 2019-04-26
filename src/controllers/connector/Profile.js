const core = require('gls-core-service');
const BasicController = core.controllers.Basic;
const Model = require('../../models/Profile');

class Profile extends BasicController {
    async getProfile({ requestedUserId, type, username, app }) {
        // TODO Check user

        const modelObject = await Model.findOne(
            { userId: requestedUserId },
            { _id: false, __v: false, updatedAt: false },
            { lean: true }
        );

        if (!modelObject) {
            throw { code: 404, message: 'Not found' };
        }

        modelObject.subscriptions = modelObject.subscriptions || { userIds: [], communityIds: [] };
        modelObject.stats = modelObject.stats || { postsCount: 0, commentsCount: 0 };
        modelObject.registration = modelObject.registration || { time: new Date(0) };
        modelObject.personal = modelObject.personal || {};
        modelObject.personal = modelObject.personal[type] || {};

        await this._populateSubscriptions(modelObject.subscriptions);

        return modelObject;
    }

    async _populateSubscriptions(subscriptions) {
        subscriptions.communities = [];

        for (const id of subscriptions.communityIds) {
            // TODO Change after MVP
            subscriptions.communities.push({
                id,
                name: 'GOLOS',
                avatarUrl: 'none', // TODO Set before MVP
            });
        }

        delete subscriptions.communityIds;
    }

    async resolveProfile({ username, app }) {
        // TODO -
    }

    async getSubscribes({ userId }) {
        // TODO -
    }
}

module.exports = Profile;
