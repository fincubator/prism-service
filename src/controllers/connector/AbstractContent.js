const core = require('gls-core-service');
const Logger = core.utils.Logger;
const BasicController = core.controllers.Basic;
const ProfileModel = require('../../models/Profile');

class AbstractContent extends BasicController {
    async _getContent(
        Model,
        { currentUserId, requestedUserId, permlink, refBlockNum, raw: onlyRawRequired }
    ) {
        const modelObject = await Model.findOne(
            {
                contentId: {
                    userId: requestedUserId,
                    permlink,
                    refBlockNum,
                },
            },
            this._makeContentProjection(onlyRawRequired),
            { lean: true }
        );

        if (!modelObject) {
            throw { code: 404, message: 'Not found' };
        }

        await this._tryApplyVotes({ Model, modelObject, currentUserId });
        await this._populateAuthors([modelObject]);

        return modelObject;
    }

    _makeContentProjection(onlyRawRequired) {
        let excludeContentVariant;

        if (onlyRawRequired) {
            excludeContentVariant = {
                'content.body.full': false,
            };
        } else {
            excludeContentVariant = {
                'content.body.raw': false,
            };
        }

        return {
            'content.body.preview': false,
            'votes.upUserIds': false,
            'votes.downUserIds': false,
            _id: false,
            __v: false,
            createdAt: false,
            updatedAt: false,
            ...excludeContentVariant,
        };
    }

    async _tryApplyVotesForModels({ Model, modelObjects, currentUserId }) {
        for (const modelObject of modelObjects) {
            await this._tryApplyVotes({ Model, modelObject, currentUserId });
        }
    }

    async _tryApplyVotes({ Model, modelObject, currentUserId }) {
        const votes = modelObject.votes;

        if (currentUserId) {
            const { hasUpVote, hasDownVote } = await this._detectVotes(
                Model,
                modelObject.contentId,
                currentUserId
            );

            votes.hasUpVote = hasUpVote;
            votes.hasDownVote = hasDownVote;
        } else {
            votes.hasUpVote = false;
            votes.hasDownVote = false;
        }
    }

    async _detectVotes(Model, contentId, currentUserId) {
        const upVoteCount = await Model.count({ contentId, 'votes.upUserIds': currentUserId });
        const downVoteCount = await Model.count({ contentId, 'votes.downUserIds': currentUserId });

        return { hasUpVote: Boolean(upVoteCount), hasDownVote: Boolean(downVoteCount) };
    }

    async _populateAuthors(modelObjects) {
        await this._populateWithCache(modelObjects, this._populateAuthor);
    }

    async _populateAuthor(modelObject, authors) {
        const id = modelObject.contentId.userId;

        if (authors.has(id)) {
            modelObject.author = authors.get(id);
        } else {
            const profile = await ProfileModel.findOne(
                { userId: id },
                { username: true, _id: false }
            );

            if (profile) {
                modelObject.author = { userId: id, username: profile.username };
            } else {
                Logger.error(`Feed - unknown user - ${id}`);
                modelObject.author = { userId: id, username: id };
            }
        }
    }

    async _populateCommunities(modelObjects) {
        await this._populateWithCache(modelObjects, this._populateCommunity);
    }

    async _populateCommunity(modelObject, communities) {
        const id = modelObject.communityId;

        if (communities.has(id)) {
            modelObject.community = communities.get(id);
        } else {
            // TODO After MVP
            modelObject.community = {
                id: 'gls',
                name: 'GOLOS',
                avatarUrl: 'none', // TODO Set before MVP
            };

            communities.set(id, modelObject.community);
        }

        delete modelObject.communityId;
    }

    async _populateWithCache(modelObjects, method) {
        const cacheMap = new Map();

        for (const modelObject of modelObjects) {
            await method.call(this, modelObject, cacheMap);
        }
    }

    _removeEmptyParentsForAll(modelObjects) {
        for (const modelObject of modelObjects) {
            this._removeEmptyParents(modelObject);
        }
    }

    _removeEmptyParents(modelObject) {
        if (!modelObject.parent.comment.contentId) {
            delete modelObject.parent.comment;
        }
    }
}

module.exports = AbstractContent;