// Описание переменных окружения смотри в Readme.
const env = process.env;

module.exports = {
    NODE_OPTIONS: env.NODE_OPTIONS,
    GLS_MAX_FEED_LIMIT: Number(env.GLS_MAX_FEED_LIMIT) || 100,
    GLS_CHAIN_PROPS_INTERVAL: Number(env.GLS_CHAIN_PROPS_INTERVAL) || 60000,
    GLS_FEED_PRICE_INTERVAL: Number(env.GLS_FEED_PRICE_INTERVAL) || 60000,
    GLS_RAW_RESTORE_THREADS: Number(env.GLS_RAW_RESTORE_THREADS) || 1000,
    GLS_RAW_RESTORE_END_VAL_SYNC_INTERVAL:
        Number(env.GLS_RAW_RESTORE_END_VAL_SYNC_INTERVAL) || 60000,
    GLS_DELEGATION_ROUND_LENGTH: Number(env.GLS_DELEGATION_ROUND_LENGTH) || 21,
    GLS_REVERT_TRACE_CLEANER_INTERVAL: Number(env.GLS_REVERT_TRACE_CLEANER_INTERVAL) || 300000,
    GLS_PAYOUT_FINALIZER_INTERVAL: Number(env.GLS_PAYOUT_FINALIZER_INTERVAL) || 310000,
    GLS_PAYOUT_RANGE: Number(env.GLS_PAYOUT_RANGE) || 604800000,
};
