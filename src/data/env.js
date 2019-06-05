const env = process.env;

module.exports = {
    NODE_OPTIONS: env.NODE_OPTIONS,
    GLS_MAX_FEED_LIMIT: Number(env.GLS_MAX_FEED_LIMIT) || 100,
    GLS_DELEGATION_ROUND_LENGTH: Number(env.GLS_DELEGATION_ROUND_LENGTH) || 21,
    GLS_FORK_CLEANER_INTERVAL: Number(env.GLS_FORK_CLEANER_INTERVAL) || 300000,
    GLS_CONTENT_PREVIEW_LENGTH: Number(env.GLS_CONTENT_PREVIEW_LENGTH) || 200,
    GLS_FEED_CACHE_INTERVAL: Number(env.GLS_FEED_CACHE_INTERVAL) || 300000,
    GLS_FEED_CACHE_TTL: Number(env.GLS_FEED_CACHE_TTL) || 28800000,
    GLS_FEED_CACHE_MAX_ITEMS: Number(env.GLS_FEED_CACHE_MAX_ITEMS) || 10000,
    GLS_FACADE_CONNECT: env.GLS_FACADE_CONNECT,
    GLS_META_CONNECT: env.GLS_META_CONNECT,
    GLS_MAX_HASH_TAG_SIZE: Number(env.GLS_MAX_HASH_TAG_SIZE) || 32,
    GLS_RECENT_TRANSACTION_ID_TTL: Number(env.GLS_RECENT_TRANSACTION_ID_TTL) || 180000,
    GLS_MAX_WAIT_FOR_BLOCKCHAIN_TIMEOUT: Number(env.GLS_MAX_WAIT_FOR_BLOCKCHAIN_TIMEOUT) || 20000,
    GLS_SEARCH_SYNC_TIMEOUT: Number(env.GLS_SEARCH_SYNC_TIMEOUT) || 1000,
    GLS_SEARCH_CONNECTION_STRING: env.GLS_SEARCH_CONNECTION_STRING,
    GLS_SEARCH_DELETE_TIMEOUT: Number(env.GLS_SEARCH_DELETE_TIMEOUT) || 1000 * 60 * 60,
    GLS_EXPORT_GOLOS_USERS: env.GLS_EXPORT_GOLOS_USERS === 'true',
    GLS_EXPORT_GOLOS_USERS_CONNECT: env.GLS_EXPORT_GOLOS_USERS_CONNECT,
    GLS_SEARCH_ENABLED: !env.GLS_SEARCH_ENABLED || env.GLS_SEARCH_ENABLED !== 'false',
    GLS_USE_GENESIS: !env.GLS_USE_GENESIS || env.GLS_USE_GENESIS !== 'false',
    GLS_CYBERWAY_CONNECT: env.GLS_CYBERWAY_CONNECT,
    GLS_MAX_QUERY_MEMORY_LIMIT: env.GLS_MAX_QUERY_MEMORY_LIMIT || 536870912,
};
