const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel(
    'Leader',
    {
        communityId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            default: 0,
        },
        votes: {
            type: [String],
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        index: [
            {
                // Search for change
                fields: {
                    communityId: 1,
                    userId: 1,
                },
                options: {
                    unique: true,
                },
            },
            {
                // Top
                fields: {
                    active: 1,
                    communityId: 1,
                    rating: -1,
                },
            },
            {
                // Detect votes
                fields: {
                    _id: 1,
                    votes: 1,
                },
                options: {
                    unique: true,
                },
            },
        ],
    }
);