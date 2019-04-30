const core = require('gls-core-service');
const MongoDB = core.services.MongoDB;

module.exports = MongoDB.makeModel(
    'Profile',
    {
        userId: {
            type: String,
            required: true,
        },
        usernames: {
            // app -> name
            type: Object,
        },
        personal: {
            cyber: {
                avatarUrl: {
                    type: String,
                },
                coverUrl: {
                    type: String,
                },
                biography: {
                    type: String,
                },
                contacts: {
                    facebook: {
                        type: String,
                    },
                    telegram: {
                        type: String,
                    },
                    whatsApp: {
                        type: String,
                    },
                    weChat: {
                        type: String,
                    },
                },
            },
            gls: {
                name: {
                    type: String,
                },
                gender: {
                    type: String,
                },
                about: {
                    type: String,
                },
                location: {
                    type: String,
                },
                website: {
                    type: String,
                },
                avatarUrl: {
                    type: String,
                },
                coverUrl: {
                    type: String,
                },
                social: {
                    type: String,
                },
            },
        },
        subscriptions: {
            userIds: {
                type: [String],
                default: [],
            },
            usersCount: {
                type: Number,
                default: 0,
            },
            communityIds: {
                type: [String],
                default: [],
            },
            communitiesCount: {
                type: Number,
                default: 0,
            },
        },
        subscribers: {
            userIds: {
                type: [String],
                default: [],
            },
            usersCount: {
                type: Number,
                default: 0,
            },
            communityIds: {
                type: [String],
                default: [],
            },
            communitiesCount: {
                type: Number,
                default: 0,
            },
        },
        registration: {
            time: {
                type: Date,
            },
        },
        stats: {
            postsCount: {
                type: Number,
                default: 0,
            },
            commentsCount: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        index: [
            // Default
            {
                fields: {
                    userId: 1,
                },
                options: {
                    unique: true,
                },
            },
            // Golos user search
            {
                fields: {
                    'usernames.gls': 1,
                },
            },
            // Cyber user search
            {
                fields: {
                    'usernames.cyber': 1,
                },
            },
        ],
    }
);
