const core = require('gls-core-service');
const stats = core.utils.statsClient;
const BasicMain = core.services.BasicMain;
const env = require('./data/env');
const Prism = require('./services/Prism');
const Connector = require('./services/Connector');
const Cleaner = require('./services/Cleaner');
const PostFeedCache = require('./services/PostFeedCache');
const LeaderFeedCache = require('./services/LeaderFeedCache');
const ServiceMetaModel = require('./models/ServiceMeta');

class Main extends BasicMain {
    constructor() {
        super(stats, env);

        const postFeedCache = new PostFeedCache();
        const leaderFeedCache = new LeaderFeedCache();
        const prism = new Prism();
        const connector = new Connector({ postFeedCache, leaderFeedCache, prism });
        const cleaner = new Cleaner();

        prism.setConnector(connector);

        this.startMongoBeforeBoot();
        this.addNested(cleaner, prism, postFeedCache, leaderFeedCache, connector);
    }

    async boot() {
        if ((await ServiceMetaModel.countDocuments()) === 0) {
            const model = new ServiceMetaModel();

            await model.save();
        }
    }
}

module.exports = Main;
