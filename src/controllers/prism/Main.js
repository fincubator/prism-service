const core = require('gls-core-service');
const Logger = core.utils.Logger;
const BlockUtil = core.utils.Block;

const Comment = require('./Comment');
const Post = require('./Post');

class Main {
    constructor() {
        this._comment = new Comment();
        this._post = new Post();
    }

    async disperse(block) {
        for (let [type, data] of BlockUtil.eachRealOperation(block)) {
            await this._disperseReal(type, data);
        }

        for (let [type, data] of BlockUtil.eachVirtualOperation(block)) {
            await this._disperseVirtual(type, data);
        }
    }

    async _disperseReal(type, data) {
        switch (type) {
            case 'vote':
                // Do noting for now
                break;
            case 'comment':
                await this._post.handle(data);
                await this._comment.handle(data);
                break;
            case 'transfer':
                // Do noting for now
                break;
            case 'transfer_to_vesting':
                // Do noting for now
                break;
            case 'withdraw_vesting':
                // Do noting for now
                break;
            case 'limit_order_create':
                // Do noting for now
                break;
            case 'limit_order_cancel':
                // Do noting for now
                break;
            case 'feed_publish':
                // Do noting for now
                break;
            case 'convert':
                // Do noting for now
                break;
            case 'account_create':
                // Do noting for now
                break;
            case 'account_update':
                // Do noting for now
                break;
            case 'witness_update':
                // Do noting for now
                break;
            case 'account_witness_vote':
                // Do noting for now
                break;
            case 'account_witness_proxy':
                // Do noting for now
                break;
            case 'pow':
                // Do noting for now
                break;
            case 'custom':
                // Do noting for now
                break;
            case 'report_over_production':
                // Do noting for now
                break;
            case 'delete_comment':
                // Do noting for now
                break;
            case 'custom_json':
                // Do noting for now
                break;
            case 'comment_options':
                // Do noting for now
                break;
            case 'set_withdraw_vesting_route':
                // Do noting for now
                break;
            case 'limit_order_create2':
                // Do noting for now
                break;
            case 'challenge_authority':
                // Do noting for now
                break;
            case 'prove_authority':
                // Do noting for now
                break;
            case 'request_account_recovery':
                // Do noting for now
                break;
            case 'recover_account':
                // Do noting for now
                break;
            case 'change_recovery_account':
                // Do noting for now
                break;
            case 'escrow_transfer':
                // Do noting for now
                break;
            case 'escrow_dispute':
                // Do noting for now
                break;
            case 'escrow_release':
                // Do noting for now
                break;
            case 'pow2':
                // Do noting for now
                break;
            case 'escrow_approve':
                // Do noting for now
                break;
            case 'transfer_to_savings':
                // Do noting for now
                break;
            case 'transfer_from_savings':
                // Do noting for now
                break;
            case 'cancel_transfer_from_savings':
                // Do noting for now
                break;
            case 'custom_binary':
                // Do noting for now
                break;
            case 'decline_voting_rights':
                // Do noting for now
                break;
            case 'reset_account':
                // Do noting for now
                break;
            case 'set_reset_account':
                // Do noting for now
                break;
            case 'delegate_vesting_shares':
                // Do noting for now
                break;
            case 'account_create_with_delegation':
                // Do noting for now
                break;
            case 'account_metadata':
                // Do noting for now
                break;
            case 'proposal_create':
                // Do noting for now
                break;
            case 'proposal_update':
                // Do noting for now
                break;
            case 'proposal_delete':
                // Do noting for now
                break;
            case 'chain_properties_update':
                // Do noting for now
                break;
            default:
                Logger.error(`Unknown real operation type - ${type} - skip.`);
        }
    }

    async _disperseVirtual(type, data) {
        switch (type) {
            case 'fill_convert_request':
                // Do noting for now
                break;
            case 'author_reward':
                // Do noting for now
                break;
            case 'curation_reward':
                // Do noting for now
                break;
            case 'comment_reward':
                // Do noting for now
                break;
            case 'liquidity_reward':
                // Do noting for now
                break;
            case 'interest':
                // Do noting for now
                break;
            case 'fill_vesting_withdraw':
                // Do noting for now
                break;
            case 'fill_order':
                // Do noting for now
                break;
            case 'shutdown_witness':
                // Do noting for now
                break;
            case 'fill_transfer_from_savings':
                // Do noting for now
                break;
            case 'hardfork':
                // Do noting for now
                break;
            case 'comment_payout_update':
                // Do noting for now
                break;
            case 'comment_benefactor_reward':
                // Do noting for now
                break;
            case 'return_vesting_delegation':
                // Do noting for now
                break;
            case 'producer_reward':
                // Do noting for now
                break;
            default:
                Logger.error(`Unknown virtual operation type - ${type} - skip.`);
        }
    }
}

module.exports = Main;