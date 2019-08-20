const core = require('gls-core-service');
const { Logger } = core.utils;

const AbstractContent = require('./AbstractContent');

class AbstractFeed extends AbstractContent {
    _normalizeParams({ sortBy, sequenceKey, limit, contentType }) {
        if (sequenceKey) {
            sequenceKey = this._unpackSequenceKey(sequenceKey);
        }

        return { sortBy, sequenceKey, limit, contentType };
    }

    _packSequenceKey(sequenceKey) {
        return Buffer.from(String(sequenceKey)).toString('base64');
    }

    _unpackSequenceKey(sequenceKey) {
        return Buffer.from(String(sequenceKey), 'base64').toString();
    }

    _applySortingAndSequence(
        { query, projection, options },
        { sortBy, sequenceKey, limit, contentType }
    ) {
        options.limit = limit;
        projection.__v = false;
        projection.updatedAt = false;
        projection['votes.upVotes'] = false;
        projection['votes.downVotes'] = false;
        projection['stats.wilson'] = false;

        switch (contentType) {
            case 'web':
            case 'mobile':
                projection['content.body.raw'] = false;
                break;
            case 'raw':
                projection['content.body.full'] = false;
                projection['content.body.preview'] = false;
                break;
        }

        switch (sortBy) {
            case 'timeDesc':
                this._applySortByTime({ query, options, sequenceKey, direction: -1 });
                break;
            case 'time':
                this._applySortByTime({ query, options, sequenceKey, direction: 1 });
        }
    }

    _applySortByTime({ query, sequenceKey, direction }) {
        if (!sequenceKey) {
            return;
        }

        const keyDate = new Date(sequenceKey);

        if (isNaN(keyDate.valueOf())) {
            this._throwBadSequence();
        }

        if (direction > 0) {
            query.createdAt = { $gt: new Date(sequenceKey) };
        } else {
            query.createdAt = { $lt: new Date(sequenceKey) };
        }
    }

    _throwBadSequence() {
        throw { code: 400, message: 'Bad sequence params' };
    }

    _makeFeedResult(modelObjects, { sortBy, limit }, meta) {
        const sequenceKey = this._getSequenceKey(modelObjects, { sortBy, limit }, meta);

        for (const modelObject of modelObjects) {
            delete modelObject._id;
            delete modelObject.createdAt;
        }

        return {
            items: modelObjects,
            sequenceKey,
        };
    }

    _makeEmptyFeedResult() {
        return {
            items: [],
            sequenceKey: null,
        };
    }

    _getSequenceKey(modelObjects, { sortBy, limit }) {
        switch (sortBy) {
            case 'timeDesc':
            case 'time':
            default:
                return this._getSequenceKeyByTime(modelObjects, limit);
        }
    }

    _getSequenceKeyByTime(modelObjects, limit) {
        if (modelObjects.length < limit) {
            return null;
        }

        const lastModel = modelObjects[modelObjects.length - 1];
        let time;

        if (lastModel.meta && lastModel.meta.time) {
            time = lastModel.meta.time;
        } else {
            Logger.warn("Feed: model does not have 'meta.time' field", new Error().stack);
            time = lastModel.createdAt;
        }

        return this._packSequenceKey(time);
    }

    _getCachedSequenceKey(models, limit, meta) {
        if (models.length < limit) {
            return null;
        }

        return this._packSequenceKey(meta.newSequenceKey);
    }

    _finalizeCachedSorting(
        modelObjects,
        {
            _id: { $in: ids },
        }
    ) {
        const idMapping = new Map();
        const result = [];

        for (const modelObject of modelObjects) {
            idMapping.set(String(modelObject._id), modelObject);
        }

        for (const id of ids) {
            result.push(idMapping.get(String(id)));
        }

        return result;
    }

    _makeArrayPaginationResult(items, skip, limit) {
        if (!items || !items.length) {
            return {
                items: [],
                sequenceKey: null,
            };
        }

        if (items.length < limit) {
            return {
                items,
                sequenceKey: null,
            };
        }

        return {
            items,
            sequenceKey: this._packSequenceKey(skip + limit),
        };
    }
}

module.exports = AbstractFeed;
