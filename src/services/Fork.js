const core = require('gls-core-service');
const BasicService = core.services.Basic;
const Logger = core.utils.Logger;
const env = require('../data/env');
const ForkModel = require('../models/Fork');
const ServiceMetaModel = require('../models/ServiceMeta');

class Fork extends BasicService {
    async start() {
        setInterval(async () => {
            await this._clean();
        }, env.GLS_FORK_CLEANER_INTERVAL);
    }

    async initBlock({ blockNum, blockTime, sequence }) {
        await ForkModel.create({ blockNum, blockTime, blockSequence: sequence });
    }

    async registerChanges({ type, Model, documentId, data }) {
        const className = Model.modelName;

        data = this._packData(data || {});

        await ForkModel.findOneAndUpdate(
            {},
            { $push: { stack: { type, className, documentId, data } } },
            { sort: { blockNum: -1 } }
        );
    }

    async revert() {
        Logger.info('Revert on fork...');

        const documents = await ForkModel.find({}, {}, { sort: { blockNum: -1 } });

        if (!documents.length) {
            Logger.warn('Empty fork data.');
            return;
        }

        const lastBlockNum = documents[documents.length - 1].blockNum - 1;

        for (const document of documents) {
            await this._restoreBy(document);
        }

        await ServiceMetaModel.updateOne({}, { $set: { lastBlockNum } });

        Logger.info('Revert on fork done!');
    }

    async revertLastBlock() {
        Logger.info('Revert last block...');

        const [current, previous] = await ForkModel.find(
            {},
            {},
            { sort: { blockNum: -1 }, limit: 2 }
        );

        if (!current) {
            Logger.warn('Empty restore data.');
            return;
        }

        await this._restoreBy(current);

        let update;

        if (previous) {
            update = {
                lastBlockNum: previous.blockNum,
                lastBlockTime: previous.blockTime,
                lastBlockSequence: previous.blockSequence,
            };
        } else {
            update = {
                lastBlockNum: 0,
                lastBlockTime: null,
                lastBlockSequence: 0,
            };
        }

        await ServiceMetaModel.updateOne({}, { $set: update });

        Logger.info('Revert last block done!');
    }

    async _clean() {
        Logger.log('Start fork cleaner...');

        try {
            const currentLastBlock = await this._getCurrentLastBlock();

            if (currentLastBlock) {
                const edge = this._calcEdge(currentLastBlock);

                await this._clearOutdated(edge);
            }
        } catch (error) {
            Logger.error('Fork cleaner error:', error);
            process.exit(1);
        }

        Logger.log('Fork cleaning done!');
    }

    async _getCurrentLastBlock() {
        const latest = await ForkModel.findOne({}, { blockNum: 1 }, { sort: { blockNum: -1 } });

        if (!latest) {
            return null;
        }

        return latest.blockNum;
    }

    _calcEdge(currentLastBlock) {
        return currentLastBlock - env.GLS_DELEGATION_ROUND_LENGTH * 3;
    }

    async _clearOutdated(edge) {
        await ForkModel.deleteMany({ blockNum: { $lt: edge } });
    }

    async _restoreBy(document) {
        const stack = document.stack;
        let data;

        while ((data = stack.pop())) {
            data = this._unpackData(data || {});

            const { type, className, documentId, data } = data;
            const Model = require(`../models/${className}`);

            switch (type) {
                case 'create':
                    await this._removeDocument(Model, documentId);
                    break;

                case 'update':
                    await this._restoreDocument(Model, documentId, data);
                    break;

                case 'remove':
                    await this._recreateDocument(Model, documentId, data);
                    break;
            }
        }

        await document.remove();
    }

    async _removeDocument(Model, documentId) {
        await Model.deleteOne({ _id: documentId });
    }

    async _restoreDocument(Model, documentId, data) {
        await Model.updateOne({ _id: documentId }, data);
    }

    async _recreateDocument(Model, documentId, data) {
        await Model.create({ _id: documentId, ...data });
    }

    _packData(data) {
        const specialKeys = [];

        for (const key of Object.keys(data)) {
            if (key.indexOf('$') === 0) {
                specialKeys.push(key);
            }

            if (data[key] && typeof data[key] === 'object') {
                this._packData(data[key]);
            }
        }

        for (const key of specialKeys) {
            data[`@${key}`] = data[key];

            delete data[key];
        }

        return data;
    }

    _unpackData(data) {
        const specialKeys = [];

        for (const key of Object.keys(data)) {
            if (key.indexOf('@$') === 0) {
                specialKeys.push(key);
            }

            if (data[key] && typeof data[key] === 'object') {
                this._unpackData(data[key]);
            }
        }

        for (const key of specialKeys) {
            data[key.slice(1)] = data[key];

            delete data[key];
        }

        return data;
    }
}

module.exports = Fork;
