const core = require('gls-core-service');
const Logger = core.utils.Logger;
const Abstract = require('./Abstract');
const env = require('../../data/env');

class AbstractContent extends Abstract {
    _extractTitle(content) {
        return this._contentUtil.sanitize(content.headermssg);
    }

    _extractBodyFull(content) {
        return this._contentUtil.sanitizePreview(content.bodymssg, env.GLS_CONTENT_PREVIEW_LENGTH);
    }

    _extractBodyPreview(content) {
        return this._contentUtil.sanitize(content.bodymssg);
    }

    _extractMetadata(content) {
        const raw = content.jsonmetadata;

        if (raw === '') {
            return {};
        }

        try {
            const result = JSON.parse(raw);

            if (result === null || typeof result !== 'object' || Array.isArray(result)) {
                Logger.log('Invalid content metadata.');
                return {};
            } else {
                return result;
            }
        } catch (error) {
            Logger.log('Invalid content metadata.');
            return {};
        }
    }
}

module.exports = AbstractContent;
