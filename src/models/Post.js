const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel(
    'Post',
    {
        parentPermlink: {
            type: String,
        },
        author: {
            type: String,
        },
        permlink: {
            type: String,
        },
        title: {
            type: String,
        },
        body: {
            type: String,
        },
        rawJsonMetadata: {
            type: String,
        },
        appType: {
            type: String,
        },
        format: {
            type: String,
        },
        tags: {
            type: [String],
        },
        images: {
            type: [String],
        },
        links: {
            type: [String],
        },
    },
    {
        index: [
            // TODO -
        ],
    }
);