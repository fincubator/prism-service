const elasticsearch = require('elasticsearch');
const bodybuilder = require('bodybuilder');
const core = require('gls-core-service');
const BasicService = core.services.Basic;
const env = require('../data/env');
const SearchSyncModel = require('../models/SearchSync');
const PostModel = require('../models/Post');
const CommentModel = require('../models/Comment');

class SearchSync extends BasicService {
    constructor(...args) {
        super(...args);
        this.modelsToWatch = [PostModel, CommentModel];
        this.modelsMappers = this._getModelsMappers();
        this.modelsInSync = new Map();

        this._esclient = new elasticsearch.Client({
            host: env.GLS_SEARCH_CONNECTION_STRING,
        });
    }

    async start() {
        await this._waitForElasticSearch();

        for (const model of this.modelsToWatch) {
            const exists = await this._esclient.indices.exists({
                index: model.modelName.toLowerCase(),
            });

            if (!exists) {
                await this._esclient.indices.create({
                    index: model.modelName.toLowerCase(),
                });
            }
        }
        await this.startLoop(0, env.GLS_SEARCH_SYNC_TIMEOUT);
        await this.startDeleteLoop(env.GLS_SEARCH_SYNC_TIMEOUT, 10000);
    }

    async stop() {
        this.stopLoop();
        this.stopDeleteLoop();
    }

    startDeleteLoop(firstIterationTimeout = 0, interval) {
        setTimeout(async () => {
            if (interval) {
                await this.deleteIteration();
                this._deleteLoopId = setInterval(this.deleteIteration.bind(this), interval);
            } else {
                await this.deleteIteration();
            }
        }, firstIterationTimeout);
    }

    stopDeleteLoop() {
        if (this._deleteLoopId) {
            clearInterval(this._deleteLoopId);
        }
    }

    async deleteIteration() {
        for (const model of this.modelsToWatch) {
            await this._syncDeleted(model);
        }
    }

    _getModelsMappers() {
        return {
            Post: data => {
                return {
                    title: data.content.title,
                    body: data.content.body,
                    permlink: data.contentId.permlink,
                    contentId: data.contentId,
                };
            },
            Comment: data => {
                return {
                    title: data.content.title,
                    body: data.content.body,
                    permlink: data.contentId.permlink,
                    contentId: data.contentId,
                };
            },
        };
    }

    async _waitForElasticSearch(retryNum = 1, maxRetries = 10) {
        try {
            return await this._esclient.ping();
        } catch (error) {
            if (retryNum < maxRetries) {
                return await this._waitForElasticSearch(retryNum + 1);
            } else {
                throw 'Too many retries to ping Elasticsearch';
            }
        }
    }

    async _checkIndexExists({ id, index, type }) {
        return await this._esclient.exists({
            id,
            index,
            type,
        });
    }

    async _getDocSyncType({ index, id, type }) {
        let syncType = 'create';
        const indexExists = await this._checkIndexExists({ id, index, type });

        if (indexExists) {
            syncType = 'update';
        }
        return syncType;
    }

    async _createIndex({ index, body, type, id }) {
        return await this._esclient.create({
            index,
            body,
            type,
            id,
        });
    }

    async _updateIndex({ index, body, type, id }) {
        return await this._esclient.update({
            index,
            body: { doc: body },
            type,
            id,
        });
    }

    async _deleteIndex({ index, type, id }) {
        return await this._esclient.delete({ type, index, id });
    }

    _mapBody(data, modelType) {
        try {
            return this.modelsMappers[modelType]({ ...data });
        } catch (error) {
            return data;
        }
    }

    _prepareIndexBody({ data, model }) {
        const modelName = model.modelName;
        const dataModel = this._mapBody(new model(data).toObject(), modelName);
        const id = data._id.toString();
        const index = modelName.toLowerCase();

        delete dataModel._id;

        return {
            body: dataModel,
            id,
            index,
            type: modelName,
        };
    }

    async _syncDoc(model, data) {
        const indexDoc = this._prepareIndexBody({ data, model });
        const syncType = await this._getDocSyncType(indexDoc);

        switch (syncType) {
            case 'create':
                await this._createIndex(indexDoc);
                break;
            case 'update':
                await this._updateIndex(indexDoc);
                break;
        }
    }

    async _getDocsToSync({ model, from = new Date(null), maxDocs = 200, sequenceKey }) {
        const query = {
            updatedAt: { $gte: from },
        };
        if (sequenceKey) {
            query._id = { $gt: sequenceKey };
        }
        const docs = await model.find(query).limit(maxDocs);
        const result = {
            docs,
        };

        if (docs.length === maxDocs) {
            result.sequenceKey = docs[docs.length - 1]._id;
        }

        return result;
    }

    async _getAllIndexes(model, offset = 0) {
        const STEP = 1000;
        const allDocs = [];
        const body = bodybuilder()
            .query('match_all')
            .size(STEP)
            .from(offset)
            .build();

        const allDocsResponse = await this._esclient.search({
            index: model.modelName.toLowerCase(),
            body,
        });
        allDocs.push(...allDocsResponse.hits.hits);

        if (allDocsResponse.hits.hits.length === STEP) {
            allDocs.push(...(await this._getAllIndexes(model, offset + STEP)));
        }
        return allDocs;
    }

    async _syncModel(model, from, sequenceKey) {
        const { docs: dataToSync, sequenceKey: newSequenceKey } = await this._getDocsToSync({
            model,
            from,
            sequenceKey,
        });

        const syncPromises = [];
        if (dataToSync.length > 0) {
            for (const data of dataToSync) {
                syncPromises.push(this._syncDoc(model, data));
            }
        }

        await Promise.all(syncPromises);

        if (newSequenceKey) {
            await this._syncModel(model, from, newSequenceKey);
        }
    }

    async _syncDeleted(model) {
        const allDocs = await this._getAllIndexes(model);

        for (const doc of allDocs) {
            const count = await model.countDocuments({ _id: doc._id });

            if (count !== 0) {
                return;
            }

            const docToDelete = this._prepareIndexBody({ data: doc, model });
            try {
                await this._deleteIndex(docToDelete);
            } catch (error) {
                // do nothing
            }
        }
    }

    async _findOrCreateSyncModel(model) {
        let searchModel = await SearchSyncModel.findOne({ model: model.modelName });

        if (!searchModel) {
            searchModel = new SearchSyncModel({
                model: model.modelName,
            });

            await searchModel.save();
        }
        return searchModel;
    }

    async iteration() {
        for (const model of this.modelsToWatch) {
            const searchModel = await this._findOrCreateSyncModel(model);

            if (this.modelsInSync.has(searchModel)) {
                continue;
            }

            this.modelsInSync.set(searchModel, true);

            await this._syncModel(model, searchModel.lastSynced);

            searchModel.lastSynced = Date.now();
            await searchModel.save();
            this.modelsInSync.set(searchModel, false);
        }
    }
}

module.exports = SearchSync;
